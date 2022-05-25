import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {BusinessesService} from '../services/businesses/businesses.service';
import {ShipPage} from "../ships/ship/ship.page";
import {ModalController} from "@ionic/angular";
import {BusinessCreationPage} from "./business-creation/business-creation.page";

@Component({
  selector: 'app-businesses',
  templateUrl: './businesses.page.html',
  styleUrls: ['./businesses.page.scss'],
})
export class BusinessesPage implements OnInit {
  //region Variables
  businessesLoaded= false;
  //endregion

  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    public busS: BusinessesService,
    public modalController: ModalController,
  ) { }

  ngOnInit() {
    this.busS.rbP().then((rbPRes: any) => {
      this.businessesLoaded= true;
    });
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

}
