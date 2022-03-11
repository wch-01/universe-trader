import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
// import { Auth } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  //region Variables
  userLogInStatus= null;
  user= null;
  userLoggedIn: Promise<boolean> | undefined;
  //endregion

  constructor(
    public angularFireAuth: AngularFireAuth,
    public router: Router
  ) {
    this.angularFireAuth.authState.subscribe(userResponse => {
      if (userResponse) {
        console.log('store user');
        this.userLoggedIn= Promise.resolve(true);
        localStorage.setItem('user', JSON.stringify(userResponse));
      } else {
        console.log('store user null');
        this.userLoggedIn= Promise.resolve(false);
        localStorage.setItem('user', null);
      }
    });
  }

  //todo update this to a better name, but this method worked best for the call order
  checkUser(): any{
    return this.angularFireAuth.authState.pipe(tap(userResponse => {
      if (userResponse) {
        console.log('store user');
        this.userLoggedIn= Promise.resolve(true);
        localStorage.setItem('user', JSON.stringify(userResponse));
      } else {
        console.log('store user null');
        this.userLoggedIn= Promise.resolve(false);
        localStorage.setItem('user', null);
      }
    })
    );
  }

  async login(email: string, password: string) {
    return await this.angularFireAuth.signInWithEmailAndPassword(email, password);
  }

  async register(email: string, password: string) {
    return await this.angularFireAuth.createUserWithEmailAndPassword(email, password);
  }

  async sendEmailVerification() {
    return await (await this.angularFireAuth.currentUser).sendEmailVerification();
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.angularFireAuth.sendPasswordResetEmail(passwordResetEmail);
  }

  async logout() {
    return await this.angularFireAuth.signOut();
  }

  isUserLoggedIn() {
    this.user= JSON.parse(localStorage.getItem('user'));
    if(this.user !== null){
      return this.user;
    }
    //return JSON.parse(localStorage.getItem('user'));//Original
  }

  async  loginWithGoogle() {
    return await this.angularFireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
}
