'use client'

/* eslint-disable react/no-unknown-property -- React Three Fiber JSX maps these props to Three.js objects. */

import { useEffect, useLayoutEffect, useMemo } from 'react'
import { Environment, Lightformer, OrbitControls, useTexture } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  ClampToEdgeWrapping,
  Color,
  Float32BufferAttribute,
  LinearFilter,
  PCFShadowMap,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from 'three'
import {
  computePlacedPhotoCrop,
  computePhotoTextureTransform,
} from '@/lib/custom-builder/photo-crop'
import type { BuilderStoneContourV1 } from '@/lib/custom-builder/stone-contour'
import {
  getHaloSupportGeometry,
  ringStyleGeometryProfiles,
  type BuilderOpal,
  type RingConfig,
} from './config'
import {
  applyHandmadeBeadVariation,
  cameraPositions,
  cameraUpVectors,
  evenlySpacedOutlinePoints,
  getCabochonDepthProfile,
  getBezelWallContourPoints,
  getCameraPosition,
  getPatinaGrooveProfile,
  getRingFramingTarget,
  getRingShankPathPoints,
  getRenderableOpalDepthMm,
  getStyleBeadCount,
  getSettingShoulderHalfWidth,
  getSettingPlacement,
  getStoneDimensions,
  outlinePoint,
  soldStyleOutlinePoint,
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
  'sterling-silver': '#eeeae2',
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
  roughness = 0.22,
}: {
  metal: RingConfig['metal']
  roughness?: number
}) {
  const isSterlingSilver = metal === 'sterling-silver'
  return (
    <meshPhysicalMaterial
      color={metalColours[metal]}
      metalness={0.96}
      roughness={isSterlingSilver ? Math.max(0.34, roughness) : roughness}
      clearcoat={0.04}
      clearcoatRoughness={0.36}
      envMapIntensity={2.2}
    />
  )
}

