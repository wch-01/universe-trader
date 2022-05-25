import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BusinessCreationPageRoutingModule } from './business-creation-routing.module';

import { BusinessCreationPage } from './business-creation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BusinessCreationPageRoutingModule
  ],
  declarations: [BusinessCreationPage]
})
export class BusinessCreationPageModule {}
