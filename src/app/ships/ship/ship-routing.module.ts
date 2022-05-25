import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShipPage } from './ship.page';

const routes: Routes = [
  {
    path: '',
    component: ShipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipPageRoutingModule {}
