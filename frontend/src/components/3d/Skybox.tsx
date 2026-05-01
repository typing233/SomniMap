import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'

interface DreamSkyboxProps {
  starCount?: number
}

export const DreamSkybox: React.FC<DreamSkyboxProps> = ({
  starCount = 5000
}) => {
  const { scene } = useThree()
  
  const starPositions = useMemo(() => {
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      const radius = 200 + Math.random() * 300
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.cos(phi)
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    return positions
  }, [starCount])

  const starColors = useMemo(() => {
    const colors = new Float32Array(starCount * 3)
    const colorPalette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#f9a8d4'),
      new THREE.Color('#fcd34d'),
    ]
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }
    return colors
  }, [starCount])

  return (
    <>
      <Stars
        radius={300}
        depth={100}
        count={starCount}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      <mesh>
        <sphereGeometry args={[400, 32, 32]} />
        <meshBasicMaterial
          color="#0a0a1a"
          side={THREE.BackSide}
        />
      </mesh>
      
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 20, 10]} intensity={0.5} color="#a78bfa" />
      <pointLight position={[-20, 10, -20]} intensity={0.3} color="#818cf8" />
      <pointLight position={[0, -10, 20]} intensity={0.2} color="#f9a8d4" />
      
      <fog attach="fog" args={['#0a0a1a', 50, 300]} />
    </>
  )
}

interface DreamGridProps {
  size?: number
  divisions?: number
}

export const DreamGrid: React.FC<DreamGridProps> = ({
  size = 200,
  divisions = 50
}) => {
  const gridRef = useRef<THREE.GridHelper>(null)
  
  useFrame((state) => {
    if (gridRef.current) {
      const time = state.clock.getElapsedTime()
      gridRef.current.material.opacity = 0.1 + Math.sin(time * 0.5) * 0.05
    }
  })

  return (
    <group>
      <gridHelper
        ref={gridRef}
        args={[size, divisions, '#4a3f6b', '#2d2540']}
        position={[0, -0.01, 0]}
      >
        <meshBasicMaterial
          attach="material"
          transparent
          opacity={0.1}
        />
      </gridHelper>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          color="#0d0d1a"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}

interface FloatingOrbsProps {
  count?: number
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({
  count = 8
}) => {
  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        Math.random() * 30 + 5,
        (Math.random() - 0.5) * 100
      ),
      scale: Math.random() * 2 + 0.5,
      color: ['#a78bfa', '#818cf8', '#f9a8d4', '#6ee7b7'][Math.floor(Math.random() * 4)],
      speed: Math.random() * 0.5 + 0.2
    }))
  }, [count])

  return (
    <group>
      {orbs.map((orb) => (
        <FloatingOrb key={orb.id} {...orb} />
      ))}
    </group>
  )
}

interface FloatingOrbData {
  id: number
  position: THREE.Vector3
  scale: number
  color: string
  speed: number
}

const FloatingOrb: React.FC<FloatingOrbData> = ({
  position,
  scale,
  color,
  speed
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const initialPos = useRef(position.clone())

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    meshRef.current.position.x = initialPos.current.x + Math.sin(time * speed) * 3
    meshRef.current.position.y = initialPos.current.y + Math.cos(time * speed * 0.7) * 2
    meshRef.current.position.z = initialPos.current.z + Math.sin(time * speed * 1.3) * 3
    
    meshRef.current.rotation.x = time * speed * 0.5
    meshRef.current.rotation.y = time * speed * 0.3
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  )
}

export default DreamSkybox
