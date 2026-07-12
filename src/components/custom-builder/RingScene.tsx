'use client'

/* eslint-disable react/no-unknown-property -- React Three Fiber JSX maps these props to Three.js objects. */

import { useEffect, useMemo } from 'react'
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useTexture,
} from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  ClampToEdgeWrapping,
  Color,
  Float32BufferAttribute,
  LinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { computePhotoCrop } from '@/lib/custom-builder/photo-crop'
import {
  getHaloSupportGeometry,
  ringStyleGeometryProfiles,
  type BuilderOpal,
  type RingConfig,
} from './config'
import {
  cameraPositions,
  cameraUpVectors,
  evenlySpacedOutlinePoints,
  getCabochonDepthProfile,
  getCameraPosition,
  getRingFramingTarget,
  getRingMeasurements,
  getSettingPlacement,
  getStoneDimensions,
  outlinePoint,
  settingRotationX,
  type CameraVector,
  type StoneDimensions,
} from './geometry'

export type RingView = 'three-quarter' | 'front' | 'profile'

interface RingSceneProps {
  config: RingConfig
  allowMotion: boolean
  onContextLost: () => void
  selectedOpal?: BuilderOpal
  view: RingView
}

const metalColours: Record<RingConfig['metal'], string> = {
  'sterling-silver': '#d2d3cf',
  '14k-gold': '#cda84d',
  '18k-gold': '#d9ad42',
  'white-gold': '#dfddd5',
  'rose-gold': '#bd806e',
  platinum: '#e4e3df',
}

const opalPalettes: Record<
  RingConfig['stone'],
  { base: string; body: string; flashes: readonly string[] }
> = {
  'blue-green': {
    base: '#cce7de',
    body: '#6cc9c1',
    flashes: ['#2fd7e5', '#55ef9a', '#406dff', '#ffd34f'],
  },
  sunset: {
    base: '#eadbcf',
    body: '#d99a86',
    flashes: ['#ff4b48', '#ffae33', '#f5ef58', '#60dcb0', '#8c79ff'],
  },
  lightning: {
    base: '#182939',
    body: '#0b1724',
    flashes: ['#16d7ef', '#43ef8f', '#405dff', '#ff4f8b', '#ffcb42'],
  },
  crystal: {
    base: '#e5ece7',
    body: '#b8d9d3',
    flashes: ['#6fe1ff', '#79f0ad', '#ffd85a', '#ff798d', '#a98dff'],
  },
}

function CameraPreset({ target, view }: { target: CameraVector; view: RingView }) {
  const { camera, invalidate, size } = useThree()

  useEffect(() => {
    const [x, y, z] = getCameraPosition(view, size.width, size.height)
    camera.up.set(...cameraUpVectors[view])
    camera.position.set(x, y, z)
    camera.lookAt(...target)
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, invalidate, size.height, size.width, target, view])

  return null
}

function MetalMaterial({
  metal,
  roughness = 0.2,
}: {
  metal: RingConfig['metal']
  roughness?: number
}) {
  const isSterlingSilver = metal === 'sterling-silver'
  return (
    <meshPhysicalMaterial
      color={metalColours[metal]}
      metalness={isSterlingSilver ? 0.9 : 0.98}
      roughness={isSterlingSilver ? Math.max(0.32, roughness) : roughness}
      clearcoat={isSterlingSilver ? 0.08 : 0.26}
      clearcoatRoughness={isSterlingSilver ? 0.26 : 0.16}
      envMapIntensity={1.2}
    />
  )
}

function PatinaMaterial() {
  return <meshStandardMaterial color="#454641" metalness={0.65} roughness={0.55} />
}

