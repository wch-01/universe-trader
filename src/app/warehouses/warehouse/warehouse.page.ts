import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ServerService} from '../../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {WarehouseService} from '../../services/warehouse/warehouse.service';
import {take} from 'rxjs/operators';
import {UniverseService} from '../../services/universe/universe.service';
import {AlertController, ToastController} from '@ionic/angular';
import {ShipService} from '../../services/ship/ship.service';
import {PlatformService} from '../../services/platform/platform.service';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.page.html',
  styleUrls: ['./warehouse.page.scss'],
})
export class WarehousePage implements OnInit, OnDestroy {
  //region Variables
  @Input() warehouseID: any;

  aShips;
  aShip;
  capReady= false;
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    public ws: WarehouseService,
    private unis: UniverseService,
    private ionAlert: AlertController,
    private toastController: ToastController,
    private shipS: ShipService,
    public platform: PlatformService
  ) { }
  //endregion

  ngOnInit() {
    this.ws.readWarehouse(this.warehouseID).then((res: any) => {
      this.ws.rwiP().then((rwiPRes: any) => {
        this.ws.setCargoCapacity().then(() => {
          this.capReady= true;
        });
      });
      this.ws.rpLocalShips().then(
        (aShips) => {
          this.aShips= aShips;
        }
      );
    });
  }

  //c

  //r

  //region Update
  assembleShipOld(aItem) {
    //region Get Default Ship
    const pBuildShip= new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear')
        .doc('ship')
        .valueChanges()
        .pipe(take(1),)
        .subscribe((aDefaultShip: any) => {
          if (this.ss.aRules.consoleLogging.mode >= 1) {
            console.log('Default Ship');
            if (this.ss.aRules.consoleLogging.mode >= 2) {
              console.log(aDefaultShip);
            }
          }
          const aShip = aDefaultShip;
          aShip.name = 'Assembled Ship';
          aShip.ownerID = this.ws.aWarehouse.ownerID;
          aShip.solarBody = this.ws.aWarehouse.solarBody;
          aShip.solarSystem = this.ws.aWarehouse.solarSystem;
          this.unis.rpSS(aShip.solarSystem).then((aSolarSystem: any) => {
            aShip.solarSystemName = aSolarSystem.name;
            this.unis.rpSB(aShip.solarBody).then((aSolarBody: any) => {
              aShip.solarBodyName = aSolarBody.name;
              this.afs.collection('servers/' + this.ss.activeServer + '/ships').add(Object.assign({}, aShip))
                .then((createShipResult: any) => {
                  //Get and Add Ship Modules
                  this.afs.collection('servers/' + this.ss.activeServer + '/zStartingGear/ship/installedModules')
                    .valueChanges()
                    .pipe(take(1))
                    .subscribe((aInstalledModules) => {
                      aInstalledModules.some((aInstalledModule: any) => {
                        if (aInstalledModule.name !== 'cargo') {
                          this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + createShipResult.id + '/installedModules')
                            .add(Object.assign({}, aInstalledModule));
                        }
                      });
                    });
                });
            });
          });
        });
    });
    //endregion

    pBuildShip.then((success) => {
      const cog= +aItem.cost / +aItem.quantity;
      aItem.quantity= +aItem.quantity - 1;
      aItem.cost= +aItem.quantity * +cog;

      if(aItem.quantity === 0){
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete();
      }
      else{
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
          .update({quantity: aItem.quantity, cost: aItem.cost});
      }
    });
  }

  assembleShip(aItem) {
    //region Get Default Ship
    const pBuildShip= new Promise((resolve, reject) => {
      this.shipS.rpDS('basicShip').then((aBasicShip: any) => {
        console.log('Assemble Ship');
        console.log(aBasicShip);

        aBasicShip.aShip.name = 'Assembled Ship';
        aBasicShip.aShip.ownerID = this.ws.aWarehouse.ownerID;
        aBasicShip.aShip.solarBody = this.ws.aWarehouse.solarBody;
        aBasicShip.aShip.solarSystem = this.ws.aWarehouse.solarSystem;

        new Promise((uniResolve, uniReject) => {
          this.unis.rpSS(aBasicShip.aShip.solarSystem).then((aSolarSystem: any) => {
            aBasicShip.aShip.solarSystemName = aSolarSystem.name;
            this.unis.rpSB(aBasicShip.aShip.solarBody).then((aSolarBody: any) => {
              aBasicShip.aShip.solarBodyName = aSolarBody.name;
              uniResolve(true);
            });
          });
        })
          .then(() => {
            this.afs.collection('servers/' + this.ss.activeServer + '/ships').add(Object.assign({}, aBasicShip.aShip))
              .then((createShipResult: any) => {
                /*
                aBasicShip.aModules.some((aModule: any) => {
                  this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + createShipResult.id + '/installedModules')
                    .add(Object.assign({}, aModule));
                });
                */
                for(const aModule of aBasicShip.aModules) {
                  this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + createShipResult.id + '/installedModules')
                    .add(Object.assign({}, aModule));
                }

                /*
                aBasicShip.aModuleSlots.some((aModuleSlot: any) => {
                  this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + createShipResult.id + '/moduleSlots')
                    .doc(aModuleSlot.name)
                    .set(Object.assign({}, aModuleSlot));
                });
                */
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
    });
    //endregion

    pBuildShip.then((success) => {
      const cog= +aItem.cost / +aItem.quantity;
      aItem.quantity= +aItem.quantity - 1;
      aItem.cost= +aItem.quantity * +cog;

      if(aItem.quantity === 0){
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete();
      }
      else{
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
          .update({quantity: aItem.quantity, cost: aItem.cost});
      }
    });
  }

  prepareModule(aItem){
    const cog= +aItem.cost / +aItem.quantity;
    aItem.quantity= +aItem.quantity - 1;
    aItem.cost= +aItem.quantity * +cog;

    if(aItem.quantity === 0){
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete();
    }
    else{
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
        .update({quantity: aItem.quantity, cost: aItem.cost});
    }

    const preparedModule= Object.assign({}, aItem);
    preparedModule.quantity= 1;
    preparedModule.cost= preparedModule.cost / preparedModule.quantity;
    preparedModule.level= 1;
    preparedModule.type= 'Prepared Module';
    preparedModule.market= false;

    this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(preparedModule);
  }

  async upgradeModuleBoot(aItem) {
    //Need to find out what it will take
    const minLevel= +aItem.level + 1;
    const confirmTradeAlert = await this.ionAlert.create({
      cssClass: '',
      header: 'Upgrade Module',
      subHeader: 'Upgrading ' + aItem.displayName + ' to level ' + minLevel,
      message: 'Will consume ' + minLevel + ' ' + aItem.displayName + ' un-prepared modules',
      inputs: [],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            //console.log('Confirm Cancel');
          }
        },
        {
          text: 'Confirm',
          handler: (data: any) => {
            this.upgradeModule(minLevel, aItem);
          }
        }
      ]
    });

    await confirmTradeAlert.present();
  }

  upgradeModule(upgradeLevel, aItem){
    console.log(upgradeLevel);
    console.log(aItem);
    this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
      ref =>
        ref.where('ownerID', '==', this.ws.aWarehouse.id)
          .where('type', '==', 'Module')
          .where('name', '==', aItem.name)
    ).valueChanges({idField: 'id'})
      .pipe(take(1))
      .subscribe((aItems: any) => {
        if(aItems.length > 0){
          if(aItems[0].quantity >= upgradeLevel){
            const cog= +aItems[0].cost / +aItems[0].quantity;
            aItems[0].quantity= +aItems[0].quantity - upgradeLevel;
            aItems[0].cost= +aItems[0].quantity * +cog;

            if(aItems[0].quantity === 0){
              this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItems[0].id).delete();
            }
            else{
              this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItems[0].id)
                .update({quantity: aItems[0].quantity, cost: aItems[0].cost});
            }

            this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
              .update({level: upgradeLevel});
          }
          else{
            this.toastMessage('Not enough Spare Modules Available', 'danger');
          }
        }
        else{
          this.toastMessage('No Spare Modules Available', 'danger');
        }
      });
  }

  attachModule(aShip, aItem){
    //region Adjust Inv Levels
    const cog= +aItem.cost / +aItem.quantity;
    aItem.quantity= +aItem.quantity - 1;
    aItem.cost= +aItem.quantity * +cog;

    if(aItem.quantity === 0){
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete();
    }
    else{
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
        .update({quantity: aItem.quantity, cost: aItem.cost});
    }
    //endregion

    /*
    const newModule= {
      level: aItem.level,
      name: aItem.name,
      displayName: aItem.displayName
    };
    */

    this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + aShip.id + '/installedModules')
      .add(aItem);
  }
  //endregion

  //d

  //Other
  async toastMessage(msg, type?) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: type
    });
    toast.present();
  }

  ngOnDestroy() {
    //this.ws.inventorySub.unsubscribe();
  }
}
