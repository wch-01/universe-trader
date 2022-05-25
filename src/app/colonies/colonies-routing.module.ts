import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColoniesPage } from './colonies.page';

const routes: Routes = [
  {
    path: '',
    component: ColoniesPage
  },
  {
    path: 'colony',
    loadChildren: () => import('./colony/colony.module').then( m => m.ColonyPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColoniesPageRoutingModule {}
