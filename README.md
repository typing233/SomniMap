# SomniMap - 梦境记录与解析应用

一个专注于心理探索和长期自我觉察的梦境记录应用。

## 项目结构

```
SomniMap/
├── backend/                # 后端 FastAPI 应用
│   ├── app/
│   │   ├── routers/        # API 路由
│   │   ├── services/       # 业务逻辑服务
│   │   ├── database.py     # 数据库配置
│   │   ├── models.py       # 数据模型
│   │   ├── schemas.py      # Pydantic 模型
│   │   └── main.py         # 应用入口
│   ├── requirements.txt    # Python 依赖
│   └── .env.example        # 环境变量示例
└── frontend/               # 前端 React 应用
    ├── src/
    │   ├── pages/          # 页面组件
    │   ├── components/     # 通用组件
    │   ├── services/       # API 服务
    │   ├── store/          # 状态管理
    │   └── index.css       # 样式文件
    ├── package.json        # Node 依赖
    └── vite.config.ts      # Vite 配置
```

## 技术栈

### 后端
- **框架**: FastAPI
- **数据库**: SQLite (可切换 PostgreSQL)
- **ORM**: SQLAlchemy
- **认证**: JWT (python-jose)
- **AI 服务**: 火山方舟大模型 API
- **聚类分析**: scikit-learn

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router
- **可视化**: ECharts
- **构建工具**: Vite

## 核心功能

### 1. 梦境记录
- 轻量级文本输入，支持自然语言描述
- 可选的情绪标记和日期设置
- 极简设计，专注于记录体验

### 2. AI 解析
- 支持火山方舟大模型配置
- 自动识别梦境元素：
  - 人物、地点、物品、动物
  - 颜色、场景变化
- 深度心理学分析：
  - 核心主题
  - 象征意象解读
  - 潜意识线索
  - 情绪分析
- 常见梦境母题识别：
  - 追逐、坠落、考试、迷路
  - 飞翔、裸体、牙齿脱落等

### 3. 统计分析
- 情绪趋势追踪
- 主题聚类分析
- 高频母题统计
- 重复模式识别
- 个性化洞察生成

### 4. 可视化
- 情绪强度趋势图
- 情绪分布饼图
- 高频母题柱状图
- 主题聚类展示
- 梦境心理地图

### 5. 隐私保护
- 密码加密存储
- JWT 认证
- 可配置隐私模式：
  - 标准模式：支持 AI 解析
  - 严格模式：仅本地分析，不上传数据
- API Key 用户自行管理

## 快速开始

### 环境要求
- Python 3.9+
- Node.js 18+

### 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端 API 文档地址：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端访问地址：http://localhost:3000

## 使用指南

### 1. 注册账号
- 访问 http://localhost:3000/welcome
- 点击"开始探索"进行注册
- 填写用户名、邮箱、密码

### 2. 配置 AI (可选)
- 登录后进入"设置"页面
- 输入火山方舟 API Key
- 选择模型（如 doubao-pro-32k）
- 点击"验证 Key"确认配置
- 保存设置

### 3. 记录梦境
- 进入"记录梦境"页面
- 选择梦境日期和整体情绪
- 用自然语言描述梦境内容
- 点击"保存并解析"

### 4. 查看解析
- 在"梦境列表"中选择一条记录
- 切换到"解析结果"标签页
- 查看 AI 生成的分析结果

### 5. 查看心理地图
- 进入"心理地图"页面
- 查看情绪趋势、分布统计
- 查看主题聚类和个性化洞察

## AI 配置说明

### 获取火山方舟 API Key
1. 访问火山方舟控制台
2. 开通服务并创建 API Key
3. 在应用设置中配置该 Key

### 支持的模型
- doubao-pro-32k (推荐)
- doubao-pro-128k
- doubao-lite-32k
- doubao-lite-128k

## 数据安全

### 本地存储
- 所有数据默认存储在本地 SQLite 数据库
- 密码使用 bcrypt 加密存储

### 数据传输
- 仅在使用 AI 解析时发送梦境内容到火山方舟 API
- API 调用使用 HTTPS 加密

### 隐私模式
- **标准模式**：支持完整功能，包括 AI 解析
- **严格模式**：仅使用本地规则分析，不发送任何数据到外部 API

## 可扩展性

### 数据库切换
修改 `backend/app/database.py` 中的连接字符串：
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"
```

### 添加新的 AI 服务
在 `backend/app/services/` 中创建新的服务类，实现类似 `VolcanicArkService` 的接口。

### 添加新的分析功能
扩展 `backend/app/services/analysis_service.py` 中的分析逻辑。

## 开发计划

- [ ] 支持语音输入记录梦境
- [ ] 添加梦境标签系统
- [ ] 梦境搜索功能
- [ ] 数据导出功能
- [ ] 梦境提醒功能
- [ ] 多语言支持
- [ ] 移动端 App

## 许可证

MIT License
