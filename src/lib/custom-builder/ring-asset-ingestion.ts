import { createHash } from 'node:crypto'

export const RING_ASSET_VALIDATION_VERSION = 'glb-ring-v6' as const
export const MAX_RING_ASSET_BYTES = 4 * 1024 * 1024

const GLB_MAGIC = 0x46546c67
const GLB_VERSION = 2
const JSON_CHUNK_TYPE = 0x4e4f534a
const BIN_CHUNK_TYPE = 0x004e4942
const MAX_MODEL_EXTENT_MM = 60
const MAX_MODEL_OFFSET_MM = 100

type Vec3 = [number, number, number]
type Vec4 = [number, number, number, number]
type Matrix4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

export interface RingAssetBounds {
  max: Vec3
  min: Vec3
  size: Vec3
}

export interface RingAssetInspection {
  bounds: RingAssetBounds
  byteLength: number
  materialNames: string[]
  nodeNames: string[]
  sha256: string
  validationVersion: typeof RING_ASSET_VALIDATION_VERSION
}

export interface StoredRingAssetRecord {
  bounds?: unknown
  byteLength?: unknown
  filename?: unknown
  filesize?: unknown
  materialNames?: unknown
  mimeType?: unknown
  nodeNames?: unknown
  sha256?: unknown
  url?: unknown
  validated?: unknown
  validationVersion?: unknown
}

interface RingAssetContractVariant {
  assembly?: unknown
  asset?: unknown
  materialSlots?: unknown
  nodes?: unknown
}

interface RingAssetContract {
  variants?: unknown
}

interface GlbJson {
  accessors?: unknown
  animations?: unknown
  asset?: unknown
  bufferViews?: unknown
  buffers?: unknown
  cameras?: unknown
  extensionsRequired?: unknown
  extensionsUsed?: unknown
  images?: unknown
  materials?: unknown
  meshes?: unknown
  nodes?: unknown
  samplers?: unknown
  scene?: unknown
  scenes?: unknown
  skins?: unknown
  textures?: unknown
}

interface GlbChunks {
  binary?: Buffer
  json: Buffer
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  return value
}

