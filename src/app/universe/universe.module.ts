import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UniversePageRoutingModule } from './universe-routing.module';

import { UniversePage } from './universe.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UniversePageRoutingModule
  ],
  declarations: [UniversePage]
})
export class UniversePageModule {}
