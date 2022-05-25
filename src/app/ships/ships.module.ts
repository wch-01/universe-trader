import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipsPageRoutingModule } from './ships-routing.module';

import { ShipsPage } from './ships.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShipsPageRoutingModule
  ],
  declarations: [ShipsPage]
})
export class ShipsPageModule {}
