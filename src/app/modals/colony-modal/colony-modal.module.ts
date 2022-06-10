import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColonyModalPageRoutingModule } from './colony-modal-routing.module';

import { ColonyModalPage } from './colony-modal.page';
import {TradePageModule} from "../../trade/trade.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ColonyModalPageRoutingModule,
        TradePageModule
    ],
  declarations: [ColonyModalPage]
})
export class ColonyModalPageModule {}
