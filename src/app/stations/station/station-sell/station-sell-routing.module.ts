import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationSellPage } from './station-sell.page';

const routes: Routes = [
  {
    path: '',
    component: StationSellPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationSellPageRoutingModule {}
