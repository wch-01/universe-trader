import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolarBodyModalPageRoutingModule } from './solar-body-modal-routing.module';

import { SolarBodyModalPage } from './solar-body-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolarBodyModalPageRoutingModule
  ],
  declarations: [SolarBodyModalPage]
})
export class SolarBodyModalPageModule {}
