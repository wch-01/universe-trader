import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShipWarehousePage } from './ship-warehouse.page';

const routes: Routes = [
  {
    path: '',
    component: ShipWarehousePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipWarehousePageRoutingModule {}
