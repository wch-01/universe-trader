import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../server/server.service';
import {Colony, SolarBody, SolarSystem} from '../../classes/universe';
import {UniverseService} from '../universe/universe.service';
import {ColonyService} from '../colony/colony.service';
import {Ship} from '../../classes/ship';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';
import {Item} from '../../classes/item';
import {WarehouseService} from '../warehouse/warehouse.service';

// @ts-ignore
const moment= require('moment');

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  //region Variables
  id: string;
  aShip;
  aColony;
  // aaInventory= []; //{ [key: string]: Item } = {};
  aaInventory: { [key: string]: Item } = {};
  aInventory: any;

  shipSub;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody(),
    aColony: new Colony()
  };
  capacityAvailable= 0;

  aModules;
  aaModules: { [key: string]: Item } = {};

  //region Warehouse
  aWarehouse;
  aWInventory;
  aaWInventory= [];
  wCapacityAvailable= 0;
  //endregion

  subscriptions: Subscription[] = [];

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
  aFilteredUniverse: any;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    private us: UniverseService,
    public colonyS: ColonyService,
    public uniS: UniverseService,
    private warehouseS: WarehouseService
  ) { }
  //endregion

  //c

  //region Read
  /**
   * Name: Read Ship Promise
   * */
  rpShip(){
    return new Promise((resolve, reject) => {
      const shipSub= this.afs.collection('servers/' + this.ss.activeServer + '/ships')
        .doc(this.id).valueChanges({idField:'id'})
        .subscribe((aShip: Ship)=>{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('shipService: rpShip');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aShip);
            }
          }
          this.aShip= aShip;

          Promise.all([
            this.rslP(this.aShip.solarSystem, this.aShip.solarBody),
            this.rpSM(),
            this.rpSI(),
            this.warehouseS.fwIDP(this.aShip.solarBody, this.aShip.ownerID)
          ])
            .then(() => {
              this.warehouseS.rpWI().then(() => {
                if (this.aShip.status !== 'Traveling') {
                  Promise.all([
                    this.uniS.rpSolarSystems(),
                    this.uniS.rpSB(this.aShip.solarBody),
                    this.uniS.rpSS(this.aShip.solarSystem)
                  ])
                    .then(() => {
                      this.aUniverse= this.uniS.aSolarSystems;
                      this.aUniverse.sort((n1,n2) => {
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

                  this.uniS.rsbCP(this.aShip.solarBody).then(
                    (aColony) => {
                      this.aColony = aColony;
                    },
                    (noColony) => {
                      this.aColony= undefined;
                    }
                  );

                  this.rpLW().then(
                    (aWarehouse) => {
                      this.aWarehouse= aWarehouse;
                      this.rpLWI();
                    },
                    (noWarehouse) => {
                      this.aWarehouse= undefined;
                    }
                  );
                }
                this.subscriptions.push(shipSub);
                //this.shipBootDone = Promise.resolve(true);
                resolve(aShip);
              });
            });
        });
    });
  }

  /**
   * Read Ship Modules
   * */
  rpSM(){
    return new Promise((resolve, reject) => {
      const moduleSub= this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.id + '/installedModules')
        .valueChanges({idField:'id'})
        .subscribe((aModules: any)=>{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('shipService: rpSM');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aModules);
            }
          }
          this.aModules= aModules;
          this.setCargoCapacity();
          aModules.some((aModule: any) => {
            /*
            if(aModule.name === 'jumpEngine'){
              this.aShip.jumpEngine= aModule.level;
            }
            if(aModule.name === 'engine'){
              this.aShip.engine= aModule.level;
            }
            */
            this.aaModules[aModule.itemID]= aModule;
          });
          this.subscriptions.push(moduleSub);
          resolve(aModules);
        });
    });
  }

  /**
   * Read Subscription Ship Modules
   * */
  rsSM(){
    return this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.id + '/installedModules').valueChanges({idField:'id'});
  }

  /**
   * Name: Local Warehouse
   *
   * @return Promise
   * */
  rpLW(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('ship-warehouse: getWarehouse');
    }
    return new Promise((resolve, reject) => {
      const rpLWSub= this.afs.collection('servers/' + this.ss.activeServer + '/warehouses',
        ref =>
          ref.where('solarBody', '==', this.aShip.solarBody).where('ownerID', '==', this.aShip.ownerID)
      ).valueChanges({idField:'id'})
        .pipe(take(1))
        .subscribe((aWarehouse: any) => {
          if(aWarehouse.length > 0){
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aWarehouse);
            }
            this.aWarehouse= aWarehouse[0];
            this.subscriptions.push(rpLWSub);
            resolve(aWarehouse[0]);
          }
          else{
            this.subscriptions.push(rpLWSub);
            reject('No Warehouse Found');
          }
        });
    });
  }

  /**
   * Name: Local Warehouse Inventory
   *
   * @return Promise
   * */
  rpLWI(){
    return new Promise((resolve, reject) => {
      const lwiSub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', this.aWarehouse.id)//.where('market', '==', true)
        // .where('type', '!=', 'preparedModule')// Adding this requires an index
      ).valueChanges({idField: 'id'})
        .subscribe((aInventory: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('warehouseService: rwiP');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aInventory);
            }
          }
          this.aWInventory= aInventory;
          this.setWCargoCapacity();

          this.aaWInventory= [];
          aInventory.some((item: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(item);
            }
            this.aaWInventory[item.name]= item;
          });
          this.subscriptions.push(lwiSub);
          resolve(true);
        });
    });
  }

  /**
   * Name: Read a Default Ship
   * */
  rpDSOld(shipName){
    return new Promise((resolve, reject) => {
      let shipCollection;
      let shipModulesCollection;
      let shipModuleSlotsCollection;
      switch (shipName){
        case 'starting':
          shipCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/').doc('ship');
          shipModulesCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/ship/installedModules')
            .valueChanges();
          shipModuleSlotsCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/ship/moduleSlots')
            .valueChanges();
          break;
        default:
          shipCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zShips/').doc(shipName);
          shipModulesCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zShips/' + shipName + '/installedModules')
            .valueChanges();
          shipModuleSlotsCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zShips/' + shipName + '/moduleSlots')
            .valueChanges();
          break;
      }

      resolve({sc: shipCollection, smc: shipModulesCollection, smsC: shipModuleSlotsCollection});
    });
  }

  rpDS(shipName){
    return new Promise((resolve, reject) => {
      let shipCollection;
      let shipModulesCollection;
      let shipModuleSlotsCollection;
      switch (shipName){
        case 'starting':
          shipCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/').doc('ship').valueChanges();
          shipModulesCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/ship/installedModules')
            .valueChanges();
          shipModuleSlotsCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/ship/moduleSlots')
            .valueChanges();
          break;
        default:
          shipCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zShips/').doc(shipName).valueChanges();
          shipModulesCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zShips/' + shipName + '/installedModules')
            .valueChanges();
          shipModuleSlotsCollection= this.afs.collection('servers/' + this.ss.activeServer + '/zShips/' + shipName + '/moduleSlots')
            .valueChanges();
          break;
      }

      shipCollection.subscribe((aShip: any) => {
        shipModulesCollection.subscribe((aModules: any) => {
          shipModuleSlotsCollection.subscribe((aModuleSlots: any) => {
            resolve({aShip, aModules, aModuleSlots});
          });
        });
      });
    });
  }

  //Read Ship Location Promise
  rslP(solarSystemID, solarBodyID){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('shipService: rslP');
    }
    return new Promise((resolve, reject) => {
      this.us.rpSS(solarSystemID).then((rssRes: any) => {
        this.us.rpSB(solarBodyID).then((rsbP: any) => {
          this.aLocation.aSolarSystem= this.us.aSolarSystem;
          this.aLocation.aSolarBody= this.us.aSolarBody;
          resolve(true);
        });
      });
    });
  }

  /**
   * Name: Read Ship Inventory
   *
   * @return: Promise
   * */
  rpSI(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('shipService: rsiP');
    }
    return new Promise((resolve, reject) => {
      const rpSISub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', this.aShip.id)
      ).valueChanges({idField: 'id'})
        .subscribe((aInventory: any) => {
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
            //this.aaInventory[item.itemID]= item;

            if(item.type === 'Prepared Module'){
              item.reference.type= 'Prepared Module';
              this.aaInventory[item.itemID+'_pm']= item;
              this.aaInventory[item.itemID+'_pm'].reference.type= 'Prepared Module';
            }
            else{
              this.aaInventory[item.itemID]= item;
            }
          });
          this.subscriptions.push(rpSISub);
          this.setCargoCapacity().then(() => {
            resolve(aInventory);
          });
        });
    });
  }

  /**
   * Name: Read Subscription Ship Inventory
   * */
  rsSI(){
    //todo convert to promise
    return this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
      ref =>
        ref.where('ownerID', '==', this.aShip.id)
    ).valueChanges({idField:'id'});
  }

  async readShip(id?){
    if(!id){id= this.id;}

    return await new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/ships')
        .doc(id).valueChanges({idField:'id'})
        .subscribe(ship=>{
          this.aShip= ship;
          this.rslP(this.aShip.solarSystem, this.aShip.solarBody).then((rslP: any) => {
            resolve(this.aShip);
          });
        });
    });
  }

  rpShipOld(id?){
    if(!id){id= this.id;}

    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/ships')
        .doc(id).valueChanges({idField:'id'})
        .subscribe(ship=>{
          this.aShip= ship;
          this.rslP(this.aShip.solarSystem, this.aShip.solarBody).then((rslP: any) => {
            resolve(this.aShip);
          });
        });
    });
  }
  //endregion

  //region Update
  //endregion

  //region Delete
  //endregion

  //region Other
  setCargoCapacity(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('shipService: setCargoCapacity');
    }
    return new Promise((resolve, reject) => {
      if(this.aInventory){
        let capacityTotal= 0;
        let capacityUsed= 0;
        this.capacityAvailable= 0;

        const pCapUsed= new Promise((cuResolve, cuReject) => {
          const rpCargoModules= new Promise((cmResolve, cmReject) => {
            /*
            this.aShip.installedModules.some(module =>{
              if(module.name === 'cargo'){
                capacityTotal= +capacityTotal + (module.level * this.ss.aaDefaultItems.cargo.capacity);
              }
            });
            */

            for(const module of this.aModules){
              if(module.itemID === 'preparedCargoModule'){
                capacityTotal= +capacityTotal + (module.level * this.ss.aRules.storage.cargoModule);
              }
            }
            cmResolve(true);
          });

          rpCargoModules.then(
            (success) => {
              /*
              this.aInventory.some(inventoryItem =>{
                console.log('Cap');
                console.log(inventoryItem);
                capacityUsed= +capacityUsed + +inventoryItem.quantity;
              });
              */

              for(const aItem of this.aInventory){
                capacityUsed= +capacityUsed + +aItem.quantity;
              }
              cuResolve(true);
            }
          );
        });

        pCapUsed.then(
          (cuSuccess) => {
            this.capacityAvailable= +capacityTotal - +capacityUsed;
            resolve(true);
          }
        );
      }
    });
  }

  setWCargoCapacity(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('shipService: setWCargoCapacity');
    }
    return new Promise((resolve, reject) => {
      const capacityTotal= +this.aWarehouse.level * this.ss.aRules.storage.warehouse;
      let capacityUsed= 0;
      this.wCapacityAvailable= 0;
      this.aWInventory.some(inventoryItem =>{
        capacityUsed= +capacityUsed + +inventoryItem.quantity;
      });
      this.wCapacityAvailable= +capacityTotal - +capacityUsed;
      resolve(true);
    });
  }

  //region Travel
  calcSSTT(){//SolarSystemTravelTime
    const distance= Math.floor(Math.sqrt(
      Math.floor(Math.pow((this.aTravel.aSolarSystem.xCoordinate - this.aLocation.aSolarSystem.xCoordinate),2))
         +
         Math.floor(Math.pow((this.aTravel.aSolarSystem.yCoordinate - this.aLocation.aSolarSystem.yCoordinate),2))
    ));
    this.aTravel.ssTTms=
      ((distance * this.ss.aRules.travel.solarSystem) / this.aaModules.preparedJumpEngineModule.level)
      *
      (this.aModules.length / 4);
    this.aTravel.solarSystemTime= moment.utc(this.aTravel.ssTTms).format('HH:mm:ss');

    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('calcSSTT');
      if(this.ss.aRules.consoleLogging.mode >= 2){
        console.log('SS');
        console.log(this.aTravel.aSolarSystem);
        console.log(this.aLocation.aSolarSystem);

        console.log('Distance');
        console.log(distance);
        console.log('SS Rule');
        console.log(this.ss.aRules.travel.solarSystem);
        console.log('Jump Engine');
        console.log(this.aShip.moduleJumpEngineLevel);
        console.log('modules');
        console.log(this.aModules.length);

        console.log('ssTTms');
        console.log(this.aTravel.ssTTms);
        console.log('SS Time');
        console.log(this.aTravel.solarSystemTime);
      }
    }
  }
  calcSBTT(){//SolarBodyTravelTime
    let xStart: number;
    let yStart: number;
    if(this.aLocation.aSolarSystem.id === this.aTravel.aSolarSystem.id){
      xStart= this.aLocation.aSolarBody.xCoordinate;
      yStart= this.aLocation.aSolarBody.yCoordinate;
    }
    else{
      xStart= 0;
      yStart= 0;
    }

    if(this.ss.aRules.consoleLogging.mode >= 2){
      console.log(this.aLocation.aSolarSystem.id + '===' + this.aTravel.aSolarSystem.id);
      console.log(xStart + ',' + yStart);
    }

    const distance= Math.floor(Math.sqrt(
      Math.floor(Math.pow((this.aTravel.aSolarBody.xCoordinate - xStart),2))
         +
         Math.floor(Math.pow((this.aTravel.aSolarBody.yCoordinate - yStart),2))
    ));
    //console.log(distance);//300000
    this.aTravel.sbTTms= (
        (distance * this.ss.aRules.travel.solarBody) / this.aaModules.preparedEngineModule.level)
      *
      (this.aModules.length / 4)
    ;
    this.aTravel.solarBodyTime= moment.utc(this.aTravel.sbTTms).format('HH:mm:ss');

    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('calcSSTT');
      if(this.ss.aRules.consoleLogging.mode >= 2){
        console.log('Distance');
        console.log(distance);
        console.log('SB');
        console.log(this.aTravel.aSolarBody);
        console.log(this.aLocation.aSolarBody);
        console.log('sbTTms');
        console.log(this.aTravel.sbTTms);
        console.log('Sb Time');
        console.log(this.aTravel.solarBodyTime);
      }
    }
  }
  calcTTT(mode?){
    let time: any;
    switch (mode){
      case 'arrivalTime':
        time=  moment(moment().add(this.aTravel.ssTTms + this.aTravel.sbTTms, 'milliseconds').valueOf()).format('MMM-DD-yyyy, HH:mm:ss');
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
      travelStartTime: moment().valueOf(),
      travelSS: this.aTravel.aSolarSystem.name,
      travelSB: this.aTravel.aSolarBody.name,
      travelSSID: this.aTravel.aSolarSystem.id,
      travelSBID: this.aTravel.aSolarBody.id,
      travelAT: arrivalTime,
    };

    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.aShip.id)
      .update(Object.assign({}, aShip));
  }
  //endregion
  //endregion
}
