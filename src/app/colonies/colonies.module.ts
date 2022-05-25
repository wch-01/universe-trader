import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColoniesPageRoutingModule } from './colonies-routing.module';

import { ColoniesPage } from './colonies.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ColoniesPageRoutingModule
  ],
  declarations: [ColoniesPage]
})
export class ColoniesPageModule {}
