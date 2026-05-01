import { create } from 'zustand'
import * as THREE from 'three'
import { SandboxState, SandboxActions, DreamNode3D } from '@/types/sandbox'

const initialCameraPosition = new THREE.Vector3(0, 10, 30)
const initialCameraTarget = new THREE.Vector3(0, 0, 0)

interface SandboxStore extends SandboxState, SandboxActions {}

export const useSandboxStore = create<SandboxStore>((set) => ({
  nodes: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  loading: false,
  error: null,
  cameraPosition: initialCameraPosition,
  cameraTarget: initialCameraTarget,

  setNodes: (nodes: DreamNode3D[]) => set({ nodes }),
  
  setSelectedNode: (id: number | null) => set({ selectedNodeId: id }),
  
  setHoveredNode: (id: number | null) => set({ hoveredNodeId: id }),
  
  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
  
  setCameraPosition: (pos: THREE.Vector3) => set({ cameraPosition: pos }),
  
  setCameraTarget: (target: THREE.Vector3) => set({ cameraTarget: target }),
  
  resetCamera: () => set({
    cameraPosition: initialCameraPosition.clone(),
    cameraTarget: initialCameraTarget.clone()
  })
}))