function createOpalTexture(stone: RingConfig['stone'], selectedOpal?: BuilderOpal): CanvasTexture {
  const palette = opalPalettes[stone]
  const seed = selectedOpal?.visual.patternSeed ?? 19
  const bodyColour = selectedOpal?.visual.bodyColour ?? palette.body
  const flashColours = selectedOpal?.visual.flashColours ?? palette.flashes
  const highlight = new Color(bodyColour).lerp(new Color('#e8eee9'), 0.34).getStyle()
  const canvas = document.createElement('canvas')
  canvas.width = 384
  canvas.height = 384
  const context = canvas.getContext('2d')

  if (!context) return new CanvasTexture(canvas)

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  background.addColorStop(0, highlight)
  background.addColorStop(0.52, bodyColour)
  background.addColorStop(1, highlight)
  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)

  const positions = [
    [0.18, 0.22, 0.18],
    [0.72, 0.18, 0.2],
    [0.46, 0.38, 0.24],
    [0.82, 0.55, 0.16],
    [0.2, 0.68, 0.22],
    [0.56, 0.78, 0.2],
    [0.84, 0.86, 0.16],
    [0.35, 0.92, 0.12],
  ] as const

  positions.forEach(([x, y, radius], index) => {
    const colour = flashColours[(index + seed) % flashColours.length] ?? flashColours[0]
    const seedX = (((seed >>> (index % 16)) & 15) - 7) / 90
    const seedY = (((seed >>> ((index + 5) % 16)) & 15) - 7) / 90
    const gradient = context.createRadialGradient(
      (x + seedX) * canvas.width,
      (y + seedY) * canvas.height,
      0,
      (x + seedX) * canvas.width,
      (y + seedY) * canvas.height,
      radius * canvas.width
    )
    gradient.addColorStop(0, `${colour}e6`)
    gradient.addColorStop(0.34, `${colour}88`)
    gradient.addColorStop(1, `${colour}00`)
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
  })

  context.globalCompositeOperation = 'soft-light'
  for (let index = 0; index < 28; index += 1) {
    const x = ((index * 89 + seed) % 367) + 8
    const y = ((index * 137 + (seed >>> 8)) % 359) + 12
    context.fillStyle = index % 2 === 0 ? '#f9fff6aa' : '#1a3a4a44'
    context.beginPath()
    context.ellipse(x, y, 5 + (index % 5) * 3, 2 + (index % 4) * 2, index * 0.4, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(1.15, 1.15)
  texture.needsUpdate = true
  return texture
}

function createCabochonGeometry(
  shape: RingConfig['shape'],
  width: number,
  height: number,
  depthMm?: number
): BufferGeometry {
  const geometry = new BufferGeometry()
  const radialSegments = 18
  const angularSegments = 72
  const { baseZ, domeHeight, girdleZ } = getCabochonDepthProfile(width, height, depthMm)
  const positions: number[] = [0, 0, girdleZ + domeHeight]
  const uvs: number[] = [0.5, 0.5]
  const indices: number[] = []

  for (let ring = 1; ring <= radialSegments; ring += 1) {
    const radius = ring / radialSegments
    const z = girdleZ + domeHeight * Math.pow(Math.max(0, 1 - radius * radius), 0.72)

    for (let segment = 0; segment < angularSegments; segment += 1) {
      const angle = (segment / angularSegments) * Math.PI * 2
      const [x, y] = outlinePoint(shape, angle, width, height)
      positions.push(x * radius, y * radius, z)
      uvs.push(0.5 + (x / width) * radius * 0.5, 0.5 + (y / height) * radius * 0.5)
    }
  }

  for (let segment = 0; segment < angularSegments; segment += 1) {
    const next = (segment + 1) % angularSegments
    indices.push(0, 1 + segment, 1 + next)
  }

  for (let ring = 1; ring < radialSegments; ring += 1) {
    const innerStart = 1 + (ring - 1) * angularSegments
    const outerStart = innerStart + angularSegments
    for (let segment = 0; segment < angularSegments; segment += 1) {
      const next = (segment + 1) % angularSegments
      indices.push(
        innerStart + segment,
        outerStart + segment,
        outerStart + next,
        innerStart + segment,
        outerStart + next,
        innerStart + next
      )
    }
  }

  const domeIndexCount = indices.length

  const topRimStart = 1 + (radialSegments - 1) * angularSegments
  const bottomRimStart = positions.length / 3
  for (let segment = 0; segment < angularSegments; segment += 1) {
    const angle = (segment / angularSegments) * Math.PI * 2
    const [x, y] = outlinePoint(shape, angle, width, height)
    positions.push(x, y, baseZ)
    uvs.push(0.5 + (x / width) * 0.5, 0.5 + (y / height) * 0.5)
  }

  for (let segment = 0; segment < angularSegments; segment += 1) {
    const next = (segment + 1) % angularSegments
    indices.push(
      topRimStart + segment,
      bottomRimStart + segment,
      bottomRimStart + next,
      topRimStart + segment,
      bottomRimStart + next,
      topRimStart + next
    )
  }

  const bottomCentre = positions.length / 3
  positions.push(0, 0, baseZ)
  uvs.push(0.5, 0.5)
  for (let segment = 0; segment < angularSegments; segment += 1) {
    const next = (segment + 1) % angularSegments
    indices.push(bottomCentre, bottomRimStart + next, bottomRimStart + segment)
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.addGroup(0, domeIndexCount, 0)
  geometry.addGroup(domeIndexCount, indices.length - domeIndexCount, 1)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

const photoGlossVertexShader = /* glsl */ `
  varying vec3 vViewDirection;
  varying vec3 vViewNormal;

  void main() {
    vec3 shellPosition = position + normal * 0.0015;
    vec4 viewPosition = modelViewMatrix * vec4(shellPosition, 1.0);
    vViewDirection = normalize(-viewPosition.xyz);
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewPosition;
  }
`

const photoGlossFragmentShader = /* glsl */ `
  varying vec3 vViewDirection;
  varying vec3 vViewNormal;

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDirection = normalize(vViewDirection);
    vec3 galleryLight = normalize(vec3(-0.42, 0.68, 0.61));
    vec3 halfDirection = normalize(galleryLight + viewDirection);
    float highlight = pow(max(dot(normal, halfDirection), 0.0), 54.0);
    float edgeSheen = pow(1.0 - max(dot(normal, viewDirection), 0.0), 5.0);
    float alpha = min(0.2, highlight * 0.18 + edgeSheen * 0.035);
    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`

function ProductPhotoGloss({ geometry }: { geometry: BufferGeometry }) {
  return (
    <mesh geometry={geometry} renderOrder={2}>
      <shaderMaterial
        attach="material-0"
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={photoGlossFragmentShader}
        toneMapped={false}
        transparent
        vertexShader={photoGlossVertexShader}
      />
      <meshBasicMaterial attach="material-1" depthWrite={false} visible={false} />
    </mesh>
  )
}

function OpalCabochon({
  config,
  dimensions,
  selectedOpal,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  selectedOpal?: BuilderOpal
}) {
  const [width, height] = dimensions
  const texture = useMemo(
    () => createOpalTexture(config.stone, selectedOpal),
    [config.stone, selectedOpal]
  )
  const geometry = useMemo(
    () =>
      createCabochonGeometry(config.shape, width, height, selectedOpal?.visual.dimensionsMm?.depth),
    [config.shape, height, selectedOpal?.visual.dimensionsMm?.depth, width]
  )
  const palette = opalPalettes[config.stone]
  // Catalogue growth must not make the WebGL scene download every product
  // image. The selected listing is the only possible texture source.
  const sourcePhoto = useTexture(selectedOpal?.imageUrl ?? '/images/products/20210923_172817.jpg')
  const photoTexture = useMemo(() => {
    const crop = selectedOpal?.visual.textureCrop
    const nextTexture = sourcePhoto.clone()
    nextTexture.colorSpace = SRGBColorSpace
    nextTexture.wrapS = ClampToEdgeWrapping
    nextTexture.wrapT = ClampToEdgeWrapping
    // These reviewed photographs contain very small flashes of colour. Sampling
    // generated whole-image mipmaps softens those flashes toward the pale body
    // colour before the crop reaches the stone. Direct bilinear sampling keeps
    // the catalogue pixels intact without introducing nearest-neighbour noise.
    nextTexture.generateMipmaps = false
    nextTexture.minFilter = LinearFilter
    nextTexture.magFilter = LinearFilter
    if (crop) {
      const image = sourcePhoto.image as { width?: number; height?: number } | undefined
      const cropRect = computePhotoCrop(image?.width ?? 1, image?.height ?? 1, width / height, crop)
      nextTexture.repeat.set(cropRect.width, cropRect.height)
      nextTexture.offset.set(cropRect.left, 1 - cropRect.top - cropRect.height)
    }
    nextTexture.needsUpdate = true
    return nextTexture
  }, [height, selectedOpal?.visual.textureCrop, sourcePhoto, width])

  useEffect(() => () => texture.dispose(), [texture])
  useEffect(() => () => photoTexture.dispose(), [photoTexture])
  useEffect(() => () => geometry.dispose(), [geometry])

  const usesProductPhoto = Boolean(selectedOpal?.visual.textureCrop)

  if (usesProductPhoto) {
    return (
      <group>
        <mesh geometry={geometry}>
          <meshBasicMaterial attach="material-0" map={photoTexture} toneMapped={false} />
          <meshBasicMaterial
            attach="material-1"
            color={selectedOpal?.visual.bodyColour ?? palette.body}
            toneMapped={false}
          />
        </mesh>
        <ProductPhotoGloss geometry={geometry} />
      </group>
    )
  }

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        attach="material-0"
        map={texture}
        color={palette.base}
        roughness={0.13}
        specularIntensity={1}
        transmission={selectedOpal?.visual.transmission ?? 0.1}
        thickness={0.6}
        clearcoat={1}
        clearcoatRoughness={0.035}
        iridescence={1}
        iridescenceIOR={1.42}
        iridescenceThicknessRange={[160, 720]}
        envMapIntensity={1.5}
      />
      <meshPhysicalMaterial
        attach="material-1"
        map={texture}
        color={palette.body}
        roughness={0.24}
        metalness={0}
        clearcoat={0.7}
        clearcoatRoughness={0.08}
      />
    </mesh>
  )
}

function createBezelWallGeometry(
  shape: RingConfig['shape'],
  width: number,
  height: number,
  offset: number,
  thickness: number,
  bottomZ: number,
  topZ: number
): BufferGeometry {
  const geometry = new BufferGeometry()
  const segments = 96
  const positions: number[] = []
  const indices: number[] = []

  for (let segment = 0; segment < segments; segment += 1) {
    const angle = (segment / segments) * Math.PI * 2
    const [outerX, outerY] = outlinePoint(shape, angle, width, height, offset + thickness / 2)
    const [innerX, innerY] = outlinePoint(shape, angle, width, height, offset - thickness / 2)
    positions.push(
      outerX,
      outerY,
      bottomZ,
      outerX,
      outerY,
      topZ,
      innerX,
      innerY,
      bottomZ,
      innerX,
      innerY,
      topZ
    )
  }
  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments
    const outerBottom = segment * 4
    const outerTop = outerBottom + 1
    const innerBottom = outerBottom + 2
    const innerTop = outerBottom + 3
    const nextOuterBottom = next * 4
    const nextOuterTop = nextOuterBottom + 1
    const nextInnerBottom = nextOuterBottom + 2
    const nextInnerTop = nextOuterBottom + 3
    indices.push(
      outerBottom,
      nextOuterBottom,
      nextOuterTop,
      outerBottom,
      nextOuterTop,
      outerTop,
      innerBottom,
      innerTop,
      nextInnerTop,
      innerBottom,
      nextInnerTop,
      nextInnerBottom,
      outerTop,
      nextOuterTop,
      nextInnerTop,
      outerTop,
      nextInnerTop,
      innerTop,
      outerBottom,
      innerBottom,
      nextInnerBottom,
      outerBottom,
      nextInnerBottom,
      nextOuterBottom
    )
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function BezelWall({
  config,
  dimensions,
  bottomZ,
  finish = 'metal',
  offset,
  thickness,
  topZ,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  bottomZ: number
  finish?: 'metal' | 'patina'
  offset: number
  thickness: number
  topZ: number
}) {
  const [width, height] = dimensions
  const geometry = useMemo(
    () => createBezelWallGeometry(config.shape, width, height, offset, thickness, bottomZ, topZ),
    [bottomZ, config.shape, height, offset, thickness, topZ, width]
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      {finish === 'patina' ? (
        <PatinaMaterial />
      ) : (
        <MetalMaterial metal={config.metal} roughness={0.3} />
      )}
    </mesh>
  )
}

function StoneOutline({
  config,
  dimensions,
  offset,
  radius,
  z,
  finish = 'metal',
  edgeVariation = 0,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  offset: number
  radius: number
  z: number
  finish?: 'metal' | 'patina'
  edgeVariation?: number
}) {
  const [width, height] = dimensions
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        Array.from({ length: 72 }, (_, index) => {
          const angle = (index / 72) * Math.PI * 2
          const handmadeOffset =
            edgeVariation * (Math.sin(angle * 3 + 0.4) * 0.65 + Math.sin(angle * 7) * 0.35)
          const [x, y] = outlinePoint(config.shape, angle, width, height, offset + handmadeOffset)
          return new Vector3(x, y, z)
        }),
        true,
        'centripetal'
      ),
    [config.shape, edgeVariation, height, offset, width, z]
  )

  return (
    <mesh>
      <tubeGeometry args={[curve, 96, radius, 14, true]} />
      {finish === 'patina' ? (
        <PatinaMaterial />
      ) : (
        <MetalMaterial metal={config.metal} roughness={0.2} />
      )}
    </mesh>
  )
}

function Setting({ config, selectedOpal }: { config: RingConfig; selectedOpal?: BuilderOpal }) {
  const dimensions = getStoneDimensions(config, selectedOpal)
  const [width, height] = dimensions
  const profile = ringStyleGeometryProfiles[config.style]
  const depthProfile = getCabochonDepthProfile(
    width,
    height,
    selectedOpal?.visual.dimensionsMm?.depth
  )
  const bezelBottom = depthProfile.baseZ - 0.012
  const bezelTop = depthProfile.girdleZ + 0.025
  const haloSupport = getHaloSupportGeometry(profile)
  const beadCount = profile.beadCount
  const beads = useMemo(
    () => evenlySpacedOutlinePoints(config.shape, width, height, profile.haloOffset, beadCount),
    [beadCount, config.shape, height, profile.haloOffset, width]
  )

  return (
    <group>
      <BezelWall
        config={config}
        dimensions={dimensions}
        bottomZ={bezelBottom}
        offset={profile.bezelWallOffset}
        thickness={profile.bezelWallThickness}
        topZ={bezelTop}
      />
      <StoneOutline
        config={config}
        dimensions={dimensions}
        offset={Math.max(0.004, profile.bezelLipOffset - profile.bezelLipRadius * 0.55)}
        radius={Math.max(0.005, profile.bezelLipRadius * 0.42)}
        z={0.043}
        finish="patina"
        edgeVariation={0.0015}
      />

      {config.setting === 'beaded' && (
        <>
          <BezelWall
            config={config}
            dimensions={dimensions}
            bottomZ={bezelBottom}
            finish="patina"
            offset={haloSupport.offset}
            thickness={haloSupport.thickness}
            topZ={0.03}
          />
          {beads.map(({ key, x, y }) => {
            // Sold Sun & Moon and Aurora rings use individually soldered beads.
            // Deterministic variation keeps the halo handmade without animating
            // or changing between renders.
            const size = 0.94 + ((key * 5) % 7) * 0.022
            const flattening = 0.68 + ((key * 3) % 5) * 0.025
            const heightVariation = (((key * 11) % 5) - 2) * 0.0015
            const radialLength = Math.hypot(x, y) || 1
            const radialJitter = (((key * 11) % 9) - 4) * 0.0012
            const tangentJitter = (((key * 13) % 7) - 3) * 0.0008
            const beadX = x + (x / radialLength) * radialJitter - (y / radialLength) * tangentJitter
            const beadY = y + (y / radialLength) * radialJitter + (x / radialLength) * tangentJitter
            return (
              <mesh
                key={key}
                position={[beadX, beadY, 0.048 + heightVariation]}
                scale={[size, size, flattening]}
              >
                <sphereGeometry args={[profile.beadRadius, 14, 14]} />
                <MetalMaterial metal={config.metal} roughness={0.46} />
              </mesh>
            )
          })}
        </>
      )}

      <OpalCabochon config={config} dimensions={dimensions} selectedOpal={selectedOpal} />
    </group>
  )
}

function RingShank({
  metal,
  radius,
  settingBaseY,
  settingHalfWidth,
  shoulderRadius,
  shoulderDepth,
  tubeRadius,
  tubeDepth,
}: {
  metal: RingConfig['metal']
  radius: number
  settingBaseY: number
  settingHalfWidth: number
  shoulderRadius: number
  shoulderDepth: number
  tubeRadius: number
  tubeDepth: number
}) {
  const curve = useMemo(() => {
    // Let the shoulder surface overlap the bezel's outer wall at its base. The
    // earlier centreline ended inside the stone width, leaving a cathedral-like
    // air gap instead of the low solder join visible on the sold rings.
    const joinX = settingHalfWidth - shoulderDepth * 0.4
    const joinY = settingBaseY + shoulderDepth * 0.35
    const ringPoints = Array.from({ length: 97 }, (_, index) => {
      const angle = (115 + (310 * index) / 96) * (Math.PI / 180)
      return new Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0)
    })
    return new CatmullRomCurve3(
      [
        new Vector3(-joinX, joinY, 0),
        new Vector3(-joinX - 0.03, settingBaseY - 0.045, 0),
        ...ringPoints,
        new Vector3(joinX + 0.03, settingBaseY - 0.045, 0),
        new Vector3(joinX, joinY, 0),
      ],
      false,
      'centripetal'
    )
  }, [radius, settingBaseY, settingHalfWidth, shoulderDepth])
  const geometry = useMemo(() => {
    const tubularSegments = 160
    const radialSegments = 16
    const positions: number[] = []
    const indices: number[] = []

    for (let segment = 0; segment <= tubularSegments; segment += 1) {
      const progress = segment / tubularSegments
      const point = curve.getPointAt(progress)
      const tangent = curve.getTangentAt(progress).normalize()
      const inPlaneNormal = new Vector3(-tangent.y, tangent.x, 0).normalize()
      const shoulderDistance = Math.min(progress, 1 - progress)
      const shoulderBlend = Math.min(1, shoulderDistance / 0.14)
      const localHalfWidth = shoulderRadius + (tubeRadius - shoulderRadius) * shoulderBlend
      const localHalfDepth = shoulderDepth + (tubeDepth - shoulderDepth) * shoulderBlend

      for (let side = 0; side < radialSegments; side += 1) {
        const angle = (side / radialSegments) * Math.PI * 2
        positions.push(
          point.x + inPlaneNormal.x * Math.cos(angle) * localHalfDepth,
          point.y + inPlaneNormal.y * Math.cos(angle) * localHalfDepth,
          point.z + Math.sin(angle) * localHalfWidth
        )
      }
    }

    for (let segment = 0; segment < tubularSegments; segment += 1) {
      const currentStart = segment * radialSegments
      const nextStart = (segment + 1) * radialSegments
      for (let side = 0; side < radialSegments; side += 1) {
        const nextSide = (side + 1) % radialSegments
        indices.push(
          currentStart + side,
          nextStart + side,
          nextStart + nextSide,
          currentStart + side,
          nextStart + nextSide,
          currentStart + nextSide
        )
      }
    }

    const nextGeometry = new BufferGeometry()
    nextGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    nextGeometry.setIndex(indices)
    nextGeometry.computeVertexNormals()
    nextGeometry.computeBoundingSphere()
    return nextGeometry
  }, [curve, shoulderDepth, shoulderRadius, tubeDepth, tubeRadius])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      <MetalMaterial metal={metal} roughness={0.25} />
    </mesh>
  )
}

