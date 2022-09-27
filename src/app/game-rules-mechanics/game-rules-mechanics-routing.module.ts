import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameRulesMechanicsPage } from './game-rules-mechanics.page';

const routes: Routes = [
  {
    path: '',
    component: GameRulesMechanicsPage
  },
  {
    path: 'rule',
    loadChildren: () => import('./rule/rule.module').then( m => m.RulePageModule)
  },
  {
    path: 'rules',
    loadChildren: () => import('./rules/rules.module').then( m => m.RulesPageModule)
  },
  {
    path: 'items',
    loadChildren: () => import('./items/items.module').then( m => m.ItemsPageModule)
  },
  {
    path: 'mechanics',
    loadChildren: () => import('./mechanics/mechanics.module').then( m => m.MechanicsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRulesMechanicsPageRoutingModule {}
