
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
export const deletePost = (postId: string) => 
  API.delete(`/posts/${postId}`);

export const logout = () => API.post('/users/logout');
export const getUsernameById = (userId: string) => API.get(`/users/${userId}`);
//export const addPost = (data: { title: string; content: string; location: string; rating: number; images: string[] }) => API.post('/posts', data);
export const getAllPosts = () => API.get('/posts');
export const getPostById = (postId: string) => API.get(`/posts/${postId}`);

export const toggleLikePost = (postId: string) =>
  API.post(`/posts/${postId}`);


export const updatePost = (postId: string, data: FormData) =>
  
  API.put(`/posts/${postId}`, data, {
    headers: {
     "Content-Type": "multipart/form-data",
    },
  });
export const addPost = (data: FormData) => API.post('/posts', data, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
// Add comment
export const addComment = (data: { content: string; postId: string }) =>
  API.post('/comments', data);

// Get all comments for a specific post
export const getCommentsByPost = (postId: string) =>
  API.get(`/comments/${postId}`);

export const planTrip = (data: { destination: string; duration: number; interests: string }) =>
  API.post('/api/plan-trip', data);

export const getPostsByUserId = (userId: string) => API.get(`/posts/user/${userId}`); 
// export const getUserById = (userId: string) => API.get(`/user/${userId}`);



interface UserResponse {
  username: string;
  bio: string;
  email: string;
  profileImage: string;
}

export const getUserById = async (userId: string) => {
  return axios.get<UserResponse>(`http://localhost:3000/users/${userId}`);
};

export const uploadProfilePicture = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const response = await fetch(`http://localhost:3000/users/upload-profile-picture/${userId}`, {
    method: "POST",
    body: formData,
  });

  return response.json();
};


export const getUserBioById = async (userId: string) => {
  return axios.get<UserResponse>(`http://localhost:3000/users/${userId}`);
};

export const updateBio = async (userId: string, bio: string) => {
  return axios.post(`http://localhost:3000/users/update-bio/${userId}`, { bio });
};

export const updateUsername = async (userId: string, username: string) => {
  return axios.post(`http://localhost:3000/users/update-username/${userId}`, { username });
};
