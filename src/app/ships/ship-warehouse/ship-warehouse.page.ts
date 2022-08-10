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
import {GlobalService} from '../../services/global/global.service';
import {Warehouse} from '../../classes/warehouse';

@Component({
  selector: 'app-ship-warehouse',
  templateUrl: './ship-warehouse.page.html',
  styleUrls: ['./ship-warehouse.page.scss'],
})
export class ShipWarehousePage implements OnInit {
  //region Variables
  foundWarehouse= false;
  warehouseBoot= false;
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    private ionAlert: AlertController,
    private cs: CharacterService,
    public us: UniverseService,
    public shipS: ShipService,
    public ws: WarehouseService,
    private gs: GlobalService
  ) { }
  //endregion

  ngOnInit() {
    if(this.shipS.aWarehouse){
      this.shipS.rpLWI();
    }
  }

  //region Create
  cWarehouse(){
    let sufficient= 1;
    //Does ship have 4 Cargo Modules in cargo?
    this.ss.aaDStructures.warehouse.construction.some((aRequirement: any) => {
      switch (aRequirement.name){
        case 'labor':
          if(aRequirement.amount > this.cs.aCharacter.pulsars){
            sufficient= 0;
          }
          break;
        case 'cargo':
          if(aRequirement.amount > this.shipS.aaInventory.cargo.quantity){
            sufficient= 0;
          }
          break;
      }
    });

    if(sufficient === 1){
      //Proceed with Build
      //Remove Cargo from Ship
      this.ss.aaDStructures.warehouse.construction.some((aRequirement: any) => {
        switch (aRequirement.name){
          case 'labor':
            this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars - +aRequirement.amount;
            this.afs.collection('servers/'+this.ss.activeServer+'/characters')
              .doc(this.cs.aCharacter.id).update({pulsars: this.cs.aCharacter.pulsars});
            break;
          case 'cargo':
            if(this.shipS.aaInventory.cargo.quantity === aRequirement.amount){
              this.afs.collection('servers/'+this.ss.activeServer+'/inventories')
                .doc(this.shipS.aaInventory.cargo.id).delete();
            }
            else{
              this.afs.collection('servers/'+this.ss.activeServer+'/inventories')
                .doc(this.shipS.aaInventory.cargo.id)
                .update({quantity: +this.shipS.aaInventory.cargo.quantity - +aRequirement.amount});
            }
            break;
        }
      });
      //Build Warehouse
      const aWarehouse= new Warehouse();
      aWarehouse.ownerID= this.cs.aCharacter.id;
      aWarehouse.level= 1;
      aWarehouse.name= 'warehouse';
      aWarehouse.solarSystem= this.shipS.aShip.solarSystem;
      aWarehouse.solarBody= this.shipS.aShip.solarBody;
      this.afs.collection('servers/' + this.ss.activeServer + '/warehouses')
        .add(Object.assign({}, aWarehouse)).then(() => {
          this.shipS.rpShip().then(() => {
            this.shipS.rpLWI();
          });
      });
    }
  }
  //endregion

  getWarehouse(){

  }

  async transferAlert(destination, aItem, amount){
    if(amount <= aItem.quantity){
      let enoughRoom= 1;
      switch (destination){
        case 'ship':
          if(this.shipS.capacityAvailable < amount){
            enoughRoom= 0;
          }
          break;
        case 'warehouse':
          if(this.shipS.wCapacityAvailable < amount){
            enoughRoom= 0;
          }
          break;
      }

      if(enoughRoom === 1){
        const confirmTradeAlert = await this.ionAlert.create({
          cssClass: '',
          header: 'Confirm Transfer',
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
                this.performTrade(destination, aItem, amount);
              }
            }
          ]
        });
        await confirmTradeAlert.present();
      }
      else{
        this.gs.toastMessage('Not enough Room', 'danger');
      }
    }
  }

  performTrade(destination, aItem, amount){
    switch (destination){
      case 'warehouse':
        const twSItemCog= +aItem.cost / +aItem.quantity;

        //Add to warehouse
        if(this.shipS.aaWInventory[aItem.name]){
          const twWItemCog= +this.shipS.aaWInventory[aItem.name].cost / +this.shipS.aaWInventory[aItem.name].quantity;
          const wNewItemCog= +twWItemCog + +twSItemCog;
          const wNewQuantity= +this.shipS.aaWInventory[aItem.name].quantity + +amount;
          const wNewItemCost= +wNewQuantity * +wNewItemCog;

          //Update Warehouse Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.shipS.aaWInventory[aItem.name].id)
            .update({
              cost: wNewItemCost,
              quantity: wNewQuantity
            });
        }
        else{
          const newItem= this.ss.aaDefaultItems[aItem.name];
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.shipS.aWarehouse.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem);
        }

        //Remove from Ship
        if((+aItem.quantity - +amount) === 0){
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete();
        }
        else{
          aItem.quantity= +aItem.quantity - +amount;
          aItem.cost= +aItem.quantity * +twSItemCog;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(aItem.id)
            .update({
              cost: aItem.cost,
              quantity: aItem.quantity
            });
        }
        break;
      case 'ship':
        const tsWItemCog= +aItem.cost / +aItem.quantity;

        //Add to Ship
        if(this.shipS.aaInventory[aItem.name]){
          console.log('Add item back to ship');
          const tsSItemCog= +this.shipS.aaInventory[aItem.name].cost / +this.shipS.aaInventory[aItem.name].quantity;
          const sNewItemCog= +tsWItemCog + +tsSItemCog;
          const sNewQuantity= +this.shipS.aaInventory[aItem.name].quantity + +amount;
          const sNewItemCost= +sNewQuantity * +sNewItemCog;

          //Update Ship Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.shipS.aaInventory[aItem.name].id)
            .update({
              cost: sNewItemCost,
              quantity: sNewQuantity
            });
        }
        else{
          const newItem= this.ss.aaDefaultItems[aItem.name];
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +tsWItemCog;
          newItem.ownerID= this.shipS.aShip.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem);
        }

        //Remove from Warehouse
        if((+aItem.quantity - +amount) === 0){
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete();
        }
        else{
          aItem.quantity= +aItem.quantity - +amount;
          aItem.cost= +aItem.quantity * +tsWItemCog;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(aItem.id)
            .update({
              cost: aItem.cost,
              quantity: aItem.quantity
            });
        }
        break;
    }

    //Set Capacity
    this.shipS.setCargoCapacity();
    this.shipS.setWCargoCapacity();
  }
}
