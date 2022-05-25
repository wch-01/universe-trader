import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipPageRoutingModule } from './ship-routing.module';

import { ShipPage } from './ship.page';
import {TradePageModule} from "../../trade/trade.module";
import {WarehousePageModule} from "../../warehouses/warehouse/warehouse.module";
import {ShipWarehousePageModule} from "../ship-warehouse/ship-warehouse.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShipPageRoutingModule,
    TradePageModule,
    WarehousePageModule,
    ShipWarehousePageModule
  ],
    exports: [
        ShipPage
    ],
    declarations: [ShipPage]
})
export class ShipPageModule {}
