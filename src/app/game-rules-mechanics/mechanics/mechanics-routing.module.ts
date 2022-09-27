import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MechanicsPage } from './mechanics.page';

const routes: Routes = [
  {
    path: '',
    component: MechanicsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MechanicsPageRoutingModule {}
