import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipWarehousePageRoutingModule } from './ship-warehouse-routing.module';

import { ShipWarehousePage } from './ship-warehouse.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ShipWarehousePageRoutingModule
    ],
    exports: [
        ShipWarehousePage
    ],
    declarations: [ShipWarehousePage]
})
export class ShipWarehousePageModule {}
