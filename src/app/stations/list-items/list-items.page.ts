import {Component, Input, OnInit} from '@angular/core';
import {SolarBody, SolarSystem} from '../../classes/universe';
import {ServerService} from '../../services/server/server.service';
import {ShipService} from '../../services/ship/ship.service';
import {WarehouseService} from '../../services/warehouse/warehouse.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AlertController} from '@ionic/angular';
import {CharacterService} from '../../services/character/character.service';
import {UniverseService} from '../../services/universe/universe.service';
import {ColonyService} from '../../services/colony/colony.service';
import {StationService} from '../../services/station/station.service';
import {Item} from '../../classes/item';

@Component({
  selector: 'app-list-items',
  templateUrl: './list-items.page.html',
  styleUrls: ['./list-items.page.scss'],
})
export class ListItemsPage implements OnInit {
  //region Variables
  @Input() trader: any;

  nsTab= 'market';
  aMarketInventory: any;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody()
  };
  //region Cargo
  aInventoryLevels;
  aaInventoryLevels;
  capacityTotal= 0;
  capacityUsed= 0;
  capacityAvailable= 0;
  showTrade= false;
  //endregion

  //region Colonies
  aColony;
  aColonies;
  aColonyInventory;
  //endregion
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    public shipS: ShipService,
    public warehouseS: WarehouseService,
    private afs: AngularFirestore,
    private ionAlert: AlertController,
    private cs: CharacterService,
    public us: UniverseService,
    public colonyS: ColonyService,
    public stationS: StationService,
  ) { }
  //endregion

  ngOnInit() {
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

  async confirmListAlert(item, amount, price){
    const salesTaxTotal= (amount * price) * (this.stationS.aStation.marketFee / 100);
    const confirmListAlert = await this.ionAlert.create({
      cssClass: '',
      header: 'Confirm Transaction',
      subHeader: '',
      message: '<p>Please Confirm Listing</p>' +
        '<p>Listing ' + amount + ' ' + item.displayName + ' @ ' + price + 'ea</p>' +
        '<p>Listing Fee: ' + this.stationS.aStation.listFee + '</p>' +
        '<p>Sales Tax @ ' + this.stationS.aStation.marketFee + '%: ' + salesTaxTotal + ' (Taken as Items sell)</p>',
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
            this.performListing(item, amount, price);
          }
        }
      ]
    });

    await confirmListAlert.present();
  }

  performListing(item, amount, price){
    const cog= item.cost / item.quantity;
    const newListedItem= new Item();
    let inventoriedItem: any;
    switch (this.trader) {
      case 'ship':
        inventoriedItem= this.shipS.aInventory[item.name];
        break;
      case 'warehouse':
        inventoriedItem= this.warehouseS.aaInventory[item.name];
        break;
    }

    //region Update Station Inventory
    newListedItem.name= item.name;
    newListedItem.listPrice= price;
    newListedItem.quantity= amount;
    newListedItem.ownerID= this.stationS.aStation.id;
    newListedItem.listerID= this.cs.id;
    newListedItem.marketFee= this.stationS.aStation.marketFee;
    newListedItem.activeListing= true;
    this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, newListedItem));
    //endregion

    //region Update Warehouse/Ship Inventory
    inventoriedItem.quantity= +inventoriedItem.quantity - +amount;
    inventoriedItem.cost= +inventoriedItem.cost - +(cog * amount);
    this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id)
      .update(Object.assign({}, inventoriedItem));
    //endregion

    //region update character money
    this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars - +this.stationS.aStation.listFee;
    this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
      .update({pulsars:this.cs.aCharacter.pulsars});
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

    //Log transaction
    this.afs.collection('servers/' + this.ss.activeServer + '/transactionLogs').add(
      {
        type: 'List on an Exchange',
        item: item.name,
        quantity: amount,
        listFee: this.stationS.aStation.listFee,
        salePrice: price,
      }
    );
  }
}
