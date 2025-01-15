import { API_URL } from '@/config';

interface ApiResponse {
  message: string;
  error?: string;
}

interface AdminLoginResponse extends ApiResponse {
  token: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  entries: number;
  createdAt: string;
  lastEntry?: string;
}

interface ScanTicketResponse extends ApiResponse {
  isValid: boolean;
  user?: User;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || 'Network error');
  }
  return response.json();
};

const fetchOptions = (method: string, body?: any) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    ...(sessionStorage.getItem('adminToken')
      ? { Authorization: `Bearer ${sessionStorage.getItem('adminToken')}` }
      : {}),
  },
  body: body ? JSON.stringify(body) : undefined,
});

export const adminLogin = async (password: string): Promise<AdminLoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/login`, 
      fetchOptions('POST', { password })
    );
    const data = await handleResponse<AdminLoginResponse>(response);
    sessionStorage.setItem('adminToken', data.token);
    sessionStorage.setItem('isAdmin', 'true');
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const addUser = async (userData: { name?: string; email: string; phone?: string }): Promise<User> => {
  try {
    const response = await fetch(
      `${API_URL}/admin/add-user`,
      fetchOptions('POST', userData)
    );
    return handleResponse<User>(response);
  } catch (error) {
    console.error('Add user error:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(
      `${API_URL}/admin/users`,
      fetchOptions('GET')
    );
    return handleResponse<User[]>(response);
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

export const loginUser = async (email: string): Promise<User> => {
  try {
    const response = await fetch(
      `${API_URL}/auth/login`,
      fetchOptions('POST', { email })
    );
    const data = await handleResponse<{ user: User }>(response);
    sessionStorage.setItem('currentUser', JSON.stringify(data.user));
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const scanTicket = async (email: string): Promise<ScanTicketResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/admin/scan`,
      fetchOptions('POST', { email })
    );
    return handleResponse<ScanTicketResponse>(response);
  } catch (error) {
    console.error('Scan ticket error:', error);
    throw error;
  }
};
