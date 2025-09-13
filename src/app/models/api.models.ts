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
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  hire_date: string;
  immediate_family?: ImmediateFamily[];
  created_at: string;
  updated_at: string;
}

export interface ImmediateFamily {
  id: number;
  employee_id: number;
  family_name: string;
  relationship: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  position: string;
  hire_date: string;
  immediate_family?: ImmediateFamily[];
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  select?: string;
  include?: string;
  [key: string]: string | number | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Meta;
  links: Links;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface Links {
  first: string;
  last: string;
  prev: string;
  next: string;
}

export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
}

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  success?: boolean;
}
