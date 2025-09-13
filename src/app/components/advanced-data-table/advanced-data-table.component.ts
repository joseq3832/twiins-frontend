/** biome-ignore-all lint/complexity/useLiteralKeys: false positive */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  LucideAngularModule,
  PencilIcon,
  Trash2,
  TriangleAlert,
} from 'lucide-angular';
import type { PaginatedResponse } from '../../models/api.models';

export interface TableItem {
  id: number | string;
}

export interface TableColumn<_T extends TableItem = TableItem> {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'email' | 'phone' | 'custom';
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: unknown) => string;
}

export interface TableAction<T extends TableItem = TableItem> {
  label: string;
  icon?: string;
  class?: string;
  action: (item: T) => void;
  visible?: (item: T) => boolean;
}

export interface SortEvent {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PageEvent {
  page: number;
  limit: number;
}

@Component({
  selector: 'app-advanced-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Table Header -->
      @if (showHeader) {
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
              @if (subtitle) {
                <p class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
              }
            </div>
            <div class="flex items-center space-x-3">
              <!-- Results Info -->
              <span class="text-sm text-gray-600">
                Mostrando {{ getDisplayRange() }} de {{ data?.meta?.total || 0 }} resultados
              </span>
              <!-- Page Size Selector -->
              <select
                [(ngModel)]="currentPageSize"
                (ngModelChange)="onPageSizeChange($event)"
                class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                @for (size of pageSizeOptions; track size) {
                  <option [value]="size">
                    {{ size }} por página
                  </option>
                }
              </select>
            </div>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (loading) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      }

      <!-- Error State -->
      @if (error && !loading) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <lucide-icon [img]="TriangleAlert" class="text-red-500 text-4xl mb-2 mx-auto"></lucide-icon>
            <p class="text-gray-600">{{ error }}</p>
            @if (onRetry) {
              <button
                (click)="onRetry()"
                class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reintentar
              </button>
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!loading && !error && (!data?.data || data?.data?.length === 0)) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <lucide-icon [img]="FileText" class="text-gray-400 text-6xl mb-4 mx-auto"></lucide-icon>
            <p class="text-gray-600 text-lg">{{ emptyMessage || 'No hay datos para mostrar' }}</p>
            <p class="text-gray-500 text-sm mt-2">{{ emptySubMessage || 'Intenta ajustar los filtros de búsqueda' }}</p>
          </div>
        </div>
      }

      <!-- Data Table -->
      @if (!loading && !error && data?.data && (data?.data?.length ?? 0) > 0) {
        <div class="overflow-x-auto">
          <table class="w-full table-auto divide-y divide-gray-200">
            <!-- Table Head -->
            <thead class="bg-gray-50">
              <tr>
                @for (column of visibleColumns; track column.key) {
                  <th
                    [class]="getHeaderClass(column)"
                    [style.width]="column.width"
                  >
                    <div class="flex items-center space-x-1">
                      <span class="font-medium text-gray-900">{{ column.label }}</span>
                      @if (column.sortable) {
                        <button
                          (click)="onSort(column.key)"
                          class="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <span class="sr-only">Ordenar por {{ column.label }}</span>
                          <!-- Sort Icons -->
                          @if (currentSort?.field !== column.key) {
                            <lucide-icon [img]="ChevronUp" class="w-4 h-4 opacity-50"></lucide-icon>
                          }
                          @if (currentSort?.field === column.key && currentSort?.direction === 'asc') {
                            <lucide-icon [img]="ChevronUp" class="w-4 h-4"></lucide-icon>
                          }
                          @if (currentSort?.field === column.key && currentSort?.direction === 'desc') {
                            <lucide-icon [img]="ChevronDown" class="w-4 h-4"></lucide-icon>
                          }
                        </button>
                      }
                    </div>
                  </th>
                }
                @if (actions && actions.length > 0) {
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                }
              </tr>
            </thead>

          <!-- Table Body -->
          <tbody class="bg-white divide-y divide-gray-200">
            @for (item of data?.data; track trackByFn($index, item); let i = $index) {
              <tr
                class="hover:bg-gray-50 transition-colors duration-150"
                [class.bg-blue-50]="selectedItems.includes(item.id)"
              >
                @for (column of visibleColumns; track column.key) {
                  <td [class]="getCellClass(column)">
                    <div [ngSwitch]="column.type">
                      <!-- Text -->
                      <span *ngSwitchCase="'text'" class="text-gray-900">
                        {{ formatCellValue(item, column) }}
                      </span>
                      <!-- Number -->
                      <span *ngSwitchCase="'number'" class="text-gray-900 font-mono">
                        {{ formatCellValue(item, column) }}
                      </span>
                      <!-- Email -->
                      <a *ngSwitchCase="'email'" [href]="'mailto:' + getCellValue(item, column)" class="text-blue-600 hover:text-blue-800">
                        {{ formatCellValue(item, column) }}
                      </a>
                      <!-- Phone -->
                      <a *ngSwitchCase="'phone'" [href]="'tel:' + getCellValue(item, column)" class="text-blue-600 hover:text-blue-800">
                        {{ formatCellValue(item, column) }}
                      </a>
                      <!-- Date -->
                      <span *ngSwitchCase="'date'" class="text-gray-900">
                        {{ formatCellValue(item, column) }}
                      </span>
                      <!-- Default -->
                      <span *ngSwitchDefault class="text-gray-900">
                        {{ formatCellValue(item, column) }}
                      </span>
                    </div>
                  </td>
                }
                <!-- Actions -->
                @if (actions && actions.length > 0) {
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      @for (action of getVisibleActions(item); track action.label) {
                        <button
                          (click)="action.action(item)"
                          [class]="action.class || 'text-blue-600 hover:text-blue-800'"
                          [title]="action.label"
                        >
                          @if (action.icon) {
                            <lucide-icon [img]="getActionIcon(action.icon)" class="w-4 h-4"></lucide-icon>
                          }
                          @if (!action.icon) {
                            <span>{{ action.label }}</span>
                          }
                        </button>
                      }
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
      }

      <!-- Pagination -->
      @if (!loading && !error && data?.meta && (data?.meta?.total ?? 0) > 0) {
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <!-- Page Info -->
          <div class="text-sm text-gray-600">
            Página {{ data?.meta?.current_page }} de {{ data?.meta?.last_page }}
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center space-x-2">
            <!-- First Page -->
            <button
              (click)="onPageChange(1)"
              [disabled]="data?.meta?.current_page === 1"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ««
            </button>

            <!-- Previous Page -->
            <button
              (click)="onPageChange((data?.meta?.current_page || 1) - 1)"
              [disabled]="data?.meta?.current_page === 1"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            <!-- Page Numbers -->
            @for (page of getVisiblePages(); track page) {
              <button
                (click)="onPageChange(page)"
                [class]="page === data?.meta?.current_page ? 'px-3 py-1 text-sm bg-blue-600 text-white rounded' : 'px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100'"
              >
                {{ page }}
              </button>
            }

            <!-- Next Page -->
            <button
              (click)="onPageChange((data?.meta?.current_page || 1) + 1)"
              [disabled]="data?.meta?.current_page === data?.meta?.last_page"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>

            <!-- Last Page -->
            <button
              (click)="onPageChange(data?.meta?.last_page || 1)"
              [disabled]="data?.meta?.current_page === data?.meta?.last_page"
              class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »»
            </button>
          </div>
        </div>
        </div>
      }
    </div>
  `,
})
export class AdvancedDataTableComponent<T extends TableItem = TableItem> implements OnChanges {
  readonly TriangleAlert = TriangleAlert;
  readonly FileText = FileText;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;
  @Input() data: PaginatedResponse<T> | null = null;
  @Input() columns: TableColumn<T>[] = [];
  @Input() visibleColumns: TableColumn<T>[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showHeader = true;
  @Input() emptyMessage = '';
  @Input() emptySubMessage = '';
  @Input() currentSort: SortEvent | null = null;
  @Input() selectedItems: (number | string)[] = [];
  @Input() pageSizeOptions = [10, 20, 50, 100];
  @Input() currentPageSize = 20;

  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() retry = new EventEmitter<void>();

  onRetry?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPageSize']?.currentValue) {
      this.onPageSizeChange(changes['currentPageSize'].currentValue);
    }
  }

  ngOnInit(): void {
    if (this.visibleColumns.length === 0) {
      this.visibleColumns = [...this.columns];
    }
    this.onRetry = () => this.retry.emit();
  }

  trackByFn(index: number, item: T): number | string {
    return item.id || index;
  }

  onSort(field: string): void {
    let direction: 'asc' | 'desc' = 'asc';

    if (this.currentSort?.field === field) {
      direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    this.sortChange.emit({ field, direction });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= (this.data?.meta?.last_page || 1)) {
      this.pageChange.emit({ page, limit: this.currentPageSize });
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSizeChange.emit(newSize);
  }

  getHeaderClass(column: TableColumn): string {
    const baseClass = 'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider';
    const alignClass =
      column.align === 'center'
        ? 'text-center'
        : column.align === 'right'
          ? 'text-right'
          : 'text-left';
    return `${baseClass} ${alignClass}`;
  }

  getCellClass(column: TableColumn): string {
    const baseClass = 'px-6 py-4 whitespace-nowrap text-sm';
    const alignClass =
      column.align === 'center'
        ? 'text-center'
        : column.align === 'right'
          ? 'text-right'
          : 'text-left';
    return `${baseClass} ${alignClass}`;
  }

  getCellValue(item: T, column: TableColumn<T>): unknown {
    return column.key
      .split('.')
      .reduce((obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key], item);
  }

  formatCellValue(item: T, column: TableColumn<T>): string {
    const value = this.getCellValue(item, column);

    if (value === null || value === undefined) {
      return '-';
    }

    if (column.formatter) {
      return column.formatter(value);
    }

    if (column.type === 'date' && value) {
      const dateValue =
        typeof value === 'string' || typeof value === 'number' || value instanceof Date
          ? new Date(value as string | number | Date)
          : null;
      return dateValue && !Number.isNaN(dateValue.getTime())
        ? dateValue.toLocaleDateString('es-ES')
        : String(value);
    }

    return String(value);
  }

  getVisibleActions(item: T): TableAction<T>[] {
    return this.actions.filter((action) => !action.visible || action.visible(item));
  }

  getDisplayRange(): string {
    if (!this.data?.meta) return '0-0';

    const { from, to } = this.data.meta;
    return `${from || 0}-${to || 0}`;
  }

  getVisiblePages(): number[] {
    if (!this.data?.meta) return [];

    const current = this.data.meta.current_page;
    const total = this.data.meta.last_page;
    const delta = 2;

    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push(-1, total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots.filter((page) => page > 0);
  }

  getActionIcon(iconName: string): typeof Eye | typeof PencilIcon | typeof Trash2 | undefined {
    switch (iconName) {
      case 'eye':
        return Eye;
      case 'edit':
        return PencilIcon;
      case 'trash-2':
        return Trash2;
      default:
        return undefined;
    }
  }
}
