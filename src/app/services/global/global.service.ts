import { Injectable } from '@angular/core';
import {ModalController, ToastController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthenticationService} from '../authentication/authentication.service';
import {TutorialModalPage} from '../../modals/tutorial-modal/tutorial-modal.page';

// @ts-ignore
const moment= require('moment');

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  //region Variables
  //endregion

  //region Constructor
  constructor(
    private toastController: ToastController,
    private afs: AngularFirestore,
    public authService: AuthenticationService,
    public modalController: ModalController,
  ) {
    // this.globalMessages();
  }
  //endregion

  //C
  //R
  //U
  //D

  //region Other
  async toastMessage(msg, type?) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: type
    });
    await toast.present();
  }

  globalMessages(){
    const rightNow= moment().valueOf();
    this.afs.collection('globalAlerts',
      ref =>
        ref.where('time', '>', rightNow)
    )
      .valueChanges({idField: 'id'})
      .subscribe((aMessages: any) => {
        aMessages.some((aMessage: any) => {
          if(!aMessage[this.authService.user.uid]){
            this.toastMessage(aMessage.msg, aMessage.type).then(() => {
              aMessage[this.authService.user.uid]= true;
              this.afs.collection('globalAlerts').doc(aMessage.id)
                .update(aMessage);
            });
          }
        });
      });
  }

  formatTimeStamp(timeStamp, format?){
    switch (format){
      case 'timer':
        const timerDuration= moment.duration(timeStamp);
        const timerHours = Math.floor(timerDuration.asHours());
        const timerMinutes  = Math.floor(timerDuration.asMinutes()) - timerHours * 60;
        const timerSeconds   = Math.floor(timerDuration.asSeconds()) - timerHours * 60 * 60 - timerMinutes * 60;
        return ((timerHours > 9) ? timerHours : ('0'+timerHours))+':'+((timerMinutes > 9) ? timerMinutes : ('0'+timerMinutes))+':'+((timerSeconds > 9) ? timerSeconds : ('0'+timerSeconds));
      default:
        return moment(timeStamp).format('MMM-DD-yyyy, HH:mm:ss');
    }
  }

  async viewTutorial(pageName){
    const shipModal= await this.modalController.create({
      component: TutorialModalPage,
      componentProps: {id: pageName},
      cssClass: 'ship_modal',
      showBackdrop: true
    });
    return await shipModal.present();
  }
  //endregion
}
