import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationOperationsPage } from './station-operations.page';

const routes: Routes = [
  {
    path: '',
    component: StationOperationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationOperationsPageRoutingModule {}
