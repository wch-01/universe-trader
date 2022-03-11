import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';

// https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
import {AngularFireAuth} from '@angular/fire/compat/auth';
// https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup;
  user = null; // https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57

  //region Constructor
  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router,
    public fireAuth: AngularFireAuth // https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
  ) {
    this.fireAuth.authState.subscribe((user) => {
      this.user= this.authService.user = user ? user : null;

      if (this.authService.user) {
        this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      } else {
        //this.showAlert('Login failed', 'Please try again!');
      }
    });// https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
  }
  //endregion

  // Easy access for form fields
  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.user = await this.authService.register(this.credentials.value);
    await loading.dismiss();

    if (this.authService.user) {
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } else {
      this.showAlert('Registration failed', 'Please try again!');
    }
  }

  async login() {
    this.authService.loginType= 'email';
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.user = await this.authService.login(this.credentials.value);
    await loading.dismiss();

    if (this.authService.user) {
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } else {
      this.showAlert('Login failed', 'Please try again!');
    }
  }

  async showAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
  loginG() {
    this.authService.loginType= 'google';
    this.fireAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  // https://dev.to/dailydevtips1/adding-firebase-google-authentication-to-an-ionic-app-o57
  logoutG() {
    this.fireAuth.signOut();
  }
}
