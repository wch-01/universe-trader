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

  eID;
  aEInventorySub;
  aEInventory;
  aaEInventory;
  eCapacity;
  aFilteredEntityInventory;
  aEntityInventoryFilters= {
    name: '',
    quantity: '',
    type: '',
  };

  veID;
  aEVInventorySub;
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
        this.eID= this.shipS.id;
        this.aEInventorySub= this.shipS.rsSI();
        /*this.shipS.rpSI().then(() => {
          this.aEInventory= this.shipS.aInventory;
          this.aFilteredEntityInventory= this.aEInventory;
          this.eCapacity= this.shipS.capacityAvailable;
        });*/
        break;
      case 'station':
        this.eID= this.stationS.stationID;
        this.aEInventorySub= this.stationS.rsSI();
        break;
    }
    this.aEInventorySub.subscribe((aInventory) => {
      this.aEInventory= aInventory;
      this.aFilteredEntityInventory= this.aEInventory;

      //region Associated Array
      this.aaEInventory= {};
      aInventory.some((item: any) => {
        if(this.ss.aRules.consoleLogging.mode >= 2){
          console.log(item);
        }
        //this.aaInventory[item.itemID]= item;

        if(item.type === 'Prepared Module'){
          item.reference.type= 'Prepared Module';
          this.aaEInventory[item.itemID+'_pm']= item;
          this.aaEInventory[item.itemID+'_pm'].reference.type= 'Prepared Module';
        }
        else{
          this.aaEInventory[item.itemID]= item;
        }
      });
      //endregion

      //region Entity Capacity
      switch (this.entity){
        case 'ship':
          this.shipS.setCargoCapacity().then(() => {
            this.eCapacity= this.shipS.capacityAvailable;
          });
          break;
        case 'station':
          this.shipS.setCargoCapacity().then(() => {
            this.eCapacity= this.stationS.capacityAvailable;
          });
          break;
      }
      //endregion

      this.filterEntityInventory();
    });

    switch (this.entityViewed){
      case 'warehouse':
        this.veID= this.warehouseS.aWarehouse.id;
        this.aEVInventorySub= this.warehouseS.rsWI();
        /*this.warehouseS.rpWI().then(() => {
          this.aEVInventory= this.warehouseS.aInventory;
          this.aFilteredEntityVInventory= this.aEVInventory;
          this.evCapacity= this.warehouseS.capacityAvailable;
        });*/
        break;
      case 'ship':
        this.aEVInventorySub= this.shipS.rsSI();
        break;
    }
    this.aEVInventorySub.subscribe((aInventory) => {
      this.aEVInventory= aInventory;
      this.aFilteredEntityVInventory= this.aEVInventory;

      //region Associated Array
      this.aaEVInventory= {};
      aInventory.some((item: any) => {
        if(this.ss.aRules.consoleLogging.mode >= 2){
          console.log(item);
        }
        //this.aaInventory[item.itemID]= item;

        if(item.type === 'Prepared Module'){
          item.reference.type= 'Prepared Module';
          this.aaEVInventory[item.itemID+'_pm']= item;
          this.aaEVInventory[item.itemID+'_pm'].reference.type= 'Prepared Module';
        }
        else{
          this.aaEVInventory[item.itemID]= item;
        }
      });
      //endregion

      //region Viewed Entity Capacity
      switch (this.entityViewed){
        case 'warehouse':
          this.evCapacity= this.warehouseS.capacityAvailable;
          break;
        case 'ship':
          this.evCapacity= this.shipS.capacityAvailable;
          break;
      }
      //endregion

      this.filterEntityVInventory();
    });
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
          header: 'Confirm Transfer ' + aItem.quantity,
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
                console.log(aItem.quantity);
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
    console.log(aItem.quantity);
    const twSItemCog= +aItem.cost / +aItem.quantity;

    switch (destination){
      case this.entityViewed:
        if(this.aaEVInventory[aItem.itemID] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          const twWItemCog= +this.aaEVInventory[aItem.itemID].cost / +this.aaEVInventory[aItem.itemID].quantity;
          const wNewItemCog= +twWItemCog + +twSItemCog;
          const wNewQuantity= +this.aaEVInventory[aItem.itemID].quantity + +amount;
          const wNewItemCost= +wNewQuantity * +wNewItemCog;

          //Update Warehouse Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.aaEVInventory[aItem.itemID].id)
            .update({
              cost: wNewItemCost,
              quantity: wNewQuantity
            }).then(() => {});
        }
        else{
          console.log('VE does not have item: ' + this.veID);
          const newItem= Object.assign({}, aItem);
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.veID;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
      case this.entity:
        if(this.aaEInventory[aItem.itemID] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          const twWItemCog= +this.aaEInventory[aItem.itemID].cost / +this.aaEInventory[aItem.itemID].quantity;
          const wNewItemCog= +twWItemCog + +twSItemCog;
          const wNewQuantity= +this.aaEInventory[aItem.itemID].quantity + +amount;
          const wNewItemCost= +wNewQuantity * +wNewItemCog;

          //Update Warehouse Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.aaEInventory[aItem.itemID].id)
            .update({
              cost: wNewItemCost,
              quantity: wNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= Object.assign({}, aItem);
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.eID;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
    }

    /*switch (destination){
      case 'warehouse':
        //Add to warehouse
        if(this.warehouseS.aaInventory[aItem.itemID] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          const twWItemCog= +this.warehouseS.aaInventory[aItem.itemID].cost / +this.warehouseS.aaInventory[aItem.itemID].quantity;
          const wNewItemCog= +twWItemCog + +twSItemCog;
          const wNewQuantity= +this.warehouseS.aaInventory[aItem.itemID].quantity + +amount;
          const wNewItemCost= +wNewQuantity * +wNewItemCog;

          //Update Warehouse Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.warehouseS.aaInventory[aItem.itemID].id)
            .update({
              cost: wNewItemCost,
              quantity: wNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= Object.assign({}, aItem);
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.warehouseS.aWarehouse.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
      case 'lWarehouse':
        //Add to warehouse
        if(this.warehouseS.aaInventory[aItem.itemID] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          const tlwWItemCog= +this.warehouseS.aaLInventory[aItem.itemID].cost / +this.warehouseS.aaLInventory[aItem.itemID].quantity;
          const lwNewItemCog= +tlwWItemCog + +twSItemCog;
          const lwNewQuantity= +this.warehouseS.aaLInventory[aItem.itemID].quantity + +amount;
          const lwNewItemCost= +lwNewQuantity * +lwNewItemCog;

          //Update Warehouse Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.warehouseS.aaLInventory[aItem.itemID].id)
            .update({
              cost: lwNewItemCost,
              quantity: lwNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= Object.assign({}, aItem);
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.warehouseS.aLWarehouse.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
      case 'ship':
        //Add to Ship
        if(this.shipS.aaInventory[aItem.itemID] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          console.log('Add item back to ship');
          const tsSItemCog= +this.shipS.aaInventory[aItem.itemID].cost / +this.shipS.aaInventory[aItem.itemID].quantity;
          const sNewItemCog= +twSItemCog + +tsSItemCog;
          const sNewQuantity= +this.shipS.aaInventory[aItem.itemID].quantity + +amount;
          const sNewItemCost= +sNewQuantity * +sNewItemCog;

          //Update Ship Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.shipS.aaInventory[aItem.itemID].id)
            .update({
              cost: sNewItemCost,
              quantity: sNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= Object.assign({}, aItem);
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.shipS.aShip.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
      case 'station':
        //Add to Station
        if(this.stationS.aaInventory[aItem.itemID] && aItem.type !== 'Prepared Module' && aItem.type !== 'Prepared Station Module'){
          const tsSItemCog= +this.stationS.aaInventory[aItem.itemID].cost / +this.stationS.aaInventory[aItem.itemID].quantity;
          const sNewItemCog= +twSItemCog + +tsSItemCog;
          const sNewQuantity= +this.stationS.aaInventory[aItem.itemID].quantity + +amount;
          const sNewItemCost= +sNewQuantity * +sNewItemCog;

          //Update Ship Inv
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(this.stationS.aaInventory[aItem.itemID].id)
            .update({
              cost: sNewItemCost,
              quantity: sNewQuantity
            }).then(() => {});
        }
        else{
          const newItem= Object.assign({}, aItem);
          newItem.quantity= amount;
          newItem.cost= +newItem.quantity * +twSItemCog;
          newItem.ownerID= this.stationS.aStation.id;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .add(newItem).then(() => {});
        }
        break;
    }*/

    console.log(aItem.quantity);
    //region Remove from Entity
    if((+aItem.quantity - +amount) === 0){
      console.log('Amount Remaining is 0');
      console.log(aItem.quantity +' - '+ amount);
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
