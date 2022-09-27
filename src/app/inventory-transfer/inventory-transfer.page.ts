import {Component, Input, OnInit} from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AlertController} from '@ionic/angular';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {StationService} from '../services/station/station.service';
import {WarehouseService} from '../services/warehouse/warehouse.service';
import {GlobalService} from '../services/global/global.service';
import {ShipService} from '../services/ship/ship.service';

@Component({
  selector: 'app-inventory-transfer',
  templateUrl: './inventory-transfer.page.html',
  styleUrls: ['./inventory-transfer.page.scss'],
})
export class InventoryTransferPage implements OnInit {
  //todo update capacity
  //region Variables
  @Input() entity;
  @Input() entityViewed;

  aEInventory;
  aaEInventory;
  eCapacity;
  aFilteredEntityInventory;
  aEntityInventoryFilters= {
    name: '',
    quantity: '',
    type: '',
  };

  aEVInventory;
  aaEVInventory;
  evCapacity;
  aFilteredEntityVInventory;
  aEntityVInventoryFilters= {
    name: '',
    quantity: '',
    type: '',
  };
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private charS: CharacterService,
    private shipS: ShipService,
    public stationS: StationService,
    public warehouseS: WarehouseService,
    private afs: AngularFirestore,
    private ionAlert: AlertController,
    public us: UniverseService,
    private gs: GlobalService
  ) { }
  //endregion

  ngOnInit() {
    switch (this.entity){
      case 'ship':
        this.shipS.rpSI().then(() => {
          this.aEInventory= this.shipS.aInventory;
          this.aFilteredEntityInventory= this.aEInventory;
        });
        // this.aEInventory= this.shipS.rsSI();
        // this.aEInventory= this.shipS.aInventory;
        this.aaEInventory= this.shipS.aaInventory;
        this.eCapacity= this.shipS.capacityAvailable;
        break;
      case 'station':
        // this.aEInventory= this.stationS.rsSI();
        this.aEInventory= this.stationS.aInventory;
        this.aaEInventory= this.stationS.aaInventory;
        this.eCapacity= this.stationS.capacityAvailable;
        break;
    }

    switch (this.entityViewed){
      case 'warehouse':
        // this.aEVInventory= this.warehouseS.rsWI();
        this.aEVInventory= this.warehouseS.aInventory;
        this.evCapacity= this.warehouseS.capacityAvailable;
        break;
      case 'ship':
        // this.aEVInventory= this.shipS.rsSI();
        this.aEVInventory= this.shipS.aInventory;
        this.evCapacity= this.shipS.capacityAvailable;
        break;
    }
    this.aFilteredEntityVInventory= this.aEVInventory;
  }

  //region Update
  async transferAlert(destination, aItem, amount){
    if(amount <= aItem.quantity){
      let enoughRoom= 1;
      switch (destination){
        case 'station':
          if(this.stationS.capacityAvailable < amount){
            enoughRoom= 0;
          }
          break;
        case 'warehouse':
          if(this.warehouseS.capacityAvailable < amount){
            enoughRoom= 0;
          }
          break;
        case 'lWarehouse':
          if(this.warehouseS.lwCapacityAvailable < amount){
            enoughRoom= 0;
          }
          break;
        case 'ship':
          if(this.shipS.capacityAvailable < amount){
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
        await this.gs.toastMessage('Not enough Room', 'danger');
      }
    }
  }

  performTrade(destination, aItem, amount){
    const twSItemCog= +aItem.cost / +aItem.quantity;

    switch (destination){
      case 'warehouse':
        //Add to warehouse
        if(this.stationS.aaWInventory[aItem.name] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          const twWItemCog= +this.warehouseS.aaInventory[aItem.name].cost / +this.warehouseS.aaInventory[aItem.name].quantity;
          const wNewItemCog= +twWItemCog + +twSItemCog;
          const wNewQuantity= +this.warehouseS.aaInventory[aItem.name].quantity + +amount;
          const wNewItemCost= +wNewQuantity * +wNewItemCog;

          //Update Warehouse Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.warehouseS.aaInventory[aItem.name].id)
            .update({
              cost: wNewItemCost,
              quantity: wNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= aItem;
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.warehouseS.aWarehouse.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
      case 'lWarehouse':
        //Add to warehouse
        if(this.stationS.aaWInventory[aItem.name] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          const tlwWItemCog= +this.warehouseS.aaLInventory[aItem.name].cost / +this.warehouseS.aaLInventory[aItem.name].quantity;
          const lwNewItemCog= +tlwWItemCog + +twSItemCog;
          const lwNewQuantity= +this.warehouseS.aaLInventory[aItem.name].quantity + +amount;
          const lwNewItemCost= +lwNewQuantity * +lwNewItemCog;

          //Update Warehouse Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.warehouseS.aaLInventory[aItem.name].id)
            .update({
              cost: lwNewItemCost,
              quantity: lwNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= aItem;
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.warehouseS.aLWarehouse.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
      case 'ship':
        //Add to Ship
        if(this.shipS.aaInventory[aItem.name] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          console.log('Add item back to ship');
          const tsSItemCog= +this.shipS.aaInventory[aItem.name].cost / +this.shipS.aaInventory[aItem.name].quantity;
          const sNewItemCog= +twSItemCog + +tsSItemCog;
          const sNewQuantity= +this.shipS.aaInventory[aItem.name].quantity + +amount;
          const sNewItemCost= +sNewQuantity * +sNewItemCog;

          //Update Ship Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.shipS.aaInventory[aItem.name].id)
            .update({
              cost: sNewItemCost,
              quantity: sNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= aItem;
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.shipS.aShip.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
      case 'station':
        //Add to Station
        if(this.stationS.aaInventory[aItem.name] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          const tsSItemCog= +this.stationS.aaInventory[aItem.name].cost / +this.stationS.aaInventory[aItem.name].quantity;
          const sNewItemCog= +twSItemCog + +tsSItemCog;
          const sNewQuantity= +this.stationS.aaInventory[aItem.name].quantity + +amount;
          const sNewItemCost= +sNewQuantity * +sNewItemCog;

          //Update Ship Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.stationS.aaInventory[aItem.name].id)
            .update({
              cost: sNewItemCost,
              quantity: sNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= aItem;
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.stationS.aStation.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
    }

    //region Remove from Entity
    if((+aItem.quantity - +amount) === 0){
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aItem.id).delete().then(() => {
        this.getCaps();
      });
    }
    else{
      aItem.quantity= +aItem.quantity - +amount;
      aItem.cost= +aItem.quantity * +twSItemCog;
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
        .doc(aItem.id)
        .update({
          cost: aItem.cost,
          quantity: aItem.quantity
        }).then(() => {
        this.getCaps();
      });
    }
    //endregion
  }

  getCaps(){
    switch (this.entity){
      case 'ship':
        this.eCapacity= this.shipS.capacityAvailable;
        break;
      case 'station':
        this.eCapacity= this.stationS.capacityAvailable;
        break;
    }

    switch (this.entityViewed){
      case 'warehouse':
        this.evCapacity= this.warehouseS.capacityAvailable;
        break;
      case 'lWarehouse':
        this.evCapacity= this.warehouseS.lwCapacityAvailable;
        break;
      case 'ship':
        this.evCapacity= this.shipS.capacityAvailable;
        break;
    }
  }

  filterEntityInventory(){
    this.aFilteredEntityInventory= this.aEInventory.filter((aInventory) =>
        this.ss.aaDefaultItems[aInventory.itemID].displayName.toLowerCase().indexOf(this.aEntityInventoryFilters.name.toLowerCase()) > -1
        && this.ss.aaDefaultItems[aInventory.itemID].type.toLowerCase().indexOf(this.aEntityInventoryFilters.type.toLowerCase()) > -1
    );
  }

  filterEntityVInventory(){
    this.aFilteredEntityVInventory= this.aEVInventory.filter((aInventory) =>
      this.ss.aaDefaultItems[aInventory.itemID].displayName.toLowerCase().indexOf(this.aEntityVInventoryFilters.name.toLowerCase()) > -1
      && this.ss.aaDefaultItems[aInventory.itemID].type.toLowerCase().indexOf(this.aEntityVInventoryFilters.type.toLowerCase()) > -1
    );
  }
  //endregion
}
