import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationWarehousePageRoutingModule } from './station-warehouse-routing.module';

import { StationWarehousePage } from './station-warehouse.page';
import {InventoryTransferPageModule} from '../../../inventory-transfer/inventory-transfer.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StationWarehousePageRoutingModule,
        InventoryTransferPageModule
    ],
    exports: [
        StationWarehousePage
    ],
    declarations: [StationWarehousePage]
})
export class StationWarehousePageModule {}
