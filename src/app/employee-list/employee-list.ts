import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Employee, EmployeeQueryParams, Meta, PaginatedResponse } from '../models/api.models';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css']
})
export class EmployeeList implements OnInit {
  employees: Employee[] = [];
  meta: Meta = {
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 10,
    to: 0,
    total: 0
  };
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(page: number = 1): void {
    this.loading = true;
    this.error = null;

    const params: EmployeeQueryParams = {
      page,
      limit: this.meta.per_page,
      include: 'immediate_family'
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.employeeService.getEmployees(params).subscribe({
      next: (response: PaginatedResponse<Employee>) => {
        this.employees = response.data;
        this.meta = response.meta;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los empleados. Por favor, intenta de nuevo.';
        this.loading = false;
        console.error('Error loading employees:', error);
      }
    });
  }

  onSearch(): void {
    this.loadEmployees(1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.meta.last_page) {
      this.loadEmployees(page);
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const currentPage = this.meta.current_page;
    const lastPage = this.meta.last_page;
    
    // Mostrar máximo 5 páginas
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(lastPage, startPage + 4);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getFamilyCount(employee: Employee): number {
    return employee.immediate_family?.length || 0;
  }
}