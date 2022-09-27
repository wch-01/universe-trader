import {Component, Input, OnInit} from '@angular/core';
import {AngularFirestore, DocumentSnapshot} from '@angular/fire/compat/firestore';
import {ShipService} from '../services/ship/ship.service';
import {WarehouseService} from '../services/warehouse/warehouse.service';
import {take} from 'rxjs/operators';
import {ServerService} from '../services/server/server.service';
import {UniverseService} from '../services/universe/universe.service';
import {AlertController} from '@ionic/angular';
import {GlobalService} from '../services/global/global.service';
import {CharacterService} from '../services/character/character.service';
import {StationService} from '../services/station/station.service';
import {Station} from '../classes/station';
import {Item} from '../classes/item';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
})
export class InventoryPage implements OnInit {
  //region Variables
  @Input() entity: any;
  @Input() entityID: any;

  aEntityInventory;
  entityCapacity;
  localSSID;
  localSBID;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public ss: ServerService,
    private shipS: ShipService,
    private warehouseS: WarehouseService,
    private uniS: UniverseService,
    private ionAlert: AlertController,
    public globalS: GlobalService,
    public charS: CharacterService,
    private stationS: StationService,
  ) { }
  //endregion

  ngOnInit() {
    this.readInventories();
    this.charS.readCharacterStations();
  }

  readInventories(){
    switch (this.entity) {
      case 'ship':
        this.shipS.rpSI().then(() => {
          this.aEntityInventory= this.shipS.aInventory;
          this.entityCapacity= this.shipS.capacityAvailable;
          this.localSSID= this.shipS.aShip.solarSystem;
          this.localSBID= this.shipS.aShip.solarBody;
        });
        break;
      case 'warehouse':
        this.warehouseS.rpWI().then(() => {
          this.aEntityInventory= this.warehouseS.aInventory;
          this.entityCapacity= this.warehouseS.capacityAvailable;
          this.localSSID= this.warehouseS.aWarehouse.solarSystem;
          this.localSBID= this.warehouseS.aWarehouse.solarBody;
          this.charS.readCharacterShips();
        });
        break;
    }
  }

  //region Create
  assembleShip(aItem) {
    //region Get Default Ship
    const pBuildShip= new Promise((resolve, reject) => {
      this.shipS.rpDS('basicShip').then((aBasicShip: any) => {
        console.log('Assemble Ship');
        console.log(aBasicShip);

        aBasicShip.aShip.name = 'Assembled Ship';
        aBasicShip.aShip.ownerID = this.warehouseS.aWarehouse.ownerID;
        aBasicShip.aShip.solarBody = this.warehouseS.aWarehouse.solarBody;
        aBasicShip.aShip.solarSystem = this.warehouseS.aWarehouse.solarSystem;

        new Promise((uniResolve, uniReject) => {
          this.uniS.rpSS(this.localSSID).then((aSolarSystem: any) => {
            aBasicShip.aShip.solarSystemName = aSolarSystem.name;
            this.uniS.rpSB(this.localSBID).then((aSolarBody: any) => {
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
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete().then(() => {
          this.readInventories();
        });
      }
      else{
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
          .update({quantity: aItem.quantity, cost: aItem.cost}).then(() => {
          this.readInventories();
        });
      }
    });
  }

  deployStation(aItem) {
    console.log('Launch Station');
    console.log(aItem.name);
    //region Get Station Template
    const pDeployStation= new Promise((resolve, reject) => {
      this.stationS.rpDS(aItem.itemID).then((oStation: DocumentSnapshot<Station>) => {
        console.log(oStation);
        const aStation= oStation.data() as Station;
        console.log(aStation);

        aStation.name = 'Deployed Station';
        aStation.ownerID = this.warehouseS.aWarehouse.ownerID;
        aStation.solarBodyID = this.warehouseS.aWarehouse.solarBody;
        aStation.solarSystemID = this.warehouseS.aWarehouse.solarSystem;

        console.log(aStation);

        this.afs.collection('servers/' + this.ss.activeServer + '/stations').add(Object.assign({}, aStation))
          .then((createStationResult: any) => {
            resolve(true);
            //todo handle errors
          });
      });
    });
    //endregion

    pDeployStation.then((success) => {
      const cog= +aItem.cost / +aItem.quantity;
      aItem.quantity= +aItem.quantity - 1;
      aItem.cost= +aItem.quantity * +cog;

      if(aItem.quantity === 0){
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete().then(() => {
          this.readInventories();
        });
      }
      else{
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
          .update({quantity: aItem.quantity, cost: aItem.cost}).then(() => {
          this.readInventories();
        });
      }
    });
  }

  prepareModule(aItem){
    const cog= +aItem.cost / +aItem.quantity;
    aItem.quantity= +aItem.quantity - 1;
    aItem.cost= +aItem.quantity * +cog;

    if(aItem.quantity === 0){
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete().then(() => {});
    }
    else{
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id)
        .update({quantity: aItem.quantity, cost: aItem.cost}).then(() => {});
    }

    const newID= aItem.itemID.replace('packaged', 'prepared');
    const preparedModule= {} as Item;
    preparedModule.itemID= newID;
    preparedModule.ownerID= aItem.ownerID;
    preparedModule.quantity= 1;
    preparedModule.cost= cog;
    preparedModule.level= 1;

    /*
    if(aItem.type === 'Station Module'){
      preparedModule.type= 'Prepared Station Module';
    }
    else{
      preparedModule.type= 'Prepared Module';
    }
    preparedModule.market= false;
    */

    this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(preparedModule).then(() => {
      this.readInventories();
    });
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
        ref.where('ownerID', '==', this.warehouseS.aWarehouse.id)
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
              .update({level: upgradeLevel}).then(() => {
              this.readInventories();
            });
          }
          else{
            this.globalS.toastMessage('Not enough Spare Modules Available', 'danger');
          }
        }
        else{
          this.globalS.toastMessage('No Spare Modules Available', 'danger');
        }
      });
  }
  //endregion
}
