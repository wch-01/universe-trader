import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListedItemsPageRoutingModule } from './listed-items-routing.module';

import { ListedItemsPage } from './listed-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListedItemsPageRoutingModule
  ],
  declarations: [ListedItemsPage]
})
export class ListedItemsPageModule {}
