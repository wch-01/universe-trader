import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalPageRoutingModule } from './modal-routing.module';

import { ModalPage } from './modal.page';
import {ShipPageModule} from "../ships/ship/ship.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ModalPageRoutingModule,
        ShipPageModule
    ],
  declarations: [ModalPage]
})
export class ModalPageModule {}
