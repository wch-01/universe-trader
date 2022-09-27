import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {HousekeepingService} from '../../services/housekeeping/housekeeping.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {BusinessesService} from '../../services/businesses/businesses.service';
import {UniverseService} from '../../services/universe/universe.service';
import {GlobalService} from '../../services/global/global.service';

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
  type;
  id;
  aBusiness;

  businessFound= false;

  //region Operation Settings
  cycles= 'false';
  manualCycles= 1;
  //endregion
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public ss: ServerService,
    private hks: HousekeepingService,
    private ionAlert: AlertController,
    public bs: BusinessesService,
    public uniS: UniverseService,
    private loadingController: LoadingController,
    public globalS: GlobalService,
  ) { }
  //endregion

  ngOnInit() {
    switch (this.type){
      case 'stationOperation':
        this.readStationBusiness().then(() => {});
        break;
      default:
        this.readBusiness().then(() => {});
        break;
    }
    /*
    this.bs.rsbP(this.id).then((aBusiness: any) => {
      this.bs.rBSS().then(() => {
        this.bs.rBSB().then(() => {
          this.businessFound= true;
        });
      });
    });
    */
  }

  //region Create
  //endregion

  //region Read
  async readBusiness() {
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Loading Business',
      //duration: 2000
    });
    await loading.present();

    this.bs.rsbP(this.id).then((aBusiness: any) => {
      this.bs.rpBProducts().then(() => {
        this.bs.rBSS().then(() => {
          this.bs.rBSB().then(() => {
            this.businessFound = true;
            console.log(this.bs.aProducts);
            loading.dismiss();
          });
        });
      });
    });
  }

  async readStationBusiness() {
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Loading Business',
      //duration: 2000
    });
    await loading.present();

    this.bs.rpSB(this.id).then((aBusiness: any) => {
      this.bs.rpBProducts().then(() => {
        this.bs.rBSS().then(() => {
          this.bs.rBSB().then(() => {
            this.businessFound = true;
            console.log(this.bs.aProducts);
            loading.dismiss();
          });
        });
      });
    });
  }
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
    switch (this.type){
      case 'stationOperation':
        this.hks.censorWords(data.name).then((result) => {
          this.afs.collection('servers/' + this.ss.activeServer + '/stationOperations').doc(this.bs.aBusiness.id).update({displayName: result});
        });
        break;
      default:
        this.hks.censorWords(data.name).then((result) => {
          this.afs.collection('servers/' + this.ss.activeServer + '/businesses').doc(this.bs.aBusiness.id).update({displayName: result});
        });
        break;
    }
  }

  beginMining(aItem, aItemYield, once?){
    console.log('Cycles');
    console.log(once);
    switch (once){
      case 'true':
        console.log('case true');
        this.bs.aBusiness.miningFrequency= true;
      break;
      case 'false':
        this.bs.aBusiness.miningFrequency= false;
      break;
      case 'other':
        this.bs.aBusiness.miningFrequency= 'other';
        this.bs.aBusiness.miningCycles= this.manualCycles;
        break;
    }

    this.bs.aBusiness.command= 'mine';
    this.bs.aBusiness.status= 'Mining';
    this.bs.aBusiness.miningTarget= aItem;
    this.bs.aBusiness.miningYield= aItemYield;
    this.bs.aBusiness.miningEndTime= moment().add(15, 'minutes').valueOf();

    this.afs.collection('servers/' + this.ss.activeServer + '/businesses').doc(this.bs.aBusiness.id)
      .update(this.bs.aBusiness);
  }

  beginOperation(item, itemYield?){
    switch (this.cycles){
      case 'true':
        console.log('case true');
        this.bs.aBusiness.productionFrequency= true;
        break;
      case 'false':
        this.bs.aBusiness.productionFrequency= false;
        break;
      case 'other':
        this.bs.aBusiness.productionFrequency= 'other';
        this.bs.aBusiness.productionCycles= this.manualCycles;
        break;
    }
    if(itemYield){
      this.bs.aBusiness.productionYield= itemYield;
    }

    this.bs.aBusiness.command= 'produce';
    this.bs.aBusiness.status= 'Producing';
    this.bs.aBusiness.productionTarget= item;
    this.bs.aBusiness.productionEndTime= moment().add(15, 'minutes').valueOf();

    switch (this.type){
      case 'stationOperation':
        this.afs.collection('servers/' + this.ss.activeServer + '/stationOperations').doc(this.bs.aBusiness.id)
          .update(this.bs.aBusiness).then(() => {});
        break;
      default:
        this.afs.collection('servers/' + this.ss.activeServer + '/businesses').doc(this.bs.aBusiness.id)
          .update(this.bs.aBusiness).then(() => {});
        break;
    }
  }

  cancelOperations(){
    this.bs.aBusiness.command= 'cancel';
    this.bs.aBusiness.status= 'Idle';
    //this.shipS.aShip.miningTarget= 'none';
    //this.shipS.aShip.miningYield= aItemYield;

    switch (this.type){
      case 'stationOperation':
        this.afs.collection('servers/' + this.ss.activeServer + '/stationOperations').doc(this.bs.aBusiness.id)
          .update(this.bs.aBusiness).then(() => {this.readBusiness();});
        break;
      default:
        this.afs.collection('servers/' + this.ss.activeServer + '/businesses').doc(this.bs.aBusiness.id)
          .update(this.bs.aBusiness).then(() => {this.readBusiness();});
        break;
    }
  }
  //endregion

  //region Delete
  //endregion

  //region Other
  eta(timeStamp){
    return moment(timeStamp).format('MMM-DD-yyyy, HH:mm:ss');
  }

  async helpMessageAlert() {
    const editNameAlert = await this.ionAlert.create({
      cssClass: '',
      header: 'Business Help',
      subHeader: '',
      message: this.ss.aRules.production.desc,
      buttons: [
        {
          text: 'Got it!',
          handler: () => {}
        }
      ]
    });

    await editNameAlert.present();
  }

  dismissModal() {
    this.bs.aSubscriptions.some((subscription) => {
      subscription.unsubscribe();
    });
    this.modal.dismiss('cancel');
  }
  //endregion
}
