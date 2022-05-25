import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShipModalPage } from './ship-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ShipModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipModalPageRoutingModule {}
