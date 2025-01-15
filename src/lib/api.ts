const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://noontalks.vercel.app/api'
  : 'http://localhost:5000/api';

export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  
  return response.json();
};

export const loginUser = async (code: string) => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return response.json();
};

export const scanTicket = async (code: string) => {
  const response = await fetch(`${API_URL}/users/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Scan failed');
  }
  
  return response.json();
};

export const getUsers = async () => {
  const adminToken = sessionStorage.getItem('adminToken') || 'noontalks2024';
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch users');
  }
  
  return response.json();
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
  const adminToken = sessionStorage.getItem('adminToken') || 'noontalks2024';
  const response = await fetch(`${API_URL}/codes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ count }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate codes');
  }
  
  return response.json();
};
