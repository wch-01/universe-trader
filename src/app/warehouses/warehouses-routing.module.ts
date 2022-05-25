import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WarehousesPage } from './warehouses.page';

const routes: Routes = [
  {
    path: '',
    component: WarehousesPage
  },
  {
    path: 'warehouse',
    loadChildren: () => import('./warehouse/warehouse.module').then( m => m.WarehousePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarehousesPageRoutingModule {}
