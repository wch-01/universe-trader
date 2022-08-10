import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WalletPageRoutingModule } from './wallet-routing.module';

import { WalletPage } from './wallet.page';
import {LogsPageModule} from "../logs/logs.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        WalletPageRoutingModule,
        LogsPageModule
    ],
  declarations: [WalletPage]
})
export class WalletPageModule {}
