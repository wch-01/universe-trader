import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../../services/server/server.service';
import {HousekeepingService} from '../../../services/housekeeping/housekeeping.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {BusinessesService} from '../../../services/businesses/businesses.service';
import {UniverseService} from '../../../services/universe/universe.service';
import {GlobalService} from '../../../services/global/global.service';
import {StationService} from '../../../services/station/station.service';
import {StationOperationService} from '../../../services/stationOperation/station-operation.service';
const moment= require('moment');

@Component({
  selector: 'app-station-operation',
  templateUrl: './station-operation.page.html',
  styleUrls: ['./station-operation.page.scss'],
})
export class StationOperationPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  isModal;
  id;
  aOperation;

  businessFound= false;
  aSubscriptions= [];

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
    public soS: StationOperationService
  ) { }
  //endregion

  ngOnInit() {
    this.readStationOperation().then(() => {});
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
  async readStationOperation() {
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Loading Operation',
      //duration: 2000
    });
    await loading.present();

    /*
    const operationSub= this.afs.collection('servers/'+this.ss.activeServer+'/stationOperations').doc(this.id)
      .valueChanges().subscribe((aOperation) => {
        this.aOperation= aOperation;
        this.aSubscriptions.push(operationSub);
        loading.dismiss();
    });
    */

    this.soS.rpSO(this.id).then((aOperation) => {
      this.soS.rpBProducts().then(() => {
        this.soS.rpSOss().then(() => {
          this.soS.rpSOsb().then(() => {
            this.aOperation= aOperation;
            // this.businessFound = true;
            console.log(this.soS.aProducts);
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
      header: 'Edit Operation Name',
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
      this.afs.collection('servers/' + this.ss.activeServer + '/stationOperations').doc(this.id).update({displayName: result});
    });
  }

  beginMining(aItem, aItemYield, once?){
    switch (once){
      case 'true':
        this.aOperation.miningFrequency= true;
        break;
      case 'false':
        this.aOperation.miningFrequency= false;
        break;
      case 'other':
        this.aOperation.miningFrequency= 'other';
        this.aOperation.miningCycles= this.manualCycles;
        break;
    }

    this.aOperation.command= 'mine';
    this.aOperation.status= 'Mining';
    this.aOperation.miningTarget= aItem;
    this.aOperation.miningYield= aItemYield;
    this.aOperation.miningEndTime= moment().add(15, 'minutes').valueOf();

    this.afs.collection('servers/' + this.ss.activeServer + '/stationOperations').doc(this.id)
      .update(this.aOperation);
  }

  beginOperation(item, itemYield?){
    switch (this.cycles){
      case 'true':
        console.log('case true');
        this.aOperation.productionFrequency= true;
        break;
      case 'false':
        this.aOperation.productionFrequency= false;
        break;
      case 'other':
        this.aOperation.productionFrequency= 'other';
        this.aOperation.productionCycles= this.manualCycles;
        break;
    }
    if(itemYield){
      this.aOperation.productionYield= itemYield;
    }

    this.aOperation.command= 'produce';
    this.aOperation.status= 'Producing';
    this.aOperation.productionTarget= item;
    this.aOperation.productionEndTime= moment().add(15, 'minutes').valueOf();

    this.afs.collection('servers/' + this.ss.activeServer + '/stationOperations').doc(this.aOperation.id)
      .update(this.aOperation);
  }

  cancelOperations(){
    this.aOperation.command= 'cancel';
    this.aOperation.status= 'Idle';
    //this.shipS.aShip.miningTarget= 'none';
    //this.shipS.aShip.miningYield= aItemYield;

    this.afs.collection('servers/' + this.ss.activeServer + '/stationOperations').doc(this.id)
      .update(this.aOperation).then(() => {this.readStationOperation();});
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
    this.aSubscriptions.some((subscription) => {
      subscription.unsubscribe();
    });
    this.modal.dismiss('cancel').then(() => {});
  }
  //endregion
}
