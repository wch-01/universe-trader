import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../server/server.service';
import {AuthenticationService} from '../authentication/authentication.service';
import {first, take, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Ship} from '../../classes/ship';
import {UniverseService} from '../universe/universe.service';
import {SolarBody, SolarSystem} from '../../classes/universe';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  //region Variables
  characterSub;
  characterFound= false;
  obsCharacter= null;
  id;
  aCharacter;
  aUserShips: any;
  characterShipsSub;
  aCharacterShips: any;
  aWarehouses: any;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody()
  };
  aAllItems;
  //endregion

  //region Constructor
  constructor(
    private authService: AuthenticationService,
    private afs: AngularFirestore,
    private ss: ServerService
  ) {}
  //endregion

  //region Create
  createCharacter(characterName){
    return new Promise((resolve, reject) => {
      const newCharacter= {
        name: characterName,
        uid: this.authService.user.uid
      };
      this.afs.collection('servers/' + this.ss.activeServer + '/characters')
        .add(Object.assign({}, newCharacter))
        .then((createCharacterResult: any) => {
          this.id= createCharacterResult.id;
          this.addStartingGearBoot(createCharacterResult.id).then((result: any) => {
            resolve(true);
          });
        });
    });
  }

  addStartingGearBoot(characterID){
    console.log('Start: addStartingGearBoot');
    return new Promise((resolve, reject) => {
      //region SolarSystem->SolarBody->Ship->Colony->Warehouse
      //Solar system
      this.afs.collection('servers/' + this.ss.activeServer + '/universe',
        ref =>
          ref.where('type', '==', 'solarSystem')
            .where('xCoordinate', '==', 0)
            .where('yCoordinate', '==', 0)
      )
        .valueChanges({idField:'id'})
        .pipe(take(1))
        .subscribe((aSolarSystem: any) => {
          //Solar Body
          this.afs.collection('servers/' + this.ss.activeServer + '/universe',
            ref =>
              ref.where('type', '==', 'solarBody')
                .where('solarSystemID', '==', aSolarSystem[0].id)
                .where('xCoordinate', '==', 0)
                .where('yCoordinate', '==', 0)
          )
            .valueChanges({idField: 'id'})
            .pipe(take(1))
            .subscribe((aSolarBody: any) => {
              //Colony
              this.afs.collection('servers/' + this.ss.activeServer + '/universe',
                ref =>
                  ref.where('solarBodyID', '==', aSolarBody[0].id)
              )
                .valueChanges({idField: 'id'})
                .pipe(take(1))
                .subscribe((aColony: any) => {
                  //region Set Character Clone Location
                  this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(characterID).update({
                    solarSystemID: aSolarSystem[0].id,
                    solarBodyID: aSolarBody[0].id
                  });
                  //endregion

                  //Fire Ship, Warehouse, and Pulsars Promise
                  Promise.all([
                    this.createStarterShip(aSolarSystem[0].id, aSolarBody[0].id),
                    this.createStarterWarehouse(aSolarSystem[0].id, aSolarBody[0].id, aColony[0].id),
                    this.startingCharacterFunds()
                  ])
                    .then((promiseAllResult: any) => {
                      resolve(true);
                    });
                });
            });
        });
      //endregion
    });
  }

  createStarterShip(solarSystemID, solarBodyID){
    return new Promise((resolve, reject) => {
      //region Get Default Ship
      this.afs.collection('servers/' + this.ss.activeServer + '/z_startingGear',
        ref =>
          ref.where('type', '==', 'ship')
      )
        .valueChanges()
        .pipe(take(1),)
        .subscribe((aDefaultShip: any)=>{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Default Ship');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aDefaultShip);
            }
          }
          const aShip= aDefaultShip[0];
          aShip.ownerID= this.id;
          aShip.solarBody= solarBodyID;
          aShip.solarSystem= solarSystemID;
          this.afs.collection('servers/' + this.ss.activeServer + '/ships').add(Object.assign({}, aShip)).then((createShipResult: any) => {
            this.afs.collection('servers/' + this.ss.activeServer + '/z_items').valueChanges()
              .pipe(take(1))
              .subscribe((aAllItems) =>{
                console.log('createShip: Add Items');
                this.aAllItems= aAllItems;
                this.aAllItems.some((item: any) =>{
                  item.quantity= 0;
                  item.cost= 0;
                  item.ownerID= createShipResult.id;
                  this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, item));
                });
                resolve(true);
              });
          });
        });
      //endregion
    });
  }

  createStarterWarehouse(solarSystemID, solarBodyID, colonyID){
    return new Promise((resolve, reject) => {
      //region Get Default Warehouse
      this.afs.collection('servers/' + this.ss.activeServer + '/z_startingGear',
        ref =>
          ref.where('type', '==', 'warehouse')
      )
        .valueChanges()
        .pipe(take(1),)
        .subscribe((aDefaultWarehouse: any)=>{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Default Warehouse');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              //console.log(aDefaultShip);
            }
          }
          const aWarehouse= aDefaultWarehouse[0];
          aWarehouse.ownerID= this.id;
          aWarehouse.solarSystem= solarSystemID;
          aWarehouse.solarBody= solarBodyID;
          aWarehouse.colonyID= colonyID;
          this.afs.collection('servers/' + this.ss.activeServer + '/warehouses')
            .add(Object.assign({}, aWarehouse)).then((createWarehouseResult: any) => {
            this.ss.aDefaultItems.some((item: any) =>{
              item.quantity= 0;
              item.cost= 0;
              item.ownerID= createWarehouseResult.id;
              this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, item));
            });
              resolve(true);
          });
        });
      //endregion
    });
  }

  startingCharacterFunds(){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/z_startingGear',
        ref =>
          ref.where('type', '==', 'pulsars')
      )
        .valueChanges()
        .pipe(take(1))
        .subscribe((aStartingCredits: any) => {
          this.afs.collection('servers/' + this.ss.activeServer + '/characters')
            .doc(this.id)
            .update({pulsars: aStartingCredits[0].amount}).then((result: any) => {
              resolve(true);
          });
        });
    });
  }
  //endregion

  //region Read

  readCharacter(){
    return this.obsCharacter= this.afs.collection('servers/' + this.ss.activeServer + '/characters',
      ref => ref.where('uid', '==', this.authService.user.uid)
    ).valueChanges({idField:'id'})
      .pipe(
        tap((aCharacter: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Character Service');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aCharacter);
            }
          }

          if(aCharacter.length > 0){
            this.characterFound= true;
            this.id= aCharacter[0].id;
            this.aCharacter= aCharacter[0];
            this.readLocation();
          }
          //this.readCharacterShips();
        })
      ) as Observable<any>;
  }

  /**
   * Name: Read Character Promise
   * Desc: Reads character from active server that matches current user
   *
   * @return Promise
   * */
  rcP(){
    return new Promise((resolve, reject) => {
      this.characterSub= this.afs.collection('servers/' + this.ss.activeServer + '/characters',
        ref => ref.where('uid', '==', this.authService.user.uid)
      ).valueChanges({idField:'id'})
        .subscribe((aCharacter: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('Character Service');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aCharacter);
              }
            }

            if(aCharacter.length > 0){
              this.characterFound= true;
              this.id= aCharacter[0].id;
              this.aCharacter= aCharacter[0];
              this.readLocation();
              resolve(true);
            }
            else{
              reject('No Character Found');
            }
          });
    });
  }

  readLocation(){
    //this.us.readSolarSystem(this.aCharacter.solarSystemID);
    //this.us.readSolarBody(this.aCharacter.solarBodyID);

    this.afs.collection('servers/' + this.ss.activeServer + '/universe')
      .doc(this.aCharacter.solarSystemID).valueChanges({idField:'id'})
      .subscribe((aSolarSystem: SolarSystem)=>{
        this.aLocation.aSolarSystem= aSolarSystem;
      });
    this.afs.collection('servers/' + this.ss.activeServer + '/universe')
      .doc(this.aCharacter.solarBodyID).valueChanges({idField:'id'})
      .subscribe((aSolarBody: SolarBody)=>{
        this.aLocation.aSolarBody= aSolarBody;
      });
  }

  async readCharacterTwo(){
    return await new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/characters',
        ref =>
          ref.where('uid', '==', this.authService.user.uid)
        )
        .valueChanges({idField:'id'})
        .pipe(
          take(1),
          tap((aCharacter: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('Character Service');
            }
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aCharacter);
            }
          })
        );
    });
  }

  readCharacterShips(){
    return this.characterShipsSub= this.afs.collection('servers/' + this.ss.activeServer + '/ships',
        ref => ref
          .where('ownerID', '==', this.id))
      .valueChanges({idField:'id'})
      .subscribe(aShips=>{
        this.aCharacterShips= [];//Reset the Character ship list each time the DB has changes.
        aShips.some((aShip: Ship)=> {
          const aSolarSystem= this.afs.collection('servers/' + this.ss.activeServer + '/universe',
            ref =>
              ref.where('type', '==', 'solarSystem')
          )
            .doc(aShip.solarSystem).valueChanges({idField:'id'})
            .subscribe((solarSystem: any)=>{
              const solarSystemName= solarSystem.name;
              aShip.solarSystemName= solarSystemName;
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('Character Service: readCharacterShips');
              }
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(solarSystemName);
              }
            });

          const aSolarBodyQuery= this.afs.collection('servers/' + this.ss.activeServer + '/universe',
            ref =>
              ref.where('type', '==', 'solarBody')
          )
            .doc(aShip.solarBody).valueChanges({idField:'id'})
            .subscribe((aSolarBody: any)=>{
              aShip.solarBodyName= aSolarBody.name;
            });

          this.aCharacterShips.push(aShip);
        });
      });
  }

  //Read Character Warehouses Promise
  rcwP(){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers' + this.ss.activeServer + '/warehouses',
        ref =>
          ref.where('ownerID', '==', this.aCharacter.id)
        ).valueChanges({idField: 'id'})
        .subscribe((aWarehouses: any) => {
          this.aWarehouses= aWarehouses;
          resolve(true);
        });
    });
  }

  readCharacterStations(uid){}

  readCharacterColonies(uid){}

  readCharacterStructures(uid){}
  //endregion

  logoutCharacter(){
    this.characterSub.unsubscribe();
    this.aCharacter= undefined;
    this.characterFound= false;

    this.id= undefined;
    this.aCharacter= undefined;
    if(this.aCharacterShips){
      this.characterShipsSub.unsubscribe();
    }
    this.aUserShips= undefined;
    this.aCharacterShips= undefined;
    this.aWarehouses= undefined;
    this.aLocation= {
      aSolarSystem: new SolarSystem(),
      aSolarBody: new SolarBody()
    };
    this.aAllItems= undefined;
  }
}