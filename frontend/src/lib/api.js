const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  getToken() {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.accessToken) {
      this.setToken(data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  }

  async logout() {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null;

    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      this.clearToken();
    }
  }

  async refresh() {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refresh_token')
      : null;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (data.accessToken) {
      this.setToken(data.accessToken);
    }

    return data;
  }

  // Supplies endpoints
  async getSupplies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/supplies${query ? `?${query}` : ''}`);
  }

  async getSupply(id) {
    return this.request(`/supplies/${id}`);
  }

  async createSupply(supplyData) {
    return this.request('/supplies', {
      method: 'POST',
      body: JSON.stringify(supplyData),
    });
  }

  async updateSupply(id, supplyData) {
    return this.request(`/supplies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplyData),
    });
  }

  async getCategories() {
    return this.request('/supplies/categories');
  }

  // Inventory endpoints
  async getUnitInventory(unitId) {
    return this.request(`/inventory/units/${unitId}`);
  }

  async getStationInventory(stationId) {
    return this.request(`/inventory/stations/${stationId}`);
  }

  async getAllInventory() {
    return this.request('/inventory/all');
  }

  async recordUsage(usageData) {
    return this.request('/inventory/usage', {
      method: 'POST',
      body: JSON.stringify(usageData),
    });
  }

  async adjustInventory(adjustmentData) {
    return this.request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
  }

  async getExpiringItems(days = 90) {
    return this.request(`/inventory/expiring?days=${days}`);
  }

  async getBelowPar() {
    return this.request('/inventory/below-par');
  }
}

const apiClient = new ApiClient();

export default apiClient;
