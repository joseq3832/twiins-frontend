// Modelos de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Modelo de usuario
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Modelos de empleados
export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  hire_date: string;
  salary: number;
  department: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  immediate_family?: ImmediateFamily[];
}

export interface ImmediateFamily {
  id: number;
  employee_id: number;
  name: string;
  relationship: string;
  birth_date?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  position: string;
  hire_date: string;
  salary: number;
  department: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

// Parámetros de consulta para empleados
export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  select?: string;
  include?: string;
  [key: string]: any; // Para filtros dinámicos como filter[position][$eq]
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

// Respuestas de error
export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
}

// Respuesta genérica de la API
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  success?: boolean;
}
