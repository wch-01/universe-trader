import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  //region Variables
  stationsSub;
  aStations;
  stationID;
  stationSub;
  aStation;
  inventorySub;
  aInventory: any;
  aaInventory= [];

  aStationsTableColumns= [
    /*
    {
      label: 'ID',
      filter: 'id'
    },
    */
    {
      label: 'Name',
      filter: 'name'
    }
  ];
  aStationsFilters= {
    /*
    id: '',
    */
    name: '',
    population: ''
  };
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
  ) { }
  //endregion

  /**
   * Name: Find Stations at Solar Body Promise
   *
   * @return: Promise
   * */
  fsaSBP(solarBodyID){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('stationService: fsaSBP');
    }
    return new Promise((resolve, reject) => {
      this.stationsSub= this.afs.collection('servers/' + this.ss.activeServer + '/stations',
        ref =>
          ref.where('solarBodyID', '==', solarBodyID)
      ).valueChanges({idField:'id'})
        .subscribe((aStations: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aStations);
          }
          this.aStations= aStations;
          resolve(true);
        });
    });
  }

  /**
   * Name: Find Station ID by SolarBodyID
   *
   * @return: Promise
   * */
  fsIDP(solarBodyID){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/stations',
        ref =>
          ref.where('solarBodyID', '==', solarBodyID)
      ).valueChanges({idField:'id'})
        .pipe(take(1))
        .subscribe((aStations: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Station');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aStations);
            }
          }
          this.stationID= aStations[0].id;
          resolve(true);
        });
    });
  }

  /**
   * Name: Read Station Promise
   *
   * @return Promise
   * */
  rsP(id){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('stationService: rsP');
      if(this.ss.aRules.consoleLogging.mode >= 2){
        console.log(id);
      }
    }
    return new Promise((resolve, reject) => {
      this.stationSub= this.afs.collection('servers/' + this.ss.activeServer + '/stations').doc(id).valueChanges({idField:'id'})
        .subscribe((aStation: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('stationService: rsP sub');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aStation);
            }
          }
          this.aStation= aStation;
          resolve(true);
        });
    });
  }

  /**
   * Name: Read Station Inventory Promise
   *
   * @return Promise
   * */
  rsiP(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('stationService: rsiP');
    }
    return new Promise((resolve, reject) => {
      this.inventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
        ref =>
          ref.where('ownerID', '==', this.aStation.id)
      ).valueChanges({idField: 'id'})
        .subscribe((aInventory: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('stationService: rsiP');
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

  logoutStation(){
    if(this.aStations){
      this.stationsSub.unsubscribe();
    }
    this.aStations= undefined;
    this.stationID= undefined;
    if(this.aStation){
      this.stationSub.unsubscribe();
    }
    this.aStation= undefined;
    if(this.aInventory){
      this.inventorySub.unsubscribe();
    }
    this.aInventory= undefined;
    this.aaInventory= [];
  }
}
