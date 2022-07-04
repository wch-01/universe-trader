import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication/authentication.service';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';
import {take} from "rxjs/operators";
const moment= require('moment');

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {
  //region Variables
  selectedVal: string;
  responseMessage = '';
  responseMessageType = '';
  emailInput: string;
  passwordInput: string;
  isForgotPassword: boolean;
  userDetails: any;
  userLoggedIn: Promise<boolean> | undefined;
  userLoggedInTwo: Promise<boolean> | undefined;
  nsTab= 'login';
  aAppStatus;
  appStatus: Promise<boolean> | undefined;
  //endregion

  //region Constructor
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private afs: AngularFirestore,
    private loadingController: LoadingController,
    public toastController: ToastController,
    private ionAlert: AlertController,
  ) {
    this.selectedVal = 'login';
    this.isForgotPassword = false;
  }
  //endregion

  ngOnInit() {
    this.afs.collection('app').doc('1_status').valueChanges()
      .pipe(take(1))
      .subscribe((aAppStatus: any) => {
        console.log('Check Status');
        console.log(aAppStatus);
        if(aAppStatus.allowLogin === true){
          this.appStatus= Promise.resolve(true);
        }
        else{
          // this.appStatus= Promise.resolve(false);
        }
      });
  }

  //Login function to handle Google and EP Login, and dynamically decide where to redirect to
  async login(method){
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Logging in',
      //duration: 2000
    });
    await loading.present();

    if(method === 'ep'){
      this.authService.emailInput= this.emailInput;
      this.authService.passwordInput= this.passwordInput;
    }

    this.authService.login(method)
      .then(
        res => {
          this.router.navigateByUrl('/servers', { replaceUrl: true });
          loading.dismiss();
        },
      )
      .catch((errorMessage) => {
        if(errorMessage === 'Not Admin'){
          this.toastMessage('You are not an admin', 'danger');
        }
        else{
          this.toastMessage(errorMessage, 'danger');
        }
        loading.dismiss();
      });
  }

  // Open Popup to Log in with Google Account
  async googleLogin() {
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Logging in',
      //duration: 2000
    });
    await loading.present();

    this.authService.loginWithGoogle()
      .then(res => {
        console.log('Login with google.');
        this.router.navigateByUrl('/after-login', { replaceUrl: true });
        const userSub= this.afs.collection('users').doc(this.authService.user.uid).valueChanges()
          .subscribe((userRecord: any) => {
            //console.log('Find user Record');
            //console.log(userRecord);
            if(!userRecord){
              //console.log('Record Does not Exist');
              this.afs.collection('users/').doc(this.authService.user.uid)
                .set({
                  lastLogin: moment().unix(),
                  email: this.authService.user.email
                });
            }
            else{
              this.afs.collection('users/').doc(this.authService.user.uid).update({lastLogin: moment().unix()});
            }
            userSub.unsubscribe();
          });
        loading.dismiss();
      }, err => {
        this.showMessage('danger', err.message);
      });
  }

  // Login user with  provided Email/ Password
  /*
  loginUser() {
    //console.log('Login with Email and Password');
    this.responseMessage = '';
    this.authService.login(this.emailInput, this.passwordInput)
      .then(
        res => {
          //console.log('E&P Result');
          //console.log(res);
          this.afs.collection('users/').doc(this.authService.user.uid).update({lastLogin: moment().unix()});
          this.router.navigateByUrl('/after-login', { replaceUrl: true });
          this.showMessage('success', 'Successfully Logged In!');
          this.isUserLoggedIn();
        },
        err => {
          //this.showMessage('danger', err.message);
          this.showMessage('danger', 'Oops, something went wrong. Please Try again.');
        });
  }
  */

  // Common Method to Show Message and Hide after 2 seconds
  showMessage(type, msg) {
    this.responseMessageType = type;
    this.responseMessage = msg;
    setTimeout(() => {
      this.responseMessage = '';
    }, 2000);
  }

  async toastMessage(msg, type?) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: type
    });
    toast.present();
  }

  // Called on switching Login/ Register tabs
  public onValChange(val: string) {
    this.showMessage('', '');
    this.selectedVal = val;
  }

  // Check localStorage is having User Data
  isUserLoggedIn() {
    /*
    this.userDetails = this.authService.isUserLoggedIn();
    console.log('login-register: isUserLoggedIn');
    console.log(this.userDetails);
    */

    this.userDetails = this.authService.checkUser().subscribe(result => {
      console.log('login-register: userLoggedIn.then');
      console.log(result);
      if(result){
        this.userLoggedIn= Promise.resolve(true);
        console.log('User logged in then');
        console.log(this.userDetails);
      }
      else{
        this.userLoggedIn= Promise.resolve(false);
        console.log('User is not logged in then.');
        console.log(this.userDetails);
      }
    });

    /*
    if(this.userDetails){
      this.userLoggedIn= Promise.resolve(true);
      console.log('User logged in');
      console.log(this.userDetails);
    }
    else{
      this.userLoggedIn= Promise.resolve(false);
      console.log('User is not logged in.');
    }
    */
  }

  // SignOut Firebase Session and Clean LocalStorage
  logoutUser() {
    this.authService.logout()
      .then(res => {
        console.log(res);
        this.userDetails = undefined;
        localStorage.removeItem('user');
      }, err => {
        this.showMessage('danger', err.message);
      });
  }

  // Register user with  provided Email/ Password
  async registerUser() {
    console.log('Register by Email&Password');
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Registering',
      //duration: 2000
    });
    await loading.present();

    this.authService.register(this.emailInput, this.passwordInput)
      .then(
        registerUserResult => {
          console.log('Register Result');
          console.log(registerUserResult.user.uid);
          this.afs.collection('users/').doc(registerUserResult.user.uid)
          .set({
            lastLogin: moment().unix(),
            email: registerUserResult.user.email
            });
          //Send Verification link in email
          this.authService.sendEmailVerification()
            .then
            (
              result =>
              {
                console.log('Send email Verify');
                console.log(result);
                this.isForgotPassword = false;
                this.toastMessage('Registration Successful! Please Verify Your Email', 'success');
                this.router.navigateByUrl('/dashboard', { replaceUrl: true });
                loading.dismiss();
              },
              err =>
              {
                this.showMessage('danger', err.message);
              }
            );
        },
        err => {
          this.showMessage('danger', err.message);
        });
  }

  // Send link on given email to reset password
  forgotPassword(email) {
    this.authService.sendPasswordResetEmail(email)
      .then(res => {
        console.log(res);
        this.toastMessage('Please Check Your Email (Check Spam as well)', 'success');
      }, err => {
        this.toastMessage(err.message, 'danger');
      });
  }

  async forgotPasswordAlert(){
    const addCreditsAlert = await this.ionAlert.create({
      cssClass: '',
      header: 'Enter Email Associated with Account',
      subHeader: '',
      message: '',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'ut@ut.com'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            //console.log('Confirm Cancel');
          }
        },
        {
          text: 'Send Email',
          handler: (data: any) => {
            console.log('Send Forgot Password Email');
            console.log(data);
            this.forgotPassword(data.email);
          }
        }
      ]
    });

    await addCreditsAlert.present();

    const { role } = await addCreditsAlert.onDidDismiss();
    //console.log('onDidDismiss resolved with role', role);
  }
}
