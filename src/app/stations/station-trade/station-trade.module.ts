import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationTradePageRoutingModule } from './station-trade-routing.module';

import { StationTradePage } from './station-trade.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationTradePageRoutingModule
  ],
  declarations: [StationTradePage]
})
export class StationTradePageModule {}
