// lib/auth.ts or utils/auth.ts
// Helper functions to manage authentication

/**
 * Get the stored authentication token
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Get the user's role
 */
export const getUserRole = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('role');
  }
  return null;
};

/**
 * Get the user's ID
 */
export const getUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId');
  }
  return null;
};

/**
 * Get the user's name
 */
export const getUserName = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userName');
  }
  return null;
};

/**
 * Get the user's email
 */
export const getUserEmail = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userEmail');
  }
  return null;
};

/**
 * Get the full user object
 */
export const getUser = (): any | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  return getUserRole() === 'admin';
};

/**
 * Check if user is student
 */
export const isStudent = (): boolean => {
  return getUserRole() === 'student';
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Logout user - clear all auth data
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Redirect to home
    window.location.href = '/';
  }
};

/**
 * Store authentication data
 */
export const setAuthData = (data: {
  token: string;
  role: string;
  user?: any;
}) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.id) localStorage.setItem('userId', data.user.id);
      if (data.user.fullName) localStorage.setItem('userName', data.user.fullName);
      if (data.user.email) localStorage.setItem('userEmail', data.user.email);
    }
  }
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// In any component:

import { getToken, getUserRole, isAuthenticated, getAuthHeaders, logout } from '@/lib/auth';

// Check if logged in
if (isAuthenticated()) {
  console.log('User is logged in!');
}

// Get user role
const role = getUserRole();
if (role === 'admin') {
  console.log('User is admin');
}

// Make authenticated API request
const fetchExams = async () => {
  const response = await fetch('http://localhost:5000/api/exam/list', {
    method: 'GET',
    headers: getAuthHeaders(), // Automatically includes token
  });
  
  const data = await response.json();
  return data;
};

// Logout
const handleLogout = () => {
  logout(); // Clears everything and redirects to home
};

*/