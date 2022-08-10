import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {ShipService} from '../services/ship/ship.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AlertController} from '@ionic/angular';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {ColonyService} from '../services/colony/colony.service';

@Component({
  selector: 'app-shipyard',
  templateUrl: './shipyard.page.html',
  styleUrls: ['./shipyard.page.scss'],
})
export class ShipyardPage implements OnInit {
  //region Variables
  aShipyard;
  aShipyardInventory;
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    public shipS: ShipService,
    private afs: AngularFirestore,
    private ionAlert: AlertController,
    private charS: CharacterService,
    public us: UniverseService,
    private colonyS: ColonyService
  ) { }
  //endregion

  ngOnInit() {
    /*
    this.colonyS.readColony(this.charS.aCharacter.location).then((res: any) => {
      this.colonyS.rciP().then((res2: any) => {
        this.getShipyard();
      });
    });
    */
  }

  setColony(){
    /*
    this.colonyS.readColony(this.charS.aCharacter.location);
    */
  }

  getShipyard(){
    this.afs.collection('servers/' + this.ss.activeServer + '/shipyards',
      ref =>
        ref.where('solarBodyID', '==', this.colonyS.aColony.solarBodyID)
    ).valueChanges({idField:'id'})
      .subscribe((aShipyard: any) => {
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('getShipyard: ' + this.colonyS.aColony.solarBodyID);
        }
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log(aShipyard);
        }
        this.aShipyard= aShipyard[0];
        this.getShipyardInventory(this.aShipyard);
      });
  }

  getShipyardInventory(aShipyard){
    if(this.ss.aRules.consoleLogging.mode >= 1){console.log('getShipyardInventory');}
    this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
      ref =>
        ref.where('ownerID', '==', aShipyard.id)
    )
      .valueChanges({idField: 'id'})
      .subscribe((aInventory: any) =>{
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('shipyard: getShipyardInventory');
        }
        if(this.ss.aRules.consoleLogging.mode >= 2){
          console.log(aInventory);
        }
        this.aShipyardInventory= aInventory;
      })
    ;
  }

  displayPrice(aModule){
    let price= 0;
    this.ss.aDefaultItems[aModule.name].producedConsumes.some((aItem: any) =>{
      console.log('Here: ' + aItem.name);
      console.log(this.colonyS.aInventory[aItem.name]);
      price= +price + (aItem.amount * this.colonyS.aInventory[aItem.name].cog);
    });
    return price;
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
    switch (action){
      case 'buy':
        //Update Colony Inventory
        item.quantity= +item.quantity - +amount;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update(Object.assign({}, item));
        //update Ship Inventory
        this.shipS.aInventory[item.slug].quantity= +this.shipS.aInventory[item.slug].quantity + amount;
        this.shipS.aInventory[item.slug].totalCost= +this.shipS.aInventory[item.slug].totalCost + total;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(this.shipS.aShip.id)
          .update(Object.assign({}, this.shipS.aInventory));
        //update character money
        this.charS.aCharacter.credits= +this.charS.aCharacter.credits - +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.charS.aCharacter.id)
          .update({credits:this.charS.aCharacter.credits});
        break;
      case 'sell':
        //Update Colony Inventory
        item.quantity= +item.quantity + +amount;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(item.id).update(Object.assign({}, item));
        //update Ship Inventory
        this.shipS.aInventory[item.slug].quantity= +this.shipS.aInventory[item.slug].quantity - amount;
        this.shipS.aInventory[item.slug].totalCost= +this.shipS.aInventory[item.slug].totalCost - total;
        this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(this.shipS.aShip.id)
          .update(Object.assign({}, this.shipS.aInventory));
        //update character money
        this.charS.aCharacter.credits= +this.charS.aCharacter.credits + +total;
        this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.charS.aCharacter.id)
          .update({credits:this.charS.aCharacter.credits});
        break;
    }

    //Log transaction
    this.afs.collection('servers/' + this.ss.activeServer + '/transactionLogs').add(
      {
        type: action,
        item: item.slug,
        quantity: amount,
        cost: price,
        totalCost: total
      }
    );
  }
}
