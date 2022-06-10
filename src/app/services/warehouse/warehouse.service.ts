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

  /**
   * Name: Find Warehouse ID by SolarBodyID
   *
   * @return: Promise
   * */
  fwIDP(solarBodyID, ownerID){
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
          this.id= aWarehouses[0].id;
          resolve(true);
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

  //readWarehouseInventoryPromise
  rwiP(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('warehouseService: rwiP');
    }
    return new Promise((resolve, reject) => {
      this.inventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', this.aWarehouse.id)//.where('market', '==', true)
      ).valueChanges({idField: 'id'})
        .subscribe((aInventory: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('warehouseService: rwiP');
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
          resolve(true);
        });
    });
  }

  setCargoCapacity(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('warehouseService: setCargoCapacity');
    }
    return new Promise((resolve, reject) => {
      const capacityTotal= +this.aWarehouse.size * 1000;
      let capacityUsed= 0;
      this.capacityAvailable= 0;
      this.aInventory.some(inventoryItem =>{
        console.log('Cap');
        console.log(inventoryItem);
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
