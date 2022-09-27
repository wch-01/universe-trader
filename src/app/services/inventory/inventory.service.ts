import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Item} from '../../classes/item';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
  ) { }

  /**
   * Name: Read Station Inventory
   *
   * @return: Promise
   * */
  rpSI(ownerID){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('shipService: rsiP');
    }
    return this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', ownerID)
      ).valueChanges({idField: 'id'});
  }

  //region Update
  /**
   * Name: Update Promise Remove Inventory
   * */
  upUI(cog: number, amount: number, aItem: Item, operation: string){
    return new Promise((resolve, reject) => {
      if(operation === '-'){
        aItem.quantity= +aItem.quantity - +amount;
      }
      else{
        aItem.quantity= +aItem.quantity + +amount;
      }
      aItem.cost= +aItem.quantity * +cog;

      if(aItem.quantity === 0){
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete().then(() => {});
      }
      else{
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
          .update({quantity: aItem.quantity, cost: aItem.cost}).then(() => {});
      }
    });
  }

  /**
   * Name: Update Promise Add Inventory
   * */
  upAI(aItem){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
        .add(aItem).then(() => {
          resolve(true);
      });
    });
  }
  //endregion
}
