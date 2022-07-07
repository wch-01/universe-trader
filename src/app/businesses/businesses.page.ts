import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {BusinessesService} from '../services/businesses/businesses.service';
import {ModalController} from '@ionic/angular';
import {BusinessCreationPage} from './business-creation/business-creation.page';
import {BusinessPage} from './business/business.page';
import {WarehouseService} from '../services/warehouse/warehouse.service';

@Component({
  selector: 'app-businesses',
  templateUrl: './businesses.page.html',
  styleUrls: ['./businesses.page.scss'],
})
export class BusinessesPage implements OnInit {
  //region Variables
  businessesLoaded= false;
  newBAllowed= false;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    public busS: BusinessesService,
    public modalController: ModalController,
    public ws: WarehouseService
  ) { }
  //endregion

  ngOnInit() {
    this.busS.rbP()
      .then((aBusinesses: any) => {
        console.log('DOT Then');
        if(aBusinesses.length < 10){
          this.newBAllowed= true;
        }
    })
      .catch(() => {
        console.log('DOT Catch');
        this.newBAllowed= true;
      });
  }

  //region C
  //endregion

  //region R
  //endregion

  //region U
  //endregion

  //region D
  //endregion

  //region Other
  async viewBusinessModal(aBusiness){
    const stationModal= await this.modalController.create({
      component: BusinessPage,
      componentProps: {
        isModal: true,
        id: aBusiness.id,
      },
      cssClass: 'ship_modal',
      showBackdrop: true
    });

    return await stationModal.present();
  }

  async businessCreationModal(){
    //this.shipS.shipID= aShip.id;
    //this.shipS.isModal= true;
    const businessCreationModal= await this.modalController.create({
      component: BusinessCreationPage,
      /*componentProps: {id: aShip.id},*/
      cssClass: 'ship_modal',
      showBackdrop: true
    });

    return await businessCreationModal.present();
  }
  //endregion
}
