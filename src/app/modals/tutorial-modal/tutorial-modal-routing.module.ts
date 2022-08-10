import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TutorialModalPage } from './tutorial-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TutorialModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TutorialModalPageRoutingModule {}
