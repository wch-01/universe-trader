import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationOperationPageRoutingModule } from './station-operation-routing.module';

import { StationOperationPage } from './station-operation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationOperationPageRoutingModule
  ],
  declarations: [StationOperationPage]
})
export class StationOperationPageModule {}
