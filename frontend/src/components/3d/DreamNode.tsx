import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DreamNode3D } from '@/types/sandbox'

interface DreamNodeMeshProps {
  node: DreamNode3D
  isSelected: boolean
  isHovered: boolean
  onPointerOver: (id: number) => void
  onPointerOut: () => void
  onClick: (id: number) => void
}

const DreamNodeMesh: React.FC<DreamNodeMeshProps> = ({
  node,
  isSelected,
  isHovered,
  onPointerOver,
  onPointerOut,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  
  const color = useMemo(() => new THREE.Color(node.color), [node.color])
  
  const hoverColor = useMemo(() => {
    const c = new THREE.Color(node.color)
    return c.multiplyScalar(1.5)
  }, [node.color])
  
  const selectedColor = useMemo(() => {
    return new THREE.Color('#ffffff')
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    meshRef.current.rotation.y = time * 0.5
    
    const floatOffset = Math.sin(time * 2 + node.id) * 0.3
    meshRef.current.position.y = node.position.y + floatOffset
    
    if (glowRef.current) {
      const glowScale = 1 + Math.sin(time * 3 + node.id) * 0.1
      glowRef.current.scale.setScalar(node.scale * glowScale * 1.3)
    }
    
    if (ringRef.current && isSelected) {
      ringRef.current.rotation.x = time * 2
      ringRef.current.rotation.z = time
    }
  })

  const currentColor = isSelected ? selectedColor : (isHovered ? hoverColor : color)
  const currentScale = node.scale * (isHovered ? 1.2 : 1) * (isSelected ? 1.3 : 1)

  return (
    <group position={node.position}>
      {isSelected && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[currentScale * 1.5, 0.05, 8, 32]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.8} />
        </mesh>
      )}
      
      <mesh ref={glowRef} scale={node.scale * 1.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={isHovered ? 0.4 : 0.2}
          side={THREE.BackSide}
        />
      </mesh>
      
      <mesh
        ref={meshRef}
        scale={currentScale}
        onPointerOver={(e) => {
          e.stopPropagation()
          onPointerOver(node.id)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          onPointerOut()
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick(node.id)
        }}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={currentColor}
          emissive={currentColor}
          emissiveIntensity={isHovered ? 0.5 : 0.3}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      <mesh scale={currentScale * 0.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>
    </group>
  )
}

interface DreamNodesProps {
  nodes: DreamNode3D[]
  selectedNodeId: number | null
  hoveredNodeId: number | null
  onNodeHover: (id: number | null) => void
  onNodeSelect: (id: number | null) => void
}

export const DreamNodes: React.FC<DreamNodesProps> = ({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  onNodeHover,
  onNodeSelect
}) => {
  return (
    <>
      {nodes.map((node) => (
        <DreamNodeMesh
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          isHovered={hoveredNodeId === node.id}
          onPointerOver={(id) => onNodeHover(id)}
          onPointerOut={() => onNodeHover(null)}
          onClick={(id) => onNodeSelect(selectedNodeId === id ? null : id)}
        />
      ))}
    </>
  )
}

export default DreamNodes
