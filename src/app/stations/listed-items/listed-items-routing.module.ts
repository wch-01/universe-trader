import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListedItemsPage } from './listed-items.page';

const routes: Routes = [
  {
    path: '',
    component: ListedItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListedItemsPageRoutingModule {}
