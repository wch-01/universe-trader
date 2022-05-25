import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationPageRoutingModule } from './station-routing.module';

import { StationPage } from './station.page';
import {TradePageModule} from "../../trade/trade.module";
import {ListItemsPageModule} from "../list-items/list-items.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StationPageRoutingModule,
        TradePageModule,
        ListItemsPageModule
    ],
  declarations: [StationPage]
})
export class StationPageModule {}
