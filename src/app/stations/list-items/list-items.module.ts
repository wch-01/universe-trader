import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListItemsPageRoutingModule } from './list-items-routing.module';

import { ListItemsPage } from './list-items.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ListItemsPageRoutingModule
    ],
    exports: [
        ListItemsPage
    ],
    declarations: [ListItemsPage]
})
export class ListItemsPageModule {}
