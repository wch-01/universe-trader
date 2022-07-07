import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {HousekeepingService} from '../../services/housekeeping/housekeeping.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {AlertController} from '@ionic/angular';
import {BusinessesService} from '../../services/businesses/businesses.service';
import {UniverseService} from '../../services/universe/universe.service';

const moment= require('moment');

@Component({
  selector: 'app-business',
  templateUrl: './business.page.html',
  styleUrls: ['./business.page.scss'],
})
export class BusinessPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  isModal;
  id;
  aBusiness;

  businessFound= false;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public ss: ServerService,
    private hks: HousekeepingService,
    private ionAlert: AlertController,
    public bs: BusinessesService,
    public uniS: UniverseService,
  ) { }
  //endregion

  ngOnInit() {
    this.bs.rsbP(this.id).then((aBusiness: any) => {
      this.bs.rBSS().then(() => {
        this.bs.rBSB().then(() => {
          this.businessFound= true;
        });
      });
    });
  }

  //region Create
  //endregion

  //region Read
  //endregion

  //region Update
  async editNameAlert(){
    const editNameAlert = await this.ionAlert.create({
      cssClass: '',
      header: 'Edit Business Name',
      subHeader: '',
      message: '',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Business Name'
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
          text: 'Confirm',
          handler: (data: any) => {
            this.editName(data);
          }
        }
      ]
    });

    await editNameAlert.present();
  }
  editName(data){
    this.hks.censorWords(data.name).then((result) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/businesses').doc(this.bs.aBusiness.id).update({displayName: result});
    });
  }

  beginMining(aItem, aItemYield){
    this.bs.aBusiness.command= 'mine';
    this.bs.aBusiness.status= 'Mining';
    this.bs.aBusiness.miningTarget= aItem;
    this.bs.aBusiness.miningYield= aItemYield;
    this.bs.aBusiness.miningEndTime= moment().add(15, 'minutes').unix();

    this.afs.collection('servers/' + this.ss.activeServer + '/businesses').doc(this.bs.aBusiness.id)
      .update(this.bs.aBusiness);
  }
  //endregion

  //region Delete
  //endregion

  //region Other
  dismissModal() {
    this.bs.aSubscriptions.some((subscription) => {
      subscription.unsubscribe();
    });
    this.modal.dismiss('cancel');
  }
  //endregion
}
