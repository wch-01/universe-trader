import {Component, Input, OnInit} from '@angular/core';
import {SolarBody, SolarSystem} from "../../classes/universe";
import {ServerService} from "../../services/server/server.service";
import {ShipService} from "../../services/ship/ship.service";
import {WarehouseService} from "../../services/warehouse/warehouse.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AlertController} from "@ionic/angular";
import {CharacterService} from "../../services/character/character.service";
import {UniverseService} from "../../services/universe/universe.service";
import {ColonyService} from "../../services/colony/colony.service";
import {StationService} from "../../services/station/station.service";

@Component({
  selector: 'app-station-trade',
  templateUrl: './station-trade.page.html',
  styleUrls: ['./station-trade.page.scss'],
})
export class StationTradePage implements OnInit {
  //region Variables
  @Input() trader: any;
  @Input() market: any;

  nsTab= 'market';
  aMarketInventory: any;
  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody()
  };
  coloniesLoaded= false;
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
        this.colonyS.readColonyMarketInventory().then((res2: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Get Market Items done');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(this.colonyS.aMarketInventory);
            }
          }

          this.aMarketInventory= this.colonyS.aMarketInventory;
          this.showTrade= true;
          this.colonyS.readColonyInventory()
            .subscribe((aInventory: any) =>{
              if(this.ss.aRules.consoleLogging.mode >= 1){
                console.log('tradePage: Inventory');
                if(this.ss.aRules.consoleLogging.mode >= 2){
                  console.log(aInventory);
                }
              }
            });
        });
        break;
      case 'station':
        this.stationS.rsiP().then((res2: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('tradePage: station inventory');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(this.stationS.aInventory);
            }
          }
          this.aMarketInventory= this.stationS.aInventory;
          this.showTrade= true;
        });
        break;
    }
  }

  async confirmTradeAlert(action, item, amount, price, total){
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
        //Update Colony Inventory
        item.quantity= +item.quantity - +amount;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update(Object.assign({}, item));
        //update Ship Inventory
        //this.shipS.aInventory[item.name].quantity= +this.shipS.aInventory[item.name].quantity + +amount;
        //this.shipS.aInventory[item.name].cost= +this.shipS.aInventory[item.name].cost + +total;
        inventoriedItem.quantity= +inventoriedItem.quantity + +amount;
        inventoriedItem.cost= +inventoriedItem.cost + +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id)
          .update(Object.assign({}, inventoriedItem));
        //update character money
        this.cs.aCharacter.credits= +this.cs.aCharacter.credits - +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
          .update({credits:this.cs.aCharacter.credits});
        break;
      case 'sell':
        //Update Colony Inventory
        item.quantity= +item.quantity + +amount;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update(Object.assign({}, item));
        //update Ship Inventory
        inventoriedItem.quantity= +inventoriedItem.quantity - +amount;
        inventoriedItem.cost= +inventoriedItem.cost - +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(inventoriedItem.id)
          .update(Object.assign({}, inventoriedItem));
        //update character money
        this.cs.aCharacter.credits= +this.cs.aCharacter.credits + +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.cs.aCharacter.id)
          .update({credits:this.cs.aCharacter.credits});
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
        type: action,
        item: item.name,
        quantity: amount,
        cost: price,
        totalCost: total
      }
    );
  }
}
