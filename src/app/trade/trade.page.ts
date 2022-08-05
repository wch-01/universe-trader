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
import {PlatformService} from '../services/platform/platform.service';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.page.html',
  styleUrls: ['./trade.page.scss'],
})
export class TradePage implements OnInit {
  //region Variables
  @Input() trader: any;
  @Input() traderID: any;
  @Input() market: any;
  sortField= 'name';
  sortOrder= true;

  nsTab= 'market';
  aMarketInventory: any;
  marketInventorySub;
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
    public cs: CharacterService,
    public uniS: UniverseService,
    public colonyS: ColonyService,
    public stationS: StationService,
    public platform: PlatformService,
  ) { }
  //endregion

  ngOnInit() {
    console.log('Load Trading Page');
    console.log(this.ss.aaDefaultItems);
    /*
    this.us.rsbCP(this.us.aSolarBody.id).then((rsbCRes: any) => {
      this.coloniesLoaded= true;
    });
    */
    this.getMarketInventory();
    switch (this.trader) {
      case 'ship':
        this.aaInventoryLevels= this.shipS.aaInventory;
        this.capacityAvailable= this.shipS.capacityAvailable;
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('trade: Trader is a ship');
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(this.aaInventoryLevels);
            console.log(this.capacityAvailable);
          }
        }
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
        this.marketInventorySub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories/',
          ref =>
            ref.where('ownerID', '==', this.uniS.aSolarBody.id)
              .where('ownerType', '==', 'colony')
        )
          .valueChanges({idField: 'id'})
          .subscribe((aMarketInventory: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('tradePage: Inventory');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aMarketInventory);
              }
            }
            aMarketInventory.forEach((aItem: any) => {
              aItem.reference= this.ss.aaDefaultItems[aItem.name];
            });
            console.log(aMarketInventory);
            this.aMarketInventory= aMarketInventory;
            this.aFilteredMarketInventory= aMarketInventory;
            this.showTrade= true;
          });
        break;
      case 'station':
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
          ref =>
            ref.where('ownerID', '==', this.stationS.aStation.id)
              .where('activeListing', '==', true)
        )
          .valueChanges({idField: 'id'})
          .subscribe((aInventory: any) => {
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('stationService: rsiP');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aInventory);
              }
            }
            aInventory.forEach((aItem: any) => {
              aItem.reference= this.ss.aaDefaultItems[aItem.name];
            });
            this.aMarketInventory= aInventory;
            this.aFilteredMarketInventory= aInventory;
            this.showTrade= true;
          });
        break;
    }
  }

  //todo change this to accept and calculate in the alert. Fingers crossed.
  async confirmTradeAlert(action, item, amount, price, total){
    switch (action){
      case 'buy':
        if(item.quantity >= amount && this.capacityAvailable >= amount && amount > 0){
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
        break;
      case 'sell':
        if(this.aaInventoryLevels[item.name]){
          if(this.aaInventoryLevels[item.name].quantity >= amount && amount > 0){
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
              inputs: [],
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
        else{
          const confirmTradeAlert = await this.ionAlert.create({
            cssClass: '',
            header: 'Confirm Transaction',
            subHeader: '',
            message: 'Please check your numbers, you either do not have room, or the seller is out of product',
            inputs: [],
            buttons: [
              {
                text: 'Confirm',
                handler: () => {}
              }
            ]
          });

          await confirmTradeAlert.present();
        }
        break;
    }
  }

  performTrade(action, item, amount, price, total){
    let inventoriedItem: any;

    if(this.aaInventoryLevels[item.name] && this.aaInventoryLevels[item.name].type !== 'Prepared Module'){
      inventoriedItem= this.aaInventoryLevels[item.name];
    }
    else{
      inventoriedItem= Object.assign([], this.ss.aaDefaultItems[item.name]);
      // inventoriedItem.id= undefined;
      inventoriedItem.quantity= 0;
      inventoriedItem.ownerID= this.traderID;
      inventoriedItem.cost= 0;
    }

    /*
    switch (this.trader) {
      case 'ship':
        if(this.shipS.aInventory[item.name]){
          inventoriedItem= this.shipS.aInventory[item.name];
        }
        else{
          inventoriedItem= Object.assign([], this.ss.aaDefaultItems[item.name]);
          // inventoriedItem.id= undefined;
          inventoriedItem.quantity= 0;
          inventoriedItem.ownerID= this.shipS.aShip.id;
          inventoriedItem.cost= 0;
        }
        break;
      case 'warehouse':
        if(this.warehouseS.aaInventory[item.name]){
          inventoriedItem= this.warehouseS.aaInventory[item.name];
        }
        else{
          inventoriedItem= Object.assign({}, this.ss.aaDefaultItems[item.name]);
          // inventoriedItem= this.ss.aaDefaultItems[item.name];
          // inventoriedItem.id= undefined;
          inventoriedItem.quantity= 0;
          inventoriedItem.ownerID= this.warehouseS.aWarehouse.id;
          inventoriedItem.cost= 0;
        }
        console.log('Item built');
        console.log(inventoriedItem);
        break;
    }
    */
    const upTransaction= new Promise((tResolve, tReject) => {
      switch (action){
        case 'buy':
          //Update Colony/Station Inventory
          item.quantity= +item.quantity - +amount;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update({quantity: item.quantity});

          //update Ship/Warehouse Inventory
          const upSWInv= new Promise((resolve, reject) => {
            inventoriedItem.quantity= +inventoriedItem.quantity + +amount;
            inventoriedItem.cost= +inventoriedItem.cost + +total;
            if(inventoriedItem.id){
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('TradePage: Buy Exiting Item');
              }
              this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id)
                .update(Object.assign({}, inventoriedItem)).then(
                () => {
                  resolve(true);
                }
              );
            }
            else{
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('TradePage: Buy New Item');
              }
              this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, inventoriedItem)).then(
                () => {
                  resolve(true);
                }
              );
            }
          });

          //update character money
          upSWInv.then(
            () => {
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('TradePage: Update Character Money');
              }
              this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars - +total;
              this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
                .update({pulsars:this.cs.aCharacter.pulsars}).then(
                () => {
                  tResolve(true);
                }
              );
            }
          );
          break;
        case 'sell':
          //Update Colony/Station Inventory
          item.quantity= +item.quantity + +amount;
          /* todo this is good, but needs to look at if item is a user listing on a station, and only happen then
          if(item.quantity === 0){
            item.activeListing= false;
          }
          */
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update({quantity: item.quantity});

          //update Ship/Warehouse Inventory
          inventoriedItem.quantity= +inventoriedItem.quantity - +amount;
          inventoriedItem.cost= +inventoriedItem.cost - +total;
          if(inventoriedItem.quantity === 0){
            this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id).delete();
          }
          else{
            this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id)
              .update(Object.assign({}, inventoriedItem));
          }

          //update character money
          this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars + +total;
          this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
            .update({pulsars:this.cs.aCharacter.pulsars});
          break;
      }
    });

    //Set Capacity
    upTransaction.then(
      () => {
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('TradePage: Update Capacity');
        }
        switch (this.trader) {
          case 'ship':
            this.shipS.setCargoCapacity().then(
              () => {
                this.capacityAvailable= this.shipS.capacityAvailable;
              }
            );
            break;
          case 'warehouse':
            this.warehouseS.setCargoCapacity();
            this.capacityAvailable= this.warehouseS.capacityAvailable;
            break;
        }
      }
    );

    //Log transaction
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('TradePage: Log Transaction');
    }
    this.afs.collection('servers/' + this.ss.activeServer + '/transactionLogs').add(
      {
        ownerID: this.cs.aCharacter.id,
        type: action,
        item: this.ss.aaDefaultItems[item.name].displayName,
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
       aInventory.reference.displayName.toLowerCase().indexOf(this.aMarketInventoryFilters.name.toLowerCase()) > -1
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
