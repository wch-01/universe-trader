import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShipOrdersModalPage } from './ship-orders-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ShipOrdersModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipOrdersModalPageRoutingModule {}
