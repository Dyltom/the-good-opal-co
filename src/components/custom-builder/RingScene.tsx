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
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  ClampToEdgeWrapping,
  Color,
  Float32BufferAttribute,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { computePhotoCrop } from '@/lib/custom-builder/photo-crop'
import { ringStyleGeometryProfiles, type BuilderOpal, type RingConfig } from './config'

export type RingView = 'three-quarter' | 'front' | 'profile'

interface RingSceneProps {
  config: RingConfig
  allowMotion: boolean
  onContextLost: () => void
  opalImageUrls: readonly string[]
  selectedOpal?: BuilderOpal
  view: RingView
}

type StoneDimensions = readonly [width: number, height: number]

const metalColours: Record<RingConfig['metal'], string> = {
  'sterling-silver': '#c9cac7',
  '14k-gold': '#cda84d',
  '18k-gold': '#d9ad42',
  'white-gold': '#dfddd5',
  'rose-gold': '#bd806e',
  platinum: '#e4e3df',
}

const stoneDimensions: Record<RingConfig['shape'], StoneDimensions> = {
  round: [0.42, 0.42],
  oval: [0.4, 0.5],
  elongated: [0.35, 0.62],
  cushion: [0.5, 0.5],
  pear: [0.4, 0.5],
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

const cameraPositions: Record<RingView, [number, number, number]> = {
  'three-quarter': [3.2, 3.8, 4.2],
  front: [0, 5.8, 0.3],
  profile: [0, 0.8, 5.8],
}

function CameraPreset({ view }: { view: RingView }) {
  const { camera, invalidate } = useThree()

  useEffect(() => {
    camera.position.set(...cameraPositions[view])
    camera.lookAt(0, 0.42, 0)
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, invalidate, view])

  return null
}

function getRingMeasurements(config: RingConfig) {
  const insideDiameterMm = 11.63 + 0.8128 * config.size
  const innerRadius = insideDiameterMm / 20
  const radialThickness = 0.085
  const axialHalfWidth = 0.11
  const centreRadius = innerRadius + radialThickness
  const outerRadius = centreRadius + radialThickness
  return {
    axialHalfWidth,
    centreRadius,
    outerRadius,
    radialThickness,
    settingY: outerRadius + 0.07,
  }
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
      metalness={isSterlingSilver ? 1 : 0.98}
      roughness={isSterlingSilver ? Math.max(0.34, roughness) : roughness}
      clearcoat={isSterlingSilver ? 0 : 0.26}
      clearcoatRoughness={isSterlingSilver ? 0.32 : 0.16}
      envMapIntensity={isSterlingSilver ? 0.9 : 1.2}
    />
  )
}

function PatinaMaterial() {
  return <meshStandardMaterial color="#454641" metalness={0.65} roughness={0.55} />
}

function getStoneDimensions(config: RingConfig, selectedOpal?: BuilderOpal): StoneDimensions {
  const [width, defaultHeight] = stoneDimensions[config.shape]
  if (!selectedOpal || selectedOpal.visual.evidence !== 'catalogue') {
    return [width, defaultHeight]
  }
  const compatibleShape =
    selectedOpal.visual.silhouette === config.shape ||
    (selectedOpal.visual.silhouette === 'elongated' && config.shape === 'oval')
  if (!compatibleShape) return [width, defaultHeight]
  return [width, Math.min(0.72, Math.max(width, width * selectedOpal.visual.aspectRatio))]
}

function outlinePoint(
  shape: RingConfig['shape'],
  angle: number,
  width: number,
  height: number,
  offset = 0
): readonly [number, number] {
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  const adjustedWidth = width + offset
  const adjustedHeight = height + offset

  if (shape === 'cushion') {
    return [
      Math.sign(cosine) * Math.pow(Math.abs(cosine), 0.5) * adjustedWidth,
      Math.sign(sine) * Math.pow(Math.abs(sine), 0.5) * adjustedHeight,
    ]
  }
  if (shape === 'pear') {
    const taper = 0.15 + 0.85 * Math.pow((sine + 1) / 2, 0.65)
    return [cosine * adjustedWidth * taper, sine * adjustedHeight]
  }
  return [cosine * adjustedWidth, sine * adjustedHeight]
}

