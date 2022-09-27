import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationOperationsPageRoutingModule } from './station-operations-routing.module';

import { StationOperationsPage } from './station-operations.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StationOperationsPageRoutingModule
    ],
    exports: [
        StationOperationsPage
    ],
    declarations: [StationOperationsPage]
})
export class StationOperationsPageModule {}
