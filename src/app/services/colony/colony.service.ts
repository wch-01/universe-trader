import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ColonyService {
  //region Variables
  colonyID;
  colonySub;
  aColony;
  inventorySub;
  aInventory= [];
  marketInventorySub;
  aMarketInventory= [];
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
  ) { }
  //endregion

  /**
   * Name: Find Colony ID by SolarBodyID
   *
   * @return: Promise
   * */
  fcIDP(solarBodyID){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe',
        ref =>
          ref.where('solarBodyID', '==', solarBodyID).where('type', '==', 'colony')
      ).valueChanges({idField:'id'})
        .subscribe((aColonies: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Colony');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aColonies);
            }
          }
          this.colonyID= aColonies[0].id;
          resolve(true);
        });
    });
  }

  readColony(id){
    return new Promise((resolve, reject) => {
      this.colonySub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(id).valueChanges({idField:'id'})
        .subscribe((aColony: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('colonyService: readColony');
          }
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aColony);
          }
          this.aColony= aColony;
          resolve(true);
        });
    });
  }

  //readColonyInventoryPromise
  rciP(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('colonyService: Get Inv');
    }
    return new Promise((resolve, reject) => {
      this.inventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', this.aColony.id)//.where('market', '==', true)
      ).valueChanges({idField: 'id'})
        .subscribe((aInventory: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('colonyService: rciP');
          }
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aInventory);
          }
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

  readColonyMarketInventory(){
    return new Promise((resolve, reject) => {
      this.marketInventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', this.aColony.id).where('market', '==', true)
        ).valueChanges({idField: 'id'})
        .subscribe((aMarketInventory: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('colonyService: Inventory');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aMarketInventory);
            }
          }
          this.aMarketInventory= aMarketInventory;
          /*
          aMarketInventory.some((item: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(item);
            }
            this.aMarketInventory[item.name]= item;
          });
          */
          resolve(true);
        });
    });
  }

  readColonyInventory(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('colonyService: Get Inv');
    }
    return this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
      ref =>
        ref.where('ownerID', '==', this.aColony.id)//.where('market', '==', true)
    ).valueChanges({idField: 'id'})
      .pipe(
        tap((aInventory: any) =>{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('colonyService: Inventory');
          }
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aInventory);
          }
          aInventory.some((item: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(item);
            }
            this.aInventory[item.name]= item;
          });
        })
      );
  }

  logoutColony(){
    this.colonyID= undefined;
    if(this.aColony){
      this.colonySub.unsubscribe();
    }
    this.aColony= undefined;
    if(this.aInventory.length > 0){
      this.inventorySub.unsubscribe();
    }
    this.aInventory= [];
    if(this.aMarketInventory.length > 0){
      this.marketInventorySub.unsubscribe();
    }
    this.aMarketInventory= [];
  }
}
