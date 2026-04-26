import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const Register: React.FC = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    setLoading(true)

    try {
      await authAPI.register({ username, email, password })
      
      const loginResponse = await authAPI.login({ username, password })
      const { access_token } = loginResponse.data
      setToken(access_token)

      const userResponse = await authAPI.getCurrentUser()
      setUser(userResponse.data)

      navigate('/record')
    } catch (err: any) {
      setError(err.response?.data?.detail || '注册失败，请稍后重试')
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
            创建账号
          </h1>
          <p className="text-night-400 mt-2">开始你的梦境探索之旅</p>
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
                placeholder="选择一个用户名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="输入邮箱地址"
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
                placeholder="至少6个字符"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field w-full"
                placeholder="再次输入密码"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? '注册中...' : '创建账号'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-night-400 text-sm">
              已有账号？{' '}
              <Link to="/login" className="text-dream-300 hover:text-dream-200">
              立即登录
            </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