function PatinaMaterial({ metal }: { metal: RingConfig['metal'] }) {
  const shadowColour =
    metal === 'sterling-silver'
      ? '#2c2d29'
      : metal === '14k-gold' || metal === '18k-gold'
        ? '#6b4b22'
        : metal === 'rose-gold'
          ? '#704a42'
          : '#575a59'
  return <meshStandardMaterial color={shadowColour} metalness={0.72} roughness={0.62} />
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
  depthMm?: number,
  style?: RingConfig['style'],
  contour?: BuilderStoneContourV1
): BufferGeometry {
  const geometry = new BufferGeometry()
  const radialSegments = 18
  const angularSegments = contour?.radii.length ?? 72
  const { baseZ, domeHeight, girdleZ } = getCabochonDepthProfile(width, height, depthMm, style)
  const positions: number[] = [0, 0, girdleZ + domeHeight]
  const uvs: number[] = [0.5, 0.5]
  const indices: number[] = []

  for (let ring = 1; ring <= radialSegments; ring += 1) {
    const radius = ring / radialSegments
    const z = girdleZ + domeHeight * Math.pow(Math.max(0, 1 - radius * radius), 0.72)

    for (let segment = 0; segment < angularSegments; segment += 1) {
      const angle = (segment / angularSegments) * Math.PI * 2
      const [x, y] = outlinePoint(shape, angle, width, height, 0, contour)
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
    const [x, y] = outlinePoint(shape, angle, width, height, 0, contour)
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
      createCabochonGeometry(
        config.shape,
        width,
        height,
        getRenderableOpalDepthMm(selectedOpal),
        config.style,
        selectedOpal?.visual.contour
      ),
    [config.shape, config.style, height, selectedOpal, width]
  )
  const palette = opalPalettes[config.stone]
  // Catalogue growth must not make the WebGL scene download every product
  // image. The selected listing is the only possible texture source.
  const sourcePhoto = useTexture(selectedOpal?.imageUrl ?? '/images/products/20210923_172817.jpg')
  const photoTexture = useMemo(() => {
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
    nextTexture.matrixAutoUpdate = false
    nextTexture.needsUpdate = true
    return nextTexture
  }, [sourcePhoto])

  useLayoutEffect(() => {
    const crop = selectedOpal?.visual.textureCrop
    if (crop) {
      const rotation = (crop.rotation ?? 0) + config.opalRotation
      const image = sourcePhoto.image as { width?: number; height?: number } | undefined
      const cropRect = computePlacedPhotoCrop(
        image?.width ?? 1,
        image?.height ?? 1,
        width / height,
        crop,
        {
          opalPositionX: config.opalPositionX,
          opalPositionY: config.opalPositionY,
          opalRotation: config.opalRotation,
          opalScale: config.opalScale,
        }
      )
      const transform = computePhotoTextureTransform(cropRect, width / height, rotation)
      const [m00, m01, m02, m10, m11, m12] = transform.matrix
      photoTexture.matrix.set(m00, m01, m02, m10, m11, m12, 0, 0, 1)
    } else {
      photoTexture.matrix.identity()
    }
  }, [
    config.opalPositionX,
    config.opalPositionY,
    config.opalRotation,
    config.opalScale,
    height,
    photoTexture,
    selectedOpal?.visual.textureCrop,
    sourcePhoto.image,
    width,
  ])

  useEffect(() => () => texture.dispose(), [texture])
  useEffect(() => () => photoTexture.dispose(), [photoTexture])
  useEffect(() => () => geometry.dispose(), [geometry])

  const usesProductPhoto = Boolean(selectedOpal?.visual.textureCrop)

  if (usesProductPhoto) {
    return (
      <group>
        <mesh castShadow geometry={geometry} receiveShadow>
          <meshStandardMaterial
            attach="material-0"
            map={photoTexture}
            color="#ffffff"
            emissive="#ffffff"
            emissiveMap={photoTexture}
            emissiveIntensity={0.025}
            envMapIntensity={0.65}
            metalness={0}
            roughness={0.28}
          />
          <meshBasicMaterial
            attach="material-1"
            color={selectedOpal?.visual.bodyColour ?? palette.body}
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
  style: RingConfig['style'],
  shape: RingConfig['shape'],
  width: number,
  height: number,
  offset: number,
  thickness: number,
  bottomZ: number,
  topZ: number,
  contour?: BuilderStoneContourV1
): BufferGeometry {
  const geometry = new BufferGeometry()
  const segments = 96
  const positions: number[] = []
  const indices: number[] = []

  for (let segment = 0; segment < segments; segment += 1) {
    const angle = (segment / segments) * Math.PI * 2
    const { inner, outer } = getBezelWallContourPoints(
      style,
      shape,
      angle,
      width,
      height,
      offset,
      thickness,
      contour
    )
    const [outerX, outerY] = outer
    const [innerX, innerY] = inner
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

function createSettingBaseGeometry(
  style: RingConfig['style'],
  shape: RingConfig['shape'],
  width: number,
  height: number,
  offset: number,
  bottomZ: number,
  topZ: number,
  contour?: BuilderStoneContourV1
): BufferGeometry {
  const geometry = new BufferGeometry()
  const segments = 96
  const positions: number[] = [0, 0, bottomZ, 0, 0, topZ]
  const indices: number[] = []

  for (let segment = 0; segment < segments; segment += 1) {
    const angle = (segment / segments) * Math.PI * 2
    const [x, y] = soldStyleOutlinePoint(style, shape, angle, width, height, offset, contour)
    positions.push(x, y, bottomZ, x, y, topZ)
  }

  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments
    const bottom = 2 + segment * 2
    const top = bottom + 1
    const nextBottom = 2 + next * 2
    const nextTop = nextBottom + 1
    indices.push(
      0,
      nextBottom,
      bottom,
      1,
      top,
      nextTop,
      bottom,
      nextBottom,
      nextTop,
      bottom,
      nextTop,
      top
    )
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

function SettingBase({
  config,
  dimensions,
  bottomZ,
  offset,
  topZ,
  contour,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  bottomZ: number
  offset: number
  topZ: number
  contour?: BuilderStoneContourV1
}) {
  const [width, height] = dimensions
  const geometry = useMemo(
    () =>
      createSettingBaseGeometry(
        config.style,
        config.shape,
        width,
        height,
        offset,
        bottomZ,
        topZ,
        contour
      ),
    [bottomZ, config.shape, config.style, contour, height, offset, topZ, width]
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh castShadow geometry={geometry} receiveShadow>
      <MetalMaterial metal={config.metal} roughness={0.34} />
    </mesh>
  )
}

function BezelWall({
  config,
  dimensions,
  bottomZ,
  finish = 'metal',
  offset,
  thickness,
  topZ,
  contour,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  bottomZ: number
  finish?: 'metal' | 'patina'
  offset: number
  thickness: number
  topZ: number
  contour?: BuilderStoneContourV1
}) {
  const [width, height] = dimensions
  const geometry = useMemo(
    () =>
      createBezelWallGeometry(
        config.style,
        config.shape,
        width,
        height,
        offset,
        thickness,
        bottomZ,
        topZ,
        contour
      ),
    [bottomZ, config.shape, config.style, contour, height, offset, thickness, topZ, width]
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh castShadow geometry={geometry} receiveShadow>
      {finish === 'patina' ? (
        <PatinaMaterial metal={config.metal} />
      ) : (
        <MetalMaterial metal={config.metal} roughness={0.3} />
      )}
    </mesh>
  )
}

function Setting({ config, selectedOpal }: { config: RingConfig; selectedOpal?: BuilderOpal }) {
  const dimensions = getStoneDimensions(config, selectedOpal)
  const [width, height] = dimensions
  const profile = ringStyleGeometryProfiles[config.style]
  const contour = selectedOpal?.visual.contour
  const depthProfile = getCabochonDepthProfile(
    width,
    height,
    getRenderableOpalDepthMm(selectedOpal),
    config.style
  )
  const bezelBottom = depthProfile.baseZ - 0.012
  const bezelTop = depthProfile.girdleZ + 0.025
  const outerBezelOffset = profile.bezelWallOffset + profile.bezelWallThickness / 2
  const bezelCapInnerOffset = profile.bezelLipOffset - profile.bezelLipRadius
  const bezelCapThickness = outerBezelOffset - bezelCapInnerOffset
  const bezelCapOffset = bezelCapInnerOffset + bezelCapThickness / 2
  // Sold halo designs need a deeper structural backplate to carry the grain
  // field into the shank. The former paper-thin cup vanished in profile and
  // made the setting look suspended even where the meshes intersected.
  const settingBaseDrop =
    config.style === 'coral' ? 0.04 : config.setting === 'beaded' ? 0.075 : 0.055
  const haloSupport = getHaloSupportGeometry(profile)
  const patinaGroove = getPatinaGrooveProfile(depthProfile.girdleZ, profile.innerSeamRadius)
  const beadCount =
    profile.beadCount > 0
      ? getStyleBeadCount(config.style, config.shape, width, height, contour)
      : 0
  const beads = useMemo(
    () =>
      applyHandmadeBeadVariation(
        evenlySpacedOutlinePoints(
          config.shape,
          width,
          height,
          profile.haloOffset,
          beadCount,
          profile.haloPhase,
          config.style,
          contour
        ),
        profile.beadVariation,
        profile.beadFlattening
      ),
    [
      beadCount,
      config.shape,
      config.style,
      contour,
      height,
      profile.beadFlattening,
      profile.beadVariation,
      profile.haloOffset,
      profile.haloPhase,
      width,
    ]
  )

  return (
    <group>
      <SettingBase
        config={config}
        dimensions={dimensions}
        bottomZ={bezelBottom - settingBaseDrop}
        offset={outerBezelOffset}
        topZ={depthProfile.baseZ + 0.003}
        contour={contour}
      />
      <BezelWall
        config={config}
        dimensions={dimensions}
        bottomZ={bezelBottom}
        offset={profile.bezelWallOffset}
        thickness={profile.bezelWallThickness}
        topZ={bezelTop}
        contour={contour}
      />
      <BezelWall
        config={config}
        dimensions={dimensions}
        bottomZ={bezelTop - profile.bezelLipRadius}
        offset={bezelCapOffset}
        thickness={bezelCapThickness}
        topZ={bezelTop + profile.bezelLipRadius * 0.18}
        contour={contour}
      />
      <BezelWall
        config={config}
        dimensions={dimensions}
        bottomZ={patinaGroove.bottomZ}
        finish="patina"
        offset={profile.innerSeamOffset}
        thickness={patinaGroove.thickness}
        topZ={patinaGroove.topZ}
        contour={contour}
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
            contour={contour}
          />
          {beads.map(
            ({ key, x, y, size, flattening, heightVariation, rotation, stretchX, stretchY }) => {
              // Sold Sun & Moon and Aurora rings use individually soldered beads.
              // Deterministic variation keeps the halo handmade without animating
              // or changing between renders.
              return (
                <mesh
                  castShadow
                  key={key}
                  position={[x, y, 0.048 + heightVariation]}
                  receiveShadow
                  rotation={[0, 0, rotation]}
                  scale={[size * stretchX, size * stretchY, flattening]}
                >
                  <sphereGeometry
                    args={[profile.beadRadius, config.style === 'aurora' ? 12 : 16, 10]}
                  />
                  <MetalMaterial metal={config.metal} roughness={profile.beadRoughness} />
                </mesh>
              )
            }
          )}
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
  shoulderUnderlap,
  shoulderJoinDrop,
  shoulderTransition,
  shoulderBlend,
  crossSectionPower,
  metalRoughness,
}: {
  metal: RingConfig['metal']
  radius: number
  settingBaseY: number
  settingHalfWidth: number
  shoulderRadius: number
  shoulderDepth: number
  tubeRadius: number
  tubeDepth: number
  shoulderUnderlap: number
  shoulderJoinDrop: number
  shoulderTransition: number
  shoulderBlend: number
  crossSectionPower: number
  metalRoughness: number
}) {
  const curve = useMemo(() => {
    return new CatmullRomCurve3(
      getRingShankPathPoints({
        radius,
        settingBaseY,
        settingHalfWidth,
        shoulderJoinDrop,
        shoulderTransition,
        shoulderUnderlap,
      }).map((point) => new Vector3(...point)),
      false,
      'centripetal'
    )
  }, [
    radius,
    settingBaseY,
    settingHalfWidth,
    shoulderJoinDrop,
    shoulderTransition,
    shoulderUnderlap,
  ])
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
      const blend = Math.min(1, shoulderDistance / shoulderBlend)
      const localHalfWidth = shoulderRadius + (tubeRadius - shoulderRadius) * blend
      const localHalfDepth = shoulderDepth + (tubeDepth - shoulderDepth) * blend

      for (let side = 0; side < radialSegments; side += 1) {
        const angle = (side / radialSegments) * Math.PI * 2
        // A softly squared superellipse matches the forged, low-profile bands
        // across the sold references. It also gives metals broad highlight planes
        // instead of the plastic-looking highlight produced by a round tube.
        const cosine = Math.cos(angle)
        const sine = Math.sin(angle)
        const acrossBand = Math.sign(cosine) * Math.pow(Math.abs(cosine), crossSectionPower)
        const throughBand = Math.sign(sine) * Math.pow(Math.abs(sine), crossSectionPower)
        positions.push(
          point.x + inPlaneNormal.x * acrossBand * localHalfDepth,
          point.y + inPlaneNormal.y * acrossBand * localHalfDepth,
          point.z + throughBand * localHalfWidth
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

    const startCentre = positions.length / 3
    const startPoint = curve.getPointAt(0)
    positions.push(startPoint.x, startPoint.y, startPoint.z)
    const endCentre = positions.length / 3
    const endPoint = curve.getPointAt(1)
    positions.push(endPoint.x, endPoint.y, endPoint.z)
    const endStart = tubularSegments * radialSegments
    for (let side = 0; side < radialSegments; side += 1) {
      const nextSide = (side + 1) % radialSegments
      indices.push(startCentre, nextSide, side)
      indices.push(endCentre, endStart + side, endStart + nextSide)
    }

    const nextGeometry = new BufferGeometry()
    nextGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    nextGeometry.setIndex(indices)
    nextGeometry.computeVertexNormals()
    nextGeometry.computeBoundingSphere()
    return nextGeometry
  }, [
    crossSectionPower,
    curve,
    shoulderBlend,
    shoulderDepth,
    shoulderRadius,
    tubeDepth,
    tubeRadius,
  ])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh castShadow geometry={geometry} receiveShadow>
      <MetalMaterial metal={metal} roughness={metalRoughness} />
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
  const [stoneWidth, stoneHeight] = dimensions
  const shoulderAnchorHalfWidth = useMemo(
    () =>
      getSettingShoulderHalfWidth(
        { shape: config.shape, style: config.style },
        [stoneWidth, stoneHeight],
        selectedOpal?.visual.contour
      ),
    [config.shape, config.style, selectedOpal?.visual.contour, stoneHeight, stoneWidth]
  )

  return (
    <group>
      <RingShank
        metal={metal}
        radius={measurements.centreRadius}
        settingBaseY={measurements.outerRadius}
        settingHalfWidth={shoulderAnchorHalfWidth}
        shoulderDepth={styleProfile.shoulderDepth}
        shoulderRadius={styleProfile.shoulderRadius}
        tubeDepth={styleProfile.shankDepth}
        tubeRadius={styleProfile.shankRadius}
        shoulderUnderlap={styleProfile.shoulderUnderlap}
        shoulderJoinDrop={styleProfile.shoulderJoinDrop}
        shoulderTransition={styleProfile.shoulderTransition}
        shoulderBlend={styleProfile.shoulderBlend}
        crossSectionPower={styleProfile.crossSectionPower}
        metalRoughness={styleProfile.metalRoughness}
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
  const background = useMemo(() => new Color('#171815'), [])
  const framingTarget = useMemo(
    () => getRingFramingTarget(config, selectedOpal),
    [config, selectedOpal]
  )

  return (
    <Canvas
      camera={{ position: cameraPositions[view], up: cameraUpVectors[view], fov: 32 }}
      dpr={[1, 2]}
      frameloop={allowMotion ? 'always' : 'demand'}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      shadows={{ type: PCFShadowMap }}
      scene={{ background }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true })
      }}
    >
      <ambientLight intensity={0.48} />
      <hemisphereLight args={['#f6f0e7', '#24251f', 1.25]} />
      <directionalLight
        castShadow
        position={[4.5, 5.5, 5]}
        intensity={3.1}
        color="#fff7e8"
        shadow-bias={-0.00015}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
      <directionalLight position={[-4, 2, 3]} intensity={1.35} color="#e5f1f2" />
      <pointLight position={[0, -2, 3]} intensity={0.42} color="#fff1de" />

      <CameraPreset target={framingTarget} view={view} />

      <RingModel config={config} selectedOpal={selectedOpal} />

      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={1.15}
          color="#f2f0eb"
          position={[0, 0, 4.5]}
          scale={[8, 8, 1]}
        />
        <Lightformer form="rect" intensity={5.5} position={[0, 4, -4]} scale={[5, 1.1, 1]} />
        <Lightformer
          form="rect"
          intensity={4.2}
          color="#f7f2e9"
          position={[0, 4, 3]}
          rotation={[Math.PI / 5, 0, 0]}
          scale={[5, 1.6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3.4}
          color="#eef4f2"
          position={[-4, 1, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3.5, 0.75, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#fff2df"
          position={[4, -1, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2.5, 0.65, 1]}
        />
        <Lightformer
          form="ring"
          intensity={1.5}
          color="#fffaf2"
          position={[0, -3, 2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={2.4}
        />
      </Environment>

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
