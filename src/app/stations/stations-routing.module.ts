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
    loadChildren: () => import('./station-trade/station-trade.module').then( m => m.StationTradePageModule)
  },
  {
    path: 'list-items',
    loadChildren: () => import('./list-items/list-items.module').then( m => m.ListItemsPageModule)
  },
  {
    path: 'listed-items',
    loadChildren: () => import('./listed-items/listed-items.module').then( m => m.ListedItemsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationsPageRoutingModule {}
