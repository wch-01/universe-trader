import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationStoragePageRoutingModule } from './station-storage-routing.module';

import { StationStoragePage } from './station-storage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationStoragePageRoutingModule
  ],
  declarations: [StationStoragePage]
})
export class StationStoragePageModule {}
