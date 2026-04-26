import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🌙',
      title: '记录梦境',
      description: '简单易用的文本编辑器，让你快速捕捉清晨的梦境记忆。',
    },
    {
      icon: '🧠',
      title: 'AI 智能解析',
      description: '基于大模型的多维度分析，识别人物、场景、情绪和深层心理线索。',
    },
    {
      icon: '📊',
      title: '梦境模式识别',
      description: '自动追踪重复出现的梦境母题、人物和情绪，揭示潜意识规律。',
    },
    {
      icon: '🗺️',
      title: '心理地图',
      description: '可视化展示情绪变化轨迹、主题云图和梦境模式，直观了解自己。',
    },
    {
      icon: '🔒',
      title: '隐私保护',
      description: '端到端的隐私保护设计，你的梦境数据只属于你自己。',
    },
    {
      icon: '✨',
      title: '自我觉察',
      description: '通过持续记录和分析，逐步建立与潜意识的对话桥梁。',
    },
  ];

  return (
    <div className="w-full max-w-4xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-soft-light/10 text-accent-dark text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          探索你的潜意识世界
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dream-900 mb-6 leading-tight">
          <span className="text-gradient">记录梦境</span>
          <br />
          发现内心的秘密
        </h1>
        
        <p className="text-lg md:text-xl text-dream-600 max-w-2xl mx-auto mb-8">
          SomniMap 帮助你通过持续记录梦境，结合 AI 智能解析，
          <br className="hidden md:block" />
          建立与潜意识的对话，实现更深层的自我觉察。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary px-8 py-3 text-lg shadow-lg shadow-accent/25"
          >
            免费开始使用
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-secondary px-8 py-3 text-lg"
          >
            登录账号
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="card card-hover p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-soft-light/10 flex items-center justify-center text-2xl mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-dream-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-dream-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-8 md:p-12 text-center">
        <div className="text-6xl mb-4">🌙</div>
        <blockquote className="text-xl md:text-2xl text-dream-800 font-serif italic mb-4">
          "梦是通往潜意识的皇家大道。"
        </blockquote>
        <cite className="text-dream-500">— 西格蒙德·弗洛伊德</cite>
      </div>
    </div>
  );
};
