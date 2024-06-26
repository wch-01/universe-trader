import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {tap} from 'rxjs/operators';
import {Colony, SolarBody} from '../../classes/universe';

@Injectable({
  providedIn: 'root'
})
export class ColonyService {
  //region Variables
  id;
  colonyID;
  colonySub;
  rCSBSub;
  rCSSSub;
  aColony= new Colony();
  inventorySub;
  aInventory= [];
  marketInventorySub;
  aMarketInventory= [];
  aSolarSystem;
  aSolarBody;

  //region Table Variables
  aColoniesTableColumns= [
    /*
    {
      label: 'ID',
      filter: 'id'
    },
    */
    {
      label: 'Name',
      filter: 'name'
    },
    {
      label: 'Population',
      filter: 'population'
    },
    {
      label: 'Primary Export',
      filter: 'resourceOne'
    },
    {
      label: 'Secondary Export',
      filter: 'resourceTwo'
    }
  ];
  aColoniesFilters= {
    /*
    id: '',
    */
    name: '',
    population: '',
    resourceOne: '',
    resourceTwo: ''
  };
  //endregion
  aInventoryColumns= [
    /*
    {
      label: 'ID',
      filter: 'id'
    },
    */
    {
      label: 'Name',
      filter: 'name',
    },
    /*
    {
      label: 'Owner ID',
      filter: 'ownerID',
    },
    */
    {
      label: 'Quantity',
      filter: 'quantity',
    },
    {
      label: 'COG',
      filter: 'cog',
    },
    {
      label: 'Demand %',
      filter: 'demand',
    },
    {
      label: 'Sells For',
      filter: 'listPrice',
    },
    {
      label: 'Buys For',
      filter: 'buyPrice',
    }
  ];
  aInventoryFilters= {
    /*
    id: '',
    */
    name: '',
    quantity: '',
    cog: '',
    //demand: ''
  };

  //region Colony Solar System
  aSSTableColumns= [
    {
      label: 'Name',
      filter: 'name'
    },
    {
      label: 'Coordinates',
      filter: 'coordinates'
    },
    {
      label: 'Solar Yield %',
      filter: 'solarYield'
    }
  ];
  //endregion

  //region Colony Solar Body
  aSBTableColumns= [
    {
      label: 'Name',
      filter: 'name'
    },
    {
      label: 'Coordinates',
      filter: 'coordinates'
    },
    {
      label: 'Primary Resource',
      filter: 'resourceOne'
    },
    {
      label: 'Secondary Resource',
      filter: 'resourceTwo'
    }
  ];
  //endregion
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
  ) { }
  //endregion

  //region Read
  /**
   * Name: Colony
   *
   * @return: Promise
   * */
  rpColony(solarBodyID){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('colonyService: rpColony');
    }
    return new Promise((resolve, reject) => {
      this.colonySub= this.afs.collection('servers/' + this.ss.activeServer + '/universe')
        .doc(solarBodyID).valueChanges()
        .subscribe((aColony: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aColony);
          }
          if(aColony.name){
            this.aColony= aColony;
            resolve(aColony);
          }
          else{
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('colonyService->rpColony: Rejecting');
            }
            reject('cols->rpColony: No Colony Found');
          }
        });
    });
  }

  /**
   * Name: Read Colony by SolarBodyID
   *
   * @return: Promise
   * */
  rCsbID(solarBodyID){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe',
        ref =>
          ref.where('solarBodyID', '==', solarBodyID).where('type', '==', 'colony')
      ).valueChanges({idField:'id'})
        .subscribe((aColonies: any) => {
          if(aColonies.length > 0){
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('ColonyService: Colony');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aColonies);
              }
            }
            this.aColony= aColonies[0];
            resolve(true);
          }
          else{
            reject('cols->rCsbID: No colony found');
          }
        });
    });
  }
  //endregion

  /**
   * Name: Find Colony ID by SolarBodyID
   *
   * @return: Promise
   * */
  fcIDP(solarBodyID){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe')
        .doc(solarBodyID)
        .valueChanges({idField:'id'})
        .subscribe((aSolarBody: SolarBody) => {
          if(aSolarBody.colony === true){
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('ColonyService: Colony');
            }
            this.aColony.population= aSolarBody.colonyPopulation;
            resolve(true);
          }
          else{
            reject('cols->fcIDP: No colony found');
          }
        });
    });
  }
  fcIDPOrig(solarBodyID){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe',
        ref =>
          ref.where('solarBodyID', '==', solarBodyID).where('type', '==', 'colony')
      ).valueChanges({idField:'id'})
        .subscribe((aColonies: any) => {
          if(aColonies.length > 0){
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('ColonyService: Colony');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aColonies);
              }
            }
            this.colonyID= aColonies[0].id;
            this.aColony= aColonies[0];
            resolve(true);
          }
          else{
            reject('cols->fcIDP: No colony found');
          }
        });
    });
  }

  readColonyOrig(id){
    return new Promise((resolve, reject) => {
      this.colonySub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(id).valueChanges({idField:'id'})
        .subscribe((aColony: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('colonyService: readColony');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aColony);
            }
          }
          this.aColony= aColony;
          resolve(true);
        });
    });
  }

  /**
   * Name: Read Colony Solar Body
   **/
  rCSB(){
    return new Promise((resolve, reject) => {
      this.rCSBSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(this.aColony.solarBodyID).valueChanges()
        .subscribe((aSolarBody: any) => {
          this.aSolarBody= aSolarBody;
          resolve(true);
        });
    });
  }

  /**
   * Name: Read Colony Solar System
   **/
  rCSS(solarSystemID){
    return new Promise((resolve, reject) => {
      this.rCSSSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(solarSystemID).valueChanges()
        .subscribe((aSolarSystem: any) => {
          this.aSolarSystem= aSolarSystem;
          resolve(true);
        });
    });
  }
  /*
  rCSSOrig(){
    return new Promise((resolve, reject) => {
      this.rCSSSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(this.aColony.solarSystemID).valueChanges()
        .subscribe((aSolarSystem: any) => {
          this.aSolarSystem= aSolarSystem;
          resolve(true);
        });
    });
  }
  */

  //readColonyInventoryPromise
  rciP(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('colonyService: Get Inv');
    }
    return new Promise((resolve, reject) => {
      this.inventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories/',
        ref =>
          ref.where('ownerID', '==', this.aColony.id)
      )
        .valueChanges({idField: 'id'})
        .subscribe((aInventory: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('colonyService: rciP');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aInventory);
            }
          }
          aInventory.some((item: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(item);
            }
            this.aInventory[item.name]= item;
          });
          resolve(aInventory);
        });
    });
  }

  readColonyMarketInventory(){
    return new Promise((resolve, reject) => {
      this.marketInventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories/',
        ref =>
          ref.where('ownerID', '==', this.aColony.id)
      )
        .valueChanges({idField: 'id'})
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
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe/' + this.aColony.id)
      .valueChanges({idField: 'id'})
      .pipe(
        tap((aInventory: any) =>{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('colonyService: Inventory');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aInventory);
            }
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
