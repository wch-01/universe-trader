import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AfterLoginPageRoutingModule } from './after-login-routing.module';

import { AfterLoginPage } from './after-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AfterLoginPageRoutingModule
  ],
  declarations: [AfterLoginPage]
})
export class AfterLoginPageModule {}
