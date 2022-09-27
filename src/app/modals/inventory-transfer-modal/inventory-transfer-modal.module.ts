import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryTransferModalPageRoutingModule } from './inventory-transfer-modal-routing.module';

import { InventoryTransferModalPage } from './inventory-transfer-modal.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        InventoryTransferModalPageRoutingModule
    ],
    exports: [
        InventoryTransferModalPage
    ],
    declarations: [InventoryTransferModalPage]
})
export class InventoryTransferModalPageModule {}
