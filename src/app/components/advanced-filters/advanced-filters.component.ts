import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { EmployeeQueryParams } from '../../models/api.models';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

export interface FilterOperator {
  key: string;
  label: string;
  value: string;
  supportedTypes?: ('text' | 'number' | 'date' | 'select')[];
}

export interface ActiveFilter {
  field: string;
  operator: string;
  value: string | string[];
  label?: string;
}

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Header con búsqueda rápida -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div class="flex-1">
            <label for="quick-search" class="block text-sm font-medium text-gray-700 mb-1">Búsqueda rápida</label>
            <input
              id="quick-search"
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              placeholder="Buscar en todos los campos..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div class="flex gap-2">
            <button
              *ngIf="searchTerm"
              (click)="clearQuickSearch()"
              class="px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Limpiar
            </button>
            <button
              (click)="toggleExpanded()"
              class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <span>{{ isExpanded ? 'Ocultar filtros' : 'Filtros avanzados' }}</span>
              <svg class="w-4 h-4 transform transition-transform" [class.rotate-180]="isExpanded" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Expanded Filters -->
      <div *ngIf="isExpanded" class="space-y-6">
        <!-- Add New Filter -->
        <div class="p-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Añadir filtro</h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Campo</label>
                <select
                  [(ngModel)]="newFilter.field"
                  (change)="onFieldChange()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Seleccionar campo</option>
                  <option *ngFor="let field of filterFields" [value]="field.key">{{ field.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Operador</label>
                <select
                  [(ngModel)]="newFilter.operator"
                  (change)="onOperatorChange()"
                  [disabled]="!newFilter.field"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                >
                  <option value="">Seleccionar operador</option>
                  <option *ngFor="let operator of getAvailableOperators(getFieldType(newFilter.field))" [value]="operator.key">
                    {{ operator.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <div [ngSwitch]="getInputType()">
                  <!-- Input para valores nulos -->
                  <div *ngSwitchCase="'none'" class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-500">
                    Sin valor requerido
                  </div>
                  <!-- Input para rango (between) -->
                  <div *ngSwitchCase="'range'" class="flex gap-2">
                    <input
                      type="text"
                      [(ngModel)]="rangeValues.from"
                      placeholder="Desde"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      [(ngModel)]="rangeValues.to"
                      placeholder="Hasta"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <!-- Input para lista (in) -->
                  <textarea
                    *ngSwitchCase="'list'"
                    [(ngModel)]="newFilter.value"
                    placeholder="Valores separados por comas"
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  ></textarea>
                  <!-- Input normal -->
                  <input
                    *ngSwitchDefault
                    [type]="getInputType()"
                    [(ngModel)]="newFilter.value"
                    [disabled]="!newFilter.operator"
                    placeholder="Ingrese valor"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>
              <div>
                <button
                  (click)="addFilter()"
                  [disabled]="!canAddFilter()"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Añadir filtro
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros activos -->
        <div *ngIf="activeFilters.length > 0" class="p-4 border-t border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">Filtros activos ({{ activeFilters.length }})</h4>
            <button
              (click)="clearAllFilters()"
              class="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Limpiar todos
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              *ngFor="let filter of activeFilters; let i = index"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
            >
              <span class="font-medium">{{ getFieldLabel(filter.field) }}</span>
              <span class="mx-1 text-blue-600">{{ getOperatorLabel(filter.operator) }}</span>
              <span *ngIf="filter.value">{{ formatFilterValue(filter.value) }}</span>
              <button
                (click)="removeFilter(i)"
                class="ml-2 text-blue-600 hover:text-blue-800 font-bold leading-none"
                title="Eliminar filtro"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Ordenamiento y selección de columnas -->
        <div class="p-4 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Ordenamiento -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Ordenamiento</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Campo</label>
                  <select
                    [(ngModel)]="sortField"
                    (ngModelChange)="onSortChange()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Sin ordenamiento</option>
                    <option *ngFor="let field of sortableFields" [value]="field.key">
                      {{ field.label }}
                    </option>
                  </select>
                </div>
                <div *ngIf="sortField">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
                  <div class="flex gap-2">
                    <button
                      (click)="setSortDirection('asc')"
                      [class]="sortDirection === 'asc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
                      class="flex-1 px-3 py-2 text-sm rounded-md border transition-colors"
                    >
                      ↑ Ascendente
                    </button>
                    <button
                      (click)="setSortDirection('desc')"
                      [class]="sortDirection === 'desc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
                      class="flex-1 px-3 py-2 text-sm rounded-md border transition-colors"
                    >
                      ↓ Descendente
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selección de columnas -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Columnas visibles</h4>
              <div class="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                <label
                  *ngFor="let field of selectableFields"
                  class="flex items-center space-x-2 text-sm hover:bg-gray-50 p-1 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    [checked]="selectedColumns.includes(field.key)"
                    (change)="toggleColumn(field.key)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="flex-1">{{ field.label }}</span>
                </label>
              </div>
              <div class="mt-2 flex gap-2">
                <button
                  (click)="selectAllColumns()"
                  class="text-xs text-blue-600 hover:text-blue-800"
                >
                  Seleccionar todas
                </button>
                <button
                  (click)="deselectAllColumns()"
                  class="text-xs text-gray-600 hover:text-gray-800"
                >
                  Deseleccionar todas
                </button>
              </div>
             </div>

             <!-- Inclusión de relaciones -->
             <div *ngIf="availableRelations.length > 0">
               <h4 class="text-sm font-medium text-gray-700 mb-3">Incluir relaciones</h4>
               <div class="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                 <label
                   *ngFor="let relation of availableRelations"
                   class="flex items-center space-x-2 text-sm hover:bg-gray-50 p-1 rounded cursor-pointer"
                 >
                   <input
                     type="checkbox"
                     [checked]="includeRelations.includes(relation.key)"
                     (change)="toggleRelation(relation.key)"
                     class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                   />
                   <span class="flex-1">{{ relation.label }}</span>
                 </label>
               </div>
               <div class="mt-2 flex gap-2">
                 <button
                   (click)="selectAllRelations()"
                   class="text-xs text-blue-600 hover:text-blue-800"
                 >
                   Seleccionar todas
                 </button>
                 <button
                   (click)="deselectAllRelations()"
                   class="text-xs text-gray-600 hover:text-gray-800"
                 >
                   Deseleccionar todas
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   `,
})
export class AdvancedFiltersComponent {
  @Input() filterFields: FilterField[] = [];
  @Input() sortableFields: FilterField[] = [];
  @Input() selectableFields: FilterField[] = [];
  @Input() availableRelations: { key: string; label: string }[] = [];
  @Output() filtersChange = new EventEmitter<EmployeeQueryParams>();

  isExpanded = false;
  searchTerm = '';
  activeFilters: ActiveFilter[] = [];
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedColumns: string[] = [];
  includeRelations: string[] = [];

  newFilter = {
    field: '',
    operator: '',
    value: '',
  };

  rangeValues = { from: '', to: '' };

  filterOperators: FilterOperator[] = [
    {
      key: 'eq',
      label: 'Igual a',
      value: '$eq',
      supportedTypes: ['text', 'number', 'date', 'select'],
    },
    {
      key: 'not',
      label: 'Diferente de',
      value: '$not',
      supportedTypes: ['text', 'number', 'date', 'select'],
    },
    { key: 'contains', label: 'Contiene (insensible)', value: '$ilike', supportedTypes: ['text'] },
    {
      key: 'contains_case',
      label: 'Contiene (sensible)',
      value: '$like',
      supportedTypes: ['text'],
    },
    { key: 'starts_with', label: 'Comienza con', value: '$starts_with', supportedTypes: ['text'] },
    { key: 'gt', label: 'Mayor que', value: '$gt', supportedTypes: ['number', 'date'] },
    { key: 'gte', label: 'Mayor o igual que', value: '$gte', supportedTypes: ['number', 'date'] },
    { key: 'lt', label: 'Menor que', value: '$lt', supportedTypes: ['number', 'date'] },
    { key: 'lte', label: 'Menor o igual que', value: '$lte', supportedTypes: ['number', 'date'] },
    { key: 'between', label: 'Entre', value: '$between', supportedTypes: ['number', 'date'] },
    { key: 'in', label: 'En lista', value: '$in', supportedTypes: ['text', 'number', 'select'] },
    {
      key: 'null',
      label: 'Es nulo',
      value: '$null',
      supportedTypes: ['text', 'number', 'date', 'select'],
    },
    {
      key: 'not_null',
      label: 'No es nulo',
      value: '$not_null',
      supportedTypes: ['text', 'number', 'date', 'select'],
    },
  ];

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onSearchChange(): void {
    this.emitFilters();
  }

  clearQuickSearch(): void {
    this.searchTerm = '';
    this.emitFilters();
  }

  onFieldChange(): void {
    this.newFilter.operator = '';
    this.newFilter.value = '';
    this.rangeValues = { from: '', to: '' };
  }

  onOperatorChange(): void {
    this.newFilter.value = '';
    this.rangeValues = { from: '', to: '' };
  }

  getFieldType(fieldKey: string): string {
    const field = this.filterFields.find((f) => f.key === fieldKey);
    return field?.type || 'text';
  }

  getAvailableOperators(fieldType: string): FilterOperator[] {
    return this.filterOperators.filter(
      (op) =>
        !op.supportedTypes ||
        op.supportedTypes.includes(fieldType as 'text' | 'number' | 'date' | 'select')
    );
  }

  getInputType(): string {
    const operator = this.filterOperators.find((op) => op.key === this.newFilter.operator);
    if (!operator) return 'text';

    if (operator.key === 'null' || operator.key === 'not_null') {
      return 'none';
    }
    if (operator.key === 'between') {
      return 'range';
    }
    if (operator.key === 'in') {
      return 'list';
    }

    const fieldType = this.getFieldType(this.newFilter.field || '');
    if (fieldType === 'date') return 'date';
    if (fieldType === 'number') return 'number';
    return 'text';
  }

  canAddFilter(): boolean {
    if (!this.newFilter.field || !this.newFilter.operator) {
      return false;
    }

    const operator = this.filterOperators.find((op) => op.key === this.newFilter.operator);
    if (!operator) return false;

    // Operadores que no requieren valor
    if (operator.key === 'null' || operator.key === 'not_null') {
      return true;
    }

    // Operador between requiere ambos valores del rango
    if (operator.key === 'between') {
      return !!(this.rangeValues.from && this.rangeValues.to);
    }

    // Otros operadores requieren valor
    return !!this.newFilter.value;
  }

  addFilter(): void {
    if (!this.canAddFilter()) return;

    const field = this.filterFields.find((f) => f.key === this.newFilter.field);
    const operator = this.filterOperators.find((o) => o.key === this.newFilter.operator);

    let filterValue: string | string[];
    let displayValue: string;

    if (operator?.key === 'null' || operator?.key === 'not_null') {
      filterValue = '';
      displayValue = '';
    } else if (operator?.key === 'between') {
      filterValue = `${this.rangeValues.from},${this.rangeValues.to}`;
      displayValue = `${this.rangeValues.from} y ${this.rangeValues.to}`;
    } else if (operator?.key === 'in') {
      filterValue = this.newFilter.value || '';
      displayValue = filterValue.toString();
    } else {
      filterValue = this.newFilter.value || '';
      displayValue = filterValue.toString();
    }

    this.activeFilters.push({
      field: this.newFilter.field,
      operator: this.newFilter.operator,
      value: filterValue,
      label: `${field?.label} ${operator?.label} ${displayValue}`.trim(),
    });

    this.newFilter = { field: '', operator: '', value: '' };
    this.rangeValues = { from: '', to: '' };
    this.emitFilters();
  }

  removeFilter(index: number): void {
    this.activeFilters.splice(index, 1);
    this.emitFilters();
  }

  clearAllFilters(): void {
    this.activeFilters = [];
    this.searchTerm = '';
    this.emitFilters();
  }

  getFieldLabel(fieldKey: string): string {
    const field = this.filterFields.find((f) => f.key === fieldKey);
    return field?.label || fieldKey;
  }

  getOperatorLabel(operatorKey: string): string {
    const operator = this.filterOperators.find((op) => op.key === operatorKey);
    return operator?.label || operatorKey;
  }

  formatFilterValue(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').join(' y ');
    }
    return value?.toString() || '';
  }

  setSortDirection(direction: 'asc' | 'desc'): void {
    this.sortDirection = direction;
    this.onSortChange();
  }

  selectAllColumns(): void {
    this.selectedColumns = this.selectableFields.map((field) => field.key);
    this.emitFilters();
  }

  deselectAllColumns(): void {
    this.selectedColumns = [];
    this.emitFilters();
  }

  toggleRelation(relationKey: string): void {
    const index = this.includeRelations.indexOf(relationKey);
    if (index > -1) {
      this.includeRelations.splice(index, 1);
    } else {
      this.includeRelations.push(relationKey);
    }
    this.emitFilters();
  }

  selectAllRelations(): void {
    this.includeRelations = this.availableRelations.map((relation) => relation.key);
    this.emitFilters();
  }

  deselectAllRelations(): void {
    this.includeRelations = [];
    this.emitFilters();
  }

  onSortChange(): void {
    this.emitFilters();
  }

  toggleColumn(columnKey: string): void {
    const index = this.selectedColumns.indexOf(columnKey);
    if (index > -1) {
      this.selectedColumns.splice(index, 1);
    } else {
      this.selectedColumns.push(columnKey);
    }
    this.emitFilters();
  }

  getFilterLabel(filter: ActiveFilter): string {
    return filter.label || `${filter.field} ${filter.operator} ${filter.value}`;
  }

  private emitFilters(): void {
    const params: EmployeeQueryParams = {};

    // Búsqueda
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    // Filtros activos
    this.activeFilters.forEach((filter) => {
      const operator = this.filterOperators.find((op) => op.value === filter.operator);
      const filterKey = `filter[${filter.field}]${operator?.value || ''}`;

      if (['null', 'not_null'].includes(filter.operator)) {
        params[filterKey] = true;
      } else if (filter.operator === 'in' && typeof filter.value === 'string') {
        // Convertir string separado por comas a array
        params[filterKey] = filter.value.split(',').map((v) => v.trim());
      } else {
        params[filterKey] = filter.value;
      }
    });

    // Ordenamiento
    if (this.sortField) {
      params.sort = this.sortDirection === 'desc' ? `-${this.sortField}` : this.sortField;
    }

    // Selección de columnas
    if (this.selectedColumns.length > 0) {
      params.select = this.selectedColumns.join(',');
    }

    // Inclusión de relaciones
    if (this.includeRelations.length > 0) {
      params.include = this.includeRelations.join(',');
    }

    this.filtersChange.emit(params);
  }
}
