import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Components} from '@ionic/core';
import {ShipService} from '../../services/ship/ship.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {UniverseService} from '../../services/universe/universe.service';
import {SolarBody, SolarSystem} from '../../classes/universe';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {CharacterService} from '../../services/character/character.service';
import {ColonyService} from '../../services/colony/colony.service';
import {ColonyModalPage} from '../../modals/colony-modal/colony-modal.page';
import {ShipWarehousePage} from '../ship-warehouse/ship-warehouse.page';
import {ModalPage} from '../../modal/modal.page';
import {Subscription} from 'rxjs';
import {Ship} from '../../classes/ship';
import {take} from 'rxjs/operators';
import {HousekeepingService} from '../../services/housekeeping/housekeeping.service';
import {PlatformService} from '../../services/platform/platform.service';
import {WarehouseService} from '../../services/warehouse/warehouse.service';
import {GlobalService} from '../../services/global/global.service';
import {ShipOrdersModalPage} from '../ship-orders-modal/ship-orders-modal.page';

const moment= require('moment');

@Component({
  selector: 'app-ship',
  templateUrl: './ship.page.html',
  styleUrls: ['./ship.page.scss'],
})
export class ShipPage implements OnInit, OnDestroy {
  //region Variables
  @Input() modal: Components.IonModal;
  @Output() traveling: EventEmitter<any> = new EventEmitter();
  id;

  //region Ship
  aShip;
  shipBootDone: Promise<boolean> | undefined;
  //endregion

  //region Inventory
  invLoaded= false;
  aInventory;
  //endregion

