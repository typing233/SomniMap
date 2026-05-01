import axios, { InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: (d) => {
        const params = new URLSearchParams()
        params.append('username', d.username)
        params.append('password', d.password)
        return params
      },
    }),
  getCurrentUser: () => api.get('/auth/me'),
}

export const dreamAPI = {
  create: (data: { content: string; dream_date?: string; overall_emotion?: string; clarity?: number }) =>
    api.post('/dreams/', data),
  getList: (params?: { skip?: number; limit?: number }) =>
    api.get('/dreams/', { params }),
  getById: (id: number) => api.get(`/dreams/${id}`),
  analyze: (id: number) => api.post(`/dreams/${id}/analyze`),
  delete: (id: number) => api.delete(`/dreams/${id}`),
}

export const statisticsAPI = {
  getOverview: () => api.get('/statistics/overview'),
  getEmotionTrend: (params?: { days?: number }) =>
    api.get('/statistics/emotion-trend', { params }),
  getThemeClusters: () => api.get('/statistics/theme-clusters'),
  getInsights: () => api.get('/statistics/insights'),
}

export const configAPI = {
  get: () => api.get('/config/'),
  update: (data: { 
    volcanic_api_key?: string; 
    volcanic_model_name?: string; 
    volcanic_base_url?: string;
    privacy_mode?: string 
  }) => api.put('/config/', data),
  validateKey: () => api.post('/config/validate-api-key'),
  testConnection: (data: {
    api_key: string;
    model_name: string;
    base_url?: string;
  }) => api.post('/config/test-connection', data),
}

export default api