function evenlySpacedOutlinePoints(
  shape: RingConfig['shape'],
  width: number,
  height: number,
  offset: number,
  count: number
): readonly { key: number; x: number; y: number }[] {
  const samples = Array.from({ length: 361 }, (_, index) => {
    const angle = (index / 360) * Math.PI * 2
    const [x, y] = outlinePoint(shape, angle, width, height, offset)
    return { x, y }
  })
  const distances = [0]
  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1]!
    const current = samples[index]!
    distances.push(
      (distances[index - 1] ?? 0) + Math.hypot(current.x - previous.x, current.y - previous.y)
    )
  }
  const perimeter = distances.at(-1) ?? 0
  return Array.from({ length: count }, (_, index) => {
    const target = (index / count) * perimeter
    const sampleIndex = distances.findIndex((distance) => distance >= target)
    const point = samples[Math.max(0, sampleIndex)] ?? samples[0]!
    return { key: index, ...point }
  })
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
  height: number
): BufferGeometry {
  const geometry = new BufferGeometry()
  const radialSegments = 18
  const angularSegments = 72
  const baseZ = -0.045
  const girdleZ = 0.035
  // The sold collection uses low cabochons. A shallow dome keeps the photographed
  // face legible and avoids ballooning its colour pattern around the shoulders.
  const domeHeight = Math.min(width, height) * 0.25
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

function OpalCabochon({
  config,
  dimensions,
  opalImageUrls,
  selectedOpal,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  opalImageUrls: readonly string[]
  selectedOpal?: BuilderOpal
}) {
  const { gl } = useThree()
  const [width, height] = dimensions
  const texture = useMemo(
    () => createOpalTexture(config.stone, selectedOpal),
    [config.stone, selectedOpal]
  )
  const geometry = useMemo(
    () => createCabochonGeometry(config.shape, width, height),
    [config.shape, height, width]
  )
  const palette = opalPalettes[config.stone]
  const photoSources: string[] =
    opalImageUrls.length > 0 ? [...opalImageUrls] : ['/images/products/20210923_172817.jpg']
  const sourcePhotos = useTexture(photoSources)
  const selectedPhotoIndex = selectedOpal ? photoSources.indexOf(selectedOpal.imageUrl) : 0
  const sourcePhoto = sourcePhotos[Math.max(0, selectedPhotoIndex)] ?? sourcePhotos[0]!
  const photoTexture = useMemo(() => {
    const crop = selectedOpal?.visual.textureCrop
    const nextTexture = sourcePhoto.clone()
    nextTexture.colorSpace = SRGBColorSpace
    nextTexture.wrapS = ClampToEdgeWrapping
    nextTexture.wrapT = ClampToEdgeWrapping
    nextTexture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    if (crop) {
      const image = sourcePhoto.image as { width?: number; height?: number } | undefined
      const cropRect = computePhotoCrop(image?.width ?? 1, image?.height ?? 1, width / height, crop)
      nextTexture.repeat.set(cropRect.width, cropRect.height)
      nextTexture.offset.set(cropRect.left, 1 - cropRect.top - cropRect.height)
    }
    nextTexture.needsUpdate = true
    return nextTexture
  }, [gl, height, selectedOpal?.visual.textureCrop, sourcePhoto, width])

  useEffect(() => () => texture.dispose(), [texture])
  useEffect(() => () => photoTexture.dispose(), [photoTexture])
  useEffect(() => () => geometry.dispose(), [geometry])

  const usesProductPhoto = Boolean(selectedOpal?.visual.textureCrop)

  if (usesProductPhoto) {
    return (
      <mesh geometry={geometry}>
        <meshBasicMaterial attach="material-0" map={photoTexture} toneMapped={false} />
        <meshStandardMaterial
          attach="material-1"
          color={selectedOpal?.visual.bodyColour ?? palette.body}
          roughness={0.24}
          metalness={0}
        />
      </mesh>
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
  thickness: number
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
      -0.07,
      outerX,
      outerY,
      0.055,
      innerX,
      innerY,
      -0.07,
      innerX,
      innerY,
      0.055
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
  offset,
  thickness,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  offset: number
  thickness: number
}) {
  const [width, height] = dimensions
  const geometry = useMemo(
    () => createBezelWallGeometry(config.shape, width, height, offset, thickness),
    [config.shape, height, offset, thickness, width]
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      <MetalMaterial metal={config.metal} roughness={0.3} />
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
}: {
  config: RingConfig
  dimensions: StoneDimensions
  offset: number
  radius: number
  z: number
  finish?: 'metal' | 'patina'
}) {
  const [width, height] = dimensions
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        Array.from({ length: 72 }, (_, index) => {
          const angle = (index / 72) * Math.PI * 2
          const [x, y] = outlinePoint(config.shape, angle, width, height, offset)
          return new Vector3(x, y, z)
        }),
        true,
        'centripetal'
      ),
    [config.shape, height, offset, width, z]
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

function Setting({
  config,
  opalImageUrls,
  selectedOpal,
}: {
  config: RingConfig
  opalImageUrls: readonly string[]
  selectedOpal?: BuilderOpal
}) {
  const dimensions = getStoneDimensions(config, selectedOpal)
  const [width, height] = dimensions
  const profile = ringStyleGeometryProfiles[config.style]
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
        offset={profile.bezelWallOffset}
        thickness={profile.bezelWallThickness}
      />
      <StoneOutline
        config={config}
        dimensions={dimensions}
        offset={Math.max(0.004, profile.bezelLipOffset - profile.bezelLipRadius * 0.55)}
        radius={0.009}
        z={0.052}
        finish="patina"
      />
      <StoneOutline
        config={config}
        dimensions={dimensions}
        offset={profile.bezelLipOffset}
        radius={profile.bezelLipRadius}
        z={0.055}
      />

      {config.setting === 'beaded' && (
        <>
          <StoneOutline
            config={config}
            dimensions={dimensions}
            offset={profile.haloSupportOffset}
            radius={profile.haloSupportRadius}
            z={0.055}
            finish="patina"
          />
          {beads.map(({ key, x, y }) => (
            <mesh key={key} position={[x, y, 0.06]} scale={[1, 1, 0.72]}>
              <sphereGeometry args={[profile.beadRadius, 14, 14]} />
              <MetalMaterial metal={config.metal} roughness={0.42} />
            </mesh>
          ))}
        </>
      )}

      <OpalCabochon
        config={config}
        dimensions={dimensions}
        opalImageUrls={opalImageUrls}
        selectedOpal={selectedOpal}
      />
    </group>
  )
}

function Shoulder({
  points,
  radius,
  metal,
}: {
  points: readonly (readonly [number, number, number])[]
  radius: number
  metal: RingConfig['metal']
}) {
  const curve = useMemo(
    () => new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z))),
    [points]
  )

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 40, radius, 14, false]} />
        <MetalMaterial metal={metal} roughness={0.2} />
      </mesh>
      {[points[0]!, points.at(-1)!].map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[radius, 14, 14]} />
          <MetalMaterial metal={metal} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Shank({
  radius,
  tubeRadius,
  metal,
}: {
  radius: number
  tubeRadius: number
  metal: RingConfig['metal']
}) {
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        Array.from({ length: 97 }, (_, index) => {
          const angle = (115 + (310 * index) / 96) * (Math.PI / 180)
          return new Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0)
        })
      ),
    [radius]
  )

  return (
    <mesh scale={[1, 1, 1.18]}>
      <tubeGeometry args={[curve, 128, tubeRadius, 16, false]} />
      <MetalMaterial metal={metal} roughness={0.25} />
    </mesh>
  )
}

