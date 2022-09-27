import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationPage } from './station.page';

const routes: Routes = [
  {
    path: '',
    component: StationPage
  },
  {
    path: 'station-admin',
    loadChildren: () => import('./station-admin/station-admin.module').then( m => m.StationAdminPageModule)
  },
  {
    path: 'station-sell',
    loadChildren: () => import('./station-sell/station-sell.module').then( m => m.StationSellPageModule)
  },
  {
    path: 'station-storage',
    loadChildren: () => import('./station-storage/station-storage.module').then( m => m.StationStoragePageModule)
  },
  {
    path: 'station-warehouse',
    loadChildren: () => import('./station-warehouse/station-warehouse.module').then( m => m.StationWarehousePageModule)
  },
  {
    path: 'station-ship',
    loadChildren: () => import('./station-ship/station-ship.module').then( m => m.StationShipPageModule)
  },
  {
    path: 'station-operations',
    loadChildren: () => import('./station-operations/station-operations.module').then( m => m.StationOperationsPageModule)
  },
  {
    path: 'station-operation',
    loadChildren: () => import('./station-operation/station-operation.module').then( m => m.StationOperationPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationPageRoutingModule {}
