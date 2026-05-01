import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/record', label: '记录梦境', icon: '✨' },
    { path: '/dreams', label: '梦境列表', icon: '📖' },
    { path: '/sandbox', label: '梦境沙盒', icon: '🎮' },
    { path: '/analytics', label: '心理地图', icon: '🗺️' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-night-700/50 bg-night-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🌙</span>
              <span className="text-xl font-serif font-semibold text-gradient">
                SomniMap
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-dream-500/20 text-dream-300'
                      : 'text-night-300 hover:bg-night-700/50 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-dream-500/30 flex items-center justify-center">
                  <span className="text-dream-300 text-sm font-medium">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm text-night-300">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-night-400 hover:text-white transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="md:hidden border-b border-night-700/50 bg-night-900/30 px-4 py-2 overflow-x-auto">
        <div className="flex space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                location.pathname === item.path
                  ? 'bg-dream-500/20 text-dream-300'
                  : 'text-night-300 hover:bg-night-700/50'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="border-t border-night-700/50 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌙</span>
              <span className="text-sm text-night-400">
                SomniMap - 探索你的梦境世界
              </span>
            </div>
            <p className="text-xs text-night-500">
              你的梦境数据安全存储，仅供你个人探索
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
