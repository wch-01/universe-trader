import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipPageRoutingModule } from './ship-routing.module';

import { ShipPage } from './ship.page';
import {TradePageModule} from "../../trade/trade.module";
import {WarehousePageModule} from "../../warehouses/warehouse/warehouse.module";
import {ShipWarehousePageModule} from "../ship-warehouse/ship-warehouse.module";
import {StationsPageModule} from "../../stations/stations.module";
import {ColonyPageModule} from "../../colonies/colony/colony.module";
import {LogsPageModule} from "../../logs/logs.module";
import {InventoryPageModule} from '../../inventory/inventory.module';
import {ModulesPageModule} from '../../modules/modules.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ShipPageRoutingModule,
        TradePageModule,
        WarehousePageModule,
        ShipWarehousePageModule,
        StationsPageModule,
        ColonyPageModule,
        LogsPageModule,
        InventoryPageModule,
        ModulesPageModule
    ],
    exports: [
        ShipPage
    ],
    declarations: [ShipPage]
})
export class ShipPageModule {}
