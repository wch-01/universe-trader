import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ControlRoomPage } from './control-room.page';

const routes: Routes = [
  {
    path: '',
    component: ControlRoomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControlRoomPageRoutingModule {}
