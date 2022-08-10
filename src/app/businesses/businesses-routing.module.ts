import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusinessesPage } from './businesses.page';

const routes: Routes = [
  {
    path: '',
    component: BusinessesPage
  },
  {
    path: 'business-creation',
    loadChildren: () => import('./business-creation/business-creation.module').then( m => m.BusinessCreationPageModule)
  },
  {
    path: 'business',
    loadChildren: () => import('./business/business.module').then( m => m.BusinessPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessesPageRoutingModule {}
