import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationShipPage } from './station-ship.page';

const routes: Routes = [
  {
    path: '',
    component: StationShipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationShipPageRoutingModule {}
