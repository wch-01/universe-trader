import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BusinessesPageRoutingModule } from './businesses-routing.module';

import { BusinessesPage } from './businesses.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        BusinessesPageRoutingModule
    ],
    exports: [
        BusinessesPage
    ],
    declarations: [BusinessesPage]
})
export class BusinessesPageModule {}
