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
import {GlobalService} from '../services/global/global.service';
import {LoggingService} from '../services/logging/logging.service';
import {Transaction} from '../classes/transaction';
import {Item} from '../classes/item';

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

  previewTransaction= false;

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
  aaTraderInvLevels;
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

  //region For Trade Window
  action;
  aItem;
  amount;
  price;
  total;
  tradeStatus;
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
    public globalS: GlobalService,
    private loggingS: LoggingService
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
        this.aaTraderInvLevels= this.shipS.aaInventory;
        this.capacityAvailable= this.shipS.capacityAvailable;
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('trade: Trader is a ship');
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(this.aaTraderInvLevels);
            console.log(this.capacityAvailable);
          }
        }
        break;
      case 'warehouse':
        this.aInventoryLevels= this.warehouseS.aInventory;
        this.aaTraderInvLevels= this.warehouseS.aaInventory;
        this.capacityAvailable= this.warehouseS.capacityAvailable;
        console.log(this.aaTraderInvLevels);
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
              aItem.reference= this.ss.aaDefaultItems[aItem.itemID];
            });
            console.log(aMarketInventory);
            this.aMarketInventory= aMarketInventory;
            this.aFilteredMarketInventory= aMarketInventory;
            this.showTrade= true;
            this.filterMarketInventory();
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
              aItem.reference= this.ss.aaDefaultItems[aItem.itemID];
            });
            this.aMarketInventory= aInventory;
            this.aFilteredMarketInventory= aInventory;
            this.showTrade= true;
            this.filterMarketInventory();
          });
        break;
    }
  }

  //todo change this to accept and calculate in the alert. Fingers crossed.
  async confirmTradeAlertOrig(action, item, amount, price, total){
    let confirmTradeAlert;
    let tradeStatus;
    price= Math.floor(price);
    total= Math.floor(total);

    switch (action){
      case 'buy':
        if(item.quantity >= amount && this.capacityAvailable >= amount && amount > 0 && this.cs.aCharacter.pulsars > total){
          tradeStatus= 1;
          /*
          const confirmTradeAlert = await this.ionAlert.create({
            cssClass: '',
            header: 'Confirm Transaction',
            subHeader: '',
            message: 'Please Confirm: ' + action + ' ' + amount + ' @ ' + price + ' Totalling ' + total,
            inputs: [
              //{
                //name: 'amount',
                //type: 'number',
                //placeholder: '100'
              //}
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
          */
        }
        else{
          tradeStatus= 2;
          /*
          const confirmTradeAlert = await this.ionAlert.create({
            cssClass: '',
            header: 'Confirm Transaction',
            subHeader: '',
            message: 'Please check your numbers, you either do not have room, or the seller is out of product',
            inputs: [
              //{
                //name: 'amount',
                //type: 'number',
                //placeholder: '100'
              //}
            ],
            buttons: [
              {
                text: 'Confirm',
                handler: () => {}
              }
            ]
          });

          await confirmTradeAlert.present();
          */
        }
        break;
      case 'sell':
        if(this.aaTraderInvLevels[item.name]){
          if(this.aaTraderInvLevels[item.name].quantity >= amount && amount > 0){
            tradeStatus= 1;
            /*
            const confirmTradeAlert = await this.ionAlert.create({
              cssClass: '',
              header: 'Confirm Transaction',
              subHeader: '',
              message: 'Please Confirm: ' + action + ' ' + amount + ' @ ' + price + ' Totalling ' + total,
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
            */
          }
          else{
            tradeStatus= 2;
            /*
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
            */
          }
        }
        else{
          tradeStatus= 3;
          /*
          const confirmTradeAlert = await this.ionAlert.create({
            cssClass: '',
            header: 'Confirm Transaction',
            subHeader: '',
            message: 'Oops, looks like you don\'t have this item to sell.',
            inputs: [],
            buttons: [
              {
                text: 'Confirm',
                handler: () => {}
              }
            ]
          });

          await confirmTradeAlert.present();
          */
        }
        break;
    }

    switch (tradeStatus){
      case 1:
        confirmTradeAlert = await this.ionAlert.create({
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
                //this.performTrade(action, item, amount, total);
              }
            }
          ]
        });
        break;
      case 2:
        confirmTradeAlert = await this.ionAlert.create({
          cssClass: '',
          header: 'Confirm Transaction',
          subHeader: '',
          message: 'Please check your numbers. Possible issues: Not enough room, seller does not have enough product, not enough pulsars for purchase.',
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
        break;
      case 3:
        confirmTradeAlert = await this.ionAlert.create({
          cssClass: '',
          header: 'Confirm Transaction',
          subHeader: '',
          message: 'Oops, looks like you don\'t have this item to sell.',
          inputs: [],
          buttons: [
            {
              text: 'Confirm',
              handler: () => {}
            }
          ]
        });
        break;
    }

    await confirmTradeAlert.present();
  }

  async confirmTradeAlert(action, aItem, amount, price, total){
    this.previewTransaction= true;
    this.action= action;
    this.aItem= aItem;
    this.amount= amount;
    this.price= price;
    this.total= total;

    let confirmTradeAlert;
    //let tradeStatus;
    price= Math.floor(price);
    total= Math.floor(total);

    switch (action){
      case 'purchase':
        if(aItem.quantity >= amount && this.capacityAvailable >= amount && amount > 0 && this.cs.aCharacter.pulsars > total){
          this.tradeStatus= 1;
          /*
          const confirmTradeAlert = await this.ionAlert.create({
            cssClass: '',
            header: 'Confirm Transaction',
            subHeader: '',
            message: 'Please Confirm: ' + action + ' ' + amount + ' @ ' + price + ' Totalling ' + total,
            inputs: [
              //{
                //name: 'amount',
                //type: 'number',
                //placeholder: '100'
              //}
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
          */
        }
        else{
          this.tradeStatus= 2;
          /*
          const confirmTradeAlert = await this.ionAlert.create({
            cssClass: '',
            header: 'Confirm Transaction',
            subHeader: '',
            message: 'Please check your numbers, you either do not have room, or the seller is out of product',
            inputs: [
              //{
                //name: 'amount',
                //type: 'number',
                //placeholder: '100'
              //}
            ],
            buttons: [
              {
                text: 'Confirm',
                handler: () => {}
              }
            ]
          });

          await confirmTradeAlert.present();
          */
        }
        break;
      case 'sale':
        if(this.aaTraderInvLevels[aItem.itemID]){
          if(this.aaTraderInvLevels[aItem.itemID].quantity >= amount && amount > 0){
            this.tradeStatus= 1;
          }
          else{
            this.tradeStatus= 2;
          }
        }
        else{
          this.tradeStatus= 3;
        }
        break;
    }

    /*
    switch (this.tradeStatus){
      case 1:
        confirmTradeAlert = await this.ionAlert.create({
          cssClass: '',
          header: 'Confirm Transaction',
          subHeader: '',
          message: 'Please Confirm: ' + action + ' ' + amount + ' @ ' + price + ' Totalling ' + total,
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
                //this.performTrade(action, aItem, amount, total);
              }
            }
          ]
        });
        break;
      case 2:
        confirmTradeAlert = await this.ionAlert.create({
          cssClass: '',
          header: 'Confirm Transaction',
          subHeader: '',
          message: 'Please check your numbers. Possible issues: Not enough room, seller does not have enough product, not enough pulsars for purchase.',
          inputs: [],
          buttons: [
            {
              text: 'Confirm',
              handler: () => {}
            }
          ]
        });
        break;
      case 3:
        confirmTradeAlert = await this.ionAlert.create({
          cssClass: '',
          header: 'Confirm Transaction',
          subHeader: '',
          message: 'Oops, looks like you don\'t have this item to sell.',
          inputs: [],
          buttons: [
            {
              text: 'Confirm',
              handler: () => {}
            }
          ]
        });
        break;
    }
    */

    // await confirmTradeAlert.present();
  }

  performTrade(){
    let tradersInventoriedItem= {} as Item;
    const aTransaction= new Transaction();
    aTransaction.details= new Transaction().details;

    //region Build the item's default object array
    if(this.aaTraderInvLevels[this.aItem.itemID] && this.aaTraderInvLevels[this.aItem.itemID].type !== 'Prepared Module'){
      tradersInventoriedItem= this.aaTraderInvLevels[this.aItem.itemID];
    }
    else{
      // tradersInventoriedItem= Object.assign([], this.ss.aaDefaultItems[marketsInventoriedItem.id]);
      tradersInventoriedItem.itemID= this.aItem.itemID;
      tradersInventoriedItem.quantity= 0;
      tradersInventoriedItem.ownerID= this.traderID;
      tradersInventoriedItem.cost= 0;
    }
    //endregion

    //region Perform transaction
    const upTransaction= new Promise((tResolve, tReject) => {
      switch (this.action){
        case 'purchase':
          aTransaction.flow= 'out';
          this.performBuy(tradersInventoriedItem, this.aItem, this.amount, this.total)
            .then(() => {
              tResolve(true);
            });
          break;
        case 'sale':
          aTransaction.flow= 'in';
          //region Calculate Profit/Loss
          //Current COG
          aTransaction.details.cog= +tradersInventoriedItem.cost / +tradersInventoriedItem.quantity;
          //Total Cost of Sold Goods
          const tCosg= +aTransaction.details.cog * +this.amount;
          //Profit or Loss
          aTransaction.details.pl= +this.total - +tCosg;
          //endregion

          this.performSell(tradersInventoriedItem, this.aItem, this.amount, this.total)
            .then(() => {
              tResolve(true);
            });
          break;
      }
    });
    //endregion

    //region Set Capacity
    upTransaction.then(() => {
      if(this.ss.aRules.consoleLogging.mode >= 1){
        console.log('TradePage: Update Capacity');
      }
      switch (this.trader) {
        case 'ship':
          this.shipS.setCargoCapacity().then(() => {
            this.capacityAvailable= this.shipS.capacityAvailable;
          });
          aTransaction.entityType= 'Ship';
          aTransaction.entityID= this.shipS.aShip.id;
          break;
        case 'warehouse':
          this.warehouseS.setCargoCapacity().then(() => {});
          this.capacityAvailable= this.warehouseS.capacityAvailable;
          aTransaction.entityType= 'Warehouse';
          aTransaction.entityID= this.warehouseS.aWarehouse.id;
          break;
      }

      //region Log transaction
      if(this.ss.aRules.consoleLogging.mode >= 1){
        console.log('TradePage: Log Transaction');
      }
      aTransaction.characterID= this.cs.aCharacter.id;
      aTransaction.type= this.action;
      aTransaction.item= this.aItem.reference.displayName;
      aTransaction.pulsars= this.total;
      aTransaction.balance= this.cs.aCharacter.pulsars;

      aTransaction.details.quantity= this.amount;
      aTransaction.details.itemPrice= +this.total / +this.amount;
      aTransaction.details.totalPrice= this.total;
      // aTransaction.details.cog= +total / +quantity;// todo fix this based on type of transaction
      this.loggingS.logTransaction(aTransaction);
      //endregion

      this.previewTransaction= false;
    });
    //endregion
  }

  performBuy(tradersInventoriedItem, marketsInventoriedItem, quantity, total){
    return new Promise((resolveBuy, rejectBuy) => {
      //region Remove Item Quantity from Colony/Station Inventory
      const uCSInv= new Promise((resolve, reject) => {
        marketsInventoriedItem.quantity= +marketsInventoriedItem.quantity - +quantity;
        // If the remaining quantity is zero and the item was listed by a character, delete it
        if(marketsInventoriedItem.quantity === 0 && marketsInventoriedItem.listerID){
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(marketsInventoriedItem.id).delete().then((r) => {
            resolve(true);
          });
        }
        else{
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(marketsInventoriedItem.id).update({quantity: marketsInventoriedItem.quantity}).then((r) => {
            resolve(true);
          });
        }
      });
      //endregion

      //region Add Item to Ship/Warehouse Inventory
      const upSWInv= new Promise((resolve, reject) => {
        tradersInventoriedItem.quantity= +tradersInventoriedItem.quantity + +quantity;
        tradersInventoriedItem.cost= +tradersInventoriedItem.cost + +total;
        if(tradersInventoriedItem.id){
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('TradePage: Buy Exiting Item');
          }
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(tradersInventoriedItem.id)
            .update(Object.assign({}, tradersInventoriedItem)).then(() => {
            resolve(true);
          });
        }
        else{
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('TradePage: Buy New Item');
          }
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').add(Object.assign({}, tradersInventoriedItem)).then(() => {
            resolve(true);
          });
        }
      });
      //endregion

      //region Handle player listed Item
      const pHandleListing= new Promise((resolve, reject) => {
        if(marketsInventoriedItem.listerID){
          const aListerTransaction= new Transaction();
          aListerTransaction.details= new Transaction().details;

          const proceeds= +total - +(total * (marketsInventoriedItem.marketFee / 100));

          this.afs.firestore.collection('servers/' + this.ss.activeServer + '/characters').doc(marketsInventoriedItem.listerID)
            .get().then((oListingCharacter) => {
              const aListingCharacter= oListingCharacter.data();
              const newPulsarTotal= +aListingCharacter.pulsars + +proceeds;

            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('TradePage: Paying Listing Character');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(aListingCharacter);
                console.log(aListingCharacter.pulsars);
                console.log(proceeds);
                console.log(newPulsarTotal);
              }
            }

            this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(marketsInventoriedItem.listerID).update({pulsars: newPulsarTotal}).then((r) => {
              aListerTransaction.characterID= marketsInventoriedItem.listerID;
              aListerTransaction.type= 'sale';
              aListerTransaction.flow= 'in';
              aListerTransaction.item= this.ss.aaDefaultItems[marketsInventoriedItem.name].displayName;
              aListerTransaction.pulsars= proceeds;
              aListerTransaction.balance= newPulsarTotal;
              aListerTransaction.details.quantity= quantity;
              aListerTransaction.details.fees= +total * (+marketsInventoriedItem.marketFee / 100);
              aListerTransaction.details.desc= 'Sold Item on Exchange';
              aListerTransaction.details.pl= +total - (+quantity * +marketsInventoriedItem.cog) - +aListerTransaction.details.fees;
              aListerTransaction.details.cog= marketsInventoriedItem.cog;
              aListerTransaction.details.itemPrice= marketsInventoriedItem.listPrice;
              aListerTransaction.details.totalPrice= total;
              this.loggingS.logTransaction(aListerTransaction);
              resolve(true);
            });
          });
        }
        else{
          resolve(true);
        }
      });
      //endregion

      //region Update character money
      uCSInv.then(() => {
        upSWInv.then(() => {
          pHandleListing.then(() => {
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('TradePage: Update Character Money');
            }
            this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars - +total;
            this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
              .update({pulsars: this.cs.aCharacter.pulsars}).then((r) => {
              resolveBuy(true);
            });
          }).catch(() => {});
        }).catch(() => {});
      }).catch(() => {});
      //endregion
    });
  }

  performSell(tradersInventoriedItem, marketsInventoriedItem, quantity, total){
    return new Promise((resolveSell, rejectSell) => {
      //region Add Item to Colony/Station Inventory
      const pUCSInv= new Promise((resolve, reject) => {
        marketsInventoriedItem.quantity= +marketsInventoriedItem.quantity + +quantity;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(marketsInventoriedItem.id).update({quantity: marketsInventoriedItem.quantity}).then((r) => {
          resolve(true);
        });
      });
      //endregion

      //region Remove and Update Item Cost From Ship/Warehouse Inventory
      const pUWSInv= new Promise((resolve, reject) => {
        tradersInventoriedItem.quantity= +tradersInventoriedItem.quantity - +quantity;
        if(tradersInventoriedItem.quantity === 0){
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(tradersInventoriedItem.id).delete().then((r) => {
            resolve(true);
          });
        }
        else{
          tradersInventoriedItem.cost= +tradersInventoriedItem.cost - +total;
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(tradersInventoriedItem.id)
            .update(Object.assign({}, tradersInventoriedItem)).then((r) => {
              resolve(true);
            });
        }
      });
      //endregion

      //region Update character money
      pUCSInv.then(() => {
        pUWSInv.then(() => {
          this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars + +total;
          this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
            .update({pulsars:this.cs.aCharacter.pulsars}).then(() => {
              resolveSell(true);
          });
        }).catch(() => {});
      }).catch(() => {});
      //endregion
    });
  }

  filterMarketInventory(){
    this.aFilteredMarketInventory= this.aMarketInventory.filter((aInventory) =>
       aInventory.reference.displayName.toLowerCase().indexOf(this.aMarketInventoryFilters.name.toLowerCase()) > -1
        && aInventory.quantity.toString().toLowerCase().indexOf(this.aMarketInventoryFilters.quantity.toLowerCase()) > -1
        //&& aInventory.demand.toString().toLowerCase().indexOf(this.aMarketInventoryFilters.demand.toLowerCase()) > -1
        && aInventory.reference.type.toLowerCase().indexOf(this.aMarketInventoryFilters.type.toLowerCase()) > -1
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

  //region Other
  closePreviewTransaction(event: Event){}

  cancelTransaction(){
    this.previewTransaction= false;
  }
  //endregion
}
