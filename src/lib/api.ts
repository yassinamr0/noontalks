const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://noontalks.vercel.app/api'
  : 'http://localhost:5000/api';

const ADMIN_TOKEN = 'noontalks2024';

export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  
  return data;
};

export const loginUser = async (code: string) => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  
  return data;
};

export const scanTicket = async (code: string) => {
  const response = await fetch(`${API_URL}/users/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Scan failed');
  }
  
  return data;
};

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  
  return data;
};

export const addValidCodes = async (codes: string[]) => {
  const adminToken = sessionStorage.getItem('adminToken') || 'noontalks2024';
  const response = await fetch(`${API_URL}/codes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ codes }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add codes');
  }
  
  return response.json();
};

export const generateCodes = async (count: number) => {
  const response = await fetch(`${API_URL}/codes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ count }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate codes');
  }
  
  return data;
};
