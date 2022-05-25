import { Component, OnInit } from '@angular/core';
import {SolarBody, SolarSystem} from '../../classes/universe';
import {ServerService} from '../../services/server/server.service';
import {ShipService} from '../../services/ship/ship.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AlertController} from '@ionic/angular';
import {CharacterService} from '../../services/character/character.service';
import {UniverseService} from '../../services/universe/universe.service';
import {ColonyService} from '../../services/colony/colony.service';
import {WarehouseService} from '../../services/warehouse/warehouse.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-ship-warehouse',
  templateUrl: './ship-warehouse.page.html',
  styleUrls: ['./ship-warehouse.page.scss'],
})
export class ShipWarehousePage implements OnInit {
  //region Variables
  warehouseBoot= false;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    private ionAlert: AlertController,
    private cs: CharacterService,
    public us: UniverseService,
    public shipS: ShipService,
    public ws: WarehouseService
  ) { }
  //endregion

  ngOnInit() {
    this.getWarehouse();
  }

  getWarehouse(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('ship-warehouse: getWarehouse');
    }
    this.afs.collection('servers/' + this.ss.activeServer + '/warehouses',
      ref =>
        ref.where('solarBody', '==', this.shipS.aShip.solarBody).where('ownerID', '==', this.shipS.aShip.ownerID)
    ).valueChanges({idField:'id'})
      .pipe(take(1))
      .subscribe((aWarehouse: any) => {
        if(this.ss.aRules.consoleLogging.mode >= 2){
          console.log(aWarehouse);
        }
        this.ws.readWarehouse(aWarehouse[0].id).then((rwRes: any) => {
          this.ws.rwiP().then((rwiPRes: any) => {
            this.warehouseBoot= true;
          });
        });
      });
  }

  async confirmTradeAlert(destination, item, amount){
    const confirmTradeAlert = await this.ionAlert.create({
      cssClass: '',
      header: 'Confirm Transaction',
      subHeader: '',
      message: 'Please Confirm: Transfer ' + amount + ' to ' + destination,
      inputs: [
        /*
        {
          name: 'amount',
          type: 'number',
          placeholder: '100'
        }
        */
      ],
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
            this.performTrade(destination, item, amount);
          }
        }
      ]
    });

    await confirmTradeAlert.present();
  }

  performTrade(destination, item, amount){
    const wItemCost= +item.cost / +item.quantity;
    const sItemCost= +this.shipS.aInventory[item.name].cost / +this.shipS.aInventory[item.name].quantity;
    switch (destination){
      case 'ship':
        //Update Colony Inventory
        item.quantity= +item.quantity - +amount;
        item.cost= +item.cost - (+wItemCost * +amount);
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update(Object.assign({}, item));
        //update Ship Inventory
        this.shipS.aInventory[item.name].quantity= +this.shipS.aInventory[item.name].quantity + +amount;
        this.shipS.aInventory[item.name].cost= +this.shipS.aInventory[item.name].cost + (+wItemCost * +amount);
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(this.shipS.aInventory[item.name].id)
          .update(Object.assign({}, this.shipS.aInventory[item.name]));
        break;
      case 'warehouse':
        //Update Colony Inventory
        item.quantity= +item.quantity + +amount;
        item.cost= +item.cost + (+sItemCost * +amount);
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update(Object.assign({}, item));

        //update Ship Inventory
        this.shipS.aInventory[item.name].quantity= +this.shipS.aInventory[item.name].quantity - +amount;
        this.shipS.aInventory[item.name].cost= +this.shipS.aInventory[item.name].cost - (+sItemCost * +amount);
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(this.shipS.aInventory[item.name].id)
          .update(Object.assign({}, this.shipS.aInventory[item.name]));
        break;
    }

    //Set Capacity
    this.shipS.setCargoCapacity();

    //Log transaction
    this.afs.collection('servers/' + this.ss.activeServer + '/transactionLogs').add(
      {
        type: 'transfer',
        to: destination,
        item: item.name,
        quantity: amount
      }
    );
  }
}
