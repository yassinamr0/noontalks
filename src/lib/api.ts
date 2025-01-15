import { API_URL } from '@/config';

interface ApiResponse<T> {
  message?: string;
  error?: string;
  [key: string]: any;
}

interface User {
  name: string;
  email: string;
  phone?: string;
  code: string;
  entries: number;
  registeredAt: string;
  lastEntry?: string;
}

interface AdminLoginResponse {
  message: string;
  token: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

const fetchOptions = (method: string = 'GET', body?: any, token?: string): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  },
  body: body ? JSON.stringify(body) : undefined,
  credentials: 'include',
  mode: 'cors'
});

export const adminLogin = async (password: string): Promise<AdminLoginResponse> => {
  const response = await fetch(`${API_URL}/admin/login`, fetchOptions('POST', { password }));
  return handleResponse<AdminLoginResponse>(response);
};

export const registerUser = async (userData: { name: string; email: string; phone?: string; code: string }): Promise<User> => {
  const response = await fetch(`${API_URL}/register`, fetchOptions('POST', userData));
  const data = await handleResponse<ApiResponse<User>>(response);
  return data.user;
};

export const loginUser = async (code: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/login`, fetchOptions('POST', { code }));
  const data = await handleResponse<ApiResponse<User>>(response);
  return data.user;
};

export const scanTicket = async (code: string): Promise<User> => {
  const token = sessionStorage.getItem('adminToken');
  if (!token) {
    throw new Error('Admin token not found. Please login again.');
  }

  const response = await fetch(`${API_URL}/users/scan`, fetchOptions('POST', { code }, token));
  const data = await handleResponse<ApiResponse<User>>(response);
  return data.user;
};

export const getUsers = async (): Promise<User[]> => {
  const token = sessionStorage.getItem('adminToken');
  if (!token) {
    throw new Error('Admin token not found. Please login again.');
  }

  const response = await fetch(`${API_URL}/users`, fetchOptions('GET', undefined, token));
  return handleResponse<User[]>(response);
};

export const generateCodes = async (count: number = 1): Promise<{ code: string }> => {
  const token = sessionStorage.getItem('adminToken');
  if (!token) {
    throw new Error('Admin token not found. Please login again.');
  }

  const response = await fetch(`${API_URL}/codes/generate`, fetchOptions('POST', undefined, token));
  return handleResponse<{ code: string }>(response);
};
