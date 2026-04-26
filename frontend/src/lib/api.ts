import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  Dream,
  Tag,
  DashboardData,
  PersonalReport,
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  CreateDreamRequest,
  UpdateDreamRequest,
  CreateTagRequest,
  UpdateTagRequest,
  UpdateProfileRequest,
  UpdateSettingsRequest,
  ChangePasswordRequest,
} from '@/types';

const API_BASE_URL = '/api';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const api = createApiClient();

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data.data!;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    return response.data.data!;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data!.user;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data.data!.user;
  },

  async updateSettings(data: UpdateSettingsRequest): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/settings', data);
    return response.data.data!.user;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.put('/auth/password', data);
  },
};

export const dreamApi = {
  async getDreams(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    mood?: string;
    lucidity?: string;
    isFavorite?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ dreams: Dream[]; meta: { total: number; page: number; limit: number; pages: number } }> {
    const response = await api.get<ApiResponse<{ dreams: Dream[] }>>('/dreams', { params });
    return {
      dreams: response.data.data!.dreams,
      meta: response.data.meta! as { total: number; page: number; limit: number; pages: number },
    };
  },

  async getDream(id: string): Promise<Dream> {
    const response = await api.get<ApiResponse<{ dream: Dream }>>(`/dreams/${id}`);
    return response.data.data!.dream;
  },

  async createDream(data: CreateDreamRequest): Promise<Dream> {
    const response = await api.post<ApiResponse<{ dream: Dream }>>('/dreams', data);
    return response.data.data!.dream;
  },

  async updateDream(id: string, data: UpdateDreamRequest): Promise<Dream> {
    const response = await api.put<ApiResponse<{ dream: Dream }>>(`/dreams/${id}`, data);
    return response.data.data!.dream;
  },

  async deleteDream(id: string): Promise<void> {
    await api.delete(`/dreams/${id}`);
  },

  async reanalyzeDream(id: string): Promise<void> {
    await api.post(`/dreams/${id}/reanalyze`);
  },
};

export const tagApi = {
  async getTags(): Promise<Tag[]> {
    const response = await api.get<ApiResponse<{ tags: Tag[] }>>('/tags');
    return response.data.data!.tags;
  },

  async createTag(data: CreateTagRequest): Promise<Tag> {
    const response = await api.post<ApiResponse<{ tag: Tag }>>('/tags', data);
    return response.data.data!.tag;
  },

  async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    const response = await api.put<ApiResponse<{ tag: Tag }>>(`/tags/${id}`, data);
    return response.data.data!.tag;
  },

  async deleteTag(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};

export const statisticsApi = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<ApiResponse<DashboardData>>('/statistics/dashboard');
    return response.data.data!;
  },

  async getPersonalReport(): Promise<PersonalReport> {
    const response = await api.get<ApiResponse<{ report: PersonalReport }>>('/statistics/report');
    return response.data.data!.report;
  },

  async getEmotionTrend(days?: number): Promise<{ emotionTrend: Array<{ date: string; dominantEmotion: string; distribution: Record<string, number>; dreamCount: number }> }> {
    const response = await api.get<ApiResponse<{ emotionTrend: Array<{ date: string; dominantEmotion: string; distribution: Record<string, number>; dreamCount: number }> }>>('/statistics/emotion-trend', {
      params: { days },
    });
    return response.data.data!;
  },

  async getPatterns(type?: string, limit?: number): Promise<{ patterns: Array<{ type: string; name: string; occurrences: number; lastOccurrence: string; significance: number }> }> {
    const response = await api.get<ApiResponse<{ patterns: Array<{ type: string; name: string; occurrences: number; lastOccurrence: string; significance: number }> }>>('/statistics/patterns', {
      params: { type, limit },
    });
    return response.data.data!;
  },

  async getMotifs(): Promise<{ motifs: Array<{ type: string; occurrences: number; averageIntensity: number; firstOccurrence: string; lastOccurrence: string }> }> {
    const response = await api.get<ApiResponse<{ motifs: Array<{ type: string; occurrences: number; averageIntensity: number; firstOccurrence: string; lastOccurrence: string }> }>>('/statistics/motifs');
    return response.data.data!;
  },

  async getThemeCloud(limit?: number): Promise<{ themeCloud: Array<{ name: string; count: number }> }> {
    const response = await api.get<ApiResponse<{ themeCloud: Array<{ name: string; count: number }> }>>('/statistics/theme-cloud', {
      params: { limit },
    });
    return response.data.data!;
  },
};

export { api };
