import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                try {
                    const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh,
                    });
                    localStorage.setItem('access_token', data.access);
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    return api(originalRequest);
                } catch {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authApi = {
    register: (data: {
        username: string;
        email: string;
        password: string;
        first_name: string;
        last_name: string;
    }) => api.post('/auth/register/', data),

    login: (data: { username: string; password: string }) =>
        api.post('/auth/login/', data),

    logout: () => {
        const refresh = localStorage.getItem('refresh_token');
        return api.post('/auth/logout/', { refresh });
    },

    me: () => api.get('/auth/me/'),
};

// Complaints APIs
export const complaintsApi = {
    submit: (formData: FormData) =>
        api.post('/complaints/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    track: (complaintId: string) =>
        api.get(`/complaints/track/${complaintId}/`),

    list: () => api.get('/complaints/'),

    get: (id: number) => api.get(`/complaints/${id}/`),

    updateStatus: (id: number, status: string) =>
        api.patch(`/complaints/${id}/`, { status }),

    assign: (id: number, data: { assigned_department?: number | null; assigned_to?: number | null }) =>
        api.post(`/complaints/${id}/assign/`, data),

    publicList: (params?: {
        category?: string;
        date_from?: string;
        date_to?: string;
        status?: string;
        sort?: string;
    }) => api.get('/complaints/public/', { params }),

    toggleUpvote: (id: number) =>
        api.post(`/complaints/${id}/upvote/`),
};

// Departments APIs
export const departmentsApi = {
    list: () => api.get('/departments/'),
    getAdmins: (departmentId: number) => api.get(`/departments/${departmentId}/admins/`),
};

export default api;
