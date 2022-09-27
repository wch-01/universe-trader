import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore, DocumentSnapshot} from '@angular/fire/compat/firestore';
import {take} from 'rxjs/operators';
import {Station} from '../../classes/station';
import {AlertController, ModalController} from '@ionic/angular';
import {HousekeepingService} from '../housekeeping/housekeeping.service';
import {Subscription} from 'rxjs';
import {CharacterService} from '../character/character.service';
import {ModalPage} from '../../modal/modal.page';
import {Item} from '../../classes/item';
import {InventoryService} from '../inventory/inventory.service';
import {WarehouseService} from '../warehouse/warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  //region Variables
  stationsSub;
  aStations;
  stationID;
  stationSub;
  moduleSub;
  aStation;
  aModules;
  aaModules: { [key: string]: Item } = {};
  inventorySub;
  aInventory: any;
  aaInventory: { [key: string]: Item } = {};

  aStationsTableColumns= [
    /*
    {
      label: 'ID',
      filter: 'id'
    },
    */
    {
      label: 'Name',
      filter: 'name'
    }
  ];
  aStationsFilters= {
    /*
    id: '',
    */
    name: '',
    population: ''
  };

  capacityAvailable= 0;
  //region Warehouse
  warehouseIsViewer= false;
  viewer= '';
  aWarehouse;
  aaWInventory;
  wCapacityAvailable= 0;
  aWInventory;
  //endregion

  subscriptions: Subscription[] = [];
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    private ionAlert: AlertController,
    private hks: HousekeepingService,
    private charS: CharacterService,
    private modalController: ModalController,
    private invS: InventoryService,
    private warehouseS: WarehouseService
  ) { }
  //endregion

  //region Read
  /**
   * Name: Read Station
   *
   * @return Promise
   * */
  rpS(id){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('stationService: rsP');
      if(this.ss.aRules.consoleLogging.mode >= 2){
        console.log(id);
      }
    }
    return new Promise((resolve, reject) => {
      const stationSub= this.afs.collection('servers/' + this.ss.activeServer + '/stations').doc(id).valueChanges({idField:'id'})
        .subscribe((aStation: any) => {
          this.subscriptions.push(stationSub);
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('stationService: rsP sub');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aStation);
            }
          }
          this.aStation= aStation;
          if(this.charS.aCharacter.id === this.aStation.ownerID){
            console.log('Char is owner');
            if(this.viewer === 'warehouse'){
              console.log('From WH');
              this.aWarehouse= this.warehouseS.aWarehouse;
              this.aWInventory= this.warehouseS.aInventory;
              this.aaWInventory= this.warehouseS.aaInventory;
            }
            else{
              console.log('From Ship');
              this.warehouseS.fwIDP(this.aStation.solarBodyID, this.aStation.ownerID).then(() => {
                this.aWarehouse= this.warehouseS.aWarehouse;
                this.warehouseS.rpWI().then(() => {
                  this.aWInventory= this.warehouseS.aInventory;
                  this.aaWInventory= this.warehouseS.aaInventory;
                });
              })
                .catch((error) =>{
                console.log(error);
              });
            }
          }
          this.rpSM().then(() => {
            resolve(true);
          });
        });
    });
  }

  /**
   * Name: Read Promise Station Modules
   *
   * @return Promise
   * */
  rpSM(){
    return new Promise((resolve, reject) => {
      const moduleSub= this.afs.collection('servers/' + this.ss.activeServer + '/stations/'+this.aStation.id+'/installedModules').valueChanges({idField:'id'})
        .subscribe((aModules: any) => {
          this.subscriptions.push(moduleSub);
          this.aModules= aModules;
          this.aaModules= {};
          aModules.some((aModule) => {
            this.aaModules[aModule.itemID]= aModule;
          });
          this.setCargoCapacity();
          resolve(true);
        });
    });
  }

  /**
   * Name: Read Subscription Station Modules
   *
   * @return Promise
   * */
  rsSM(){
    return this.moduleSub= this.afs.collection('servers/' + this.ss.activeServer + '/stations/'+this.aStation.id+'/installedModules').valueChanges({idField:'id'});
  }

  /**
   * Name: Read Promise Station Inventory
   *
   * @return: Promise
   * */
  rpSI(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('shipService: rsiP');
    }
    return new Promise((resolve, reject) => {
      const rpSISub= this.invS.rpSI(this.aStation.id).subscribe((aInventory: any) => {
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('shipService: Sub');
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aInventory);
          }
        }
        this.aInventory= aInventory;
        // this.aaInventory= [];
        this.aaInventory= {};
        aInventory.some((item: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(item);
          }
          this.aaInventory[item.name]= item;
        });
        this.subscriptions.push(rpSISub);
        this.setCargoCapacity().then(() => {
          resolve(aInventory);
        });
      });
    });
  }

  /**
   * Name: Read Subscription Station Inventory
   * */
  rsSI(){
    //todo convert to promise
    return this.invS.rpSI(this.aStation.id);
  }

  /**
   * Default Station
   * */
  rpDS(stationName){
    return new Promise((resolve, reject) => {
      this.afs.firestore.collection('servers/' + this.ss.activeServer + '/zStations/').doc(stationName).get().then((aStation: DocumentSnapshot<Station>) => {
        resolve(aStation);
      });
    });
  }

  /**
   * View Local Warehouse
   * */
  async viewWarehouse(){
    const warehouseModal = await this.modalController.create({
      component: ModalPage,
      componentProps: {
        viewer:'station',
        modalType: 'warehouse',
        trading: true,
        trader: 'station'
      },
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await warehouseModal.present();
  }
  //endregion

  //region Update
  async editNameAlert(){
    const editNameAlert = await this.ionAlert.create({
      cssClass: '',
      header: 'Edit Station Name',
      subHeader: '',
      message: '',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Station Name'
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
      this.afs.collection('servers/' + this.ss.activeServer + '/stations').doc(this.aStation.id).update({name: result});
    });
  }
  //endregion

  /**
   * Name: Find Stations at Solar Body Promise
   *
   * @return: Promise
   * */
  fsaSBP(solarBodyID){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('stationService: fsaSBP');
    }
    return new Promise((resolve, reject) => {
      this.stationsSub= this.afs.collection('servers/' + this.ss.activeServer + '/stations',
        ref =>
          ref.where('solarBodyID', '==', solarBodyID)
      ).valueChanges({idField:'id'})
        .subscribe((aStations: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aStations);
          }
          this.aStations= aStations;
          resolve(true);
        });
    });
  }

  /**
   * Name: Find Station ID by SolarBodyID
   *
   * @return: Promise
   * */
  fsIDP(solarBodyID){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/stations',
        ref =>
          ref.where('solarBodyID', '==', solarBodyID)
      ).valueChanges({idField:'id'})
        .pipe(take(1))
        .subscribe((aStations: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Station');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aStations);
            }
          }
          this.stationID= aStations[0].id;
          resolve(true);
        });
    });
  }



  /**
   * Name: Read Station Inventory Promise
   *
   * @return Promise
   * */
  rsiP(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('stationService: rsiP');
    }
    return new Promise((resolve, reject) => {
      this.inventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', this.aStation.id)
      ).valueChanges({idField: 'id'})
        .subscribe((aInventory: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('stationService: rsiP');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aInventory);
            }
          }
          this.aInventory= aInventory;
          aInventory.some((item: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(item);
            }
            this.aaInventory[item.name]= item;
          });
          this.setCargoCapacity();
          resolve(true);
        });
    });
  }

  logoutStation(){
    if(this.aStations){
      this.stationsSub.unsubscribe();
    }
    this.aStations= undefined;
    this.stationID= undefined;
    if(this.aStation){
      this.stationSub.unsubscribe();
      this.moduleSub.unsubscribe();
    }
    this.aStation= undefined;
    if(this.aInventory){
      this.inventorySub.unsubscribe();
    }
    this.aInventory= undefined;
    this.aaInventory= {};
  }

  //region Other
  setCargoCapacity(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('stationService: setCargoCapacity');
    }
    return new Promise((resolve, reject) => {
      let capacityTotal= this.ss.aRules.station.defaultStorage;
      let capacityUsed= 0;

      const rpCargoModules= new Promise((cmResolve, cmReject) => {
        /*
        this.aShip.installedModules.some(module =>{
          if(module.name === 'cargo'){
            capacityTotal= +capacityTotal + (module.level * this.ss.aaDefaultItems.cargo.capacity);
          }
        });
        */

        for(const aModule of this.aModules){
          if(aModule.name === 'stationStorageModule'){
            capacityTotal= +capacityTotal + (+aModule.level * +this.ss.aRules.storage.stationCargoModule);
          }
        }
        cmResolve(true);
      });

      const pCapUsed= new Promise((cuResolve, cuReject) => {
        if(this.aInventory){
          for(const aItem of this.aInventory){
            capacityUsed= +capacityUsed + +aItem.quantity;
          }
        }
        cuResolve(true);
      });


      rpCargoModules.then(() => {
        pCapUsed.then(() => {
          this.capacityAvailable= +capacityTotal - +capacityUsed;
          resolve(true);
        });
      });
    });
  }
  //endregion
}
