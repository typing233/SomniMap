import React from 'react'
import { Link } from 'react-router-dom'

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="stars">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl animate-fade-in">
        <div className="mb-8 animate-float">
          <span className="text-8xl">🌙</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-gradient">
          SomniMap
        </h1>
        <p className="text-xl sm:text-2xl text-night-300 mb-2">
          梦境记录与心理探索
        </p>
        <p className="text-night-400 mb-12 max-w-md mx-auto">
          用文字记录你的梦境，让AI帮你解读潜意识的语言，
          绘制属于你的梦境心理地图，探索更深层的自我。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
          >
            开始探索
          </Link>
          <Link
            to="/login"
            className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
          >
            登录账号
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card p-6 card-hover">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="text-lg font-medium mb-2">轻便记录</h3>
            <p className="text-sm text-night-400">
              无需复杂表单，用自然语言直接描述你的梦境
            </p>
          </div>

          <div className="card p-6 card-hover">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-medium mb-2">AI深度解析</h3>
            <p className="text-sm text-night-400">
              识别梦境元素、情绪和象征，解读潜意识线索
            </p>
          </div>

          <div className="card p-6 card-hover">
            <div className="text-3xl mb-3">🗺️</div>
            <h3 className="text-lg font-medium mb-2">心理地图</h3>
            <p className="text-sm text-night-400">
              可视化情绪轨迹和重复主题，发现你的梦境模式
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome
