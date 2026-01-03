import api from './api';

export interface Employee {
    id: string; // UUID
    user_id: string;
    job_title: string;
    department: string;
    address?: string;
    check_in_time?: string; // HH:MM:SS
    check_out_time?: string; // HH:MM:SS
    profile_picture_url?: string;
    current_status?: string;
    // Map existing User fields if they are flattened or nested
    user?: {
        id: string | number;
        full_name: string;
        email: string;
        role: string;
        company: string;
    };
    // New fields from prompt
    personal_email?: string;
    private_phone?: string;
    emergency_contact?: string;
    nationality?: string;
    gender?: string;
    date_of_birth?: string;
    marital_status?: string;
    certificate_level?: string;
    visa_info?: string;
    base_salary?: number;
    wage_type?: string;
    pay_schedule?: string;
    bank_name?: string;
    account_number?: string;
    swift_code?: string;
    contract_start_date?: string;
    contract_end_date?: string;
    working_hours?: number;
}

export interface EmployeeCreate {
    user: {
        full_name: string;
        email: string;
        password: string; // Needed for user creation
        role?: string;
        company: string;
    };
    job_title: string;
    department: string;
    address?: string;
    date_of_joining: string; // YYYY-MM-DD
    profile_picture_url?: string;
}

export const employeeService = {
    getAll: async () => {
        const response = await api.get<Employee[]>('/employees/');
        return response.data;
    },

    getById: async (id: string | number) => {
        const response = await api.get<Employee>(`/employees/${id}`);
        return response.data;
    },

    getPrivateInfo: async (id: string | number) => {
        const response = await api.get<Partial<Employee>>(`/employees/${id}/private-info`);
        return response.data;
    },

    getSalary: async (id: string | number) => {
        const response = await api.get<Partial<Employee>>(`/employees/${id}/salary`);
        return response.data;
    },

    create: async (data: EmployeeCreate) => {
        // Note: Requires Admin Token
        const response = await api.post<Employee>('/employees/', data);
        return response.data;
    },

    update: async (id: string | number, data: Partial<Employee>) => {
        const response = await api.patch<Employee>(`/employees/${id}`, data);
        return response.data;
    },

    checkIn: async () => {
        const response = await api.post('/attendance/check-in', {});
        return response.data;
    },

    checkOut: async () => {
        const response = await api.post('/attendance/check-out', {});
        return response.data;
    },

    getAttendanceMe: async () => {
        const response = await api.get('/attendance/me');
        return response.data;
    }
};
