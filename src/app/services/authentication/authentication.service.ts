import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
// import { Auth } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {first, take, tap} from 'rxjs/operators';
import {Observable, Observer} from 'rxjs';
import User = firebase.User;
import {AngularFirestore} from '@angular/fire/compat/firestore';
// @ts-ignore
const moment= require('moment');

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

  emailInput: string;
  passwordInput: string;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
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
        //Get Custom Claims
        this.user.getIdTokenResult().then((tokenResult) => {
          console.log('Claims');
          console.log(tokenResult.claims);
          this.user.claims= tokenResult.claims;
        });
        this.afs.collection('users/').doc(this.user.uid).update({lastLogin: moment().valueOf()});
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

  login(method){
    return new Promise((resolve, reject) => {
      const loginP= new Promise((loginRes, loginRej) => {
        switch (method){
          case 'google':
            this.loginWithGoogle()
              .then(
                res => {
                  console.log('Logged in with Google');
                  console.log(res);
                  loginRes(true);
                }
              )
              .catch(
                error => {
                  console.log('Login with Email & Password Failed');
                  console.log(error);
                  loginRej(error);
                }
              );
            break;
          case 'ep':
            this.loginEP(this.emailInput, this.passwordInput)
              .then(
                res => {
                  console.log('Logged in with Email and Password Success');
                  console.log(res);
                  loginRes(true);
                }
              )
              .catch (
                error => {
                  console.log('Login with Email & Password Failed');
                  console.log(error);
                  loginRej(error);
                }
              );
            break;
        }
      });

      loginP.then(
        res => {
          // If the User does not have a record, creat it, and update last login
          const userSub= this.afs.collection('users').doc(this.user.uid).valueChanges()
            .subscribe((userRecord: any) => {
              if(!userRecord){
                //console.log('Record Does not Exist');
                this.afs.collection('users/').doc(this.user.uid)
                  .set({
                    lastLogin: moment().valueOf(),
                    email: this.user.email
                  });
              }
              else{
                this.afs.collection('users/').doc(this.user.uid).update({lastLogin: moment().valueOf()});
              }
              userSub.unsubscribe();
              this.userLoggedInP= Promise.resolve(true);
              resolve(true);
            });

          //Get Custom Claims
          this.user.getIdTokenResult().then((tokenResult) => {
            console.log('Claims');
            console.log(tokenResult.claims);
            this.user.claims= tokenResult.claims;
          });
        },
        err => {
          console.log('Login Failed');
          reject(err);
        }
      );
    });
  }

  async loginWithGoogle() {
    console.log('Login with Google');
    return new Promise((resolve, reject) => {
      this.angularFireAuth.signInWithPopup(
        new firebase.auth.GoogleAuthProvider()
      )
        .then(
          (gAuthRes: any) => {
            console.log('Google Auth');
            //console.log(gAuthRes);
            this.user= gAuthRes.user;
            resolve(true);
          }
        )
        .catch(
          error => {
            console.log('Catch Error');
            reject(error.message);
          }
        );
    });
  }

  loginEP(email: string, password: string) {
    console.log('Login Email & Password');
    return new Promise ((resolve, reject) => {
      this.angularFireAuth.signInWithEmailAndPassword(email, password)
        .then(
          (epSignRes: any) => {
            console.log('Email & Password Auth');
            //console.log(epSignRes);
            this.user = epSignRes.user;
            resolve(true);
          }
        )
        .catch(error => {
          console.log('Catch Error');
          reject(error.message);
        });

    });

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
