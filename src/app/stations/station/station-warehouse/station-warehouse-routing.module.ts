import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationWarehousePage } from './station-warehouse.page';

const routes: Routes = [
  {
    path: '',
    component: StationWarehousePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationWarehousePageRoutingModule {}
