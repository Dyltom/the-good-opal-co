'use client'

/* eslint-disable react/no-unknown-property -- React Three Fiber JSX maps these props to Three.js objects. */

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Environment, Lightformer, OrbitControls, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  Float32BufferAttribute,
  LinearFilter,
  PCFShadowMap,
  RepeatWrapping,
  SRGBColorSpace,
  SphereGeometry,
  type Group,
  Vector3,
} from 'three'
import {
  computePlacedPhotoCrop,
  computePhotoTextureTransform,
  constrainPhotoPlacementRotation,
} from '@/lib/custom-builder/photo-crop'
import type { BuilderStoneContourV1 } from '@/lib/custom-builder/stone-contour'
import {
  getRingStyleReferenceOpal,
  ringStyleGeometryProfiles,
  type BezelLipProfileKnot,
  type BuilderOpal,
  type RingConfig,
} from './config'
import {
  applyHandmadeBeadVariation,
  cameraPositions,
  cameraUpVectors,
  coalesceOverlappingHaloBeads,
  evenlySpacedOutlinePoints,
  fuseContactingHaloBeads,
  getBezelWallContourPoints,
  getBezelLipContactZ,
  getCabochonDepthProfile,
  getCameraPosition,
  getDShankCrossSection,
  getForgedMetalTone,
  getGrainDerivedHaloSupportOutline,
  getHaloStoneContour,
  getOpalSettleTransform,
  getOpalSettleStartOffset,
  getPatinaGrooveProfile,
  getProfiledBezelLipRings,
  getRingFramingTarget,
  getRingShankCapTopology,
  getRingShankCurve,
  getSolderGrainTone,
  getShoulderBlendProgress,
  getRenderableOpalDepthMm,
  getStyleBeadCount,
  getSettingShoulderHalfWidth,
  getSettingPlacement,
  getStoneDimensions,
  outlinePoint,
  soldStyleOutlinePoint,
  settingRotationX,
  type CabochonDepthProfile,
  type CameraVector,
  type HaloSupportContourPoint,
  type StoneDimensions,
} from './geometry'
import { applyForgedNormalVariation } from './forged-surface'

export type RingView = 'three-quarter' | 'front' | 'profile'

interface RingSceneProps {
  config: RingConfig
  allowMotion: boolean
  onContextLost: () => void
  onRenderReady?: () => void
  reduceMotion?: boolean
  selectedOpal?: BuilderOpal
  view: RingView
  zoomEnabled?: boolean
}

const metalColours: Record<RingConfig['metal'], string> = {
  'sterling-silver': '#f5f2eb',
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

function RenderReadySignal({ onReady }: { onReady: () => void }) {
  const { invalidate } = useThree()
  const frameCount = useRef(0)
  const readyFrame = useRef<number | null>(null)
  const signalled = useRef(false)
  const onReadyRef = useRef(onReady)

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    invalidate()
    return () => {
      if (readyFrame.current !== null) window.cancelAnimationFrame(readyFrame.current)
    }
  }, [invalidate])

  useFrame(() => {
    if (signalled.current) return

    frameCount.current += 1
    if (frameCount.current < 4) {
      invalidate()
      return
    }

    signalled.current = true
    readyFrame.current = window.requestAnimationFrame(() => {
      readyFrame.current = null
      onReadyRef.current()
    })
  })

  return null
}

function MetalMaterial({
  flatShading = false,
  metal,
  roughness = 0.22,
  vertexColors = false,
}: {
  flatShading?: boolean
  metal: RingConfig['metal']
  roughness?: number
  vertexColors?: boolean
}) {
  const isSterlingSilver = metal === 'sterling-silver'
  return (
    <meshPhysicalMaterial
      color={metalColours[metal]}
      flatShading={flatShading}
      metalness={0.96}
      roughness={isSterlingSilver ? Math.max(0.38, roughness) : roughness}
      clearcoat={0.02}
      clearcoatRoughness={0.44}
      envMapIntensity={1.4}
      vertexColors={vertexColors}
    />
  )
}

