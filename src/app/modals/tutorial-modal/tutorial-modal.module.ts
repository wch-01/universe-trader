import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TutorialModalPageRoutingModule } from './tutorial-modal-routing.module';

import { TutorialModalPage } from './tutorial-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TutorialModalPageRoutingModule
  ],
  declarations: [TutorialModalPage]
})
export class TutorialModalPageModule {}
