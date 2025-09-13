import { HttpClient, type HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type {
  ApiError,
  ApiResponse,
  CreateEmployeeRequest,
  Employee,
  EmployeeQueryParams,
  ImmediateFamily,
  PaginatedResponse,
  UpdateEmployeeRequest,
} from '../models/api.models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.baseUrl = `${this.config.apiBaseUrl}/v1/employees`;
  }

  /**
   * Obtener lista de empleados con filtrado avanzado
   */
  getEmployees(params?: EmployeeQueryParams): Observable<PaginatedResponse<Employee>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.select) httpParams = httpParams.set('select', params.select);
      if (params.include) httpParams = httpParams.set('include', params.include);

      Object.keys(params).forEach((key) => {
        if (key.startsWith('filter[') && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http
      .get<PaginatedResponse<Employee>>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener un empleado por ID
   */
  getEmployee(id: number, include?: string): Observable<Employee> {
    let httpParams = new HttpParams();
    if (include) {
      httpParams = httpParams.set('include', include);
    }

    return this.http
      .get<ApiResponse<Employee>>(`${this.baseUrl}/${id}`, { params: httpParams })
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Crear un nuevo empleado
   */
  createEmployee(employee: CreateEmployeeRequest): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(this.baseUrl, employee).pipe(
      map((response) => response.data!),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar un empleado existente
   */
  updateEmployee(id: number, employee: UpdateEmployeeRequest): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${this.baseUrl}/${id}`, employee).pipe(
      map((response) => response.data!),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un empleado
   */
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Obtener familia inmediata de un empleado
   */
  getEmployeeFamily(employeeId: number): Observable<ImmediateFamily[]> {
    return this.http
      .get<ApiResponse<ImmediateFamily[]>>(`${this.baseUrl}/${employeeId}/immediate-family`)
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Agregar miembro de familia inmediata
   */
  addFamilyMember(
    employeeId: number,
    familyMember: Omit<ImmediateFamily, 'id' | 'employee_id' | 'created_at' | 'updated_at'>
  ): Observable<ImmediateFamily> {
    return this.http
      .post<ApiResponse<ImmediateFamily>>(
        `${this.baseUrl}/${employeeId}/immediate-family`,
        familyMember
      )
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar miembro de familia inmediata
   */
  updateFamilyMember(
    employeeId: number,
    familyId: number,
    familyMember: Partial<ImmediateFamily>
  ): Observable<ImmediateFamily> {
    return this.http
      .put<ApiResponse<ImmediateFamily>>(
        `${this.baseUrl}/${employeeId}/immediate-family/${familyId}`,
        familyMember
      )
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar miembro de familia inmediata
   */
  deleteFamilyMember(employeeId: number, familyId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${employeeId}/immediate-family/${familyId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Métodos de utilidad para construir filtros
   */

  /**
   * Crear filtro de igualdad
   */
  static createEqualFilter(field: string, value: string): { [key: string]: string } {
    return { [`filter[${field}][$eq]`]: value };
  }

  /**
   * Crear filtro de mayor que
   */
  static createGreaterThanFilter(field: string, value: string): { [key: string]: string } {
    return { [`filter[${field}][$gt]`]: value };
  }

  /**
   * Crear filtro de mayor o igual que
   */
  static createGreaterThanOrEqualFilter(field: string, value: string): { [key: string]: string } {
    return { [`filter[${field}][$gte]`]: value };
  }

  /**
   * Crear filtro de menor que
   */
  static createLessThanFilter(field: string, value: string): { [key: string]: string } {
    return { [`filter[${field}][$lt]`]: value };
  }

  /**
   * Crear filtro de menor o igual que
   */
  static createLessThanOrEqualFilter(field: string, value: string): { [key: string]: string } {
    return { [`filter[${field}][$lte]`]: value };
  }

  /**
   * Crear filtro de contiene
   */
  static createContainsFilter(field: string, value: string): { [key: string]: string } {
    return { [`filter[${field}][$like]`]: value };
  }

  /**
   * Crear filtro de está en lista
   */
  static createInFilter(field: string, values: string[]): { [key: string]: string } {
    return { [`filter[${field}][$in]`]: values.join(',') };
  }

  /**
   * Manejar errores de HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      const apiError = error.error as ApiError;
      errorMessage = apiError.message || `Error ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  };
}