function RingModel({
  config,
  opalImageUrls,
  selectedOpal,
}: {
  config: RingConfig
  opalImageUrls: readonly string[]
  selectedOpal?: BuilderOpal
}) {
  const metal = config.metal
  const styleProfile = ringStyleGeometryProfiles[config.style]
  const [stoneWidth] = getStoneDimensions(config, selectedOpal)
  const measurements = getRingMeasurements(config)
  const shoulderRadius = styleProfile.shoulderRadius
  const endX = stoneWidth - 0.02
  const gapAngle = (115 * Math.PI) / 180
  const gapX = measurements.centreRadius * Math.cos(gapAngle)
  const gapY = measurements.centreRadius * Math.sin(gapAngle)
  const shoulderPoints = useMemo(
    () => ({
      left: [
        [gapX, gapY, 0],
        [-endX - 0.035, measurements.settingY - 0.14, 0],
        [-endX, measurements.settingY - 0.035, 0],
      ] as const,
      right: [
        [-gapX, gapY, 0],
        [endX + 0.035, measurements.settingY - 0.14, 0],
        [endX, measurements.settingY - 0.035, 0],
      ] as const,
    }),
    [endX, gapX, gapY, measurements]
  )

  return (
    <group>
      <Shank
        radius={measurements.centreRadius}
        tubeRadius={styleProfile.shankRadius}
        metal={metal}
      />

      <Shoulder points={shoulderPoints.left} radius={shoulderRadius} metal={metal} />
      <Shoulder points={shoulderPoints.right} radius={shoulderRadius} metal={metal} />

      <group position={[0, measurements.settingY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Setting config={config} opalImageUrls={opalImageUrls} selectedOpal={selectedOpal} />
      </group>
    </group>
  )
}

export function RingScene({
  config,
  allowMotion,
  onContextLost,
  opalImageUrls,
  selectedOpal,
  view,
}: RingSceneProps) {
  const background = useMemo(() => new Color('#151512'), [])
  const measurements = getRingMeasurements(config)

  return (
    <Canvas
      camera={{ position: cameraPositions[view], fov: 32 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      scene={{ background }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true })
      }}
    >
      <ambientLight intensity={0.92} />
      <directionalLight position={[4, 5, 6]} intensity={3.1} color="#fffaf0" />
      <directionalLight position={[-4, 1, 3]} intensity={2.1} color="#eef4f2" />
      <pointLight position={[0, -2, 3]} intensity={0.8} color="#fff7eb" />

      <CameraPreset view={view} />

      <RingModel config={config} opalImageUrls={opalImageUrls} selectedOpal={selectedOpal} />

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
        target={[0, 0.42, 0]}
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
