import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loginResponse = await authAPI.login({ username, password })
      const { access_token } = loginResponse.data
      setToken(access_token)

      const userResponse = await authAPI.getCurrentUser()
      setUser(userResponse.data)

      navigate('/record')
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="stars">
        {Array.from({ length: 30 }).map((_, i) => (
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

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/welcome" className="inline-block mb-4">
            <span className="text-4xl">🌙</span>
          </Link>
          <h1 className="text-2xl font-serif font-semibold text-gradient">
            欢迎回来
          </h1>
          <p className="text-night-400 mt-2">登录你的 SomniMap 账号</p>
        </div>

        <div className="card p-8 animate-slide-up">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field w-full"
                placeholder="输入用户名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="输入密码"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-night-400 text-sm">
              还没有账号？{' '}
              <Link to="/register" className="text-dream-300 hover:text-dream-200">
              立即注册
            </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
