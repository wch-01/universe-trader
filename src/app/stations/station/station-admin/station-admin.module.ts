import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationAdminPageRoutingModule } from './station-admin-routing.module';

import { StationAdminPage } from './station-admin.page';
import {StationWarehousePageModule} from '../station-warehouse/station-warehouse.module';
import {InventoryTransferPageModule} from '../../../inventory-transfer/inventory-transfer.module';
import {ModulesPageModule} from '../../../modules/modules.module';
import {StationOperationsPageModule} from '../station-operations/station-operations.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StationAdminPageRoutingModule,
        StationWarehousePageModule,
        InventoryTransferPageModule,
        ModulesPageModule,
        StationOperationsPageModule
    ],
    exports: [
        StationAdminPage
    ],
    declarations: [StationAdminPage]
})
export class StationAdminPageModule {}
