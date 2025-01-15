const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://noontalks-backend.vercel.app'
  : 'http://localhost:5000';

const ADMIN_TOKEN = 'noontalks2024';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

const adminHeaders = {
  ...defaultHeaders,
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const registerUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw error;
  }
};

export const loginUser = async (code: string) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
};

export const scanTicket = async (code: string) => {
  try {
    const response = await fetch(`${API_URL}/users/scan`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error in scanTicket:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: adminHeaders,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw error;
  }
};

export const addValidCodes = async (codes: string[]) => {
  const adminToken = sessionStorage.getItem('adminToken') || 'noontalks2024';
  try {
    const response = await fetch(`${API_URL}/codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ codes }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error in addValidCodes:', error);
    throw error;
  }
};

export const generateCodes = async (count: number) => {
  try {
    const response = await fetch(`${API_URL}/codes/generate`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ count }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error in generateCodes:', error);
    throw error;
  }
};
