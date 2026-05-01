import React from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { DreamNode3D } from '@/types/sandbox'
import { emotionColorMap } from '@/utils/dreamLayout'

interface NodeInfoPanelProps {
  node: DreamNode3D | null
  onClose: () => void
  onViewDetail: (id: number) => void
}

export const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({
  node,
  onClose,
  onViewDetail
}) => {
  const navigate = useNavigate()

  if (!node) return null

  const handleViewDetail = () => {
    navigate(`/dreams/${node.id}`)
  }

  const getEmotionColor = (name: string) => {
    return emotionColorMap[name] || '#8266a0'
  }

  return (
    <div
      className="fixed right-4 top-20 bottom-4 w-80 bg-night-900/95 backdrop-blur-md rounded-xl border border-night-700/50 overflow-hidden animate-slide-in"
      style={{ zIndex: 100 }}
    >
      <div 
        className="p-4 border-b border-night-700/50"
        style={{ borderLeft: `4px solid ${node.color}` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-night-500 mb-1">
              {node.data.dreamDate && format(new Date(node.data.dreamDate), 'yyyy年MM月dd日', { locale: zhCN })}
            </div>
            <h3 className="text-night-100 font-medium truncate">
              {node.data.title}
              {node.data.content.length > 50 && '...'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ml-2 text-night-500 hover:text-night-300 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
        {node.data.clarity && (
          <div className="mb-4">
            <div className="text-xs text-night-500 mb-1">清晰度</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-night-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(node.data.clarity / 10) * 100}%`,
                    backgroundColor: node.color
                  }}
                />
              </div>
              <span className="text-sm text-night-300">{node.data.clarity}/10</span>
            </div>
          </div>
        )}

        {node.data.overallEmotion && (
          <div className="mb-4">
            <div className="text-xs text-night-500 mb-2">整体情绪</div>
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: getEmotionColor(node.data.overallEmotion) + '33',
                color: getEmotionColor(node.data.overallEmotion)
              }}
            >
              {node.data.overallEmotion}
            </span>
          </div>
        )}

        {node.data.emotions && node.data.emotions.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-night-500 mb-2">情绪分布</div>
            <div className="space-y-2">
              {node.data.emotions.slice(0, 5).map((emotion, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-night-300">{emotion.name}</span>
                    <span className="text-xs text-night-500">{emotion.intensity}/10</span>
                  </div>
                  <div className="h-1.5 bg-night-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(emotion.intensity / 10) * 100}%`,
                        backgroundColor: getEmotionColor(emotion.name)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {node.data.themes && node.data.themes.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-night-500 mb-2">主题</div>
            <div className="flex flex-wrap gap-1.5">
              {node.data.themes.slice(0, 6).map((theme, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-dream-500/10 text-dream-300 text-xs rounded-full border border-dream-500/20"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.data.motifs && node.data.motifs.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-night-500 mb-2">梦境母题</div>
            <div className="flex flex-wrap gap-1.5">
              {node.data.motifs.map((motif, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-night-700/50 text-night-300 text-xs rounded-full"
                >
                  {motif}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.data.content && (
          <div className="mb-4">
            <div className="text-xs text-night-500 mb-2">梦境摘要</div>
            <p className="text-sm text-night-400 leading-relaxed line-clamp-6">
              {node.data.content}
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-night-900/80 backdrop-blur-md border-t border-night-700/50">
        <button
          onClick={handleViewDetail}
          className="w-full btn-primary text-sm"
        >
          📖 查看完整详情
        </button>
      </div>
    </div>
  )
}

interface MiniMapProps {
  nodes: DreamNode3D[]
  selectedNodeId: number | null
  cameraPosition: { x: number; y: number; z: number }
}

export const MiniMap: React.FC<MiniMapProps> = ({
  nodes,
  selectedNodeId,
  cameraPosition
}) => {
  const mapSize = 150
  const worldSize = 100

  const toMapCoord = (x: number, z: number) => ({
    x: (x / worldSize) * (mapSize / 2) + mapSize / 2,
    y: (z / worldSize) * (mapSize / 2) + mapSize / 2
  })

  return (
    <div
      className="fixed bottom-4 left-4 rounded-xl overflow-hidden border border-night-700/50"
      style={{
        width: mapSize,
        height: mapSize,
        backgroundColor: 'rgba(13, 13, 26, 0.9)',
        zIndex: 50
      }}
    >
      <div className="absolute top-1 left-1 text-xs text-night-500">
        小地图
      </div>
      
      <svg width={mapSize} height={mapSize}>
        {nodes.map((node) => {
          const pos = toMapCoord(node.position.x, node.position.z)
          const isSelected = selectedNodeId === node.id
          return (
            <circle
              key={node.id}
              cx={pos.x}
              cy={pos.y}
              r={isSelected ? 4 : 2}
              fill={isSelected ? '#ffffff' : node.color}
              opacity={isSelected ? 1 : 0.6}
            />
          )
        })}
        
        {(() => {
          const camPos = toMapCoord(cameraPosition.x, cameraPosition.z)
          return (
            <polygon
              points={`${camPos.x},${camPos.y - 4} ${camPos.x - 3},${camPos.y + 3} ${camPos.x + 3},${camPos.y + 3}`}
              fill="#8266a0"
              opacity={0.8}
            />
          )
        })()}
      </svg>
    </div>
  )
}

interface ControlHintsProps {
  isLocked: boolean
}

export const ControlHints: React.FC<ControlHintsProps> = ({ isLocked }) => {
  if (!isLocked) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-center" style={{ zIndex: 50 }}>
      <div className="bg-night-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-night-700/50">
        <span className="text-xs text-night-500">
          <span className="text-dream-300 font-medium">WASD</span> 移动 · 
          <span className="text-dream-300 font-medium ml-1">鼠标</span> 视角 · 
          <span className="text-dream-300 font-medium ml-1">ESC</span> 退出
        </span>
      </div>
    </div>
  )
}

export default NodeInfoPanel
