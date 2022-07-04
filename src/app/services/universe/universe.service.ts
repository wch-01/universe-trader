import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ServerService } from '../server/server.service';
import {Colony, SolarBody, SolarSystem} from '../../classes/universe';
import {take} from 'rxjs/operators';
import {HousekeepingService} from '../housekeeping/housekeeping.service';
// @ts-ignore
const moment= require('moment');

@Injectable({
  providedIn: 'root'
})
export class UniverseService {
  //region Variables
  ssSub;
  sbSub;
  cSub;
  aSolarSystems;
  aSolarBodies: any;
  aColonies: any;
  aColony: any;
  aSolarSystem= new SolarSystem();
  aSolarBody= new SolarBody();
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    private hks: HousekeepingService
  ) {}
  //endregion

  /**
   * Name: Read Universe
   * */
  readUniverse(){
    //todo convert to promise
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe',
      ref =>
        ref.where('type', '==', 'solarSystem')
    )
      .valueChanges({idField:'id'});
  }

  readSSSolarBodies(solarSystemID){
    //todo convert to promise
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe',
        ref =>
          ref.where('solarSystemID','==',solarSystemID).where('type', '==', 'solarBody')
    )
      .valueChanges({idField:'id'});
  }

  //region Read
  rpSolarSystems(){
    console.log('Read Solar Systems');
    return new Promise((resolve, reject) => {
      if(localStorage.getItem('ut_server_universe_solar_systems')
        &&
        localStorage.getItem('ut_server_universe_solar_systems_time') < moment().add(7, 'days').unix()
        &&
        localStorage.getItem('ut_server_universe_solar_systems_time') > this.ss.lastUpdate.universeUpdated
      ){
        this.aSolarSystems= JSON.parse(localStorage.getItem('ut_server_universe_solar_systems'));
        resolve(true);
      }
      else{
        console.log('Solar Systems Local Storage is out of Date');
        this.ssSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe/',
          ref =>
            ref.where('type', '==', 'solarSystem')
        ).valueChanges({idField:'id'})
          .pipe(take(2))//Not ideal, but makes sure it gets all items instead of just one
          .subscribe((aSolarSystems: any) => {
          localStorage.setItem('ut_server_universe_solar_systems', JSON.stringify(aSolarSystems));
          localStorage.setItem('ut_server_universe_solar_systems_time', moment().unix());
          this.aSolarSystems= aSolarSystems;
          console.log(this.aSolarSystems);
          //ssSub.unsubscribe();//Only works the first time the function is called, any other calls it only pulls one system
          resolve(true);
        });
      }
    });
  }

  rpSS(id){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe')
        .doc(id).valueChanges({idField:'id'}).pipe(take(1))
        .subscribe((aSolarSystem: SolarSystem)=>{
          this.aSolarSystem= aSolarSystem;
          resolve(aSolarSystem);
        });
    });
  }

  rpSolarBodies(){
    return new Promise((resolve, reject) => {
      if(localStorage.getItem('ut_server_universe_solar_bodies')
        &&
        localStorage.getItem('ut_server_universe_solar_bodies_time') < moment().add(7, 'days').unix()
        &&
        localStorage.getItem('ut_server_universe_solar_bodies_time') > this.ss.lastUpdate.universeUpdated
      ){
        this.aSolarBodies= JSON.parse(localStorage.getItem('ut_server_universe_solar_bodies'));
        resolve(true);
      }
      else{
        console.log('Solar Bodies Local Storage is out of Date');
        this.sbSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe/',
          ref =>
            ref.where('type', '==', 'solarBody')
        ).valueChanges({idField:'id'})
          .pipe(take(2))//Not ideal, but makes sure it gets all items instead of just one
          .subscribe((aSolarBodies: any) => {
          localStorage.setItem('ut_server_universe_solar_bodies', JSON.stringify(aSolarBodies));
          localStorage.setItem('ut_server_universe_solar_bodies_time', moment().unix());
          this.aSolarBodies= aSolarBodies;
          //sbSub.unsubscribe();
          resolve(true);
        });
      }
    });
  }

  rpSB(id){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe')
        .doc(id).valueChanges({idField:'id'}).pipe(take(1))
        .subscribe((aSolarBody: SolarBody)=>{
          this.aSolarBody= aSolarBody;
          resolve(aSolarBody);
        });
    });
  }

  /**
   * Read Promise Colonies
   **/
  rpColonies(){
    return new Promise((resolve, reject) => {
      if(localStorage.getItem('ut_server_universe_colonies')
        &&
        localStorage.getItem('ut_server_universe_colonies_time') < moment().add(7, 'days').unix()
        &&
        localStorage.getItem('ut_server_universe_colonies_time') > this.ss.lastUpdate.universeUpdated
      ){
        this.aColonies= JSON.parse(localStorage.getItem('ut_server_universe_colonies'));
        resolve(true);
      }
      else{
        console.log('Colony Local Storage is out of Date');
        this.cSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe/',
          ref =>
            ref.where('type', '==', 'colony')
        ).valueChanges({idField:'id'})
          .pipe(take(2))//Not ideal, but makes sure it gets all items instead of just one
          .subscribe((aColonies: any) => {
          localStorage.setItem('ut_server_universe_colonies', JSON.stringify(aColonies));
          localStorage.setItem('ut_server_universe_colonies_time', moment().unix());
          this.aColonies= aColonies;
          //cSub.unsubscribe();
          resolve(true);
        });
      }
    });
  }

  readColonies(){
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe',
      ref =>
        ref.where('type', '==', 'colony')
    )
      .valueChanges({idField:'id'});
  }
  //endregion

  /**
   * Name: Read Solar Bodies Colonies
   *
   * @return: Promise
   **/
  rsbCP(solarBodyID){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('universeService: rsbCP | ' + solarBodyID);
    }
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe',
        ref =>
          ref.where('solarBodyID', '==', solarBodyID).where('type', '==', 'colony')
      ).valueChanges({idField: 'id'}).pipe(take(1))
        .subscribe((aColonies: any)=>{
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aColonies);
          }
          if(aColonies.length > 0){
            // this.aColony= aColonies[0];
            resolve(aColonies[0]);
          }
          else{
            reject('No Colony Found');
          }
        });
    });
  }

  //Read Solar System Promise
  rssP(id){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe')
        .doc(id).valueChanges({idField:'id'}).pipe(take(1))
        .subscribe((aSolarSystem: SolarSystem)=>{
          this.aSolarSystem= aSolarSystem;
          resolve(true);
        });
    });
  }
  readSolarSystem(id){
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe')
      .doc(id).valueChanges({idField:'id'});
      /*
      .subscribe((solarSystem: SolarSystem)=>{
        this.aSolarSystem= solarSystem;
      });
    */
  }

  //Read Solar Body Promise
  rsbP(id){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/universe')
        .doc(id).valueChanges({idField:'id'}).pipe(take(1))
        .subscribe((aSolarBody: SolarBody)=>{
          this.aSolarBody= aSolarBody;
          resolve(true);
        });
    });
  }
  readSolarBody(id){
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe')
      .doc(id).valueChanges({idField:'id'})
      .subscribe((solarBody: SolarBody)=>{
        this.aSolarBody= solarBody;
      });
  }

  //Read Colony
  readColony(id){
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe')
      .doc(id).valueChanges({idField:'id'})
      .subscribe(colony=>{
        //console.log(colony);
        //this.aShip= ship;
      });
  }
}
