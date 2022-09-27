import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationShipPageRoutingModule } from './station-ship-routing.module';

import { StationShipPage } from './station-ship.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationShipPageRoutingModule
  ],
  declarations: [StationShipPage]
})
export class StationShipPageModule {}
