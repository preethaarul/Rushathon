const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(typeof data === 'object' ? data.error || 'API Error' : data);
  }
  return data;
};

export const api = {
  auth: {
    signup: (data: any) => fetch(`${API_BASE}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
    login: (data: any) => fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse),
    me: () => fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  },
  transactions: {
    getAll: () => fetch(`${API_BASE}/transactions`, { headers: getHeaders() }).then(handleResponse),
    create: (data: any) => fetch(`${API_BASE}/transactions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id: number) => fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  },
  goals: {
    getAll: () => fetch(`${API_BASE}/goals`, { headers: getHeaders() }).then(handleResponse),
    create: (data: any) => fetch(`${API_BASE}/goals`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id: number, data: any) => fetch(`${API_BASE}/goals/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  },
  prediction: {
    get: () => fetch(`${API_BASE}/predict-expenses`, { headers: getHeaders() }).then(handleResponse),
  }
};
