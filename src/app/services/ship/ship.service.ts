import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../server/server.service';
import {Colony, SolarBody, SolarSystem} from '../../classes/universe';
import {UniverseService} from '../universe/universe.service';
import {ColonyService} from '../colony/colony.service';

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  //region Variables
  shipID: string;
  aShip;
  aRawInventory: any;
  aInventory= [];
  shipSub;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody(),
    aColony: new Colony()
  };
  capacityAvailable= 0;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    private us: UniverseService,
    public colonyS: ColonyService,
  ) { }
  //endregion

  async readShip(id?){
    if(!id){id= this.shipID;}

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

  rpShip(id?){
    if(!id){id= this.shipID;}

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
  rsiP(){
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
          this.aRawInventory= aInventory;
          aInventory.some((item: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(item);
            }
            this.aInventory[item.name]= item;
          });
          resolve(true);
        });
    });
  }

  setCargoCapacity(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('setCargoCapacity');
    }
    return new Promise((resolve, reject) => {
      let capacityTotal= 0;
      let capacityUsed= 0;
      this.capacityAvailable= 0;
      this.aShip.installedModules.some(module =>{
        if(module.name === 'cargo'){
          capacityTotal= +capacityTotal + (module.level * this.ss.aaDefaultItems.cargo.capacity);
        }
      });
      this.aRawInventory.some(inventoryItem =>{
        console.log('Cap');
        console.log(inventoryItem);
        capacityUsed= +capacityUsed + +inventoryItem.quantity;
      });
      this.capacityAvailable= +capacityTotal - +capacityUsed;
      resolve(true);
    });
  }
}
