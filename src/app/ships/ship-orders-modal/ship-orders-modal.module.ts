import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipOrdersModalPageRoutingModule } from './ship-orders-modal-routing.module';

import { ShipOrdersModalPage } from './ship-orders-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShipOrdersModalPageRoutingModule
  ],
  declarations: [ShipOrdersModalPage]
})
export class ShipOrdersModalPageModule {}
