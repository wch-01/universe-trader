import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationStoragePage } from './station-storage.page';

const routes: Routes = [
  {
    path: '',
    component: StationStoragePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationStoragePageRoutingModule {}
