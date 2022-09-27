import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WarehousePageRoutingModule } from './warehouse-routing.module';

import { WarehousePage } from './warehouse.page';
import {InventoryPageModule} from '../../inventory/inventory.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        WarehousePageRoutingModule,
        InventoryPageModule
    ],
    exports: [
        WarehousePage
    ],
    declarations: [WarehousePage]
})
export class WarehousePageModule {}
