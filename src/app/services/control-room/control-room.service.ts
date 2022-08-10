import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ControlRoomService {
  //region Variables
  warehouseSub;
  warehouseID;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
  ) { }
  //endregion

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
          if(aWarehouses.length > 0){
            this.warehouseID= aWarehouses[0].id;
            resolve(true);
          }
          else{
            reject('No Warehouse Found');
          }
        });
    });
  }

  /**
   * Name: Find Warehouse ID by SolarBodyID
   *
   * @return: Promise
   * */
  rp(solarBodyID, ownerID){
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
          if(aWarehouses.length > 0){
            this.warehouseID= aWarehouses[0].id;
            resolve(true);
          }
          else{
            reject('No Warehouse Found');
          }
        });
    });
  }
  //endregion
}
