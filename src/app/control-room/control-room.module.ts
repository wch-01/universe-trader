import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ControlRoomPageRoutingModule } from './control-room-routing.module';

import { ControlRoomPage } from './control-room.page';
import {WarehousePageModule} from "../warehouses/warehouse/warehouse.module";
import {TradePageModule} from "../trade/trade.module";
import {ColonyPageModule} from "../colonies/colony/colony.module";
import {BusinessesPageModule} from "../businesses/businesses.module";
import {StationsPageModule} from "../stations/stations.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ControlRoomPageRoutingModule,
        WarehousePageModule,
        TradePageModule,
        ColonyPageModule,
        BusinessesPageModule,
        StationsPageModule
    ],
  declarations: [ControlRoomPage]
})
export class ControlRoomPageModule {}
