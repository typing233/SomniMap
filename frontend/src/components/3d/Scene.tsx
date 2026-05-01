import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { DreamNodes } from '@/components/3d/DreamNode'
import { NodeConnections, FlowingParticles } from '@/components/3d/ParticleConnection'
import { FirstPersonControls } from '@/components/3d/FirstPersonControls'
import { DreamSkybox, DreamGrid, FloatingOrbs } from '@/components/3d/Skybox'
import { NodeInfoPanel, MiniMap, ControlHints } from '@/components/3d/NodeInfoPanel'
import { DreamNode3D } from '@/types/sandbox'
import { useSandboxStore } from '@/store/sandboxStore'

interface SandboxSceneProps {
  nodes: DreamNode3D[]
}

const SandboxScene: React.FC<SandboxSceneProps> = ({ nodes }) => {
  const {
    selectedNodeId,
    hoveredNodeId,
    setSelectedNode,
    setHoveredNode,
    cameraPosition,
    setCameraPosition
  } = useSandboxStore()
  
  const [isLocked, setIsLocked] = useState(false)

  const handleNodeHover = (id: number | null) => {
    setHoveredNode(id)
    document.body.style.cursor = id ? 'pointer' : 'auto'
  }

  const handleNodeSelect = (id: number | null) => {
    setSelectedNode(id)
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null

  return (
    <>
      <DreamSkybox starCount={3000} />
      <DreamGrid size={200} divisions={40} />
      <FloatingOrbs count={6} />
      
      <NodeConnections
        nodes={nodes}
        selectedNodeId={selectedNodeId}
      />
      
      <FlowingParticles
        nodes={nodes}
        selectedNodeId={selectedNodeId}
      />
      
      <DreamNodes
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        hoveredNodeId={hoveredNodeId}
        onNodeHover={handleNodeHover}
        onNodeSelect={handleNodeSelect}
      />
      
      <FirstPersonControls
        enabled={true}
        moveSpeed={25}
        onLockChange={setIsLocked}
      />

      <ControlHints isLocked={isLocked} />
      
      {nodes.length > 0 && (
        <MiniMap
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          cameraPosition={{
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z
          }}
        />
      )}
      
      {selectedNode && (
        <NodeInfoPanel
          node={selectedNode}
          onClose={() => handleNodeSelect(null)}
          onViewDetail={(id) => console.log('View detail:', id)}
        />
      )}
    </>
  )
}

interface SandboxCanvasProps {
  nodes: DreamNode3D[]
}

export const SandboxCanvas: React.FC<SandboxCanvasProps> = ({ nodes }) => {
  return (
    <Canvas
      camera={{
        position: [0, 10, 30],
        fov: 75,
        near: 0.1,
        far: 1000
      }}
      gl={{
        antialias: true,
        alpha: false
      }}
      style={{
        width: '100%',
        height: '100%'
      }}
      shadows
    >
      <SandboxScene nodes={nodes} />
    </Canvas>
  )
}

export default SandboxCanvas