function integer(value: unknown, label: string): number {
  if (!Number.isInteger(value) || typeof value !== 'number' || value < 0) {
    throw new Error(`${label} must be a non-negative integer`)
  }
  return value
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be finite`)
  }
  return value
}

function vector(
  value: unknown,
  length: number,
  label: string,
  fallback?: readonly number[]
): number[] {
  if (value === undefined && fallback) return [...fallback]
  const values = array(value, label)
  if (values.length !== length) throw new Error(`${label} must contain ${length} values`)
  return values.map((entry, index) => finiteNumber(entry, `${label}[${index}]`))
}

function parseChunks(bytes: Buffer): GlbChunks {
  if (bytes.length > MAX_RING_ASSET_BYTES) {
    throw new Error(`GLB exceeds the ${MAX_RING_ASSET_BYTES}-byte upload limit`)
  }
  if (bytes.length < 20) throw new Error('GLB is truncated')
  if (bytes.readUInt32LE(0) !== GLB_MAGIC) throw new Error('File is not a GLB binary')
  if (bytes.readUInt32LE(4) !== GLB_VERSION) throw new Error('Only GLB version 2 is supported')
  if (bytes.readUInt32LE(8) !== bytes.length) {
    throw new Error('GLB declared byte length does not match uploaded bytes')
  }

  let offset = 12
  let json: Buffer | undefined
  let binary: Buffer | undefined
  let chunkIndex = 0

  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new Error('GLB chunk header is truncated')
    const length = bytes.readUInt32LE(offset)
    const type = bytes.readUInt32LE(offset + 4)
    const end = offset + 8 + length
    if (length === 0 || length % 4 !== 0 || end > bytes.length) {
      throw new Error('GLB chunk length is invalid')
    }

    const chunk = bytes.subarray(offset + 8, end)
    if (chunkIndex === 0 && type !== JSON_CHUNK_TYPE) {
      throw new Error('GLB JSON must be the first chunk')
    }
    if (type === JSON_CHUNK_TYPE) {
      if (json) throw new Error('GLB contains multiple JSON chunks')
      json = chunk
    } else if (type === BIN_CHUNK_TYPE) {
      if (binary) throw new Error('GLB contains multiple binary chunks')
      binary = chunk
    } else {
      throw new Error('GLB contains an unsupported chunk type')
    }
    offset = end
    chunkIndex += 1
  }

  if (!json) throw new Error('GLB JSON chunk is missing')
  return { binary, json }
}

function parseJson(chunk: Buffer): GlbJson {
  const text = chunk.toString('utf8').replace(/[\u0000\u0020]+$/u, '')
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('GLB JSON chunk is invalid')
  }
  return object(parsed, 'GLB JSON') as GlbJson
}

function validateEmbeddedResources(json: GlbJson, binary: Buffer | undefined): void {
  const asset = object(json.asset, 'asset')
  if (asset['version'] !== '2.0') throw new Error('GLB asset.version must be 2.0')
  if (
    array(json.extensionsRequired ?? [], 'extensionsRequired').length > 0 ||
    array(json.extensionsUsed ?? [], 'extensionsUsed').length > 0
  ) {
    throw new Error('GLB renderer extensions are not approved')
  }
  for (const resource of ['cameras', 'images', 'samplers', 'textures'] as const) {
    if (array(json[resource] ?? [], resource).length > 0) {
      throw new Error(`GLB ${resource} are not supported for ring geometry`)
    }
  }

  const buffers = array(json.buffers, 'buffers')
  if (buffers.length !== 1) throw new Error('GLB must contain exactly one embedded buffer')
  const buffer = object(buffers[0], 'buffers[0]')
  const declaredLength = integer(buffer['byteLength'], 'buffers[0].byteLength')
  const uri = buffer['uri']
  if (uri !== undefined) throw new Error('GLB geometry must use its embedded binary chunk')
  if (!binary) throw new Error('GLB embedded binary chunk is missing')
  if (binary.length < declaredLength || binary.length - declaredLength > 3) {
    throw new Error('GLB binary chunk length does not match its buffer')
  }

  const inspectUris = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(inspectUris)
      return
    }
    if (!value || typeof value !== 'object') return
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'uri' && (typeof entry !== 'string' || !entry.startsWith('data:'))) {
        throw new Error('GLB must not reference external resources')
      }
      inspectUris(entry)
    }
  }
  inspectUris(json)

  const rejectRendererReferences = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(rejectRendererReferences)
      return
    }
    if (!value || typeof value !== 'object') return
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'extensions' || /Texture$/u.test(key)) {
        throw new Error(`GLB renderer reference ${key} is not supported`)
      }
      rejectRendererReferences(entry)
    }
  }
  rejectRendererReferences(json)

  for (const [index, value] of array(json.bufferViews ?? [], 'bufferViews').entries()) {
    const view = object(value, `bufferViews[${index}]`)
    if (view['buffer'] !== 0) throw new Error(`bufferViews[${index}] uses an unknown buffer`)
    const offset = integer(view['byteOffset'] ?? 0, `bufferViews[${index}].byteOffset`)
    const length = integer(view['byteLength'], `bufferViews[${index}].byteLength`)
    if (offset + length > declaredLength) {
      throw new Error(`bufferViews[${index}] exceeds the embedded buffer`)
    }
  }

}

function namedEntries(values: unknown, label: string): string[] {
  const names = array(values ?? [], label).flatMap((value, index) => {
    const candidate = object(value, `${label}[${index}]`)['name']
    if (candidate === undefined) return []
    if (
      typeof candidate !== 'string' ||
      candidate.length === 0 ||
      candidate !== candidate.trim()
    ) {
      throw new Error(`${label}[${index}].name must be non-empty without surrounding whitespace`)
    }
    return [candidate]
  })
  if (new Set(names).size !== names.length) throw new Error(`${label} names must be unique`)
  return names.sort()
}

function assertAllowedKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string
): void {
  const unexpected = Object.keys(value).find((key) => !allowed.includes(key))
  if (unexpected) throw new Error(`${label}.${unexpected} is not supported`)
}

function validateOptionalName(value: Record<string, unknown>, label: string): void {
  if (value['name'] !== undefined && typeof value['name'] !== 'string') {
    throw new Error(`${label}.name must be a string`)
  }
}

/** Strict schema for the deliberately small static jewellery subset we publish. */
function validateStaticRingSubsetSchema(json: GlbJson): void {
  const root = object(json, 'GLB JSON')
  assertAllowedKeys(
    root,
    ['accessors', 'asset', 'bufferViews', 'buffers', 'materials', 'meshes', 'nodes', 'scene', 'scenes'],
    'GLB JSON'
  )

  const asset = object(json.asset, 'asset')
  assertAllowedKeys(asset, ['copyright', 'generator', 'minVersion', 'version'], 'asset')
  for (const field of ['copyright', 'generator', 'minVersion', 'version']) {
    if (asset[field] !== undefined && typeof asset[field] !== 'string') {
      throw new Error(`asset.${field} must be a string`)
    }
  }

  for (const [index, value] of array(json.buffers, 'buffers').entries()) {
    const buffer = object(value, `buffers[${index}]`)
    assertAllowedKeys(buffer, ['byteLength', 'name'], `buffers[${index}]`)
    validateOptionalName(buffer, `buffers[${index}]`)
  }
  for (const [index, value] of array(json.bufferViews ?? [], 'bufferViews').entries()) {
    const view = object(value, `bufferViews[${index}]`)
    assertAllowedKeys(
      view,
      ['buffer', 'byteLength', 'byteOffset', 'byteStride', 'name', 'target'],
      `bufferViews[${index}]`
    )
    validateOptionalName(view, `bufferViews[${index}]`)
    if (view['target'] !== undefined && ![34962, 34963].includes(integer(view['target'], `bufferViews[${index}].target`))) {
      throw new Error(`bufferViews[${index}].target is unsupported`)
    }
  }
  for (const [index, value] of array(json.accessors, 'accessors').entries()) {
    const accessor = object(value, `accessors[${index}]`)
    assertAllowedKeys(
      accessor,
      ['bufferView', 'byteOffset', 'componentType', 'count', 'max', 'min', 'name', 'normalized', 'type'],
      `accessors[${index}]`
    )
    validateOptionalName(accessor, `accessors[${index}]`)
    for (const field of ['min', 'max']) {
      if (accessor[field] !== undefined) {
        array(accessor[field], `accessors[${index}].${field}`).forEach((entry, item) =>
          finiteNumber(entry, `accessors[${index}].${field}[${item}]`)
        )
      }
    }
  }
  for (const [index, value] of array(json.materials, 'materials').entries()) {
    const material = object(value, `materials[${index}]`)
    assertAllowedKeys(material, ['name'], `materials[${index}]`)
  }
  for (const [meshIndex, value] of array(json.meshes, 'meshes').entries()) {
    const mesh = object(value, `meshes[${meshIndex}]`)
    assertAllowedKeys(mesh, ['name', 'primitives'], `meshes[${meshIndex}]`)
    validateOptionalName(mesh, `meshes[${meshIndex}]`)
    for (const [primitiveIndex, primitiveValue] of array(
      mesh['primitives'],
      `meshes[${meshIndex}].primitives`
    ).entries()) {
      const primitive = object(
        primitiveValue,
        `meshes[${meshIndex}].primitives[${primitiveIndex}]`
      )
      assertAllowedKeys(
        primitive,
        ['attributes', 'indices', 'material', 'mode'],
        `meshes[${meshIndex}].primitives[${primitiveIndex}]`
      )
      object(
        primitive['attributes'],
        `meshes[${meshIndex}].primitives[${primitiveIndex}].attributes`
      )
    }
  }
  for (const [index, value] of array(json.nodes, 'nodes').entries()) {
    const node = object(value, `nodes[${index}]`)
    assertAllowedKeys(
      node,
      ['children', 'matrix', 'mesh', 'name', 'rotation', 'scale', 'translation'],
      `nodes[${index}]`
    )
    validateOptionalName(node, `nodes[${index}]`)
    nodeMatrix(node, `nodes[${index}]`)
    if (node['mesh'] !== undefined) integer(node['mesh'], `nodes[${index}].mesh`)
    array(node['children'] ?? [], `nodes[${index}].children`).forEach((entry, childIndex) =>
      integer(entry, `nodes[${index}].children[${childIndex}]`)
    )
  }
  for (const [index, value] of array(json.scenes, 'scenes').entries()) {
    const scene = object(value, `scenes[${index}]`)
    assertAllowedKeys(scene, ['name', 'nodes'], `scenes[${index}]`)
    validateOptionalName(scene, `scenes[${index}]`)
    array(scene['nodes'], `scenes[${index}].nodes`).forEach((entry, nodeIndex) =>
      integer(entry, `scenes[${index}].nodes[${nodeIndex}]`)
    )
  }
}

function identityMatrix(): Matrix4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}

function multiplyMatrices(left: Matrix4, right: Matrix4): Matrix4 {
  const result = Array.from({ length: 16 }, () => 0) as Matrix4
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      result[column * 4 + row] =
        left[row]! * right[column * 4]! +
        left[4 + row]! * right[column * 4 + 1]! +
        left[8 + row]! * right[column * 4 + 2]! +
        left[12 + row]! * right[column * 4 + 3]!
    }
  }
  return result
}

function nodeMatrix(node: Record<string, unknown>, label: string): Matrix4 {
  if (node['matrix'] !== undefined) {
    if (
      node['translation'] !== undefined ||
      node['rotation'] !== undefined ||
      node['scale'] !== undefined
    ) {
      throw new Error(`${label} cannot combine matrix and TRS transforms`)
    }
    const matrix = vector(node['matrix'], 16, `${label}.matrix`) as Matrix4
    if (
      Math.abs(matrix[3]) > 0.000_001 ||
      Math.abs(matrix[7]) > 0.000_001 ||
      Math.abs(matrix[11]) > 0.000_001 ||
      Math.abs(matrix[15] - 1) > 0.000_001
    ) {
      throw new Error(`${label}.matrix must be affine`)
    }
    const columns: Vec3[] = [
      [matrix[0], matrix[1], matrix[2]],
      [matrix[4], matrix[5], matrix[6]],
      [matrix[8], matrix[9], matrix[10]],
    ]
    const lengths = columns.map(([x, y, z]) => Math.hypot(x, y, z))
    if (lengths.some((length) => length < 0.000_001)) {
      throw new Error(`${label}.matrix must have non-zero scale`)
    }
    for (const [left, right] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ] as const) {
      const dot = columns[left]!.reduce(
        (sum, value, index) => sum + value * columns[right]![index]!,
        0
      )
      if (Math.abs(dot) / (lengths[left]! * lengths[right]!) > 0.000_01) {
        throw new Error(`${label}.matrix must decompose without shear`)
      }
    }
    const determinant =
      columns[0]![0] *
        (columns[1]![1] * columns[2]![2] - columns[1]![2] * columns[2]![1]) -
      columns[1]![0] *
        (columns[0]![1] * columns[2]![2] - columns[0]![2] * columns[2]![1]) +
      columns[2]![0] *
        (columns[0]![1] * columns[1]![2] - columns[0]![2] * columns[1]![1])
    if (determinant <= 0.000_000_000_001) {
      throw new Error(`${label}.matrix cannot reflect geometry`)
    }
    return matrix
  }

  const [tx, ty, tz] = vector(node['translation'], 3, `${label}.translation`, [0, 0, 0]) as Vec3
  const [qx, qy, qz, qw] = vector(node['rotation'], 4, `${label}.rotation`, [0, 0, 0, 1]) as Vec4
  const [sx, sy, sz] = vector(node['scale'], 3, `${label}.scale`, [1, 1, 1]) as Vec3
  if ([sx, sy, sz].some((scale) => scale < 0.000_001)) {
    throw new Error(`${label}.scale must be positive`)
  }
  const length = Math.hypot(qx, qy, qz, qw)
  if (Math.abs(length - 1) > 0.001) throw new Error(`${label}.rotation must be normalized`)

  const x2 = qx + qx
  const y2 = qy + qy
  const z2 = qz + qz
  const xx = qx * x2
  const xy = qx * y2
  const xz = qx * z2
  const yy = qy * y2
  const yz = qy * z2
  const zz = qz * z2
  const wx = qw * x2
  const wy = qw * y2
  const wz = qw * z2

  return [
    (1 - (yy + zz)) * sx,
    (xy + wz) * sx,
    (xz - wy) * sx,
    0,
    (xy - wz) * sy,
    (1 - (xx + zz)) * sy,
    (yz + wx) * sy,
    0,
    (xz + wy) * sz,
    (yz - wx) * sz,
    (1 - (xx + yy)) * sz,
    0,
    tx,
    ty,
    tz,
    1,
  ]
}

function transformPoint(matrix: Matrix4, [x, y, z]: Vec3): Vec3 {
  const denominator = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
  if (!Number.isFinite(denominator) || Math.abs(denominator) < Number.EPSILON) {
    throw new Error('GLB contains a non-projectable node transform')
  }
  return [
    (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / denominator,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / denominator,
    (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / denominator,
  ]
}

function accessorBounds(accessor: Record<string, unknown>, label: string): [Vec3, Vec3] {
  if (accessor['type'] !== 'VEC3') throw new Error(`${label} must be VEC3`)
  const minimum = vector(accessor['min'], 3, `${label}.min`) as Vec3
  const maximum = vector(accessor['max'], 3, `${label}.max`) as Vec3
  if (minimum.some((value, index) => value > maximum[index]!)) {
    throw new Error(`${label} has inverted bounds`)
  }
  return [minimum, maximum]
}

const accessorComponentBytes = new Map<number, number>([
  [5120, 1],
  [5121, 1],
  [5122, 2],
  [5123, 2],
  [5125, 4],
  [5126, 4],
])
const accessorTypeComponents = new Map<string, number>([
  ['SCALAR', 1],
  ['VEC2', 2],
  ['VEC3', 3],
  ['VEC4', 4],
])

interface AccessorStorage {
  componentBytes: number
  componentCount: number
  componentType: number
  count: number
  elementBytes: number
  start: number
  stride: number
  type: string
  view: Record<string, unknown>
}

function validateAccessorStorage(
  accessor: Record<string, unknown>,
  accessorIndex: number,
  bufferViews: readonly Record<string, unknown>[],
  binary: Buffer
): AccessorStorage {
  const label = `accessors[${accessorIndex}]`
  if (accessor['sparse'] !== undefined) throw new Error(`${label} cannot use sparse storage`)
  const count = integer(accessor['count'], `${label}.count`)
  if (count === 0) throw new Error(`${label}.count must be positive`)
  const componentType = integer(accessor['componentType'], `${label}.componentType`)
  const componentBytes = accessorComponentBytes.get(componentType)
  if (!componentBytes) throw new Error(`${label}.componentType is unsupported`)
  const type = accessor['type']
  const componentCount = typeof type === 'string' ? accessorTypeComponents.get(type) : undefined
  if (!componentCount || typeof type !== 'string') throw new Error(`${label}.type is unsupported`)
  if (accessor['normalized'] !== undefined && typeof accessor['normalized'] !== 'boolean') {
    throw new Error(`${label}.normalized must be boolean`)
  }

  const viewIndex = integer(accessor['bufferView'], `${label}.bufferView`)
  const view = bufferViews[viewIndex]
  if (!view) throw new Error(`${label} uses an unknown buffer view`)
  const viewLength = integer(view['byteLength'], `bufferViews[${viewIndex}].byteLength`)
  const viewOffset = integer(view['byteOffset'] ?? 0, `bufferViews[${viewIndex}].byteOffset`)
  const accessorOffset = integer(accessor['byteOffset'] ?? 0, `${label}.byteOffset`)
  if ((viewOffset + accessorOffset) % componentBytes !== 0) {
    throw new Error(`${label} is not aligned to its component size`)
  }
  const elementBytes = componentBytes * componentCount
  const stride = integer(view['byteStride'] ?? elementBytes, `bufferViews[${viewIndex}].byteStride`)
  if (stride < elementBytes || stride > 252 || stride % componentBytes !== 0) {
    throw new Error(`bufferViews[${viewIndex}].byteStride is invalid for ${label}`)
  }
  const requiredBytes = accessorOffset + (count - 1) * stride + elementBytes
  if (requiredBytes > viewLength || viewOffset + requiredBytes > binary.length) {
    throw new Error(`${label} exceeds its buffer view`)
  }

  return {
    componentBytes,
    componentCount,
    componentType,
    count,
    elementBytes,
    start: viewOffset + accessorOffset,
    stride,
    type,
    view,
  }
}

function validateFloatValues(binary: Buffer, storage: AccessorStorage, label: string): void {
  if (storage.componentType !== 5126) return
  for (let item = 0; item < storage.count; item += 1) {
    for (let component = 0; component < storage.componentCount; component += 1) {
      if (!Number.isFinite(binary.readFloatLE(storage.start + item * storage.stride + component * 4))) {
        throw new Error(`${label} contains non-finite values`)
      }
    }
  }
}

function readPositionAccessorBounds(
  accessor: Record<string, unknown>,
  accessorIndex: number,
  bufferViews: readonly Record<string, unknown>[],
  binary: Buffer
): { maximum: Vec3; minimum: Vec3; positions: Vec3[] } {
  const label = `accessors[${accessorIndex}]`
  if (accessor['componentType'] !== 5126) {
    throw new Error(`${label} POSITION data must use 32-bit floats`)
  }
  const storage = validateAccessorStorage(accessor, accessorIndex, bufferViews, binary)
  if (storage.type !== 'VEC3') throw new Error(`${label} POSITION data must be VEC3`)

  const actualMinimum: Vec3 = [Infinity, Infinity, Infinity]
  const actualMaximum: Vec3 = [-Infinity, -Infinity, -Infinity]
  const positions: Vec3[] = []
  for (let item = 0; item < storage.count; item += 1) {
    const offset = storage.start + item * storage.stride
    const position: Vec3 = [0, 0, 0]
    for (let axis = 0; axis < 3; axis += 1) {
      const coordinate = binary.readFloatLE(offset + axis * 4)
      if (!Number.isFinite(coordinate)) throw new Error(`${label} contains non-finite POSITION data`)
      position[axis] = coordinate
      actualMinimum[axis] = Math.min(actualMinimum[axis]!, coordinate)
      actualMaximum[axis] = Math.max(actualMaximum[axis]!, coordinate)
    }
    positions.push(position)
  }

  const [declaredMinimum, declaredMaximum] = accessorBounds(accessor, label)
  const boundsMatch = [...declaredMinimum, ...declaredMaximum].every((declared, index) => {
    const actual = index < 3 ? actualMinimum[index]! : actualMaximum[index - 3]!
    return Math.abs(declared - actual) <= Math.max(0.000_01, Math.abs(actual) * 0.000_01)
  })
  if (!boundsMatch) throw new Error(`${label} bounds do not match embedded POSITION data`)
  return { maximum: actualMaximum, minimum: actualMinimum, positions }
}

function validatePrimitiveAttribute(
  semantic: string,
  accessor: Record<string, unknown>,
  accessorIndex: number,
  positionCount: number,
  bufferViews: readonly Record<string, unknown>[],
  binary: Buffer
): void {
  const storage = validateAccessorStorage(accessor, accessorIndex, bufferViews, binary)
  const label = `attribute ${semantic}`
  if (storage.count !== positionCount) throw new Error(`${label} count must match POSITION`)

  const floatVector =
    (semantic === 'NORMAL' && storage.type === 'VEC3') ||
    (semantic === 'TANGENT' && storage.type === 'VEC4')
  const texture = /^TEXCOORD_[0-9]+$/u.test(semantic) && storage.type === 'VEC2'
  const colour = /^COLOR_[0-9]+$/u.test(semantic) && ['VEC3', 'VEC4'].includes(storage.type)
  if (!floatVector && !texture && !colour) {
    throw new Error(`${label} is not supported for static ring geometry`)
  }
  if (floatVector && storage.componentType !== 5126) {
    throw new Error(`${label} must use 32-bit floats`)
  }
  if ((texture || colour) && ![5121, 5123, 5126].includes(storage.componentType)) {
    throw new Error(`${label} uses an unsupported component type`)
  }
  if (
    (texture || colour) &&
    storage.componentType !== 5126 &&
    accessor['normalized'] !== true
  ) {
    throw new Error(`${label} integer data must be normalized`)
  }
  validateFloatValues(binary, storage, label)
}

function validatePrimitiveIndices(
  accessor: Record<string, unknown>,
  accessorIndex: number,
  positionCount: number,
  bufferViews: readonly Record<string, unknown>[],
  binary: Buffer
): number[] {
  const storage = validateAccessorStorage(accessor, accessorIndex, bufferViews, binary)
  const label = `accessors[${accessorIndex}] indices`
  if (storage.type !== 'SCALAR' || ![5121, 5123, 5125].includes(storage.componentType)) {
    throw new Error(`${label} must use unsigned scalar data`)
  }
  if (storage.count % 3 !== 0) throw new Error(`${label} count must form triangles`)
  if (storage.view['byteStride'] !== undefined) throw new Error(`${label} cannot be interleaved`)
  if (accessor['normalized'] === true) throw new Error(`${label} cannot be normalized`)

  const indices: number[] = []
  for (let item = 0; item < storage.count; item += 1) {
    const offset = storage.start + item * storage.stride
    const index =
      storage.componentType === 5121
        ? binary.readUInt8(offset)
        : storage.componentType === 5123
          ? binary.readUInt16LE(offset)
          : binary.readUInt32LE(offset)
    if (index >= positionCount) throw new Error(`${label} references a missing vertex`)
    indices.push(index)
  }
  return indices
}

function validateTriangleSurface(positions: readonly Vec3[], indices: readonly number[]): void {
  for (let item = 0; item < indices.length; item += 3) {
    const a = positions[indices[item]!]
    const b = positions[indices[item + 1]!]
    const c = positions[indices[item + 2]!]
    if (!a || !b || !c) throw new Error('Ring triangle references a missing vertex')
    const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const ac: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    const cross: Vec3 = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ]
    if (Math.hypot(...cross) <= 0.000_000_01) {
      throw new Error('Ring geometry contains a degenerate triangle')
    }
  }
}

function includeBox(bounds: RingAssetBounds, matrix: Matrix4, minimum: Vec3, maximum: Vec3): void {
  for (const x of [minimum[0], maximum[0]]) {
    for (const y of [minimum[1], maximum[1]]) {
      for (const z of [minimum[2], maximum[2]]) {
        const point = transformPoint(matrix, [x, y, z])
        for (let axis = 0; axis < 3; axis += 1) {
          bounds.min[axis] = Math.min(bounds.min[axis]!, point[axis]!)
          bounds.max[axis] = Math.max(bounds.max[axis]!, point[axis]!)
        }
      }
    }
  }
}

function inspectScene(
  json: GlbJson,
  binary: Buffer
): Pick<RingAssetInspection, 'bounds' | 'materialNames' | 'nodeNames'> {
  if (Array.isArray(json.animations) && json.animations.length > 0) {
    throw new Error('Animated ring assets are not supported')
  }
  if (Array.isArray(json.skins) && json.skins.length > 0) {
    throw new Error('Skinned ring assets are not supported')
  }

  const nodes = array(json.nodes, 'nodes').map((value, index) => object(value, `nodes[${index}]`))
  const meshes = array(json.meshes, 'meshes').map((value, index) =>
    object(value, `meshes[${index}]`)
  )
  const accessors = array(json.accessors, 'accessors').map((value, index) =>
    object(value, `accessors[${index}]`)
  )
  const bufferViews = array(json.bufferViews, 'bufferViews').map((value, index) =>
    object(value, `bufferViews[${index}]`)
  )
  const nodeNames = namedEntries(nodes, 'nodes')
  const materialNames = namedEntries(json.materials, 'materials')
  if (materialNames.length !== array(json.materials, 'materials').length) {
    throw new Error('Every GLB material must have a unique contract name')
  }
  for (const required of ['RING_ROOT', 'STONE_ANCHOR']) {
    if (!nodeNames.includes(required)) throw new Error(`GLB is missing required ${required} node`)
  }

  const scenes = array(json.scenes, 'scenes').map((value, index) =>
    object(value, `scenes[${index}]`)
  )
  if (scenes.length !== 1) throw new Error('GLB must contain exactly one scene')
  const sceneIndex = integer(json.scene ?? 0, 'scene')
  const scene = scenes[sceneIndex]
  if (!scene) throw new Error('GLB default scene does not exist')
  const roots = array(scene['nodes'], `scenes[${sceneIndex}].nodes`).map((value, index) =>
    integer(value, `scenes[${sceneIndex}].nodes[${index}]`)
  )
  if (roots.length !== 1 || nodes[roots[0]!]?.['name'] !== 'RING_ROOT') {
    throw new Error('GLB default scene must have one RING_ROOT node')
  }

  const bounds: RingAssetBounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
    size: [0, 0, 0],
  }
  const reachableNames = new Set<string>()
  const reachedNodes = new Set<number>()
  const reachedMeshes = new Set<number>()
  const usedMaterialNames = new Set<string>()
  let primitiveCount = 0

  const visit = (nodeIndex: number, parent: Matrix4, ancestors: ReadonlySet<number>): void => {
    const node = nodes[nodeIndex]
    if (!node) throw new Error(`Node ${nodeIndex} does not exist`)
    if (ancestors.has(nodeIndex)) throw new Error('GLB node graph contains a cycle')
    if (reachedNodes.has(nodeIndex)) throw new Error('GLB node graph contains multiple parents')
    reachedNodes.add(nodeIndex)
    const nextAncestors = new Set(ancestors).add(nodeIndex)
    const world = multiplyMatrices(parent, nodeMatrix(node, `nodes[${nodeIndex}]`))
    if (typeof node['name'] === 'string') reachableNames.add(node['name'])
    if (node['camera'] !== undefined || node['skin'] !== undefined) {
      throw new Error('Ring nodes cannot reference cameras or skins')
    }

    if (node['mesh'] !== undefined) {
      const meshIndex = integer(node['mesh'], `nodes[${nodeIndex}].mesh`)
      const mesh = meshes[meshIndex]
      if (!mesh) throw new Error(`Mesh ${meshIndex} does not exist`)
      reachedMeshes.add(meshIndex)
      const primitives = array(mesh['primitives'], `meshes[${meshIndex}].primitives`)
      for (const [primitiveIndex, primitiveValue] of primitives.entries()) {
        const primitive = object(
          primitiveValue,
          `meshes[${meshIndex}].primitives[${primitiveIndex}]`
        )
        if (primitive['targets'] !== undefined) throw new Error('Morph targets are not supported')
        if (primitive['mode'] !== undefined && primitive['mode'] !== 4) {
          throw new Error('Ring geometry must use triangle primitives')
        }
        const attributes = object(
          primitive['attributes'],
          `meshes[${meshIndex}].primitives[${primitiveIndex}].attributes`
        )
        const accessorIndex = integer(
          attributes['POSITION'],
          `meshes[${meshIndex}].primitives[${primitiveIndex}].attributes.POSITION`
        )
        const accessor = accessors[accessorIndex]
        if (!accessor) throw new Error(`Accessor ${accessorIndex} does not exist`)
        const { maximum, minimum, positions } = readPositionAccessorBounds(
          accessor,
          accessorIndex,
          bufferViews,
          binary
        )
        const positionCount = integer(accessor['count'], `accessors[${accessorIndex}].count`)
        for (const [semantic, attributeValue] of Object.entries(attributes)) {
          if (semantic === 'POSITION') continue
          const attributeIndex = integer(
            attributeValue,
            `meshes[${meshIndex}].primitives[${primitiveIndex}].attributes.${semantic}`
          )
          const attributeAccessor = accessors[attributeIndex]
          if (!attributeAccessor) throw new Error(`Accessor ${attributeIndex} does not exist`)
          validatePrimitiveAttribute(
            semantic,
            attributeAccessor,
            attributeIndex,
            positionCount,
            bufferViews,
            binary
          )
        }
        let triangleIndices: number[]
        if (primitive['indices'] === undefined) {
          if (positionCount % 3 !== 0) {
            throw new Error('Non-indexed ring geometry POSITION count must form triangles')
          }
          triangleIndices = Array.from({ length: positionCount }, (_, index) => index)
        } else {
          const indicesIndex = integer(
            primitive['indices'],
            `meshes[${meshIndex}].primitives[${primitiveIndex}].indices`
          )
          const indicesAccessor = accessors[indicesIndex]
          if (!indicesAccessor) throw new Error(`Accessor ${indicesIndex} does not exist`)
          triangleIndices = validatePrimitiveIndices(
            indicesAccessor,
            indicesIndex,
            positionCount,
            bufferViews,
            binary
          )
        }
        validateTriangleSurface(positions, triangleIndices)
        if (primitive['material'] === undefined) {
          throw new Error('Every ring mesh primitive requires a named material')
        }
        const materialIndex = integer(
          primitive['material'],
          `meshes[${meshIndex}].primitives[${primitiveIndex}].material`
        )
        if (!array(json.materials, 'materials')[materialIndex]) {
          throw new Error(`Material ${materialIndex} does not exist`)
        }
        usedMaterialNames.add(materialNames[materialIndex]!)
        includeBox(bounds, world, minimum, maximum)
        primitiveCount += 1
      }
    }

    for (const [childIndex, childValue] of array(
      node['children'] ?? [],
      'node children'
    ).entries()) {
      visit(
        integer(childValue, `nodes[${nodeIndex}].children[${childIndex}]`),
        world,
        nextAncestors
      )
    }
  }

  roots.forEach((root) => visit(root, identityMatrix(), new Set()))
  if (primitiveCount === 0) throw new Error('GLB contains no renderable ring geometry')
  if (reachedNodes.size !== nodes.length || reachedMeshes.size !== meshes.length) {
    throw new Error('Every ring node and mesh must be reachable from RING_ROOT')
  }
  for (const required of ['RING_ROOT', 'STONE_ANCHOR']) {
    if (!reachableNames.has(required)) {
      throw new Error(`Required ${required} node is outside the default scene`)
    }
  }
  if (usedMaterialNames.size !== materialNames.length) {
    throw new Error('Every named GLB material must be assigned to rendered geometry')
  }

  bounds.size = bounds.max.map((value, index) => value - bounds.min[index]!) as Vec3
  if (
    bounds.size.some((extent) => extent <= 0 || extent > MAX_MODEL_EXTENT_MM) ||
    [...bounds.min, ...bounds.max].some((coordinate) => Math.abs(coordinate) > MAX_MODEL_OFFSET_MM)
  ) {
    throw new Error('GLB geometry bounds are not plausible millimetre-scale ring dimensions')
  }

  return { bounds, materialNames, nodeNames: [...reachableNames].sort() }
}

/** Parses and fingerprints the exact immutable bytes accepted for maker review. */
export function inspectRingGlb(bytes: Buffer): RingAssetInspection {
  const chunks = parseChunks(bytes)
  const json = parseJson(chunks.json)
  validateStaticRingSubsetSchema(json)
  validateEmbeddedResources(json, chunks.binary)
  if (!chunks.binary) throw new Error('GLB embedded binary chunk is missing')
  const scene = inspectScene(json, chunks.binary)
  return {
    ...scene,
    byteLength: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    validationVersion: RING_ASSET_VALIDATION_VERSION,
  }
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) return undefined
  return value
}

function parsedBounds(value: unknown): RingAssetBounds | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  try {
    return {
      min: vector(record['min'], 3, 'bounds.min') as Vec3,
      max: vector(record['max'], 3, 'bounds.max') as Vec3,
      size: vector(record['size'], 3, 'bounds.size') as Vec3,
    }
  } catch {
    return undefined
  }
}

function assetIdentity(
  value: unknown
): { byteLength: number; sha256: string; url: string } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  if (
    typeof record['byteLength'] !== 'number' ||
    typeof record['sha256'] !== 'string' ||
    typeof record['url'] !== 'string'
  ) {
    return undefined
  }
  return {
    byteLength: record['byteLength'],
    sha256: record['sha256'],
    url: record['url'],
  }
}

function requiredContractNames(variant: RingAssetContractVariant): {
  materials: string[]
  nodes: string[]
} | null {
  if (!variant.nodes || typeof variant.nodes !== 'object' || Array.isArray(variant.nodes)) {
    return null
  }
  if (
    !variant.materialSlots ||
    typeof variant.materialSlots !== 'object' ||
    Array.isArray(variant.materialSlots)
  ) {
    return null
  }
  const nodes = Object.values(variant.nodes as Record<string, unknown>)
  const slots = variant.materialSlots as Record<string, unknown>
  const materials = ['metal', 'patina', 'preserve'].flatMap((key) => stringArray(slots[key]) ?? [])
  if (nodes.some((name) => typeof name !== 'string') || materials.length === 0) return null
  return { materials, nodes: nodes as string[] }
}

/**
 * Confirms a model contract names the exact validated CMS blobs reviewed by the
 * maker. Called both while approving and while creating the public manifest.
 */
export function validateStoredRingAssets(
  model: RingAssetContract,
  records: readonly StoredRingAssetRecord[]
): true | string {
  if (!Array.isArray(model.variants)) return 'Ring asset contract has no variants'

  for (const variantValue of model.variants) {
    if (!variantValue || typeof variantValue !== 'object' || Array.isArray(variantValue)) {
      return 'Ring asset contract contains an invalid variant'
    }
    const variant = variantValue as RingAssetContractVariant
    const identity = assetIdentity(variant.asset)
    if (!identity) return 'Ring asset variant has an invalid identity'
    const matches = records.filter((record) => record.sha256 === identity.sha256)
    if (matches.length !== 1) {
      return `Ring asset ${identity.sha256} must match one CMS-owned validated upload`
    }
    const stored = matches[0]!
    if (
      stored.validated !== true ||
      stored.validationVersion !== RING_ASSET_VALIDATION_VERSION ||
      stored.mimeType !== 'model/gltf-binary' ||
      stored.url !== identity.url ||
      stored.byteLength !== identity.byteLength ||
      stored.filesize !== identity.byteLength ||
      typeof stored.filename !== 'string' ||
      !stored.filename.includes(identity.sha256)
    ) {
      return `Ring asset ${identity.sha256} identity does not match its validated CMS upload`
    }

    const contractNames = requiredContractNames(variant)
    const storedNodes = stringArray(stored.nodeNames)
    const storedMaterials = stringArray(stored.materialNames)
    if (!contractNames || !storedNodes || !storedMaterials) {
      return `Ring asset ${identity.sha256} is missing validated node or material metadata`
    }
    const missingNode = contractNames.nodes.find((name) => !storedNodes.includes(name))
    if (missingNode) return `Ring asset ${identity.sha256} is missing required node ${missingNode}`
    const missingMaterial = contractNames.materials.find((name) => !storedMaterials.includes(name))
    if (missingMaterial) {
      return `Ring asset ${identity.sha256} is missing required material ${missingMaterial}`
    }
    const unassignedMaterial = storedMaterials.find(
      (name) => !contractNames.materials.includes(name)
    )
    if (unassignedMaterial) {
      return `Ring asset ${identity.sha256} has unassigned material ${unassignedMaterial}`
    }
    if (variant.assembly === 'authored-head-procedural-shank') {
      for (const anchor of ['SHANK_JOIN_LEFT', 'SHANK_JOIN_RIGHT']) {
        if (!storedNodes.includes(anchor)) {
          return `Authored ring head ${identity.sha256} is missing ${anchor}`
        }
      }
    }

    const bounds = parsedBounds(stored.bounds)
    if (
      !bounds ||
      bounds.size.some((extent) => extent <= 0 || extent > MAX_MODEL_EXTENT_MM) ||
      bounds.min.some((value, index) => bounds.max[index]! <= value) ||
      bounds.size.some(
        (extent, index) => Math.abs(extent - (bounds.max[index]! - bounds.min[index]!)) > 0.000_001
      ) ||
      [...bounds.min, ...bounds.max].some(
        (coordinate) => Math.abs(coordinate) > MAX_MODEL_OFFSET_MM
      )
    ) {
      return `Ring asset ${identity.sha256} has invalid millimetre-scale geometry bounds`
    }
  }

  return true
}
