// cms-kampus-frontend/app/lib/api.ts

interface ApiResponse {
  message: string;
  data?: any;
  token?: string;
  user?: any;
}

export const fetchAPI = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token?: string,
  body?: any,
  isFormData: boolean = false
): Promise<ApiResponse> => {
  const headers: HeadersInit = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: method,
    headers: headers,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, config);

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    }
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }

  return data;
};
