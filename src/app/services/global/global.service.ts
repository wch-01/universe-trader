import { Injectable } from '@angular/core';
import {ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  //region Variables
  //endregion

  //region Constructor
  constructor(
    private toastController: ToastController,
  ) { }
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
    toast.present();
  }
  //endregion
}
