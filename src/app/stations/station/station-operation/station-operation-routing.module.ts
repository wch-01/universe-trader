import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationOperationPage } from './station-operation.page';

const routes: Routes = [
  {
    path: '',
    component: StationOperationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationOperationPageRoutingModule {}
