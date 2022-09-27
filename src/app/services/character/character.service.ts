import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../server/server.service';
import {AuthenticationService} from '../authentication/authentication.service';
import {first, take, tap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {Ship} from '../../classes/ship';
import {UniverseService} from '../universe/universe.service';
import {SolarBody, SolarSystem} from '../../classes/universe';
import {ShipService} from '../ship/ship.service';
import {HousekeepingService} from '../housekeeping/housekeeping.service';
import {Character} from '../../classes/character';

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
  aCharacterStations: any;
  aCharacterWarehouses: any;
  aWarehouses: any;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody()
  };
  aAllItems;
  subscriptions: Subscription[] = [];
  //endregion

  //region Constructor
  constructor(
    private authService: AuthenticationService,
    private afs: AngularFirestore,
    private ss: ServerService,
    private shipS: ShipService,
    private hks: HousekeepingService,
  ) {}
  //endregion

  //region Create
  createCharacter(characterName){
    return new Promise((resolve, reject) => {
      this.afs.firestore.collection('servers/' + this.ss.activeServer + '/zCharacters').doc('starting character')
        .get().then((oNewCharacter) => {
          const aNewCharacter= oNewCharacter.data() as Character;
          aNewCharacter.name= characterName;
          aNewCharacter.uid= this.authService.user.uid;
          /*
          const newCharacter= {
            name: characterName,
            uid: this.authService.user.uid,
            skills: {
              engine: 1,
              jumpEngine: 1,
              equipment: 1,
              station: 0
            }
          };
          */
          this.afs.collection('servers/' + this.ss.activeServer + '/characters')
            .add(Object.assign({}, aNewCharacter))
            .then((createCharacterResult: any) => {
              this.id= createCharacterResult.id;
              this.addStartingGearBoot(createCharacterResult.id).then((result: any) => {
                resolve(true);
              });
            });
      });
    });
  }

  addStartingGearBoot(characterID){
    console.log('characterService->addStartingGearBoot');
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
              //region Set Character Clone Location
              this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(characterID).update({
                solarSystemID: aSolarSystem[0].id,
                solarBodyID: aSolarBody[0].id
              });
              //endregion

              //Fire Ship, Warehouse, and Pulsars Promise
              Promise.all([
                this.createStarterShip(aSolarSystem[0], aSolarBody[0]),
                this.createStarterWarehouse(aSolarSystem[0].id, aSolarBody[0].id),
                this.startingCharacterFunds()
              ])
                .then((promiseAllResult: any) => {
                  resolve(true);
                });
            });
        });
      //endregion
    });
  }

  createStarterShipOld(aSolarSystem, aSolarBody){
    return new Promise((resolve, reject) => {
      //region Get Default Ship
      this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear')
        .doc('ship')
        .valueChanges()
        .pipe(take(1),)
        .subscribe((aDefaultShip: any)=>{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Default Ship');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(aDefaultShip);
            }
          }
          //region Build New Ship Object
          const aShip= Object.assign({}, aDefaultShip);
          aShip.ownerID= this.id;
          aShip.solarBody= aSolarBody.id;
          aShip.solarBodyName= aSolarBody.name;
          aShip.solarSystem= aSolarSystem.id;
          aShip.solarSystemName= aSolarSystem.name;
          //endregion
          //Add Ship
          this.afs.collection('servers/' + this.ss.activeServer + '/ships').add(Object.assign({}, aShip)).then((createShipResult: any) => {
            //Get and Add Ship Modules
            this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/ship/installedModules')
              .valueChanges()
              .pipe(take(1))
              .subscribe((aInstalledModules) => {
                aInstalledModules.some((aInstalledModule) => {
                  this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + createShipResult.id + '/installedModules')
                    .add(Object.assign({}, aInstalledModule));
                });
              });

            this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/ship/modules_slots')
              .valueChanges()
              .pipe(take(1))
              .subscribe((aModules) => {
                aModules.some((aModule: any) => {
                  this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + createShipResult.id + '/modules_slots')
                    .doc(aModule.name).update(Object.assign({}, aModule));
                });
              });
            /*
            this.afs.collection('servers/' + this.ss.activeServer + '/zItems').valueChanges()
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
            */
            resolve(true);
          });
        });
      //endregion
    });
  }

  createStarterShip(aSolarSystem, aSolarBody) {
    //todo hand errors
    return new Promise((resolve, reject) => {
      this.shipS.rpDS('starting').then((aBasicShip: any) => {
        aBasicShip.aShip.name = 'Assembled Ship';
        aBasicShip.aShip.ownerID= this.id;
        aBasicShip.aShip.solarBody= aSolarBody.id;
        aBasicShip.aShip.solarBodyName= aSolarBody.name;
        aBasicShip.aShip.solarSystem= aSolarSystem.id;
        aBasicShip.aShip.solarSystemName= aSolarSystem.name;

        //Add Ship
        this.afs.collection('servers/' + this.ss.activeServer + '/ships').add(Object.assign({}, aBasicShip.aShip))
          .then((createShipResult: any) => {
            for(const aModule of aBasicShip.aModules) {
              this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + createShipResult.id + '/installedModules')
                .add(Object.assign({}, aModule));
            }

            /*
            for(const aModuleSlot of aBasicShip.aModuleSlots) {
              this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + createShipResult.id + '/moduleSlots')
                .doc(aModuleSlot.name)
                .set(Object.assign({}, aModuleSlot));
            }
            */

            resolve(true);
            //todo handle errors
          });
      });
    });
  }

  createStarterWarehouse(solarSystemID, solarBodyID){
    return new Promise((resolve, reject) => {
      //region Get Default Warehouse
      this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear')
        .doc('warehouse')
        .valueChanges()
        .pipe(take(1),)
        .subscribe((aDefaultWarehouse: any)=>{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Default Warehouse');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              //console.log(aDefaultShip);
            }
          }
          const aWarehouse= aDefaultWarehouse;
          aWarehouse.ownerID= this.id;
          aWarehouse.solarSystem= solarSystemID;
          aWarehouse.solarBody= solarBodyID;
          this.afs.collection('servers/' + this.ss.activeServer + '/warehouses')
            .add(Object.assign({}, aWarehouse)).then((createWarehouseResult: any) => {
              /*
            this.ss.aDefaultItems.some((item: any) =>{
              item.quantity= 0;
              item.cost= 0;
              item.ownerID= createWarehouseResult.id;
              this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, item));
            });
            */
              resolve(true);
          });
        });
      //endregion
    });
  }

  startingCharacterFunds(){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear')
        .doc('pulsars')
        .valueChanges()
        .pipe(take(1))
        .subscribe((aStartingCredits: any) => {
          this.afs.collection('servers/' + this.ss.activeServer + '/characters')
            .doc(this.id)
            .update({pulsars: aStartingCredits.amount}).then((result: any) => {
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
      const characterSub= this.afs.collection('servers/' + this.ss.activeServer + '/characters',
        ref => ref.where('uid', '==', this.authService.user.uid)
      ).valueChanges({idField:'id'})
        .subscribe((aCharacter: any) => {
          this.hks.subscriptions.push(characterSub);
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('Character Service: rcP sub');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aCharacter);
              }
            }

            if(aCharacter.length > 0){
              this.characterFound= true;
              this.id= aCharacter[0].id;
              this.aCharacter= aCharacter[0];
              this.readLocation();
              this.subscriptions.push(characterSub);
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

  /**
   * Name: Read Character Ships
   * */
  readCharacterShips(){
    const characterShipsSub= this.afs.collection('servers/' + this.ss.activeServer + '/ships',
        ref => ref
          .where('ownerID', '==', this.id))
      .valueChanges({idField:'id'})
      .subscribe(aShips=>{
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('Character Service: readCharacterShips Sub');
        }
        this.aCharacterShips= [];//Reset the Character ship list each time the DB has changes.
        aShips.some((aShip: Ship)=> {
          const aSolarSystemSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe',
            ref =>
              ref.where('type', '==', 'solarSystem')
          )
            .doc(aShip.solarSystem).valueChanges({idField:'id'})
            .subscribe((solarSystem: any)=>{
              this.subscriptions.push(aSolarSystemSub);
              const solarSystemName= solarSystem.name;
              aShip.solarSystemName= solarSystemName;
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('Character Service: readCharacterShips - Solar System');
                if(this.ss.aRules.consoleLogging.mode >= 2){
                  console.log(solarSystemName);
                }
              }
            });

          const aSolarBodyQuerySub= this.afs.collection('servers/' + this.ss.activeServer + '/universe',
            ref =>
              ref.where('type', '==', 'solarBody')
          )
            .doc(aShip.solarBody).valueChanges({idField:'id'})
            .subscribe((aSolarBody: any)=>{
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('Character Service: readCharacterShips - Solar Body');
              }
              this.subscriptions.push(aSolarBodyQuerySub);
              aShip.solarBodyName= aSolarBody.name;
            });

          this.aCharacterShips.push(aShip);
        });
        this.subscriptions.push(characterShipsSub);
        //this.characterShipsSub.unsubscribe();
      });
  }

  /**
   * Name: Read Character Warehouses
   * */
  rCharacterWarehouses(){
    const characterWarehousesSub= this.afs.collection('servers/' + this.ss.activeServer + '/warehouses',
      ref => ref
        .where('ownerID', '==', this.id))
      .valueChanges({idField:'id'})
      .subscribe(aWarehouses=>{
        this.subscriptions.push(characterWarehousesSub);
        this.aCharacterWarehouses= [];//Reset the Character ship list each time the DB has changes.
        aWarehouses.some((aWarehouse: any)=> {
          const aSolarSystem= this.afs.collection('servers/' + this.ss.activeServer + '/universe')
            .doc(aWarehouse.solarSystem).valueChanges({idField:'id'})
            .subscribe((solarSystem: any)=>{
              this.subscriptions.push(aSolarSystem);
              const solarSystemName= solarSystem.name;
              aWarehouse.solarSystemName= solarSystemName;
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('Character Service: readCharacterWarehouse');
                if(this.ss.aRules.consoleLogging.mode >= 2){
                  console.log(solarSystemName);
                }
              }
            });

          const aSolarBodyQuery= this.afs.collection('servers/' + this.ss.activeServer + '/universe')
            .doc(aWarehouse.solarBody).valueChanges({idField:'id'})
            .subscribe((aSolarBody: any)=>{
              aWarehouse.solarBodyName= aSolarBody.name;
            });

          this.aCharacterWarehouses.push(aWarehouse);
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

  /**
   * Name: Read Character Ships
   * */
  readCharacterStations(){
    const characterStationsSub= this.afs.collection('servers/' + this.ss.activeServer + '/stations',
      ref => ref
        .where('ownerID', '==', this.id))
      .valueChanges({idField:'id'})
      .subscribe(aStations=>{
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('Character Service: readCharacterShips Sub');
        }
        this.aCharacterStations= [];//Reset the Character ship list each time the DB has changes.
        aStations.some((aStation: Ship)=> {
          const aSolarSystemSub= this.afs.collection('servers/' + this.ss.activeServer + '/universe',
            ref =>
              ref.where('type', '==', 'solarSystem')
          )
            .doc(aStation.solarSystem).valueChanges({idField:'id'})
            .subscribe((solarSystem: any)=>{
              this.subscriptions.push(aSolarSystemSub);
              const solarSystemName= solarSystem.name;
              aStation.solarSystemName= solarSystemName;
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('Character Service: readCharacterShips - Solar System');
                if(this.ss.aRules.consoleLogging.mode >= 2){
                  console.log(solarSystemName);
                }
              }
            });

          const aSolarBodyQuerySub= this.afs.collection('servers/' + this.ss.activeServer + '/universe',
            ref =>
              ref.where('type', '==', 'solarBody')
          )
            .doc(aStation.solarBody).valueChanges({idField:'id'})
            .subscribe((aSolarBody: any)=>{
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('Character Service: readCharacterShips - Solar Body');
              }
              this.subscriptions.push(aSolarBodyQuerySub);
              aStation.solarBodyName= aSolarBody.name;
            });

          this.aCharacterStations.push(aStation);
        });
        this.subscriptions.push(characterStationsSub);
      });
  }

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
