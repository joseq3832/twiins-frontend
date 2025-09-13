import type { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { EmployeeList } from './employee-list/employee-list';
import { AuthGuard } from './guards/auth.guard';
import { Login } from './login/login';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'employees', component: EmployeeList, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' },
];
