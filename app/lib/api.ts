// cms-kampus-frontend/app/lib/api.ts

interface ApiResponse {
  message: string;
  data?: any;
  token?: string; // Tambahkan ini jika API login juga pakai api.ts
  user?: any; // Tambahkan ini jika API login juga pakai api.ts
}

/**
 * Fungsi helper untuk melakukan permintaan API ke backend.
 * @param endpoint - Endpoint API (misal: '/api/posts', '/api/auth/login')
 * @param method - Metode HTTP (GET, POST, PUT, DELETE)
 * @param token - Token otentikasi (opsional, diperlukan untuk rute terproteksi)
 * @param body - Data body untuk POST/PUT
 * @param isFormData - Atur true jika body adalah FormData (untuk upload file)
 * @returns Promise<ApiResponse>
 */
export const fetchAPI = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token?: string, // Token sekarang opsional
  body?: any,
  isFormData: boolean = false // Parameter baru untuk FormData
): Promise<ApiResponse> => {
  const headers: HeadersInit = {};

  // Jika bukan FormData, atur Content-Type ke application/json
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Tambahkan token jika ada
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: method,
    headers: headers,
  };

  // Handle body: gunakan FormData langsung jika isFormData true,
  // jika tidak, stringify body jika ada
  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, config);

  const data = await response.json();

  if (!response.ok) {
    // Tangani error khusus untuk 401/403
    if (response.status === 401 || response.status === 403) {
      // Log out user jika token tidak valid atau tidak berhak
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      // Tidak perlu redirect di sini, biarkan komponen yang memanggil yang handle.
      // throw new Error('Unauthorized or Forbidden: Please login again.');
    }
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }

  return data;
};
