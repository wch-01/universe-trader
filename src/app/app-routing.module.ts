import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
//import { redirectUnauthorizedTo,redirectLoggedInTo,canActivate } from '@angular/fire/auth-guard';
//https://github.com/angular/angularfire/blob/master/docs/auth/router-guards.md
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/compat/auth-guard';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login-register']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);
const adminOnly = () => hasCustomClaim('superAdmin');

//const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login-register']);
//const redirectLoggedInToHome = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login-register',
    loadChildren: () => import('./login-register/login-register.module').then( m => m.LoginRegisterPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectLoggedInToDashboard }
    //...canActivate(redirectLoggedInToHome),
  },
  {
    path: 'logout',
    redirectTo: 'login-register',
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
    //...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: adminOnly }
  },
  {//todo this needs to be last all the time
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
