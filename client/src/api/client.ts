import axios from 'axios';

interface ApiEnvelope<T> {
  code: number;
  data: T;
  message: string;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope<unknown>;
    if (payload && typeof payload.code === 'number') {
      if (payload.code !== 0) return Promise.reject(new Error(payload.message || '请求失败'));
      response.data = payload.data;
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络请求失败';
    return Promise.reject(new Error(message));
  }
);
