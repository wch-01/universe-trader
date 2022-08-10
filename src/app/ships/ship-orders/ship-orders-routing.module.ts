import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShipOrdersPage } from './ship-orders.page';

const routes: Routes = [
  {
    path: '',
    component: ShipOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipOrdersPageRoutingModule {}
