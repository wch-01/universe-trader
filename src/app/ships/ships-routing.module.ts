import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShipsPage } from './ships.page';

const routes: Routes = [
  {
    path: '',
    component: ShipsPage
  },
  {
    path: 'ship',
    loadChildren: () => import('./ship/ship.module').then( m => m.ShipPageModule)
  },
  {
    path: 'ship-modal',
    loadChildren: () => import('./ship-modal/ship-modal.module').then( m => m.ShipModalPageModule)
  },
  {
    path: 'ship-warehouse',
    loadChildren: () => import('./ship-warehouse/ship-warehouse.module').then( m => m.ShipWarehousePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipsPageRoutingModule {}
