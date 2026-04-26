import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-9xl mb-6 opacity-20">404</div>
        
        <div className="text-6xl mb-4">🌙</div>
        
        <h1 className="text-3xl font-bold text-dream-800 mb-3">
          迷失在梦境中
        </h1>
        
        <p className="text-dream-500 mb-8 leading-relaxed">
          这个页面似乎不存在，或者已经被遗忘在潜意识的深处。
          让我们回到安全的地方。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回上一页
          </button>
          
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="btn btn-primary"
          >
            {isAuthenticated ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                返回仪表盘
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                返回首页
              </>
            )}
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-dream-100">
          <p className="text-sm text-dream-400 mb-2">
            你也可以尝试这些页面：
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dreams" className="text-accent hover:text-accent-dark text-sm">
                  梦境记录
                </Link>
                <Link to="/dreams/create" className="text-accent hover:text-accent-dark text-sm">
                  记录新梦
                </Link>
                <Link to="/analysis" className="text-accent hover:text-accent-dark text-sm">
                  心理分析
                </Link>
                <Link to="/settings" className="text-accent hover:text-accent-dark text-sm">
                  设置
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-accent hover:text-accent-dark text-sm">
                  登录
                </Link>
                <Link to="/register" className="text-accent hover:text-accent-dark text-sm">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-12">
          <p className="text-5xl mb-4">✨</p>
          <blockquote className="text-lg text-dream-600 font-serif italic">
            "未知并非一定是迷失。"
          </blockquote>
          <cite className="text-sm text-dream-400 block mt-2">— 梦境探索者</cite>
        </div>
      </div>
    </div>
  );
};
