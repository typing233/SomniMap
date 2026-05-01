import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DreamNode3D } from '@/types/sandbox'

interface NodeConnectionLineProps {
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
  opacity: number
}

const NodeConnectionLine: React.FC<NodeConnectionLineProps> = ({
  start,
  end,
  color,
  opacity
}) => {
  const lineRef = useRef<THREE.Line>(null)
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array([
      start.x, start.y, start.z,
      end.x, end.y, end.z
    ])
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [start, end])

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
      />
    </line>
  )
}

interface NodeConnectionsProps {
  nodes: DreamNode3D[]
  selectedNodeId: number | null
}

export const NodeConnections: React.FC<NodeConnectionsProps> = ({
  nodes,
  selectedNodeId
}) => {
  const connections = useMemo(() => {
    const result: {
      start: THREE.Vector3
      end: THREE.Vector3
      color: string
      opacity: number
    }[] = []
    
    const processedPairs = new Set<string>()
    
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId)
        if (!targetNode) return
        
        const pairKey = [Math.min(node.id, targetId), Math.max(node.id, targetId)].join('-')
        if (processedPairs.has(pairKey)) return
        processedPairs.add(pairKey)
        
        const isHighlighted = selectedNodeId === node.id || selectedNodeId === targetId
        
        result.push({
          start: node.position,
          end: targetNode.position,
          color: isHighlighted ? '#ffffff' : '#4a3f6b',
          opacity: isHighlighted ? 0.8 : 0.15
        })
      })
    })
    
    return result
  }, [nodes, selectedNodeId])

  return (
    <group>
      {connections.map((conn, index) => (
        <NodeConnectionLine
          key={`conn-${index}`}
          start={conn.start}
          end={conn.end}
          color={conn.color}
          opacity={conn.opacity}
        />
      ))}
    </group>
  )
}

interface FlowingParticleProps {
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
  speed: number
  delay: number
}

const FlowingParticle: React.FC<FlowingParticleProps> = ({
  start,
  end,
  color,
  speed,
  delay
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const startTime = useRef<number | null>(null)
  
  useFrame((state) => {
    if (!meshRef.current) return
    
    const currentTime = state.clock.getElapsedTime()
    
    if (startTime.current === null) {
      startTime.current = currentTime + delay
    }
    
    if (currentTime < startTime.current) return
    
    const elapsed = (currentTime - startTime.current) % speed
    const progress = elapsed / speed
    
    const easedProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    
    meshRef.current.position.lerpVectors(start, end, easedProgress)
    
    const scale = Math.sin(progress * Math.PI) * 0.5 + 0.5
    meshRef.current.scale.setScalar(scale * 0.3)
  })

  return (
    <mesh ref={meshRef} position={start}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  )
}

interface FlowingParticlesProps {
  nodes: DreamNode3D[]
  selectedNodeId: number | null
}

export const FlowingParticles: React.FC<FlowingParticlesProps> = ({
  nodes,
  selectedNodeId
}) => {
  const particles = useMemo(() => {
    const result: {
      id: string
      start: THREE.Vector3
      end: THREE.Vector3
      color: string
      speed: number
      delay: number
    }[] = []
    
    let particleIndex = 0
    
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId)
        if (!targetNode) return
        
        const isHighlighted = selectedNodeId === node.id || selectedNodeId === targetId
        const particleCount = isHighlighted ? 5 : 2
        const baseColor = isHighlighted ? '#a78bfa' : '#6b5b8a'
        
        for (let i = 0; i < particleCount; i++) {
          const speed = 3 + Math.random() * 2
          const delay = (i / particleCount) * speed + Math.random() * 0.5
          
          result.push({
            id: `particle-${particleIndex++}`,
            start: node.position.clone(),
            end: targetNode.position.clone(),
            color: baseColor,
            speed,
            delay
          })
          
          if (i % 2 === 0) {
            result.push({
              id: `particle-${particleIndex++}`,
              start: targetNode.position.clone(),
              end: node.position.clone(),
              color: baseColor,
              speed: speed * 1.2,
              delay: delay + speed * 0.5
            })
          }
        }
      })
    })
    
    return result
  }, [nodes, selectedNodeId])

  return (
    <group>
      {particles.map((p) => (
        <FlowingParticle
          key={p.id}
          start={p.start}
          end={p.end}
          color={p.color}
          speed={p.speed}
          delay={p.delay}
        />
      ))}
    </group>
  )
}

export default NodeConnections