function PatinaMaterial({ metal }: { metal: RingConfig['metal'] }) {
  const shadowColour =
    metal === 'sterling-silver'
      ? '#20211d'
      : metal === '14k-gold' || metal === '18k-gold'
        ? '#6b4b22'
        : metal === 'rose-gold'
          ? '#704a42'
          : '#575a59'
  return <meshStandardMaterial color={shadowColour} metalness={0.58} roughness={0.72} />
}

function SolderGrainMaterial({
  faceted,
  organic,
  metal,
  roughness,
  tone,
}: {
  faceted: boolean
  organic: boolean
  metal: RingConfig['metal']
  roughness: number
  tone: number
}) {
  const solderColour: Record<RingConfig['metal'], string> = {
    'sterling-silver': '#d0cdc5',
    '14k-gold': '#b99342',
    '18k-gold': '#c49a3d',
    'white-gold': '#c7c4bb',
    'rose-gold': '#ad7565',
    platinum: '#cbc9c3',
  }
  const organicSolderColour: Record<RingConfig['metal'], string> = {
    'sterling-silver': '#b9b6af',
    '14k-gold': '#997a37',
    '18k-gold': '#a98235',
    'white-gold': '#aaa8a1',
    'rose-gold': '#956458',
    platinum: '#afada8',
  }
  const facetedSolderColour: Record<RingConfig['metal'], string> = {
    'sterling-silver': '#969690',
    '14k-gold': '#967634',
    '18k-gold': '#a17d31',
    'white-gold': '#aaa9a4',
    'rose-gold': '#936157',
    platinum: '#acabaa',
  }

  const colour = new Color(
    (faceted ? facetedSolderColour : organic ? organicSolderColour : solderColour)[metal]
  ).multiplyScalar(tone)

  return (
    <meshPhysicalMaterial
      color={colour}
      metalness={faceted ? 0.74 : 0.91}
      roughness={
        faceted
          ? Math.max(0.5, roughness * 0.85)
          : organic
            ? roughness
            : Math.max(0.44, roughness * 0.82)
      }
      clearcoat={0.01}
      clearcoatRoughness={0.68}
      envMapIntensity={faceted ? 1.18 : organic ? 1.14 : 1.26}
    />
  )
}

function SolderSupportMaterial({ metal }: { metal: RingConfig['metal'] }) {
  const colour =
    metal === 'sterling-silver'
      ? '#454640'
      : metal === '14k-gold' || metal === '18k-gold'
        ? '#765728'
        : metal === 'rose-gold'
          ? '#76524a'
          : '#666662'

  return <meshStandardMaterial color={colour} metalness={0.72} roughness={0.68} />
}

