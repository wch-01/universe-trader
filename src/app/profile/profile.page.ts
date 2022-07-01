import {Component, OnDestroy, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthenticationService} from '../services/authentication/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  //region Variables
  dataLoaded= false;
  userSub;
  aUser;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) { }
  //endregion

  ngOnInit() {
    this.userSub= this.afs.collection('users').doc(this.auth.user.uid)
      .valueChanges({idField: 'id'})
      .subscribe((aUser: any) => {
        this.aUser= aUser;
        console.log(aUser);
        this.dataLoaded= true;
      });
  }

  //C

  //R

  //region Update
  uNtfSettings(){
    this.afs.collection('users').doc(this.auth.user.uid)
      .update({
        emailNotifications: this.aUser.emailNotifications
      });
  }
  //endregion

  //D

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
