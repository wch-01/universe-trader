import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AfterLoginPage } from './after-login.page';

const routes: Routes = [
  {
    path: '',
    component: AfterLoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfterLoginPageRoutingModule {}
