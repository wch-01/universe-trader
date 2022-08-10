import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipOrdersPageRoutingModule } from './ship-orders-routing.module';

import { ShipOrdersPage } from './ship-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShipOrdersPageRoutingModule
  ],
  declarations: [ShipOrdersPage]
})
export class ShipOrdersPageModule {}
