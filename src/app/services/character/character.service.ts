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
    private ss: ServerService,
    private us: UniverseService
  ) {}
  //endregion

  //region Create
  async createCharacter(characterName){
    return new Promise((resolve, reject) => {
      const newCharacter= {
        name: characterName,
        uid: this.authService.user.uid
      };
      this.afs.collection('servers/' + this.ss.activeServer + '/characters')
        .add(Object.assign({}, newCharacter))
        .then((createCharacterResult: any) => {
          this.addStartingGearBoot(createCharacterResult.id);
        });
    });
  }

  async addStartingGearBoot(characterID){
    console.log('Start: addStartingGearBoot');
    //region SolarBody->SolarSystem->Ship->Colony->Warehouse
    this.afs.collection('servers/' + this.ss.activeServer + '/universe',
      ref =>
        ref.where('type', '==', 'solarSystem')
          .where('xCoordinate', '==', 0)
          .where('yCoordinate', '==', 0)
    )
      .valueChanges({idField:'id'})
      .pipe(take(1))
      .subscribe((aSolarSystem: any) => {
        this.afs.collection('servers/' + this.ss.activeServer + '/universe',
          ref =>
            ref.where('type', '==', 'solarBody')
              .where('systemID', '==', aSolarSystem[0].id)
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

            //region Get Default Ship
            this.afs.collection('servers/' + this.ss.activeServer + '/z_startingGear',
              ref =>
                ref.where('type', '==', 'ship')
            )
              .valueChanges()
              .pipe(take(1),)
              .subscribe((aDefaultShip: any)=>{
                console.log('Default Ship');
                console.log(aDefaultShip);
                const aShip= aDefaultShip[0];
                aShip.ownerID= characterID;
                aShip.solarBody= aSolarBody[0].id;
                aShip.solarSystem= aSolarBody[0].systemID;
                console.log(aShip);
                this.createShip(aShip);
              });
            //endregion

            //region Get Colony for Warehouse
            this.afs.collection('servers/' + this.ss.activeServer + '/universe',
              ref =>
                ref.where('solarBodyID', '==', aSolarBody[0].id)
            )
              .valueChanges({idField: 'id'})
              .pipe(take(1))
              .subscribe((aColony: any) => {
                //region Get Default Warehouse
                this.afs.collection('servers/' + this.ss.activeServer + '/z_startingGear',
                  ref =>
                    ref.where('type', '==', 'warehouse')
                )
                  .valueChanges()
                  .pipe(take(1),)
                  .subscribe((aDefaultWarehouse: any)=>{
                    console.log('Default Warehouse');
                    const aWarehouse= aDefaultWarehouse[0];
                    aWarehouse.ownerID= characterID;
                    aWarehouse.solarBody= aSolarBody[0].id;
                    aWarehouse.solarSystem= aSolarBody[0].systemID;
                    aWarehouse.colonyID= aColony[0].id;
                    this.createWarehouse(aWarehouse);
                  });
                //endregion
              });
            //endregion
          });
      });
    //endregion

    //region Starting Credits
    this.afs.collection('servers/' + this.ss.activeServer + '/z_startingGear',
      ref =>
        ref.where('type', '==', 'pulsars')
    )
      .valueChanges()
      .pipe(take(1))
      .subscribe((aStartingCredits: any) => {
        this.afs.collection('servers/' + this.ss.activeServer + '/characters')
          .doc(characterID)
          .update({pulsars: aStartingCredits[0].amount});
      });
    //endregion
  }

  async createShip(aShip){
    console.log('4. createShip');
    //create starting ships inventory
    const aStartingShip= await this.afs.collection('servers/' + this.ss.activeServer + '/ships').add(Object.assign({}, aShip));
    this.afs.collection('servers/' + this.ss.activeServer + '/z_items').valueChanges()
      .pipe(take(1))
      .subscribe((aAllItems) =>{
        console.log('createShip: Add Items');
        this.aAllItems= aAllItems;
        this.aAllItems.some((item: any) =>{
          item.quantity= 0;
          item.cost= 0;
          item.ownerID= aStartingShip.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, item));
        });
      });
  }

  async createWarehouse(aWarehouse){
    console.log('4. createWarehouse');
    //create starting ships inventory
    const aStartingWarehouse= await this.afs.collection('servers/' + this.ss.activeServer + '/warehouses')
      .add(Object.assign({}, aWarehouse));
    this.afs.collection('servers/' + this.ss.activeServer + '/z_items').valueChanges()
      .pipe(take(1))
      .subscribe((aAllItems) =>{
        this.aAllItems= aAllItems;
        this.aAllItems.some((item: any) =>{
          item.quantity= 0;
          item.cost= 0;
          item.ownerID= aStartingWarehouse.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, item));
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
