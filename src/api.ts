
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});
export default API;
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = (data: { email: string; password: string }) =>
  API.post('/users/login', data);

export const register = (data: { email: string; username: string; password: string }) =>
  API.post('/users/register', data);

export const refreshToken = () => API.post('/users/refresh');

export const logout = () => API.post('/users/logout');
export const getUsernameById = (userId: string) => API.get(`/users/${userId}`);
//export const addPost = (data: { title: string; content: string; location: string; rating: number; images: string[] }) => API.post('/posts', data);
export const getAllPosts = () => API.get('/posts');
export const addPost = (data: FormData) => API.post('/posts', data, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
