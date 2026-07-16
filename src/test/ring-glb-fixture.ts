interface RingGlbFixtureOptions {
  bounds?: { max: [number, number, number]; min: [number, number, number] }
  declaredBounds?: { max: [number, number, number]; min: [number, number, number] }
  degenerateTriangles?: boolean
  duplicateMaterial?: boolean
  externalBufferUri?: string
  invalidCamera?: boolean
  indicesAccessor?: number
  invalidMaterialField?: boolean
  invalidMaterialTexture?: boolean
  invalidMatrix?: boolean
  invalidScene?: boolean
  invalidNodeField?: boolean
  missingNode?: string
  normalAccessor?: number
  positionBufferViewLength?: number
  reflectedRoot?: boolean
  requiredExtension?: string
  unnamedMaterial?: boolean
  unreachableNode?: string
  whitespaceMaterial?: boolean
  whitespaceNode?: string
}

function paddedChunk(data: Buffer, padding: number): Buffer {
  const remainder = data.length % 4
  return remainder === 0 ? data : Buffer.concat([data, Buffer.alloc(4 - remainder, padding)])
}

/** Small structurally valid static jewellery GLB for unit tests. */
export function makeRingGlbFixture(options: RingGlbFixtureOptions = {}): Buffer {
  const bounds = options.bounds ?? { min: [-10, -10, -3], max: [10, 10, 3] }
  const declaredBounds = options.declaredBounds ?? bounds
  const nodeNames = ['RING_ROOT', 'STONE_ANCHOR', 'SHANK_JOIN_LEFT', 'SHANK_JOIN_RIGHT'].filter(
    (name) => name !== options.missingNode
  )
  const nodes = nodeNames.map((name, index) => ({
    name: name === options.whitespaceNode ? ` ${name} ` : name,
    ...(index === 0 && options.invalidMatrix
      ? { matrix: [1, 0, 0, 0.1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
      : {}),
    ...(index === 0 && options.reflectedRoot ? { scale: [-1, 1, 1] } : {}),
    ...(index === 0
      ? {
          children: nodeNames
            .slice(1)
            .flatMap((name, childIndex) =>
              name === options.unreachableNode ? [] : [childIndex + 1]
            ),
          mesh: 0,
        }
      : {}),
  }))
  const binary = Buffer.alloc(36)
  const positions = [
    bounds.min,
    bounds.max,
    options.degenerateTriangles
      ? ([0, 0, 0] as const)
      : ([bounds.min[0], bounds.max[1], bounds.min[2]] as const),
  ]
  positions
    .flat()
    .forEach((value, index) => binary.writeFloatLE(value, index * 4))
  const json = {
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        max: declaredBounds.max,
        min: declaredBounds.min,
        type: 'VEC3',
      },
    ],
    asset: { generator: 'Good Opal test fixture', version: '2.0' },
    buffers: [
      {
        byteLength: binary.length,
        ...(options.externalBufferUri ? { uri: options.externalBufferUri } : {}),
      },
    ],
    bufferViews: [{ buffer: 0, byteLength: options.positionBufferViewLength ?? binary.length }],
    ...(options.requiredExtension ? { extensionsRequired: [options.requiredExtension] } : {}),
    materials: [
      options.unnamedMaterial
        ? {}
        : {
            name: options.whitespaceMaterial ? ' STERLING_SILVER ' : 'STERLING_SILVER',
            ...(options.invalidMaterialTexture
              ? { pbrMetallicRoughness: { baseColorTexture: { index: 999 } } }
              : {}),
            ...(options.invalidMaterialField ? { emissiveFactor: null } : {}),
          },
      { name: options.duplicateMaterial ? 'STERLING_SILVER' : 'OXIDIZED_RECESS' },
      { name: 'MAKER_MARK' },
    ],
    meshes: [
      {
        primitives: [0, 1, 2].map((material) => ({
          attributes: {
            POSITION: 0,
            ...(options.normalAccessor === undefined ? {} : { NORMAL: options.normalAccessor }),
          },
          ...(options.indicesAccessor === undefined ? {} : { indices: options.indicesAccessor }),
          material,
        })),
      },
    ],
    nodes: nodes.map((node, index) => ({
      ...node,
      ...(index === 0 && options.invalidCamera ? { camera: 999 } : {}),
      ...(index === 0 && options.invalidNodeField ? { weights: null } : {}),
    })),
    scene: 0,
    scenes: [{ nodes: [0] }, ...(options.invalidScene ? [{ nodes: [999] }] : [])],
  }
  const jsonChunk = paddedChunk(Buffer.from(JSON.stringify(json)), 0x20)
  const binaryChunk = paddedChunk(binary, 0)
  const totalLength = 12 + 8 + jsonChunk.length + 8 + binaryChunk.length
  const header = Buffer.alloc(12)
  header.writeUInt32LE(0x46546c67, 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(totalLength, 8)
  const jsonHeader = Buffer.alloc(8)
  jsonHeader.writeUInt32LE(jsonChunk.length, 0)
  jsonHeader.writeUInt32LE(0x4e4f534a, 4)
  const binaryHeader = Buffer.alloc(8)
  binaryHeader.writeUInt32LE(binaryChunk.length, 0)
  binaryHeader.writeUInt32LE(0x004e4942, 4)
  return Buffer.concat([header, jsonHeader, jsonChunk, binaryHeader, binaryChunk])
}
