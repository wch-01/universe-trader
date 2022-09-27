import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameRulesMechanicsPageRoutingModule } from './game-rules-mechanics-routing.module';

import { GameRulesMechanicsPage } from './game-rules-mechanics.page';
import {RulesPageModule} from './rules/rules.module';
import {ItemsPageModule} from './items/items.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameRulesMechanicsPageRoutingModule,
    RulesPageModule,
    ItemsPageModule
  ],
  declarations: [GameRulesMechanicsPage]
})
export class GameRulesMechanicsPageModule {}
