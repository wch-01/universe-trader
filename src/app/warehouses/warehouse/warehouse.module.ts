import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WarehousePageRoutingModule } from './warehouse-routing.module';

import { WarehousePage } from './warehouse.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        WarehousePageRoutingModule
    ],
    exports: [
        WarehousePage
    ],
    declarations: [WarehousePage]
})
export class WarehousePageModule {}
