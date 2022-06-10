import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolarSystemModalPageRoutingModule } from './solar-system-modal-routing.module';

import { SolarSystemModalPage } from './solar-system-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolarSystemModalPageRoutingModule
  ],
  declarations: [SolarSystemModalPage]
})
export class SolarSystemModalPageModule {}
