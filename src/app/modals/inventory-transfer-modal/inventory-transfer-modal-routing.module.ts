import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryTransferModalPage } from './inventory-transfer-modal.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryTransferModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryTransferModalPageRoutingModule {}
