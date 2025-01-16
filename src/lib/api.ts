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

interface ScanTicketResponse extends User {
  // Inherits all User properties
}

interface ScanTicketFullResponse extends ApiResponse {
  isValid: boolean;
  user?: ScanTicketResponse;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson && data.message) {
      throw new Error(data.message);
    } else {
      throw new Error('Network error');
    }
  }

  return data;
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
    console.log('Making login request with password:', password);
    const url = `${API_URL}/api/admin/login`;
    console.log('Login URL:', url);
    
    const options = fetchOptions('POST', { password });
    console.log('Request options:', options);
    
    const response = await fetch(url, options);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await handleResponse<AdminLoginResponse>(response);
    console.log('Response data:', data);
    
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
    const response = await fetch(`${API_URL}/admin/add-user`, 
      fetchOptions('POST', userData)
    );
    return handleResponse<User>(response);
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/admin/users`, 
      fetchOptions('GET')
    );
    return handleResponse<User[]>(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const loginUser = async (email: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/user/login`, 
      fetchOptions('POST', { email })
    );
    return handleResponse<User>(response);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const scanTicket = async (email: string): Promise<ScanTicketFullResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/validate`, 
      fetchOptions('POST', { email })
    );
    return handleResponse<ScanTicketFullResponse>(response);
  } catch (error) {
    console.error('Error scanning ticket:', error);
    throw error;
  }
};
