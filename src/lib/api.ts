import { API_URL } from '@/config';

interface ApiResponse {
  message: string;
  error?: string;
}

interface AdminLoginResponse extends ApiResponse {
  token: string;
}

interface GenerateCodeResponse extends ApiResponse {
  codes: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  code: string;
  entries: number;
  createdAt: string;
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

export const generateCodes = async (count: number): Promise<GenerateCodeResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/admin/generate-codes?count=${count}`,
      fetchOptions('POST')
    );
    return handleResponse<GenerateCodeResponse>(response);
  } catch (error) {
    console.error('Generate codes error:', error);
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

export const scanTicket = async (code: string): Promise<ScanTicketResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/admin/scan`,
      fetchOptions('POST', { code })
    );
    return handleResponse<ScanTicketResponse>(response);
  } catch (error) {
    console.error('Scan ticket error:', error);
    throw error;
  }
};

export const loginUser = async (code: string): Promise<User> => {
  try {
    const response = await fetch(
      `${API_URL}/login`,
      fetchOptions('POST', { code })
    );
    const data = await handleResponse<User>(response);
    sessionStorage.setItem('user', JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('User login error:', error);
    throw error;
  }
};

export const registerUser = async (userData: { name: string; email: string; code: string }): Promise<User> => {
  try {
    const response = await fetch(
      `${API_URL}/register`,
      fetchOptions('POST', userData)
    );
    const data = await handleResponse<User>(response);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
