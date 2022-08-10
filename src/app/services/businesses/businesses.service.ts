import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {UniverseService} from '../universe/universe.service';
import {CharacterService} from '../character/character.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessesService {
  //region Variables
  aBusinesses;
  aBusiness;

  //region Solar System
  aSolarSystem;
  //endregion

  //region Solar Body
  aSolarBody;
  //endregion

  //region Subscriptions
  aSubscriptions= [];
  rBSBSub;
  rBSSSub;
  //endregion
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    private us: UniverseService,
    private charS: CharacterService
  ) { }
  //endregion

  //region Create
  //endregion

  //region Read
  /**
   * Name: Read Businesses Promise
   *
   * @return Promise
   **/
  rbP(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('businessesService');
    }

    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/businesses',
        ref =>
          ref.where('solarBodyID', '==', this.us.aSolarBody.id).where('ownerID', '==', this.charS.aCharacter.id)
      ).valueChanges({idField: 'id'})
        .subscribe((aBusinesses: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aBusinesses);
          }
          if(aBusinesses.length > 0){
            this.aBusinesses= aBusinesses;
            resolve(aBusinesses);
          }
          else{
            reject('No Businesses Found');
          }
        });
    });
  }

  /**
   * Name: Read Single Business Promise
   **/
  rsbP(id){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('businessesService');
    }

    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/businesses')
        .doc(id)
        .valueChanges({idField: 'id'})
        .subscribe((aBusiness: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aBusiness);
          }
          this.aBusiness= aBusiness;
          resolve(aBusiness);
        });
    });
  }

  /**
   * Name: Read Business Solar Body
   **/
  rBSB(){
    return new Promise((resolve, reject) => {
      this.rBSBSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(this.aBusiness.solarBodyID).valueChanges()
        .subscribe((aSolarBody: any) => {
          this.aSolarBody= aSolarBody;
          this.aSubscriptions.push(this.rBSBSub);
          resolve(true);
        });
    });
  }

  /**
   * Name: Read Business Solar System
   **/
  rBSS(){
    return new Promise((resolve, reject) => {
      this.rBSSSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(this.aBusiness.solarSystemID).valueChanges()
        .subscribe((aSolarSystem: any) => {
          this.aSolarSystem= aSolarSystem;
          this.aSubscriptions.push(this.rBSSSub);
          resolve(true);
        });
    });
  }
  //endregion

  //region Update
  //endregion

  //region Delete
  //endregion
}
