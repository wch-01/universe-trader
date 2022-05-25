import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ServerService } from '../server/server.service';
import {Colony, SolarBody, SolarSystem} from '../../classes/universe';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UniverseService {
  //region Variables
  aSolarBodies: any;
  aColonies: any;
  aSolarSystem= new SolarSystem();
  aSolarBody= new SolarBody();
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
  ) {}
  //endregion

  readUniverse(){
    //todo convert to promise
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe',
      ref =>
        ref.where('type', '==', 'solarSystem')
    )
      .valueChanges({idField:'id'});
  }

  readSolarBodies(systemID){
    //todo convert to promise
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe',
        ref =>
          ref.where('systemID','==',systemID).where('type', '==', 'solarBody')
    )
      .valueChanges({idField:'id'});
  }

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
          this.aColonies= aColonies;
          resolve(true);
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
      .doc(id).valueChanges({idField:'id'})
      .subscribe((solarSystem: SolarSystem)=>{
        this.aSolarSystem= solarSystem;
      });
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

  readColony(id){
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe')
      .doc(id).valueChanges({idField:'id'})
      .subscribe(colony=>{
        //console.log(colony);
        //this.aShip= ship;
      });
  }
}