  //region Location
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody()
  };
  /*
  currentDate= moment().valueOf();
  currentDateAdd= moment().add(600000).valueOf();
  timer= this.currentDateAdd - this.currentDate;
  duration= moment.utc(600000).format('HH:mm:ss.SSS');
  date= moment.valueOf(this.currentDate).format();
  dateTwo= moment.valueOf(this.currentDateAdd).format();
  arrivalTime;
  */
  //currentDate= this.date.setDate(this.date.getDate() + 1*60000);
  aTravel= {
    aSolarSystem: new SolarSystem(),
    ssTTms: 0,
    solarSystemTime: '00:00:00',
    //currentDate: this.currentDate,
    aSolarBody: new SolarBody(),
    sbTTms: 0,
    solarBodyTime: '00:00:00',
    totalTravelTime: '00:00:00',
  };
  aUniverse: any;
  aSolarBodies;
  //endregion
  nsTab= 'main';

  sizeTemplate= 'standard';

  //region Warehouse
  foundWarehouse= false;
  aWarehouse;
  //endregion

  //region Colony
  foundColony= false;
  aColony;
  aColonies;
  aColonyInventory;
  //endregion

  //region Cargo
  totalCapacity= 0;
  //endregion

  aModules;

  timeOne= moment.utc().format('HH:mm:ss');
  timeTwo= moment().format('HH:mm:ss');

  subscriptions: Subscription[] = [];
  //endregion

  //region Constructor
  constructor(
    public shipS: ShipService,
    public colonyS: ColonyService,
    public ss: ServerService,
    private afs: AngularFirestore,
    public uniS: UniverseService,
    private ionAlert: AlertController,
    private route: ActivatedRoute,
    public router: Router,
    private cs: CharacterService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private hks: HousekeepingService,
    public platform: PlatformService,
    public ws: WarehouseService,
    private gs: GlobalService,
    public globalS: GlobalService,
  ) { }
  //endregion

  async ngOnInit() {
    console.log('Load Ship Page');
    /* Used this for a while, but want to get away from url params
    this.route.params.subscribe(params => {
      if (this.ss.aRules.consoleLogging.mode >= 1) {
        console.log('shipPage');
        if (this.ss.aRules.consoleLogging.mode >= 2) {
          console.log(params);
        }
      }
      if (Object.keys(params).length === 0) {
        this.router.navigate(['/dashboard']);
      } else {
        this.id = params.id;
        if (this.ss.aRules.consoleLogging.mode >= 1) {
          console.log('shipID Set');
        }
        this.shipS.readShip(this.id).then(res => {
          if (this.ss.aRules.consoleLogging.mode >= 2) {
            console.log(res);
          }
          this.shipS.rsiP().then(rsiPRes => {
            this.shipS.setCargoCapacity();
            if (this.shipS.aShip.status === 'Idle') {
              this.colonyS.fcIDP(this.shipS.aShip.solarBody).then(
                (fcIDRes: any) => {
                  this.foundColony = true;
                  this.colonyS.readColony(this.colonyS.colonyID);
                },
                (fcIDErr: any) => {
                  this.foundColony = false;
                }
              );
            }
          });
          this.shipBootDone = Promise.resolve(true);
        });
        this.aUniverse = this.uniS.readUniverse();
      }
    });
    */
    this.id= this.shipS.id;
    if(!this.id){
      await this.router.navigate(['/dashboard']);
    }
    else{
      this.readShip();
      /*
      const loading = await this.loadingController.create({
        //cssClass: 'my-custom-class',
        message: 'Loading Ship',
        //duration: 2000
      });
      loading.present();

      this.shipS.rpShip().then(
        (aShip) => {
          this.aShip= aShip;
          console.log(aShip);

          this.shipS.rpSM().then(
            (aModules) => {
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('ShipPage: Read Ship Modules');
                if(this.ss.aRules.consoleLogging.mode >= 2){
                  console.log(aModules);
                }
              }
              this.aModules= aModules;
              this.shipS.rpSI().then(
                (aInventory) => {
                  if(this.ss.aRules.consoleLogging.mode >= 1){
                    console.log('ShipPage: Read INV');
                    if(this.ss.aRules.consoleLogging.mode >= 2){
                      console.log(aInventory);
                    }
                  }
                  this.aInventory= aInventory;
                  this.shipS.setCargoCapacity().then(
                    () => {
                      if(this.ss.aRules.consoleLogging.mode >= 1){
                        console.log('ShipPage: Capacity has been Set');
                        if(this.ss.aRules.consoleLogging.mode >= 2){
                          console.log(this.shipS.capacityAvailable);
                        }
                      }
                      this.invLoaded= true;
                    }
                  );
                }
              );
            }
          );

          if(this.shipS.aShip.status === 'Idle'){
            this.aUniverse = this.uniS.readUniverse();
            this.shipS.rslP(this.aShip.solarSystem, this.aShip.solarBody);

            this.uniS.rpSB(this.shipS.aShip.solarBody).then(
              (aSolarBody) => {
                //Found Solar Body
              }
            );

            this.uniS.rpSS(this.shipS.aShip.solarSystem).then(
              (aSolarSystem) => {
                //Found Solar System
              }
            );
            this.uniS.rsbCP(this.aShip.solarBody).then(
              (aColony) => {
                this.aColony= aColony;
                this.foundColony= true;
              },
              (noColony) => {
                this.foundColony= false;
              }
            );

            this.shipS.rpLW().then(
              (aWarehouse) => {
                if(this.ss.aRules.consoleLogging.mode >= 1){
                  console.log('Warehouse Found');
                }
                this.aWarehouse= aWarehouse;
                this.shipS.rpLWI().then(
                  (aWInventory) => {}
                );
                this.foundWarehouse= true;
              },
              (noWarehouse) => {
                if(this.ss.aRules.consoleLogging.mode >= 2){
                  console.log(noWarehouse);
                }
                this.foundWarehouse= false;
              }
            );
          }

          this.shipBootDone = Promise.resolve(true);

          loading.dismiss();
        },
        async (rspError) => {
          await this.router.navigate(['/dashboard']);
        }
      );
      */
      /*
      this.readShipP().then((res) => {
        this.shipBootDone = Promise.resolve(true);
        loading.dismiss();
      });
      */
    }
  }

  //C

  //region Read
  async readShip() {
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Loading Ship',
      //duration: 2000
    });
    await loading.present();

    this.shipS.rpShip().then(
      (aShip) => {
        /*
        this.aShip = aShip;
        this.shipS.rpSM().then(
          (aModules) => {
            if (this.ss.aRules.consoleLogging.mode >= 1) {
              console.log('ShipPage: Read Ship Modules');
              if (this.ss.aRules.consoleLogging.mode >= 2) {
                console.log(aModules);
              }
            }
            this.aModules = aModules;
            this.shipS.rpSI().then(
              (aInventory) => {
                if (this.ss.aRules.consoleLogging.mode >= 1) {
                  console.log('ShipPage: Read INV');
                  if (this.ss.aRules.consoleLogging.mode >= 2) {
                    console.log(aInventory);
                  }
                }
                this.aInventory = aInventory;
                this.shipS.setCargoCapacity().then(
                  () => {
                    if (this.ss.aRules.consoleLogging.mode >= 1) {
                      console.log('ShipPage: Capacity has been Set');
                      if (this.ss.aRules.consoleLogging.mode >= 2) {
                        console.log(this.shipS.capacityAvailable);
                      }
                    }
                    this.invLoaded = true;
                  }
                );
              }
            );
          }
        );

        this.shipS.rslP(this.aShip.solarSystem, this.aShip.solarBody);

        if (this.shipS.aShip.status !== 'Traveling') {
          this.aUniverse = this.uniS.readUniverse();


          this.uniS.rpSB(this.shipS.aShip.solarBody).then(
            (aSolarBody) => {
              //Found Solar Body
            }
          );

          this.uniS.rpSS(this.shipS.aShip.solarSystem).then(
            (aSolarSystem) => {
              //Found Solar System
            }
          );
          this.uniS.rsbCP(this.aShip.solarBody).then(
            (aColony) => {
              this.aColony = aColony;
              this.foundColony = true;
            },
            (noColony) => {
              this.foundColony = false;
            }
          );

          this.shipS.rpLW().then(
            (aWarehouse) => {
              if (this.ss.aRules.consoleLogging.mode >= 1) {
                console.log('Warehouse Found');
              }
              this.aWarehouse = aWarehouse;
              this.shipS.rpLWI().then(
                (aWInventory) => {
                }
              );
              this.foundWarehouse = true;
            },
            (noWarehouse) => {
              if (this.ss.aRules.consoleLogging.mode >= 2) {
                console.log(noWarehouse);
              }
              this.foundWarehouse = false;
            }
          );
        }

        this.shipBootDone = Promise.resolve(true);
        */

        this.shipBootDone = Promise.resolve(true);
        loading.dismiss();
      },
      async (rspError) => {
        await this.router.navigate(['/dashboard']);
      }
    );
  }
  //endregion

  //region Update
  async editNameAlert(){
    const editNameAlert = await this.ionAlert.create({
      cssClass: '',
      header: 'Edit Ship Name',
      subHeader: '',
      message: '',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Ship Name'
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
      this.afs.collection('servers/' + this.ss.activeServer + '/ships').doc(this.shipS.aShip.id).update({name: result});
    });
  }

  detachModule(aModule, aShip: Ship){
    //Check for Local Warehouse
    this.ws.fwIDP(aShip.solarBody, aShip.ownerID).then(
      (foundWarehouse) => {
        switch (aModule){
          case 'engine':
            aModule= this.ss.aaDefaultItems.engine;
            aModule.ownerID= this.ws.id;
            aModule.type= 'Prepared Module';
            aModule.quantity= 1;
            aModule.level= aShip.moduleEngineLevel;

            this.afs.collection('servers/' + this.ss.activeServer + '/ships/')
              .doc(aShip.id).update({moduleEngine: false});
            break;
          case 'jumpEngine':
            aModule= this.ss.aaDefaultItems.jumpEngine;
            aModule.ownerID= this.ws.id;
            aModule.type= 'Prepared Module';
            aModule.quantity= 1;
            aModule.level= aShip.moduleJumpEngineLevel;

            this.afs.collection('servers/' + this.ss.activeServer + '/ships/')
              .doc(aShip.id).update({moduleJumpEngine: false});
             break;
          case 'commandCenter':
            aModule= this.ss.aaDefaultItems.commandCenter;
            aModule.ownerID= this.ws.id;
            aModule.type= 'Prepared Module';
            aModule.quantity= 1;
            aModule.level= aShip.moduleCommandCenterLevel;

            this.afs.collection('servers/' + this.ss.activeServer + '/ships/')
              .doc(aShip.id).update({moduleCommandCenter: false});
            break;
          case 'miningLaser':
            aModule= this.ss.aaDefaultItems.miningLaser;
            aModule.ownerID= this.ws.id;
            aModule.type= 'Prepared Module';
            aModule.quantity= 1;
            aModule.level= aShip.moduleMiningLaserLevel;

            this.afs.collection('servers/' + this.ss.activeServer + '/ships/')
              .doc(aShip.id).update({moduleMiningLaser: false});
            break;
          default:
            aModule.ownerID= this.ws.id;
            aModule.type= 'Prepared Module';
            aModule.quantity= 1;
            //Remove item from Ship
            this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + aShip.id +'/installedModules')
              .doc(aModule.id).delete();
            break;
        }

        //Add Module to Warehouse
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
          .add(aModule).then(() => {
          this.gs.toastMessage('Module detached and moved to local warehouse', 'success');
        });

        this.afs.collection('servers/' + this.ss.activeServer + '/ships')
          .doc(aShip.id)
          .update(
            {
              moduleCount: +this.shipS.aShip.moduleCount - 1
            }
          );
      },
    )
      .catch((noWarehouse) => {
        this.gs.toastMessage('No Warehouse to Detach Module to', 'danger');
      });
  }

  attachModule(aModule){
    switch (aModule.name){
      case 'engine':
        if(this.shipS.aShip.moduleEngine){
          this.gs.toastMessage('Module is not stackable, and the ship has one already', 'danger');
        }
        else{
          this.afs.collection('servers/' + this.ss.activeServer + '/ships/')
            .doc(this.shipS.aShip.id)
            .update({
              moduleEngine: true,
              moduleEngineLevel: aModule.level
            });
        }
        break;
      case 'jumpEngine':
        if(this.shipS.aShip.moduleJumpEngine){
          this.gs.toastMessage('Module is not stackable, and the ship has one already', 'danger');
        }
        else{
          this.afs.collection('servers/' + this.ss.activeServer + '/ships/')
            .doc(this.shipS.aShip.id).update({
            moduleJumpEngine: true,
            moduleJumpEngineLevel: aModule.level
          });
        }
        break;
      case 'commandCenter':
        if(this.shipS.aShip.moduleCommandCenter){
          this.gs.toastMessage('Module is not stackable, and the ship has one already', 'danger');
        }
        else{
          this.afs.collection('servers/' + this.ss.activeServer + '/ships/')
            .doc(this.shipS.aShip.id)
            .update({
              moduleCommandCenter: true,
              moduleCommandCenterLevel: aModule.level
            });
        }
        break;
      case 'miningLaser':
        if(this.shipS.aShip.moduleMiningLaser){
          this.gs.toastMessage('Module is not stackable, and the ship has one already', 'danger');
        }
        else{
          this.afs.collection('servers/' + this.ss.activeServer + '/ships/')
            .doc(this.shipS.aShip.id).update({
            moduleMiningLaser: true,
            moduleMiningLaserLevel: aModule.level
          });
        }
        break;
      default:
        this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.shipS.aShip.id + '/installedModules')
          .add(aModule);
        break;
    }

    //region Adjust Inv Levels
    const cog= +aModule.cost / +aModule.quantity;
    aModule.quantity= +aModule.quantity - 1;
    aModule.cost= +aModule.quantity * +cog;

    if(aModule.quantity === 0){
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aModule.id).delete();
    }
    else{
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aModule.id)
        .update({quantity: aModule.quantity, cost: aModule.cost});
    }
    //endregion

    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.shipS.aShip.id)
      .update(
        {
          moduleCount: +this.shipS.aShip.moduleCount + 1
        }
      );
  }

  beginMining(aItem, aItemYield){
    this.shipS.aShip.command= 'mine';
    this.shipS.aShip.status= 'Mining';
    this.shipS.aShip.miningTarget= aItem;
    this.shipS.aShip.miningYield= aItemYield;
    this.shipS.aShip.miningEndTime= moment().add(15, 'minutes').valueOf();

    this.afs.collection('servers/' + this.ss.activeServer + '/ships').doc(this.shipS.aShip.id)
      .update(this.shipS.aShip);
  }

  cancelMining(){
    this.shipS.aShip.command= 'cancel';
    this.shipS.aShip.status= 'Idle';
    //this.shipS.aShip.miningTarget= 'none';
    //this.shipS.aShip.miningYield= aItemYield;

    this.afs.collection('servers/' + this.ss.activeServer + '/ships').doc(this.shipS.aShip.id)
      .update(this.shipS.aShip).then(() => {this.readShip();});
  }

  cancelOrders(){
    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.shipS.aShip.id)
      .update({orders: false});
  }
  //endregion

  //D

  readSSSolarBodies(aSolarSystem){
    //this.aSolarBodies= this.uniS.readSSSolarBodies(aSolarSystem.id);
    this.uniS.rpSSSolarBodies(aSolarSystem.id).then((aSolarBodies) => {
      this.aSolarBodies= aSolarBodies;
      this.aSolarBodies.sort((n1,n2) => {
        if (n1.name > n2.name) {
          return 1;
        }
        if (n1.name < n2.name) {
          return -1;
        }
        return 0;
        //this.aFilteredSolarBodies.sort
      });
    });
  }

  //region Travel
  calcSSTT(){//SolarSystemTravelTime
    const distance= Math.sqrt(
      Math.pow((this.aTravel.aSolarSystem.xCoordinate - this.shipS.aLocation.aSolarSystem.xCoordinate),2)
      +
      Math.pow((this.aTravel.aSolarSystem.yCoordinate - this.shipS.aLocation.aSolarSystem.yCoordinate),2)
    );

    //600000
    console.log('Travel Details');
    console.log(distance);
    console.log(this.ss.aRules.travel.solarSystem);
    console.log(this.shipS.aShip.moduleJumpEngineLevel);
    this.aTravel.ssTTms=
      ((distance * this.ss.aRules.travel.solarSystem) / this.shipS.aShip.moduleJumpEngineLevel)
      *
      (this.shipS.aModules.length / 4);
    this.aTravel.solarSystemTime= moment.utc(this.aTravel.ssTTms).format('HH:mm:ss');
  }
  calcSBTT(){//SolarBodyTravelTime
    let xStart: number;
    let yStart: number;
    if(this.shipS.aLocation.aSolarSystem.id === this.aTravel.aSolarSystem.id){
      xStart= this.shipS.aLocation.aSolarBody.xCoordinate;
      yStart= this.shipS.aLocation.aSolarBody.yCoordinate;
    }
    else{
      xStart= 0;
      yStart= 0;
    }
    console.log('SB Start');
    console.log(xStart +','+ yStart);

    if(this.ss.aRules.consoleLogging.mode >= 2){
      console.log(this.aLocation.aSolarSystem.id + '===' + this.aTravel.aSolarSystem.id);
      console.log(xStart + ',' + yStart);
    }

    const distance= Math.sqrt(
      Math.pow((this.aTravel.aSolarBody.xCoordinate - xStart),2)
      +
      Math.pow((this.aTravel.aSolarBody.yCoordinate - yStart),2)
    );
    //console.log(distance);//300000
    this.aTravel.sbTTms= (
      (distance * this.ss.aRules.travel.solarBody) / this.shipS.aShip.moduleEngineLevel)
      *
      (this.shipS.aModules.length / 4)
    ;
    this.aTravel.solarBodyTime= moment.utc(this.aTravel.sbTTms).format('HH:mm:ss');
  }
  calcTTT(mode?){
    let time: any;
    switch (mode){
      case 'arrivalTime':
        time=  moment
          .valueOf(
            moment()
              .add(this.aTravel.ssTTms + this.aTravel.sbTTms, 'milliseconds')
              .valueOf()
          )
          .format('HH:mm:ss');
        break;
      default:
        this.aTravel.totalTravelTime= moment.utc(
          this.aTravel.ssTTms
          +
          this.aTravel.sbTTms).format('HH:mm:ss');
        time= this.aTravel.totalTravelTime;
        break;
    }
    return time;
  }
  eta(timeStamp){
    return moment(timeStamp).format('MMM-DD-yyyy, HH:mm:ss');
  }
  travel(){
    const arrivalTime= moment().add( +this.aTravel.ssTTms + +this.aTravel.sbTTms, 'milliseconds')
      .valueOf();
    //console.log(arrivalTime);
    const aShip= {
      status: 'Traveling',
      travelSS: this.aTravel.aSolarSystem.name,
      travelSB: this.aTravel.aSolarBody.name,
      travelSSID: this.aTravel.aSolarSystem.id,
      travelSBID: this.aTravel.aSolarBody.id,
      travelAT: arrivalTime,
    };

    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.shipS.aShip.id)
      .update(Object.assign({}, aShip));
    //this.traveling.emit(null);
    //this.colonyS.colonySub.unsubscribe();
    //this.colonyS.aColony= '';
    //this.colonyS.aSolarSystem= '';
    //this.colonyS.aSolarBody= '';
    //this.colonyS.rCSSSub.unsubscribe();
    //this.colonyS.rCSBSub.unsubscribe();
  }
  //endregion

  dismissModal() {
    //this.shipS.aShip= undefined;
    //this.shipS.shipSub.unsubscribe();//Stopped working after turning the call into a promise.
    this.modal.dismiss('cancel');
  }

  async viewColony(){
    const colonyModal = await this.modalController.create({
      component: ColonyModalPage,
      componentProps: {
        id: this.shipS.aShip.solarBodyID,
        trading: true,
        trader: 'ship',
        traderID: this.shipS.aShip.id
      },
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await colonyModal.present();
  }

  async viewOrders(){
    const colonyModal = await this.modalController.create({
      component: ShipOrdersModalPage,
      componentProps: {
      },
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await colonyModal.present();
  }

  //region Other
  async viewWarehouse(){
    const warehouseModal = await this.modalController.create({
      component: ModalPage,
      componentProps: {
        viewer:'ship',
        modalType: 'warehouse',
        trading: true,
        trader: 'ship'
      },
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await warehouseModal.present();
  }

  ngOnDestroy() {
    this.shipS.aTravel= {
      aSolarSystem: new SolarSystem(),
      ssTTms: 0,
      solarSystemTime: '00:00:00',
      //currentDate: this.currentDate,
      aSolarBody: new SolarBody(),
      sbTTms: 0,
      solarBodyTime: '00:00:00',
      totalTravelTime: '00:00:00',
    };
    this.shipS.subscriptions.some((subscription) => {
      subscription.unsubscribe();
    });
  }
  //endregion
}
