import { Injectable } from '@angular/core';
import {Platform} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  //region Variables
  sizeTemplate= 'standard';
  //endregion

  constructor(
    public platform: Platform
  ) {
    // console.log(this.platform);
    // console.log(this.platform.is('desktop'));
    this.platform.ready().then(() => {
      if(this.platform.width() <= 1180){
        this.sizeTemplate= 'small';
      }
    });
    this.platform.resize.subscribe(async () => {
      console.log('Resize event detected');
      console.log('Width: ' + this.platform.width());
      console.log('Height: ' + this.platform.height());
      if(this.platform.width() <= 1180){
        this.sizeTemplate= 'small';
      }
      else{
        this.sizeTemplate= 'standard';
      }
    });
  }
}
