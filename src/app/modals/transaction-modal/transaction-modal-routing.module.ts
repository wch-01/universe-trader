import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionModalPage } from './transaction-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionModalPageRoutingModule {}
