import api from './api';

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface UserCreate {
    full_name: string;
    email: string;
    password: string;
    role: string;
    company: string;
    phone?: string;
}

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await api.post<LoginResponse>('/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    },

    signup: async (userData: UserCreate) => {
        // Note: This endpoint requires Admin privileges by default on the backend.
        const response = await api.post('/users/', userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        // Redirect or state cleanup handled by UI
    },

    changePassword: async (data: { old_password: string; new_password: string }) => {
        const response = await api.post('/auth/password-update', data);
        return response.data;
    },
};
