import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolarSystemModalPage } from './solar-system-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SolarSystemModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolarSystemModalPageRoutingModule {}
