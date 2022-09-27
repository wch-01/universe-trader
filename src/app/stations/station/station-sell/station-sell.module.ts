import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationSellPageRoutingModule } from './station-sell-routing.module';

import { StationSellPage } from './station-sell.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StationSellPageRoutingModule
    ],
    exports: [
        StationSellPage
    ],
    declarations: [StationSellPage]
})
export class StationSellPageModule {}
