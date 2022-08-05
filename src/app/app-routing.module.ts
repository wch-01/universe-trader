import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
//import { redirectUnauthorizedTo,redirectLoggedInTo,canActivate } from '@angular/fire/auth-guard';
//https://github.com/angular/angularfire/blob/master/docs/auth/router-guards.md
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/compat/auth-guard';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login-register']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);
const redirectLoggedInToServers = () => redirectLoggedInTo(['servers']);
//const adminOnly = () => hasCustomClaim('superAdmin');

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
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectLoggedInToServers }
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
    //canActivate: [AngularFireAuthGuard], data: { authGuardPipe: adminOnly }
  },
  {
    path: 'ship',
    loadChildren: () => import('./ships/ship/ship.module').then( m => m.ShipPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'ships',
    loadChildren: () => import('./ships/ships.module').then( m => m.ShipsPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'chat-rooms',
    loadChildren: () => import('./chat-rooms/chat-rooms.module').then( m => m.ChatRoomsPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'modal',
    loadChildren: () => import('./modal/modal.module').then( m => m.ModalPageModule)
  },
  {
    path: 'shipyard',
    loadChildren: () => import('./shipyard/shipyard.module').then( m => m.ShipyardPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  /*{//todo this needs to be last all the time. Freaking dont forget this!!!!
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },*/
  {
    path: 'trade',
    loadChildren: () => import('./trade/trade.module').then( m => m.TradePageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'warehouses',
    loadChildren: () => import('./warehouses/warehouses.module').then( m => m.WarehousesPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'character',
    loadChildren: () => import('./character/character.module').then( m => m.CharacterPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'control-room',
    loadChildren: () => import('./control-room/control-room.module').then( m => m.ControlRoomPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'colonies',
    loadChildren: () => import('./colonies/colonies.module').then( m => m.ColoniesPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'businesses',
    loadChildren: () => import('./businesses/businesses.module').then( m => m.BusinessesPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'stations',
    loadChildren: () => import('./stations/stations.module').then( m => m.StationsPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'servers',
    loadChildren: () => import('./servers/servers.module').then( m => m.ServersPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'tos',
    loadChildren: () => import('./tos/tos.module').then( m => m.TosPageModule)
  },
  {
    path: 'universe',
    loadChildren: () => import('./universe/universe.module').then( m => m.UniversePageModule)
  },
  {
    path: 'solar-system-modal',
    loadChildren: () => import('./modals/solar-system-modal/solar-system-modal.module').then( m => m.SolarSystemModalPageModule)
  },
  {
    path: 'solar-body-modal',
    loadChildren: () => import('./modals/solar-body-modal/solar-body-modal.module').then( m => m.SolarBodyModalPageModule)
  },
  {
    path: 'colony-modal',
    loadChildren: () => import('./modals/colony-modal/colony-modal.module').then( m => m.ColonyModalPageModule)
  },
  {
    path: 'after-login',
    loadChildren: () => import('./after-login/after-login.module').then( m => m.AfterLoginPageModule)
  },
  {
    path: 'price-list',
    loadChildren: () => import('./price-list/price-list.module').then( m => m.PriceListPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'logs',
    loadChildren: () => import('./logs/logs.module').then( m => m.LogsPageModule)
  },
  {
    path: 'tutorial-modal',
    loadChildren: () => import('./modals/tutorial-modal/tutorial-modal.module').then( m => m.TutorialModalPageModule)
  },




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class UTAppRoutingModule {}
