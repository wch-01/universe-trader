import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MechanicsPageRoutingModule } from './mechanics-routing.module';

import { MechanicsPage } from './mechanics.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MechanicsPageRoutingModule
  ],
  declarations: [MechanicsPage]
})
export class MechanicsPageModule {}