function OrganicSolderGeometry({ radius, seed }: { radius: number; seed: number }) {
  const geometry = useMemo(() => {
    const nextGeometry = new SphereGeometry(radius, 14 + (seed % 3), 9)
    const positions = nextGeometry.getAttribute('position')
    const point = new Vector3()

    for (let index = 0; index < positions.count; index += 1) {
      point.fromBufferAttribute(positions, index)
      const length = point.length() || 1
      const nx = point.x / length
      const ny = point.y / length
      const nz = point.z / length
      const deformation =
        1 +
        Math.sin(nx * 7.1 + seed * 0.73) * 0.032 +
        Math.sin(ny * 9.3 - seed * 0.41) * 0.024 +
        Math.sin(nz * 6.7 + nx * 2.8 + seed * 0.29) * 0.02
      point.multiplyScalar(deformation)
      positions.setXYZ(index, point.x, point.y, point.z)
    }

    positions.needsUpdate = true
    nextGeometry.computeVertexNormals()
    nextGeometry.computeBoundingSphere()
    return nextGeometry
  }, [radius, seed])

  useEffect(() => () => geometry.dispose(), [geometry])
  return <primitive attach="geometry" object={geometry} />
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
    float alpha = min(0.06, highlight * 0.045 + edgeSheen * 0.012);
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
      const customerRotation = constrainPhotoPlacementRotation(
        width / height,
        crop.zoom,
        config.opalScale,
        config.opalRotation
      )
      const rotation = (crop.rotation ?? 0) + customerRotation
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
          <meshPhysicalMaterial
            attach="material-0"
            map={photoTexture}
            color="#ffffff"
            clearcoat={0.38}
            clearcoatRoughness={0.12}
            envMapIntensity={0.35}
            ior={1.44}
            metalness={0}
            roughness={0.24}
            specularIntensity={0.32}
            toneMapped={false}
          />
          <meshPhysicalMaterial
            attach="material-1"
            color={selectedOpal?.visual.bodyColour ?? palette.body}
            clearcoat={0.24}
            clearcoatRoughness={0.18}
            envMapIntensity={0.35}
            metalness={0}
            roughness={0.3}
            specularIntensity={0.3}
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

function SettlingOpalCabochon({
  animate,
  config,
  dimensions,
  selectedOpal,
  settleStartOffset,
  transitionKey,
}: {
  animate: boolean
  config: RingConfig
  dimensions: StoneDimensions
  selectedOpal?: BuilderOpal
  settleStartOffset: number
  transitionKey: string
}) {
  const group = useRef<Group>(null)
  const elapsed = useRef(Number.POSITIVE_INFINITY)
  const previousTransitionKey = useRef(transitionKey)
  const { invalidate } = useThree()

  useLayoutEffect(() => {
    const shouldAnimate = animate && previousTransitionKey.current !== transitionKey
    previousTransitionKey.current = transitionKey
    elapsed.current = shouldAnimate ? 0 : Number.POSITIVE_INFINITY
    const transform = getOpalSettleTransform(0, settleStartOffset, !shouldAnimate)
    group.current?.position.set(0, 0, transform.offsetZ)
    if (shouldAnimate) invalidate()
  }, [animate, invalidate, settleStartOffset, transitionKey])

  useFrame((_, delta) => {
    if (!group.current || !Number.isFinite(elapsed.current)) return

    elapsed.current += Math.min(delta, 0.05)
    const transform = getOpalSettleTransform(elapsed.current, settleStartOffset)
    group.current.position.z = transform.offsetZ

    if (transform.settled) elapsed.current = Number.POSITIVE_INFINITY
    else invalidate()
  })

  return (
    <group ref={group}>
      <OpalCabochon config={config} dimensions={dimensions} selectedOpal={selectedOpal} />
    </group>
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
  contour?: BuilderStoneContourV1,
  lipContactProfile?: CabochonDepthProfile
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
    const innerBottomZ = lipContactProfile
      ? getBezelLipContactZ(shape, angle, width, height, inner, lipContactProfile, contour)
      : bottomZ
    positions.push(
      outerX,
      outerY,
      bottomZ,
      outerX,
      outerY,
      topZ,
      innerX,
      innerY,
      innerBottomZ,
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
  const surface = ringStyleGeometryProfiles[style]
  applyForgedNormalVariation(
    geometry,
    surface.surfaceNormalVariation * 0.62,
    surface.surfaceSeed + 7
  )
  return geometry
}

function createProfiledBezelLipGeometry(
  style: RingConfig['style'],
  shape: RingConfig['shape'],
  width: number,
  height: number,
  innerOffset: number,
  outerOffset: number,
  topZ: number,
  depthProfile: CabochonDepthProfile,
  profile: readonly BezelLipProfileKnot[],
  contour?: BuilderStoneContourV1
): BufferGeometry {
  const geometry = new BufferGeometry()
  const segments = 96
  const positions: number[] = []
  const metalIndices: number[] = []
  const patinaIndices: number[] = []

  for (let segment = 0; segment < segments; segment += 1) {
    const angle = (segment / segments) * Math.PI * 2
    const rings = getProfiledBezelLipRings({
      angle,
      contour,
      depthProfile,
      height,
      innerOffset,
      outerOffset,
      profile,
      shape,
      style,
      topZ,
      width,
    })
    rings.forEach(({ point, z }) => positions.push(point[0], point[1], z))
  }

  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments
    for (let ring = 0; ring < profile.length - 1; ring += 1) {
      const currentInner = segment * profile.length + ring
      const currentOuter = currentInner + 1
      const nextInner = next * profile.length + ring
      const nextOuter = nextInner + 1
      const target = profile[ring + 1]?.finish === 'patina' ? patinaIndices : metalIndices
      target.push(currentInner, nextInner, nextOuter, currentInner, nextOuter, currentOuter)
    }
  }

  const indices = [...metalIndices, ...patinaIndices]
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.addGroup(0, metalIndices.length, 0)
  geometry.addGroup(metalIndices.length, patinaIndices.length, 1)
  geometry.computeVertexNormals()
  const surface = ringStyleGeometryProfiles[style]
  applyForgedNormalVariation(
    geometry,
    surface.surfaceNormalVariation * 0.42,
    surface.surfaceSeed + 13
  )
  geometry.computeBoundingSphere()
  return geometry
}

function createHaloSupportMeshGeometry(
  contour: readonly HaloSupportContourPoint[],
  bottomZ: number,
  topZ: number,
  style: RingConfig['style']
): BufferGeometry {
  const geometry = new BufferGeometry()
  const positions: number[] = []
  const indices: number[] = []

  contour.forEach(({ inner, outer }) => {
    positions.push(
      outer[0],
      outer[1],
      bottomZ,
      outer[0],
      outer[1],
      topZ,
      inner[0],
      inner[1],
      bottomZ,
      inner[0],
      inner[1],
      topZ
    )
  })

  contour.forEach((_, index) => {
    const next = (index + 1) % contour.length
    const outerBottom = index * 4
    const outerTop = outerBottom + 1
    const innerBottom = outerBottom + 2
    const innerTop = outerBottom + 3
    const nextOuterBottom = next * 4
    const nextOuterTop = nextOuterBottom + 1
    const nextInnerBottom = nextOuterBottom + 2
    const nextInnerTop = nextOuterBottom + 3
    indices.push(
      outerTop,
      nextOuterTop,
      nextInnerTop,
      outerTop,
      nextInnerTop,
      innerTop,
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
      nextInnerBottom
    )
  })

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const surface = ringStyleGeometryProfiles[style]
  applyForgedNormalVariation(geometry, surface.surfaceNormalVariation, surface.surfaceSeed + 31)
  geometry.computeBoundingSphere()
  return geometry
}

function createSettingBaseGeometry(
  style: RingConfig['style'],
  shape: RingConfig['shape'],
  width: number,
  height: number,
  bottomOffset: number,
  topOffset: number,
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
    const [bottomX, bottomY] = soldStyleOutlinePoint(
      style,
      shape,
      angle,
      width,
      height,
      bottomOffset,
      contour
    )
    const [topX, topY] = soldStyleOutlinePoint(
      style,
      shape,
      angle,
      width,
      height,
      topOffset,
      contour
    )
    positions.push(bottomX, bottomY, bottomZ, topX, topY, topZ)
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
  const surface = ringStyleGeometryProfiles[style]
  applyForgedNormalVariation(
    geometry,
    surface.surfaceNormalVariation * 0.72,
    surface.surfaceSeed + 23
  )
  geometry.computeBoundingSphere()
  return geometry
}

function SettingBase({
  config,
  dimensions,
  bottomOffset,
  bottomZ,
  topOffset,
  topZ,
  contour,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  bottomOffset: number
  bottomZ: number
  topOffset: number
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
        bottomOffset,
        topOffset,
        bottomZ,
        topZ,
        contour
      ),
    [bottomOffset, bottomZ, config.shape, config.style, contour, height, topOffset, topZ, width]
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
  lipContactProfile,
}: {
  config: RingConfig
  dimensions: StoneDimensions
  bottomZ: number
  finish?: 'metal' | 'patina'
  offset: number
  thickness: number
  topZ: number
  contour?: BuilderStoneContourV1
  lipContactProfile?: CabochonDepthProfile
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
        contour,
        lipContactProfile
      ),
    [
      bottomZ,
      config.shape,
      config.style,
      contour,
      height,
      lipContactProfile,
      offset,
      thickness,
      topZ,
      width,
    ]
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

function ProfiledBezelLip({
  config,
  contour,
  depthProfile,
  dimensions,
  innerOffset,
  outerOffset,
  topZ,
}: {
  config: RingConfig
  contour?: BuilderStoneContourV1
  depthProfile: CabochonDepthProfile
  dimensions: StoneDimensions
  innerOffset: number
  outerOffset: number
  topZ: number
}) {
  const [width, height] = dimensions
  const profile = ringStyleGeometryProfiles[config.style]
  const geometry = useMemo(
    () =>
      createProfiledBezelLipGeometry(
        config.style,
        config.shape,
        width,
        height,
        innerOffset,
        outerOffset,
        topZ,
        depthProfile,
        profile.bezelLipProfile,
        contour
      ),
    [
      config.shape,
      config.style,
      contour,
      depthProfile,
      height,
      innerOffset,
      outerOffset,
      profile.bezelLipProfile,
      topZ,
      width,
    ]
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh castShadow geometry={geometry} receiveShadow>
      <meshPhysicalMaterial
        attach="material-0"
        color={metalColours[config.metal]}
        metalness={0.96}
        roughness={config.metal === 'sterling-silver' ? 0.38 : 0.25}
        clearcoat={0.04}
        clearcoatRoughness={0.36}
        envMapIntensity={1.55}
      />
      <meshStandardMaterial
        attach="material-1"
        color={config.metal === 'sterling-silver' ? '#080a08' : '#563716'}
        metalness={0.56}
        roughness={0.9}
      />
    </mesh>
  )
}

function HaloSupport({
  bottomZ,
  config,
  contour,
  topZ,
}: {
  bottomZ: number
  config: RingConfig
  contour: readonly HaloSupportContourPoint[]
  topZ: number
}) {
  const geometry = useMemo(
    () => createHaloSupportMeshGeometry(contour, bottomZ, topZ, config.style),
    [bottomZ, config.style, contour, topZ]
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh castShadow geometry={geometry} receiveShadow>
      <SolderSupportMaterial metal={config.metal} />
    </mesh>
  )
}

function Setting({
  animateOpalPlacement,
  config,
  selectedOpal,
  transitionKey,
}: {
  animateOpalPlacement: boolean
  config: RingConfig
  selectedOpal?: BuilderOpal
  transitionKey: string
}) {
  const dimensions = getStoneDimensions(config, selectedOpal)
  const [width, height] = dimensions
  const profile = ringStyleGeometryProfiles[config.style]
  const contour = selectedOpal?.visual.contour
  const haloContour = useMemo(() => getHaloStoneContour(contour), [contour])
  const depthMm = getRenderableOpalDepthMm(selectedOpal)
  const depthProfile = useMemo(
    () => getCabochonDepthProfile(width, height, depthMm, config.style),
    [config.style, depthMm, height, width]
  )
  const bezelBottom = depthProfile.baseZ - 0.012
  const bezelTop = depthProfile.girdleZ + 0.025
  const outerBezelOffset = profile.bezelWallOffset + profile.bezelWallThickness / 2
  const bezelCapInnerOffset = profile.bezelLipOffset - profile.bezelLipRadius
  const patinaGroove = getPatinaGrooveProfile(depthProfile.girdleZ, profile.innerSeamRadius)
  const beadCount =
    profile.beadCount > 0
      ? getStyleBeadCount(config.style, config.shape, width, height, haloContour)
      : 0
  const beads = useMemo(() => {
    const variedBeads = applyHandmadeBeadVariation(
      evenlySpacedOutlinePoints(
        config.shape,
        width,
        height,
        profile.haloOffset,
        beadCount,
        profile.haloPhase,
        config.style,
        haloContour
      ),
      profile.beadVariation,
      profile.beadFlattening,
      profile.beadAsymmetry
    )
    return fuseContactingHaloBeads(
      coalesceOverlappingHaloBeads(variedBeads, profile.beadRadius),
      profile.beadRadius
    )
  }, [
    beadCount,
    config.shape,
    config.style,
    haloContour,
    height,
    profile.beadRadius,
    profile.beadFlattening,
    profile.beadAsymmetry,
    profile.beadVariation,
    profile.haloOffset,
    profile.haloPhase,
    width,
  ])
  const haloSupportContour = useMemo(
    () =>
      getGrainDerivedHaloSupportOutline({
        beadRadius: profile.beadRadius,
        beads,
        bezelOuterOffset: outerBezelOffset,
        contour,
        coverage: profile.haloSupportCoverage,
        haloContour,
        haloOffset: profile.haloOffset,
        height,
        shape: config.shape,
        style: config.style,
        valleyCoverage: profile.haloValleySupportCoverage,
        width,
      }),
    [
      beads,
      config.shape,
      config.style,
      contour,
      haloContour,
      height,
      outerBezelOffset,
      profile.beadRadius,
      profile.haloOffset,
      profile.haloSupportCoverage,
      profile.haloValleySupportCoverage,
      width,
    ]
  )

  return (
    <group>
      <SettingBase
        config={config}
        dimensions={dimensions}
        bottomOffset={outerBezelOffset - profile.cupTaper}
        bottomZ={bezelBottom - profile.cupDepth}
        topOffset={outerBezelOffset}
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
      <ProfiledBezelLip
        config={config}
        contour={contour}
        depthProfile={depthProfile}
        dimensions={dimensions}
        innerOffset={bezelCapInnerOffset}
        outerOffset={outerBezelOffset}
        topZ={bezelTop + profile.bezelLipRadius * 0.18}
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
          <HaloSupport
            config={config}
            bottomZ={Math.max(bezelBottom, 0.008)}
            contour={haloSupportContour}
            topZ={0.026}
          />
          {beads.map(
            ({ key, x, y, size, flattening, heightVariation, rotation, stretchX, stretchY }) => {
              // Sold Sun & Moon and Aurora rings use individually soldered beads.
              // Deterministic variation keeps the halo handmade without animating
              // or changing between renders.
              const usesHandmadeSurface = profile.beadShape === 'granulated'
              const solderTone = getSolderGrainTone(key, usesHandmadeSurface)
              const grainTiltX = ((((key * 13) % 7) - 3) / 3) * 0.16
              const grainTiltY = ((((key * 17) % 9) - 4) / 4) * 0.14
              return (
                <group
                  key={key}
                  position={[x, y, 0.036 + heightVariation]}
                  rotation={[0, 0, rotation]}
                  scale={[size * stretchX, size * stretchY, flattening]}
                >
                  <mesh
                    castShadow
                    receiveShadow
                    rotation={
                      usesHandmadeSurface ? [grainTiltX, grainTiltY, 0] : undefined
                    }
                  >
                    {profile.beadPrimitive === 'rounded-granule' && (
                      <sphereGeometry args={[profile.beadRadius, 20, 14]} />
                    )}
                    {profile.beadPrimitive === 'organic-granule' && (
                      <OrganicSolderGeometry radius={profile.beadRadius} seed={key} />
                    )}
                    <SolderGrainMaterial
                      faceted={false}
                      organic={usesHandmadeSurface}
                      metal={config.metal}
                      roughness={profile.beadRoughness}
                      tone={solderTone}
                    />
                  </mesh>
                </group>
              )
            }
          )}
        </>
      )}

      <SettlingOpalCabochon
        animate={animateOpalPlacement}
        config={config}
        dimensions={dimensions}
        selectedOpal={selectedOpal}
        settleStartOffset={getOpalSettleStartOffset(depthProfile, bezelTop)}
        transitionKey={transitionKey}
      />
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
  shoulderBlendLengthMm,
  shoulderLandingLengthMm,
  crossSectionPower,
  shankInnerFacePower,
  shankForgedVariation,
  surfaceNormalVariation,
  surfaceSeed,
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
  shoulderBlendLengthMm: number
  shoulderLandingLengthMm: number
  crossSectionPower: number
  shankInnerFacePower: number
  shankForgedVariation: number
  surfaceNormalVariation: number
  surfaceSeed: number
  metalRoughness: number
}) {
  const curve = useMemo(() => {
    return getRingShankCurve({
      radius,
      settingBaseY,
      settingHalfWidth,
      shoulderJoinDrop,
      shoulderLandingLengthMm,
      shoulderTransition,
      shoulderUnderlap,
    })
  }, [
    radius,
    settingBaseY,
    settingHalfWidth,
    shoulderJoinDrop,
    shoulderLandingLengthMm,
    shoulderTransition,
    shoulderUnderlap,
  ])
  const geometry = useMemo(() => {
    const tubularSegments = 160
    const radialSegments = 24
    const curveLength = curve.getLength()
    const positions: number[] = []
    const colours: number[] = []
    const indices: number[] = []
    const baseMetalColour = new Color(metalColours[metal])
    const forgedColour = new Color()

    for (let segment = 0; segment <= tubularSegments; segment += 1) {
      const progress = segment / tubularSegments
      const point = curve.getPointAt(progress)
      const tangent = curve.getTangentAt(progress).normalize()
      const inPlaneNormal = new Vector3(-tangent.y, tangent.x, 0).normalize()
      const toCentre = new Vector3(-point.x, -point.y, 0)
      if (inPlaneNormal.dot(toCentre) < 0) inPlaneNormal.multiplyScalar(-1)
      const blend = getShoulderBlendProgress(progress, curveLength, shoulderBlendLengthMm)
      // Deterministic low-amplitude forging variation breaks the mathematically
      // perfect tube highlight without changing ring size or shoulder joins.
      const widthForge =
        1 +
        Math.sin(progress * Math.PI * 10 + 0.35) * shankForgedVariation +
        Math.sin(progress * Math.PI * 22 - 0.4) * shankForgedVariation * 0.35
      const localHalfWidth = (shoulderRadius + (tubeRadius - shoulderRadius) * blend) * widthForge
      // Keep radial depth nominal so forged surface variation cannot shrink the
      // selected ring's exact inside diameter.
      const localHalfDepth = shoulderDepth + (tubeDepth - shoulderDepth) * blend

      for (let side = 0; side < radialSegments; side += 1) {
        const angle = (side / radialSegments) * Math.PI * 2
        // A softly squared superellipse matches the forged, low-profile bands
        // across the sold references. It also gives metals broad highlight planes
        // instead of the plastic-looking highlight produced by a round tube.
        const { axial: throughBand, radial: acrossBand } = getDShankCrossSection(
          angle,
          crossSectionPower,
          shankInnerFacePower
        )
        positions.push(
          point.x + inPlaneNormal.x * acrossBand * localHalfDepth,
          point.y + inPlaneNormal.y * acrossBand * localHalfDepth,
          point.z + throughBand * localHalfWidth
        )
        const tone = getForgedMetalTone(progress, side / radialSegments)
        forgedColour.copy(baseMetalColour).multiplyScalar(tone)
        colours.push(forgedColour.r, forgedColour.g, forgedColour.b)
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

    const capTopology = getRingShankCapTopology(tubularSegments, radialSegments)
    const startPoint = curve.getPointAt(0)
    const endPoint = curve.getPointAt(1)
    positions.push(startPoint.x, startPoint.y, startPoint.z, endPoint.x, endPoint.y, endPoint.z)
    for (const progress of [0, 1]) {
      const tone = getForgedMetalTone(progress, 0)
      forgedColour.copy(baseMetalColour).multiplyScalar(tone)
      colours.push(forgedColour.r, forgedColour.g, forgedColour.b)
    }
    indices.push(...capTopology.indices)

    const nextGeometry = new BufferGeometry()
    nextGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    nextGeometry.setAttribute('color', new Float32BufferAttribute(colours, 3))
    nextGeometry.setIndex(indices)
    nextGeometry.computeVertexNormals()
    applyForgedNormalVariation(nextGeometry, surfaceNormalVariation, surfaceSeed)
    nextGeometry.computeBoundingSphere()
    return nextGeometry
  }, [
    crossSectionPower,
    curve,
    metal,
    shoulderBlendLengthMm,
    shoulderDepth,
    shoulderRadius,
    shankForgedVariation,
    shankInnerFacePower,
    surfaceNormalVariation,
    surfaceSeed,
    tubeDepth,
    tubeRadius,
  ])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh castShadow geometry={geometry} receiveShadow>
      <MetalMaterial metal={metal} roughness={metalRoughness} vertexColors />
    </mesh>
  )
}

function RingModel({
  animateOpalPlacement,
  config,
  selectedOpal,
  transitionKey,
}: {
  animateOpalPlacement: boolean
  config: RingConfig
  selectedOpal?: BuilderOpal
  transitionKey: string
}) {
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
        shoulderBlendLengthMm={styleProfile.shoulderBlendLengthMm}
        shoulderLandingLengthMm={styleProfile.shoulderLandingLengthMm}
        crossSectionPower={styleProfile.crossSectionPower}
        shankInnerFacePower={styleProfile.shankInnerFacePower}
        shankForgedVariation={styleProfile.shankForgedVariation}
        surfaceNormalVariation={styleProfile.surfaceNormalVariation}
        surfaceSeed={styleProfile.surfaceSeed}
        metalRoughness={styleProfile.metalRoughness}
      />

      <group position={[0, settingY, 0]} rotation={[settingRotationX, 0, 0]}>
        <Setting
          animateOpalPlacement={animateOpalPlacement}
          config={config}
          selectedOpal={selectedOpal}
          transitionKey={transitionKey}
        />
      </group>
    </group>
  )
}

