import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SandboxCanvas } from '@/components/3d/Scene'
import { fetchDreamNodes } from '@/services/sandboxData'
import { convertTo3DNodes } from '@/utils/dreamLayout'
import { DreamNode3D, DreamNodeData } from '@/types/sandbox'
import { useSandboxStore } from '@/store/sandboxStore'

const DreamSandbox: React.FC = () => {
  const [dreamData, setDreamData] = useState<DreamNodeData[]>([])
  const [nodes, setNodes] = useState<DreamNode3D[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { setNodes: setStoreNodes } = useSandboxStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await fetchDreamNodes()
        setDreamData(data)
        
        const threeDNodes = convertTo3DNodes(data)
        setNodes(threeDNodes)
        setStoreNodes(threeDNodes)
        
      } catch (err) {
        console.error('Failed to load sandbox data:', err)
        setError('加载梦境数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setStoreNodes])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-night-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌙</div>
          <h2 className="text-xl font-medium text-night-200 mb-2">
            构建梦境沙盒...
          </h2>
          <p className="text-night-500">
            正在将你的梦境转换为 3D 空间
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-night-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-medium text-night-200 mb-2">
            无法加载梦境沙盒
          </h2>
          <p className="text-night-500 mb-6">
            {error}
          </p>
          <Link
            to="/dreams"
            className="inline-flex items-center text-dream-300 hover:text-dream-200 transition-colors"
          >
            ← 返回梦境列表
          </Link>
        </div>
      </div>
    )
  }

  if (dreamData.length === 0) {
    return (
      <div className="fixed inset-0 bg-night-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🌙</div>
          <h2 className="text-xl font-medium text-night-200 mb-2">
            梦境沙盒为空
          </h2>
          <p className="text-night-500 mb-6">
            记录更多梦境后，你将能够在 3D 沙盒中探索它们之间的联系。
          </p>
          <div className="space-y-3">
            <Link
              to="/record"
              className="block btn-primary"
            >
              ✨ 记录第一个梦境
            </Link>
            <Link
              to="/dreams"
              className="block text-dream-300 hover:text-dream-200 transition-colors text-sm"
            >
              查看梦境列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-night-900">
      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/dreams"
          className="inline-flex items-center gap-2 px-3 py-2 bg-night-900/80 backdrop-blur-md rounded-lg border border-night-700/50 text-night-300 hover:text-white hover:bg-night-800/80 transition-all text-sm"
        >
          <span>←</span>
          <span>返回</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center gap-3 px-3 py-2 bg-night-900/80 backdrop-blur-md rounded-lg border border-night-700/50">
          <span className="text-night-500 text-xs">
            {dreamData.length} 个梦境
          </span>
          <div className="w-1 h-1 rounded-full bg-night-600" />
          <span className="text-night-500 text-xs">
            {nodes.reduce((acc, n) => acc + n.connections.length, 0)} 条连接
          </span>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="px-4 py-2 bg-night-900/60 backdrop-blur-md rounded-full border border-night-700/30">
          <span className="text-dream-300 text-sm font-medium">
            🌙 梦境沙盒
          </span>
        </div>
      </div>

      <SandboxCanvas nodes={nodes} />
    </div>
  )
}

export default DreamSandbox
