import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication/authentication.service';

import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  //region Variables
  user= null;
  //endregion

  //region Constructor
  constructor(
    private authService: AuthenticationService,
    public angularFireAuth: AngularFireAuth,
  ) {
    this.user= this.authService.user;
  }
  //endregion

  ngOnInit() {
    this.angularFireAuth.authState.subscribe(userResponse => {
      if (userResponse) {
        console.log('Auth state is good');
        //localStorage.setItem('user', JSON.stringify(userResponse));
      } else {
        console.log('Auth state is bad');
        //localStorage.setItem('user', null);
      }
    });
  }
}
