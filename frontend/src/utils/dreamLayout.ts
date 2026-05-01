import * as THREE from 'three'
import { DreamNodeData, DreamNode3D, EmotionColorMap, LayoutConfig } from '@/types/sandbox'

export const emotionColorMap: EmotionColorMap = {
  '恐惧': '#ef4444',
  '焦虑': '#f97316',
  '悲伤': '#3b82f6',
  '快乐': '#22c55e',
  '愤怒': '#dc2626',
  '惊讶': '#eab308',
  '厌恶': '#a855f7',
  '平静': '#06b6d4',
}

export const defaultNodeColor = '#8266a0'

export const layoutConfig: LayoutConfig = {
  spacing: 8,
  clusterSpacing: 15,
  baseRadius: 2
}

export function getNodeColor(data: DreamNodeData): string {
  if (data.overallEmotion && emotionColorMap[data.overallEmotion]) {
    return emotionColorMap[data.overallEmotion]
  }
  
  if (data.emotions && data.emotions.length > 0) {
    const strongestEmotion = data.emotions.reduce((prev, curr) => 
      prev.intensity > curr.intensity ? prev : curr
    )
    if (emotionColorMap[strongestEmotion.name]) {
      return emotionColorMap[strongestEmotion.name]
    }
  }
  
  return defaultNodeColor
}

export function getNodeScale(data: DreamNodeData): number {
  const baseScale = 1
  const clarityBonus = (data.clarity || 5) / 10
  const emotionBonus = data.emotions ? Math.min(data.emotions.length * 0.1, 0.5) : 0
  const themeBonus = data.themes ? Math.min(data.themes.length * 0.05, 0.3) : 0
  
  return baseScale + clarityBonus * 0.3 + emotionBonus + themeBonus
}

export function clusterByThemes(nodes: DreamNodeData[]): Map<string, DreamNodeData[]> {
  const clusters = new Map<string, DreamNodeData[]>()
  
  nodes.forEach(node => {
    if (node.themes && node.themes.length > 0) {
      const primaryTheme = node.themes[0]
      if (!clusters.has(primaryTheme)) {
        clusters.set(primaryTheme, [])
      }
      clusters.get(primaryTheme)!.push(node)
    } else {
      if (!clusters.has('未分类')) {
        clusters.set('未分类', [])
      }
      clusters.get('未分类')!.push(node)
    }
  })
  
  return clusters
}

export function calculateSpiralPosition(
  index: number,
  totalInCluster: number,
  clusterCenter: THREE.Vector3,
  config: LayoutConfig
): THREE.Vector3 {
  const angleIncrement = (2 * Math.PI) / Math.max(totalInCluster, 1)
  const radius = config.baseRadius + Math.floor(index / 6) * config.spacing
  const angle = index * angleIncrement + (index / 6) * 0.3
  
  return new THREE.Vector3(
    clusterCenter.x + Math.cos(angle) * radius,
    clusterCenter.y + (Math.random() - 0.5) * 2,
    clusterCenter.z + Math.sin(angle) * radius
  )
}

export function calculateClusterCenters(
  clusterCount: number,
  config: LayoutConfig
): THREE.Vector3[] {
  const centers: THREE.Vector3[] = []
  
  for (let i = 0; i < clusterCount; i++) {
    const angle = (2 * Math.PI * i) / Math.max(clusterCount, 1)
    const radius = Math.ceil(clusterCount / 6) * config.clusterSpacing
    
    centers.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ))
  }
  
  return centers
}

export function calculateConnections(nodes: DreamNode3D[]): Map<number, number[]> {
  const connections = new Map<number, number[]>()
  
  nodes.forEach((node, i) => {
    const nearby: { id: number; distance: number }[] = []
    
    nodes.forEach((other, j) => {
      if (i !== j) {
        const distance = node.position.distanceTo(other.position)
        nearby.push({ id: other.id, distance })
      }
    })
    
    nearby.sort((a, b) => a.distance - b.distance)
    const closestIds = nearby.slice(0, 3).filter(n => n.distance < 20).map(n => n.id)
    connections.set(node.id, closestIds)
  })
  
  return connections
}

export function convertTo3DNodes(
  dreamData: DreamNodeData[],
  config: LayoutConfig = layoutConfig
): DreamNode3D[] {
  if (dreamData.length === 0) return []
  
  const clusters = clusterByThemes(dreamData)
  const clusterNames = Array.from(clusters.keys())
  const clusterCenters = calculateClusterCenters(clusterNames.length, config)
  
  const nodes: DreamNode3D[] = []
  let globalIndex = 0
  
  clusterNames.forEach((themeName, clusterIndex) => {
    const clusterNodes = clusters.get(themeName) || []
    const center = clusterCenters[clusterIndex]
    
    clusterNodes.forEach((nodeData, nodeIndex) => {
      const position = calculateSpiralPosition(
        nodeIndex,
        clusterNodes.length,
        center,
        config
      )
      
      nodes.push({
        id: nodeData.id,
        data: nodeData,
        position,
        color: getNodeColor(nodeData),
        scale: getNodeScale(nodeData),
        connections: []
      })
      
      globalIndex++
    })
  })
  
  const connections = calculateConnections(nodes)
  nodes.forEach(node => {
    node.connections = connections.get(node.id) || []
  })
  
  return nodes
}

export function findNearestNode(
  position: THREE.Vector3,
  nodes: DreamNode3D[],
  maxDistance: number = 5
): DreamNode3D | null {
  let nearest: DreamNode3D | null = null
  let minDistance = maxDistance
  
  nodes.forEach(node => {
    const distance = position.distanceTo(node.position)
    if (distance < minDistance) {
      minDistance = distance
      nearest = node
    }
  })
  
  return nearest
}
