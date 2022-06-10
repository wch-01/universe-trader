import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
// import { Auth } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {first, take, tap} from 'rxjs/operators';
import {Observable, Observer} from 'rxjs';
import User = firebase.User;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  //region Variables
  userAuthSub;
  userLogInStatus= null;
  user= null;
  userOBS= null;
  userLoggedInP: Promise<boolean> | undefined;
  userLoggedIn= false;
  //userOBS= new Observable(this.checkUserOBS);
  //endregion

  //region Constructor
  constructor(
    public angularFireAuth: AngularFireAuth,
    public router: Router
  ) {
    //this.userLoggedIn= Promise.resolve(false);
    this.userAuthSub= this.angularFireAuth.authState.subscribe((userResponse: any) => {
      console.log('Auth Service: Check for Auth State');
      console.log(userResponse);
      if (userResponse) {
        console.log('AuthState Found, Store User');
        this.userLoggedIn= true;
        this.userLoggedInP= Promise.resolve(true);
        console.log(this.userLoggedIn);
        console.log(this.userLoggedInP);
        this.user= userResponse;
        localStorage.setItem('user', JSON.stringify(userResponse));
      }
      else {
        console.log('AuthState Not Found, un-store User');
        this.user= undefined;
        if(this.userLoggedIn === true){
          this.userLoggedIn= false;
          this.userLoggedInP= Promise.resolve(false);
        }
        console.log(this.userLoggedIn);
        localStorage.setItem('user', null);
      }
    });

    /*
    this.userOBS= this.angularFireAuth.authState.pipe(tap(userResponse => {
      if (userResponse) {
        console.log('Auth Service: Constructor store user');
        this.user= userResponse;
        //this.userLoggedIn= Promise.resolve(true);
        localStorage.setItem('user', JSON.stringify(userResponse));
      }
      else {
        console.log('Auth Service: Constructor store user null');
        this.user= undefined;
        //this.userLoggedIn= Promise.resolve(false);
        localStorage.setItem('user', null);
      }
    })) as Observable<User>;
    */

    /*
    this.angularFireAuth.authState.subscribe((userResponse: User) => {
      if (userResponse) {
        console.log('Auth Service: Constructor store user');
        this.user= userResponse;
        this.userLoggedIn= Promise.resolve(true);
        localStorage.setItem('user', JSON.stringify(userResponse));
      }
      else {
        console.log('store user null');
        this.user= undefined;
        this.userLoggedIn= Promise.resolve(false);
        localStorage.setItem('user', null);
      }
    });
    */

    //this.user= this.angularFireAuth.authState as Observable<User>;
  }
  //endregion

  checkUserOBS(observer: Observer<User>){
    return this.angularFireAuth.authState;
  }
  //todo update this to a better name, but this method worked best for the call order
  checkUser(): any{
    return this.angularFireAuth.authState.pipe(tap(userResponse => {
      if (userResponse) {
        console.log('Auth Service: Check User store user');
        this.user= userResponse;
        this.userLoggedIn= true;
        this.userLoggedInP= Promise.resolve(true);
        localStorage.setItem('user', JSON.stringify(userResponse));
      }
      else {
        console.log('store user null');
        this.user= undefined;
        this.userLoggedIn= false;
        this.userLoggedInP= Promise.resolve(false);
        localStorage.setItem('user', null);
      }
    })
    );
  }

  async loginWithGoogle() {
    return await this.angularFireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((gAuthRes: any) => {
      console.log('Google Auth');
      //console.log(gAuthRes);
      this.user= gAuthRes.user;
      this.userLoggedIn= true;
      this.userLoggedInP= Promise.resolve(true);
    });
  }

  async login(email: string, password: string) {
    console.log('Login Email & Password');
    return await this.angularFireAuth.signInWithEmailAndPassword(email, password)
      .then((epSignRes: any) => {
        console.log('Email & Password Auth');
        //console.log(epSignRes);
        this.user= epSignRes.user;
        this.userLoggedIn= true;
        this.userLoggedInP= Promise.resolve(true);
      });
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
    console.log('Logging Out');
    this.userLoggedIn= false;
    this.userLoggedInP= Promise.resolve(false);
    this.user= null;
    this.userAuthSub.unsubscribe();
    return await this.angularFireAuth.signOut().then((logoutRes: any) => {
      this.router.navigateByUrl('/login-register', { replaceUrl: true });
      /*
      console.log(logoutRes);
      console.log(this.userLoggedIn);
      */
    });
  }

  isUserLoggedIn() {
    //this just is not working
    //return this.user !== null;
    /*
    if(this.user === null){
      return false;
    }
    else{
      return true;
    }
    */
  }


}
