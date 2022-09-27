import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationsPage } from './stations.page';

const routes: Routes = [
  {
    path: '',
    component: StationsPage
  },
  {
    path: 'station',
    loadChildren: () => import('./station/station.module').then( m => m.StationPageModule)
  },
  {
    path: 'station-trade',
    loadChildren: () => import('./station/station-trade/station-trade.module').then(m => m.StationTradePageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationsPageRoutingModule {}
