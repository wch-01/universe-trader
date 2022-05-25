import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipyardPageRoutingModule } from './shipyard-routing.module';

import { ShipyardPage } from './shipyard.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ShipyardPageRoutingModule
    ],
    exports: [
        ShipyardPage
    ],
    declarations: [ShipyardPage]
})
export class ShipyardPageModule {}
