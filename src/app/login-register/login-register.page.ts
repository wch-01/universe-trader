import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication/authentication.service';
import {Router} from "@angular/router";

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
  //endregion

  //region Constructor
  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {
    this.selectedVal = 'login';
    this.isForgotPassword = false;

  }
  //endregion

  ngOnInit() {
  }

  // Common Method to Show Message and Hide after 2 seconds
  showMessage(type, msg) {
    this.responseMessageType = type;
    this.responseMessage = msg;
    setTimeout(() => {
      this.responseMessage = '';
    }, 2000);
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

  // Login user with  provided Email/ Password
  loginUser() {
    this.responseMessage = '';
    this.authService.login(this.emailInput, this.passwordInput)
      .then(res => {
        this.router.navigateByUrl('/dashboard', { replaceUrl: true });
        console.log(res);
        this.showMessage('success', 'Successfully Logged In!');
        this.isUserLoggedIn();
      }, err => {
        this.showMessage('danger', err.message);
      });
  }

  // Register user with  provided Email/ Password
  registerUser() {
    this.authService.register(this.emailInput, this.passwordInput)
      .then(res => {
        // Send Verification link in email
        this.authService.sendEmailVerification().then(result => {
          console.log(result);
          this.isForgotPassword = false;
          this.showMessage('success', 'Registration Successful! Please Verify Your Email');
        }, err => {
          this.showMessage('danger', err.message);
        });
        this.isUserLoggedIn();


      }, err => {
        this.showMessage('danger', err.message);
      });
  }

  // Send link on given email to reset password
  forgotPassword() {
    this.authService.sendPasswordResetEmail(this.emailInput)
      .then(res => {
        console.log(res);
        this.isForgotPassword = false;
        this.showMessage('success', 'Please Check Your Email');
      }, err => {
        this.showMessage('danger', err.message);
      });
  }

  // Open Popup to Log in with Google Account
  googleLogin() {
    this.authService.loginWithGoogle()
      .then(res => {
        this.router.navigateByUrl('/dashboard', { replaceUrl: true });
        console.log(res);
        this.showMessage('success', 'Successfully Logged In with Google');
        this.isUserLoggedIn();
      }, err => {
        this.showMessage('danger', err.message);
      });
  }

}
