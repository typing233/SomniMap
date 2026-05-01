import { dreamAPI, statisticsAPI } from '@/services/api'
import { DreamNodeData } from '@/types/sandbox'

export async function fetchDreamNodes(): Promise<DreamNodeData[]> {
  try {
    const [dreamsRes, clustersRes] = await Promise.all([
      dreamAPI.getList({ limit: 100 }),
      statisticsAPI.getThemeClusters()
    ])
    
    const dreams = dreamsRes.data || []
    const clusters = clustersRes.data.clusters || []
    
    const themeMap = new Map<number, string[]>()
    clusters.forEach((cluster: any) => {
      if (cluster.dream_ids && cluster.keywords) {
        cluster.dream_ids.forEach((id: number) => {
          if (!themeMap.has(id)) {
            themeMap.set(id, [])
          }
          if (cluster.cluster_name) {
            themeMap.get(id)!.push(cluster.cluster_name)
          }
          themeMap.get(id)!.push(...(cluster.keywords || []).slice(0, 3))
        })
      }
    })
    
    const nodes: DreamNodeData[] = dreams.map((dream: any) => ({
      id: dream.id,
      title: dream.content?.substring(0, 50) || '梦境',
      content: dream.content || '',
      dreamDate: dream.dream_date,
      createdAt: dream.created_at,
      emotions: dream.analysis?.emotions || [],
      themes: themeMap.get(dream.id) || dream.analysis?.themes || [],
      motifs: dream.analysis?.motifs || [],
      clarity: dream.clarity,
      overallEmotion: dream.overall_emotion
    }))
    
    return nodes
  } catch (error) {
    console.error('Failed to fetch dream nodes:', error)
    throw error
  }
}

export async function fetchSingleDreamNode(id: number): Promise<DreamNodeData | null> {
  try {
    const response = await dreamAPI.getById(id)
    const dream = response.data
    
    if (!dream) return null
    
    return {
      id: dream.id,
      title: dream.content?.substring(0, 50) || '梦境',
      content: dream.content || '',
      dreamDate: dream.dream_date,
      createdAt: dream.created_at,
      emotions: dream.analysis?.emotions || [],
      themes: dream.analysis?.themes || [],
      motifs: dream.analysis?.motifs || [],
      clarity: dream.clarity,
      overallEmotion: dream.overall_emotion
    }
  } catch (error) {
    console.error('Failed to fetch dream node:', error)
    return null
  }
}
