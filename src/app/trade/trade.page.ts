import {Component, Input, OnInit} from '@angular/core';
import {ShipService} from '../services/ship/ship.service';
import {ServerService} from '../services/server/server.service';
import {SolarBody, SolarSystem} from '../classes/universe';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AlertController} from '@ionic/angular';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {ColonyService} from '../services/colony/colony.service';
import {WarehouseService} from '../services/warehouse/warehouse.service';
import {StationService} from '../services/station/station.service';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.page.html',
  styleUrls: ['./trade.page.scss'],
})
export class TradePage implements OnInit {
  //region Variables
  @Input() trader: any;
  @Input() market: any;
  sortField= 'name';
  sortOrder= true;

  nsTab= 'market';
  aMarketInventory: any;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody()
  };
  coloniesLoaded= false;

  //region Items Filter
  aMarketInventoryFilters= {
    name: '',
    quantity: '',
    demand: '',
    type: '',
  };
  aFilteredMarketInventory: any;
  //endregion
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
    public ss: ServerService,
    public shipS: ShipService,
    public warehouseS: WarehouseService,
    private afs: AngularFirestore,
    private ionAlert: AlertController,
    private cs: CharacterService,
    public us: UniverseService,
    public colonyS: ColonyService,
    public stationS: StationService
  ) { }
  //endregion

  ngOnInit() {
    this.us.rsbCP(this.us.aSolarBody.id).then((rsbCRes: any) => {
      this.coloniesLoaded= true;
    });
    this.getMarketInventory();
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

  getMarketInventory(){
    switch (this.market){
      case 'colony':
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
          ref =>
            ref.where('ownerID', '==', this.colonyS.aColony.id).where('market', '==', true)
        ).valueChanges({idField: 'id'})
          .subscribe((aMarketInventory: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('colonyService: Inventory');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aMarketInventory);
              }
            }
            this.aMarketInventory= aMarketInventory;
            this.aFilteredMarketInventory= aMarketInventory;
            this.showTrade= true;
          });
        break;
      case 'station':
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
          ref =>
            ref.where('ownerID', '==', this.stationS.aStation.id)
              //.where('quantity', '!=', 0)
              .where('activeListing', '==', true)
        ).valueChanges({idField: 'id'})
          .subscribe((aInventory: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('stationService: rsiP');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aInventory);
              }
            }
            this.aMarketInventory= aInventory;
            this.aFilteredMarketInventory= aInventory;
            this.showTrade= true;
          });
        break;
    }
  }

  async confirmTradeAlert(action, item, amount, price, total){
    //todo Validate values available, capacity available etc.
    if(item.quantity >= amount && this.capacityAvailable >= amount){
      price= Math.ceil(price);
      total= Math.ceil(total);
      const confirmTradeAlert = await this.ionAlert.create({
        cssClass: '',
        header: 'Confirm Transaction',
        subHeader: '',
        message: 'Please Confirm: ' + action + ' ' + amount + ' @ ' + price + ' Totalling ' + total,
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
              this.performTrade(action, item, amount, price, total);
            }
          }
        ]
      });

      await confirmTradeAlert.present();
    }
    else{
      const confirmTradeAlert = await this.ionAlert.create({
        cssClass: '',
        header: 'Confirm Transaction',
        subHeader: '',
        message: 'Please check your numbers, you either do not have room, or the seller is out of product',
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
            text: 'Confirm',
            handler: () => {}
          }
        ]
      });

      await confirmTradeAlert.present();
    }
  }

  performTrade(action, item, amount, price, total){
    let inventoriedItem: any;
    switch (this.trader) {
      case 'ship':
        inventoriedItem= this.shipS.aInventory[item.name];
        break;
      case 'warehouse':
        inventoriedItem= this.warehouseS.aaInventory[item.name];
        break;
    }
    switch (action){
      case 'buy':
        //Update Colony/Station Inventory
        item.quantity= +item.quantity - +amount;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update(Object.assign({}, item));
        //update Ship/Warehouse Inventory
        inventoriedItem.quantity= +inventoriedItem.quantity + +amount;
        inventoriedItem.cost= +inventoriedItem.cost + +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id)
          .update(Object.assign({}, inventoriedItem));
        //update character money
        this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars - +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
          .update({pulsars:this.cs.aCharacter.pulsars});
        break;
      case 'sell':
        //Update Colony/Station Inventory
        item.quantity= +item.quantity + +amount;
        if(item.quantity === 0){
          item.activeListing= false;
        }
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update(Object.assign({}, item));
        //update Ship Inventory
        inventoriedItem.quantity= +inventoriedItem.quantity - +amount;
        inventoriedItem.cost= +inventoriedItem.cost - +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id)
          .update(Object.assign({}, inventoriedItem));
        //update character money
        this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars + +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
          .update({pulsars:this.cs.aCharacter.pulsars});
        break;
    }

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
        ownerID: this.cs.aCharacter.id,
        type: action,
        item: this.ss.aDefaultItems[item.name].displayName,
        quantity: amount,
        cost: price,
        totalCost: total,
        runningBalance: this.cs.aCharacter.pulsars
      }
    );

    if(item.listerID){
      const proceeds= +total - +(total * (item.marketFee / 100));
      console.log('Proceeds to lister:' + proceeds);
      const listerSub= this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(item.listerID)
        .valueChanges({idField: 'id'})
        .subscribe((aListingCharacter: any) => {
          const newPulsarTotal= +aListingCharacter.pulsars + +proceeds;
          console.log('find lister');
          console.log(aListingCharacter);
          this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(item.listerID).update({pulsars: newPulsarTotal});
          this.afs.collection('servers/' + this.ss.activeServer + '/transactionLogs').add(
            {
              ownerID: item.listerID,
              type: 'Sold Items',
              item: item.name,
              quantity: amount,
              totalSale: total,
              taxes: (total * (item.marketFee / 100)),
              runningBalance: aListingCharacter.pulsars
            }
          );
          listerSub.unsubscribe();
        });
      //listerSub.unsubscribe();
    }
  }

  filterMarketInventory(){
    this.aFilteredMarketInventory= this.aMarketInventory.filter((aInventory) =>
       aInventory.name.toLowerCase().indexOf(this.aMarketInventoryFilters.name.toLowerCase()) > -1
        && aInventory.quantity.toString().toLowerCase().indexOf(this.aMarketInventoryFilters.quantity.toLowerCase()) > -1
        //&& aInventory.demand.toString().toLowerCase().indexOf(this.aMarketInventoryFilters.demand.toLowerCase()) > -1
        && aInventory.type.toLowerCase().indexOf(this.aMarketInventoryFilters.type.toLowerCase()) > -1
        //&& aInventory.type.toLowerCase().indexOf(('raw').toLowerCase()) > -1;//This works
        //&& aInventory.type.toLowerCase().indexOf('refined') > -1;
    );
  }

  sortMarketItems(field, sortOrder){
    if(this.sortField !== field){
      this.sortOrder= sortOrder= true;
    }
    this.sortField= field;
    this.aFilteredMarketInventory.sort((n1,n2) => {
      if(sortOrder){
        if (n1[field] > n2[field]) {
          return 1;
        }

        if (n1[field] < n2[field]) {
          return -1;
        }
      }
      else{
        if (n1[field] > n2[field]) {
          return -1;
        }

        if (n1[field] < n2[field]) {
          return 1;
        }
      }

      return 0;
      //this.aFilteredSolarBodies.sort
    });

    console.log('Filter');
    console.log(sortOrder);
  }
}
