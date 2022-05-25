import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListItemsPage } from './list-items.page';

const routes: Routes = [
  {
    path: '',
    component: ListItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListItemsPageRoutingModule {}
