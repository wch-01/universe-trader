import {Injectable} from '@angular/core';
import {AngularFirestore, QuerySnapshot} from '@angular/fire/compat/firestore';
import {ServerService} from '../server/server.service';
import {UniverseService} from '../universe/universe.service';
import {CharacterService} from '../character/character.service';
import {StationService} from '../station/station.service';

@Injectable({
  providedIn: 'root'
})
export class StationOperationService {
  //region Variables
  aStationOperations;
  aStationOperation;
  aProducts;

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
    private charS: CharacterService,
    private stationS: StationService
  ) { }
  //endregion

  //region Create
  //endregion

  //region Read
  /**
   * Name: Businesses Total
   *
   * @return Promise
   **/
  rpBT(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('businessesService');
    }

    return new Promise((resolve, reject) => {
      this.afs.firestore.collection('servers/' + this.ss.activeServer + '/businesses')
        .where('ownerID', '==', this.charS.aCharacter.id)
        .get()
        .then((oBusinesses: QuerySnapshot<object>) => {
          resolve(oBusinesses.size);
        });
    });
  }

  /**
   * Name: Read Promise Station Operations
   *
   * @return Promise
   **/
  rpSOs(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('businessesService');
    }

    return new Promise((resolve, reject) => {
      this.afs.collection('servers/'+this.ss.activeServer+'/stationOperations',
        ref => ref.where('ownerID', '==', this.stationS.aStation.id)).valueChanges({idField: 'id'})
        .subscribe((aStationOperations) => {
          if(aStationOperations.length > 0){
            this.aStationOperations= aStationOperations;
            resolve(aStationOperations);
          }
        });
    });
  }

  /**
   * Name: Read Promise Station Operation
   **/
  rpSO(id){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/stationOperations')
        .doc(id)
        .valueChanges({idField: 'id'})
        .subscribe((aStationOperation: any) => {
          this.aStationOperation= aStationOperation;
          resolve(aStationOperation);
        });
    });
  }

  /**
   * Name: Read Business Solar Body
   **/
  rpSOsb(){
    return new Promise((resolve, reject) => {
      this.rBSBSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(this.aStationOperation.solarBodyID).valueChanges()
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
  rpSOss(){
    return new Promise((resolve, reject) => {
      this.rBSSSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe').doc(this.aStationOperation.solarSystemID).valueChanges()
        .subscribe((aSolarSystem: any) => {
          this.aSolarSystem= aSolarSystem;
          this.aSubscriptions.push(this.rBSSSub);
          resolve(true);
        });
    });
  }

  /**
   * Name: Read Promise Business Products
   * */
  rpBProducts(){
    return new Promise((resolve, reject) => {
      this.afs.firestore.collection('servers/'+this.ss.activeServer+'/zItems')
        .where('producedAt', '==', this.aStationOperation.name).get().then((oProducts: QuerySnapshot<object[]>) => {
        this.aProducts= oProducts.docs;
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
