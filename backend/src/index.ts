import mongoose from 'mongoose';
import { config } from './config';
import { createApp } from './app';

const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 正在启动 SomniMap 后端服务...');
    
    console.log('📦 正在连接 MongoDB...');
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ MongoDB 连接成功');

    const app = createApp();

    app.listen(config.port, () => {
      console.log(`
╔═════════════════════════════════════════════╗
║                                             ║
║   🌙 SomniMap - 梦境记录与心理探索应用      ║
║                                             ║
║   🚀 服务已启动                              ║
║   📍 环境: ${config.nodeEnv.padEnd(34)}║
║   🌐 端口: ${String(config.port).padEnd(35)}║
║   📊 API: http://localhost:${config.port}/api    ║
║   🏥 健康检查: http://localhost:${config.port}/health ║
║                                             ║
╚═════════════════════════════════════════════╝
      `);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('❌ 未处理的 Promise 拒绝:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('❌ 未捕获的 异常:', error);
      process.exit(1);
    });

    process.on('SIGTERM', async () => {
      console.log('📢 收到 SIGTERM 信号，正在优雅关闭...');
      await mongoose.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('📢 收到 SIGINT 信号，正在优雅关闭...');
      await mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
};

startServer();
