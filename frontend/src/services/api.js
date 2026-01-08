/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ==================== Auth API ====================

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    getAllUsers: () => api.get('/auth/users')
};

// ==================== Foods API ====================

export const foodsAPI = {
    getAll: (params) => api.get('/foods', { params }),
    getById: (id) => api.get(`/foods/${id}`),
    create: (data) => api.post('/foods', data),
    update: (id, data) => api.put(`/foods/${id}`, data),
    delete: (id) => api.delete(`/foods/${id}`)
};

// ==================== Plans API ====================

export const plansAPI = {
    getAll: () => api.get('/plans'),
    getById: (id) => api.get(`/plans/${id}`),
    getActive: () => api.get('/plans/active'),
    create: (data) => api.post('/plans', data),
    update: (id, data) => api.put(`/plans/${id}`, data),
    delete: (id) => api.delete(`/plans/${id}`),
    activate: (id) => api.put(`/plans/${id}/activate`),
    addItem: (id, data) => api.post(`/plans/${id}/items`, data),
    removeItem: (planId, itemId) => api.delete(`/plans/${planId}/items/${itemId}`),
    calculateCalories: (gender) => api.get('/plans/calculate-calories', { params: { gender } })
};

// ==================== Logs API ====================

export const logsAPI = {
    getAll: (limit) => api.get('/logs', { params: { limit } }),
    getToday: () => api.get('/logs/today'),
    getByDate: (date) => api.get(`/logs/date/${date}`),
    getRange: (startDate, endDate) => api.get('/logs/range', { params: { startDate, endDate } }),
    create: (data) => api.post('/logs', data),
    update: (id, data) => api.put(`/logs/${id}`, data),
    delete: (id) => api.delete(`/logs/${id}`),
    getTodayTotals: () => api.get('/logs/totals/today'),
    getTotalsByDate: (date) => api.get(`/logs/totals/date/${date}`),
    getTotalsRange: (startDate, endDate) => api.get('/logs/totals/range', { params: { startDate, endDate } }),
    getWeeklySummary: () => api.get('/logs/totals/weekly')
};

// ==================== Progress API ====================

export const progressAPI = {
    getSummary: () => api.get('/progress/summary'),
    getWeightProgress: () => api.get('/progress/weight-progress'),
    getNutrition: (days) => api.get('/progress/nutrition', { params: { days } }),
    getGoal: () => api.get('/progress/goal'),
    getWeight: (limit) => api.get('/progress/weight', { params: { limit } }),
    getLatestWeight: () => api.get('/progress/weight/latest'),
    getWeightRange: (startDate, endDate) => api.get('/progress/weight/range', { params: { startDate, endDate } }),
    logWeight: (data) => api.post('/progress/weight', data),
    updateWeight: (id, data) => api.put(`/progress/weight/${id}`, data),
    deleteWeight: (id) => api.delete(`/progress/weight/${id}`)
};

export default api;
