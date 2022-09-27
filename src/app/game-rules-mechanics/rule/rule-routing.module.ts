import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RulePage } from './rule.page';

const routes: Routes = [
  {
    path: '',
    component: RulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RulePageRoutingModule {}