function RingModel({ config, selectedOpal }: { config: RingConfig; selectedOpal?: BuilderOpal }) {
  const metal = config.metal
  const styleProfile = ringStyleGeometryProfiles[config.style]
  const {
    measurements,
    settingY,
    stoneDimensions: dimensions,
  } = getSettingPlacement(config, selectedOpal)
  const [stoneWidth] = dimensions
  const settingHalfWidth =
    stoneWidth + styleProfile.bezelWallOffset + styleProfile.bezelWallThickness / 2

  return (
    <group>
      <RingShank
        metal={metal}
        radius={measurements.centreRadius}
        settingBaseY={measurements.outerRadius}
        settingHalfWidth={settingHalfWidth}
        shoulderDepth={styleProfile.shoulderDepth}
        shoulderRadius={styleProfile.shoulderRadius}
        tubeDepth={styleProfile.shankDepth}
        tubeRadius={styleProfile.shankRadius}
      />

      <group position={[0, settingY, 0]} rotation={[settingRotationX, 0, 0]}>
        <Setting config={config} selectedOpal={selectedOpal} />
      </group>
    </group>
  )
}

export function RingScene({
  config,
  allowMotion,
  onContextLost,
  selectedOpal,
  view,
}: RingSceneProps) {
  const background = useMemo(() => new Color('#151512'), [])
  const measurements = getRingMeasurements(config)
  const framingTarget = useMemo(
    () => getRingFramingTarget(config, selectedOpal),
    [config, selectedOpal]
  )

  return (
    <Canvas
      camera={{ position: cameraPositions[view], up: cameraUpVectors[view], fov: 32 }}
      dpr={[1, 2]}
      frameloop={allowMotion ? 'always' : 'demand'}
      gl={{ antialias: true, alpha: false }}
      scene={{ background }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace
        gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true })
      }}
    >
      <ambientLight intensity={0.82} />
      <directionalLight position={[4, 5, 6]} intensity={2.5} color="#fffaf0" />
      <directionalLight position={[-4, 1, 3]} intensity={1.5} color="#eef4f2" />
      <pointLight position={[0, -2, 3]} intensity={0.8} color="#fff7eb" />

      <CameraPreset target={framingTarget} view={view} />

      <RingModel config={config} selectedOpal={selectedOpal} />

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={4} position={[0, 4, -4]} scale={[5, 1.2, 1]} />
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#eef4f2"
          position={[-4, 1, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 1, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#fff2df"
          position={[4, -1, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 1, 1]}
        />
      </Environment>

      <ContactShadows
        position={[0, -measurements.outerRadius - 0.08, 0]}
        opacity={0.34}
        scale={4}
        blur={2.6}
        far={4}
      />
      <OrbitControls
        makeDefault
        target={framingTarget}
        enablePan={false}
        enableZoom
        minDistance={4.8}
        maxDistance={8.5}
        autoRotate={allowMotion}
        autoRotateSpeed={0.55}
      />
    </Canvas>
  )
}
