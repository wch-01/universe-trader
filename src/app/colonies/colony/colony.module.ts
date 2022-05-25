import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColonyPageRoutingModule } from './colony-routing.module';

import { ColonyPage } from './colony.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ColonyPageRoutingModule
    ],
    exports: [
        ColonyPage
    ],
    declarations: [ColonyPage]
})
export class ColonyPageModule {}
