import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import {AngularFireAuth} from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //region Variables
  user = null; // https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
  loginType= null;
  //endregion

  //region Constructor
  constructor(
    private auth: Auth,
    public fireAuth: AngularFireAuth // https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
  ) {}
  //endregion

  async register({ email, password }) {
    try {
      this.user = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return this.user;
    } catch (e) {
      return null;
    }
  }

  async login({ email, password }) {
    try {
      this.user = await signInWithEmailAndPassword(this.auth, email, password);
      return this.user;
    } catch (e) {
      return null;
    }
  }

  logout() {
    return signOut(this.auth);
  }


  // https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
  loginG() {
    this.fireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  // https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
  logoutG() {
    this.fireAuth.signOut();
  }
}
