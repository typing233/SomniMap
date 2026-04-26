import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/somnimap',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  volcengine: {
    accessKey: process.env.VOLCENGINE_ACCESS_KEY || '',
    secretKey: process.env.VOLCENGINE_SECRET_KEY || '',
    modelEndpointId: process.env.VOLCENGINE_MODEL_ENDPOINT_ID || '',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here',
  },

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};
