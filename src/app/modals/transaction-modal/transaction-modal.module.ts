import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionModalPageRoutingModule } from './transaction-modal-routing.module';

import { TransactionModalPage } from './transaction-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionModalPageRoutingModule
  ],
  declarations: [TransactionModalPage]
})
export class TransactionModalPageModule {}
