import apiClient from './api-client';

class AuthService {
  async login(data) {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  async logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
