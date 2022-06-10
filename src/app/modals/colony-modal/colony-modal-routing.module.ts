import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColonyModalPage } from './colony-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ColonyModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColonyModalPageRoutingModule {}
