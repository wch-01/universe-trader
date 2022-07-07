import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  //region Variables
  warehouseSub;
  inventorySub;
  id;
  aWarehouse;
  aInventory= [];
  aaInventory= [];
  aMarketInventory= [];
  capacityAvailable= 0;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
  ) { }
  //endregion

  //c

  //region Read
  /**
   * Name: Find Warehouse ID by SolarBodyID
   *
   * @return: Promise
   * */
  fwIDP(solarBodyID, ownerID){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('warehouseService: fwIDP');
      if(this.ss.aRules.consoleLogging.mode >= 2){
        console.log(solarBodyID);
        console.log(ownerID);
      }
    }
    return new Promise((resolve, reject) => {
      this.warehouseSub= this.afs.collection('servers/' + this.ss.activeServer + '/warehouses',
        ref =>
          ref.where('solarBody', '==', solarBodyID).where('ownerID', '==', ownerID)
      ).valueChanges({idField:'id'})
        .subscribe((aWarehouses: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Warehouses');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aWarehouses);
            }
          }
          if(aWarehouses.length > 0){
            this.id= aWarehouses[0].id;
            resolve(true);
          }
          else{
            reject('No Warehouse Found');
          }
        });
    });
  }

  readWarehouse(id){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('warehouseService: readWarehouse');
    }

    return new Promise((resolve, reject) => {
      this.warehouseSub= this.afs.collection('servers/' + this.ss.activeServer + '/warehouses').doc(id).valueChanges({idField:'id'})
        .subscribe((aWarehouse: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aWarehouse);
          }
          this.aWarehouse= aWarehouse;
          resolve(true);
        });
    });
  }

  rpLocalShips(){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/ships',
        ref =>
          ref.where('ownerID', '==', this.aWarehouse.ownerID)
            .where('solarSystem', '==', this.aWarehouse.solarSystem)
            .where('solarBody', '==', this.aWarehouse.solarBody)
      ).valueChanges({idField: 'id'})
        .subscribe((aShips: any) => {
          resolve(aShips);
        });
    });
  }

  /**
   * Name: Warehouse Inventory
   */
  rwiP(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('warehouseService: rwiP');
    }
    return new Promise((resolve, reject) => {
      this.inventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
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
          this.aInventory= aInventory;

          this.aaInventory= [];
          aInventory.some((item: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(item);
            }
            if(item.type === 'Prepared Module'){
              this.aaInventory[item.name+'_pm']= item;
            }
            else{
              this.aaInventory[item.name]= item;
            }
          });
          resolve(true);
        });
    });
  }
  //endregion

  //u

  //d

  setCargoCapacity(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('warehouseService: setCargoCapacity');
    }
    return new Promise((resolve, reject) => {
      if(this.ss.aRules.consoleLogging.mode >= 2){
        console.log(this.ss.aRules.storage.warehouse);
      }
      const capacityTotal= +this.aWarehouse.level * this.ss.aRules.storage.warehouse;
      let capacityUsed= 0;
      this.capacityAvailable= 0;
      this.aInventory.some(inventoryItem =>{
        if(this.ss.aRules.consoleLogging.mode >= 2){
          console.log(inventoryItem);
        }
        capacityUsed= +capacityUsed + +inventoryItem.quantity;
      });
      this.capacityAvailable= +capacityTotal - +capacityUsed;
      resolve(true);
    });
  }

  logoutWarehouse(){
    if(this.aInventory.length > 0){
      this.inventorySub.unsubscribe();
    }
    if(this.aWarehouse){
      this.warehouseSub.unsubscribe();
    }
    this.id= undefined;
    this.aWarehouse= undefined;
    this.aInventory= [];
    this.aaInventory= [];
    this.aMarketInventory= [];
    this.capacityAvailable= 0;
  }
}