export function RingScene({
  config,
  allowMotion,
  onContextLost,
  onRenderReady,
  reduceMotion = false,
  selectedOpal,
  view,
  zoomEnabled = true,
}: RingSceneProps) {
  const background = useMemo(() => new Color('#24241f'), [])
  const renderedOpal = useMemo(
    () => selectedOpal ?? getRingStyleReferenceOpal(config.style),
    [config.style, selectedOpal]
  )
  const framingTarget = useMemo(
    () => getRingFramingTarget(config, renderedOpal),
    [config, renderedOpal]
  )
  const renderSignature = useMemo(
    () => JSON.stringify([config, renderedOpal, view]),
    [config, renderedOpal, view]
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
        intensity={2.2}
        color="#fff7e8"
        shadow-bias={-0.00015}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
      <directionalLight position={[-4, 2, 3]} intensity={1} color="#e5f1f2" />
      <pointLight position={[0, -2, 3]} intensity={0.42} color="#fff1de" />

      <CameraPreset target={framingTarget} view={view} />
      {onRenderReady && <RenderReadySignal key={renderSignature} onReady={onRenderReady} />}

      <RingModel
        animateOpalPlacement={!reduceMotion}
        config={config}
        selectedOpal={renderedOpal}
        transitionKey={renderedOpal.id}
      />

      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={1.15}
          color="#f2f0eb"
          position={[0, 0, 4.5]}
          scale={[8, 8, 1]}
        />
        <Lightformer form="rect" intensity={3.6} position={[0, 4, -4]} scale={[5, 1.1, 1]} />
        <Lightformer
          form="rect"
          intensity={3}
          color="#f7f2e9"
          position={[0, 4, 3]}
          rotation={[Math.PI / 5, 0, 0]}
          scale={[5, 1.6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#eef4f2"
          position={[-4, 1, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3.5, 0.75, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
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
        enableZoom={zoomEnabled}
        minDistance={4.8}
        maxDistance={8.5}
        autoRotate={allowMotion}
        autoRotateSpeed={0.55}
      />
    </Canvas>
  )
}
