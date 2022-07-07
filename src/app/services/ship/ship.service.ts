import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../server/server.service';
import {Colony, SolarBody, SolarSystem} from '../../classes/universe';
import {UniverseService} from '../universe/universe.service';
import {ColonyService} from '../colony/colony.service';
import {Ship} from '../../classes/ship';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  //region Variables
  id: string;
  aShip;
  aColony;
  aaInventory= [];
  aInventory: any;

  shipSub;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody(),
    aColony: new Colony()
  };
  capacityAvailable= 0;

  aModules;
  aaModules= [];

  //region Warehouse
  aWarehouse;
  aWInventory;
  aaWInventory= [];
  wCapacityAvailable= 0;
  //endregion

  subscriptions: Subscription[] = [];
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    private us: UniverseService,
    public colonyS: ColonyService,
  ) { }
  //endregion

  //c

  //region Read
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
          this.setCargoCapacity();
          this.subscriptions.push(shipSub);
          //this.shipBootDone = Promise.resolve(true);
          resolve(aShip);
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
            if(aModule.name === 'jumpEngine'){
              this.aShip.jumpEngine= aModule.level;
            }
            if(aModule.name === 'engine'){
              this.aShip.engine= aModule.level;
            }
            this.aaModules[aModule.name]= aModule;
          });
          this.subscriptions.push(moduleSub);
          //this.shipBootDone = Promise.resolve(true);
          resolve(aModules);
        });
    });
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
      this.afs.collection('servers/' + this.ss.activeServer + '/warehouses',
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
            resolve(aWarehouse[0]);
          }
          else{
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
  //endregion

  //u
  //d

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

  //Read Ship Location Promise
  rslP(solarSystemID, solarBodyID){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('shipService: rslP');
    }
    return new Promise((resolve, reject) => {
      this.us.rssP(solarSystemID).then((rssRes: any) => {
        this.us.rsbP(solarBodyID).then((rsbP: any) => {
          this.colonyS.rCsbID(solarBodyID).then(
            rCsbIDRes => {
              this.aLocation.aColony= this.colonyS.aColony;
            },
            rCsbIDErr => {
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('shipService: rslP');
                if(this.ss.aRules.consoleLogging.mode >= 2){
                  console.log(rCsbIDErr.message());
                }
              }
              this.aLocation.aColony= undefined;
            }
          );
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
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', this.aShip.id)//.where('market', '==', true)
      ).valueChanges({idField: 'id'})
        .subscribe((aInventory: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('shipService: Sub');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aInventory);
            }
          }
          this.aInventory= aInventory;
          this.setCargoCapacity();
          this.aaInventory= [];
          aInventory.some((item: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(item);
            }
            this.aaInventory[item.name]= item;
          });
          resolve(aInventory);
        });
    });
  }

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
              if(module.name === 'cargo'){
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
              console.log(capacityTotal);

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
        console.log('Cap');
        console.log(inventoryItem);
        capacityUsed= +capacityUsed + +inventoryItem.quantity;
      });
      this.wCapacityAvailable= +capacityTotal - +capacityUsed;
      resolve(true);
    });
  }
}
