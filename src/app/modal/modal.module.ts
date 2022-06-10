import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalPageRoutingModule } from './modal-routing.module';

import { ModalPage } from './modal.page';
import {ShipPageModule} from "../ships/ship/ship.module";
import {ColonyPageModule} from "../colonies/colony/colony.module";
import {ShipWarehousePageModule} from "../ships/ship-warehouse/ship-warehouse.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ModalPageRoutingModule,
        ShipPageModule,
        ColonyPageModule,
        ShipWarehousePageModule
    ],
  declarations: [ModalPage]
})
export class ModalPageModule {}
