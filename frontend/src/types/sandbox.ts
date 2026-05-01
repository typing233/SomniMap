import * as THREE from 'three'

export interface DreamNodeData {
  id: number
  title: string
  content: string
  dreamDate: string
  createdAt: string
  emotions: { name: string; intensity: number }[]
  themes: string[]
  motifs: string[]
  clarity?: number
  overallEmotion?: string
}

export interface DreamNode3D {
  id: number
  data: DreamNodeData
  position: THREE.Vector3
  color: string
  scale: number
  connections: number[]
}

export interface ParticleData {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  targetPosition: THREE.Vector3
  color: string
  size: number
}

export interface SandboxState {
  nodes: DreamNode3D[]
  selectedNodeId: number | null
  hoveredNodeId: number | null
  loading: boolean
  error: string | null
  cameraPosition: THREE.Vector3
  cameraTarget: THREE.Vector3
}

export interface SandboxActions {
  setNodes: (nodes: DreamNode3D[]) => void
  setSelectedNode: (id: number | null) => void
  setHoveredNode: (id: number | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCameraPosition: (pos: THREE.Vector3) => void
  setCameraTarget: (target: THREE.Vector3) => void
  resetCamera: () => void
}

export interface EmotionColorMap {
  [key: string]: string
}

export interface LayoutConfig {
  spacing: number
  clusterSpacing: number
  baseRadius: number
}
