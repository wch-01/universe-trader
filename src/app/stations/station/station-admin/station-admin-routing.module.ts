import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationAdminPage } from './station-admin.page';

const routes: Routes = [
  {
    path: '',
    component: StationAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationAdminPageRoutingModule {}
