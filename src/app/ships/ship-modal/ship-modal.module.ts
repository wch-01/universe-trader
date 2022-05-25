import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipModalPageRoutingModule } from './ship-modal-routing.module';

import { ShipModalPage } from './ship-modal.page';
import {ShipPageModule} from "../ship/ship.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ShipModalPageRoutingModule,
        ShipPageModule
    ],
  declarations: [ShipModalPage]
})
export class ShipModalPageModule {}
