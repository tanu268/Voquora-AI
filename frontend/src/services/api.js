import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auto refresh token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem('refresh_token');
                const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
                localStorage.setItem('access_token', res.data.access);
                originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                return api(originalRequest);
            } catch (err) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const registerUser = (data) => api.post('/auth/register/', data);
export const loginUser = (data) => api.post('/auth/login/', data);
export const logoutUser = (data) => api.post('/auth/logout/', data);
export const getProfile = () => api.get('/auth/profile/');

// Learning
export const getTopics = () => api.get('/learning/topics/');
export const getExercises = (params) => api.get('/learning/exercises/', { params });
export const submitAnswer = (data) => api.post('/learning/submit/', data);

// Progress
export const getProgressHistory = () => api.get('/progress/history/');
export const getProgressSummary = () => api.get('/progress/summary/');
export const getWeaknesses = () => api.get('/progress/weaknesses/');

// Analysis
export const analyzeText = (data) => api.post('/analysis/analyze/', data);
export const getRecommendations = () => api.get('/analysis/recommendations/');

export default api;