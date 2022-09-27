import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationPageRoutingModule } from './station-routing.module';

import { StationPage } from './station.page';
import {TradePageModule} from '../../trade/trade.module';
import {StationAdminPageModule} from './station-admin/station-admin.module';
import {StationSellPageModule} from './station-sell/station-sell.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationPageRoutingModule,
    TradePageModule,
    StationAdminPageModule,
    StationSellPageModule
  ],
  declarations: [StationPage]
})
export class StationPageModule {}
