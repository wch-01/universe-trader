import {Component, Input, OnInit} from '@angular/core';
import {SolarBody, SolarSystem} from '../../../classes/universe';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../../services/server/server.service';
import {StationService} from '../../../services/station/station.service';
import {CharacterService} from '../../../services/character/character.service';
import {ShipService} from '../../../services/ship/ship.service';
import {WarehouseService} from '../../../services/warehouse/warehouse.service';
import {GlobalService} from '../../../services/global/global.service';
import {LoggingService} from '../../../services/logging/logging.service';
import {Item} from '../../../classes/item';
import {Transaction} from '../../../classes/transaction';

@Component({
  selector: 'app-station-sell',
  templateUrl: './station-sell.page.html',
  styleUrls: ['./station-sell.page.scss'],
})
export class StationSellPage implements OnInit {
  //region Variables
  @Input() trader: any;

  aListedItems;
  aInventoryLevels;
  aaInventoryLevels;
  capacityAvailable= 0;
  capacityTotal= 0;
  capacityUsed= 0;
  showTrade= false;
  aMarketInventory: any;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody()
  };

  //region Colonies
  aColony;
  aColonies;
  aColonyInventory;
  //endregion

  //region List Item
  listItemModalDisplay= false;
  aListingItem: any;
  //endregion
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    public stationS: StationService,
    public charS: CharacterService,
    public shipS: ShipService,
    public warehouseS: WarehouseService,
    private globalS: GlobalService,
    private loggingS: LoggingService
  ) { }
  //endregion

  ngOnInit() {
    this.afs.collection('servers/'+this.ss.activeServer+'/inventories',
      ref =>
        ref.where('listerID', '==', this.charS.id)
    )
      .valueChanges({idField: 'id'})
      .subscribe((aItems) => {
        this.aListedItems= aItems;
        console.log(aItems);
        console.log(this.aListedItems);
      });

    switch (this.trader) {
      case 'ship':
        this.aaInventoryLevels= this.shipS.aInventory;
        this.capacityAvailable= this.shipS.capacityAvailable;
        break;
      case 'warehouse':
        this.aInventoryLevels= this.warehouseS.aInventory;
        this.aaInventoryLevels= this.warehouseS.aaInventory;
        this.capacityAvailable= this.warehouseS.capacityAvailable;
        break;
    }
  }

  removeListing(aItem){
    let newItem= new Item();
    if(this.capacityAvailable >= aItem.quantity){
      if(this.aaInventoryLevels[aItem.name] && this.aaInventoryLevels[aItem.name].type !== 'Prepared Module'){
        this.aaInventoryLevels[aItem.name].quantity= +this.aaInventoryLevels[aItem.name].quantity + +aItem.quantity;
        newItem= this.aaInventoryLevels[aItem.name];
        newItem.cost= +newItem.cost + (+aItem.cog * +aItem.quantity);
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
          .doc(newItem.id).update(Object.assign({}, newItem)).then(() => {
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(aItem.id).delete().then(() => {});
        });
      }
      else{
        newItem= this.ss.aaDefaultItems[aItem.name];
        newItem.quantity= aItem.quantity;
        newItem.cog= aItem.cog;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
          .add(Object.assign({}, newItem)).then(() => {
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories')
            .doc(aItem.id).delete().then(() => {});
        });
      }
    }
    else{
      console.log(this.capacityAvailable);
      this.globalS.toastMessage('Not enough Room to take items', 'danger');
    }
  }

  async listItemModal(item){
    this.aListingItem= item;
    this.listItemModalDisplay= true;
  }

  performListing(){
    const cog= this.aListingItem.cost / this.aListingItem.quantity;
    const newListedItem= new Item();
    let inventoriedItem: any;
    switch (this.trader) {
      case 'ship':
        inventoriedItem= this.shipS.aInventory[this.aListingItem.name];
        break;
      case 'warehouse':
        inventoriedItem= this.warehouseS.aaInventory[this.aListingItem.name];
        break;
    }

    //region Update Station Inventory
    //region Listed Item Object
    newListedItem.name= this.aListingItem.name;
    newListedItem.listPrice= this.aListingItem.price;
    newListedItem.quantity= this.aListingItem.amount;
    newListedItem.ownerID= this.stationS.aStation.id;
    newListedItem.listerID= this.charS.id;
    newListedItem.marketFee= this.stationS.aStation.marketFee;
    newListedItem.activeListing= true;
    newListedItem.cog= cog;
    //endregion

    this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, newListedItem));
    //endregion

    //region Update Warehouse/Ship Inventory
    inventoriedItem.quantity= +inventoriedItem.quantity - +this.aListingItem.amount;
    inventoriedItem.cost= +inventoriedItem.cost - +(cog * +this.aListingItem.amount);
    if(inventoriedItem.quantity === 0){
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id).delete();
    }
    else{
      this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id)
        .update(Object.assign({}, inventoriedItem));
    }
    //endregion

    //region update character money
    this.charS.aCharacter.pulsars= +this.charS.aCharacter.pulsars - +this.stationS.aStation.listFee;
    this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.charS.aCharacter.id)
      .update({pulsars:this.charS.aCharacter.pulsars});
    //endregion

    //Set Capacity
    switch (this.trader) {
      case 'ship':
        this.shipS.setCargoCapacity();
        this.capacityAvailable= this.shipS.capacityAvailable;
        break;
      case 'warehouse':
        this.warehouseS.setCargoCapacity();
        this.capacityAvailable= this.warehouseS.capacityAvailable;
        break;
    }

    //region Log transaction
    const transaction= new Transaction();
    transaction.details= new Transaction().details;
    transaction.characterID= this.charS.aCharacter.id;
    transaction.type= 'list item on market';
    transaction.item= this.aListingItem.name;
    transaction.pulsars= this.stationS.aStation.listFee;
    transaction.balance= this.charS.aCharacter.pulsars;
    transaction.details.quantity= this.aListingItem.amount;
    this.loggingS.logTransaction(transaction);
    //endregion

    this.listItemModalDisplay= false;
  }

  //region List Item Modal
  listItemModalClose(){
    this.listItemModalDisplay= false;
  }
  listItemModalClosing(event: Event){
    this.listItemModalDisplay= false;
    console.log('close listing modal');
    console.log(event);
  }
  //endregion

}
