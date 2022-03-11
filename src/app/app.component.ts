import { Component } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AuthenticationService} from "./services/authentication/authentication.service";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  user = null;
  public appPages = [
    /*{ title: 'Login', url: '/login', icon: '', role: 'admin' },*/
    { title: 'Dashboard', url: '/dashboard', icon: '', role: 'any', auth: true },
    { title: 'Ships', url: '/ships', icon: '', role: 'any', auth: true },
    /*{ title: 'Outbox', url: '/folder/Outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/Favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/Spam', icon: 'warning' },*/
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(
    private authService: AuthenticationService,
    public fireAuth: AngularFireAuth
  ) {
    this.user= this.authService.user;
  }

  async logout() {
    this.authService.logout();
    /*
    switch (this.authService.loginType){
      case 'email':
        return this.authService.logout();
        break;
      case 'google':
        this.fireAuth.signOut();
        break;
    }
    */
  }
}
