import {Component, Input, OnInit} from '@angular/core';
import {ServerService} from '../../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {UniverseService} from '../../services/universe/universe.service';
import {Business} from '../../classes/business';
import {WarehouseService} from '../../services/warehouse/warehouse.service';
import {Components} from '@ionic/core';
import {GlobalService} from '../../services/global/global.service';
import {CharacterService} from '../../services/character/character.service';

@Component({
  selector: 'app-business-creation',
  templateUrl: './business-creation.page.html',
  styleUrls: ['./business-creation.page.scss'],
})
export class BusinessCreationPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  aNewBusiness= { } as Business;
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    private us: UniverseService,
    public ws: WarehouseService,
    private gs: GlobalService,
    private cs: CharacterService
  ) { }
  //endregion

  ngOnInit() {
  }

  //region Create
  async beginConstruction(aStructure){
    //Check that user has required items
    let goodToGo= 0;
    aStructure.construction.forEach((aItem: any) => {
      switch (aItem.name){
        case 'labor':
          if(this.cs.aCharacter.pulsars >= aItem.amount){
            //Good to Go
            goodToGo= 1;
          }
          else{
            this.gs.toastMessage('Not enough Pulsars.', 'danger');
          }
          break;
        default:
          if(this.ws.aaInventory[aItem.name] && this.ws.aaInventory[aItem.name].quantity >= aItem.amount){
            //good to go
            goodToGo= 1;
          }
          else{
            this.gs.toastMessage('Not enough ' + aItem.name + ' in warehouse.', 'danger');
          }
          break;
      }
    });

    if(goodToGo === 1){
      //Build Structure
      //Remove items form Warehouse
      aStructure.construction.forEach((aItem: any) => {
        switch (aItem.name){
          case 'labor':
            const newBalance= +this.cs.aCharacter.pulsars - +aItem.amount;
            this.afs.collection('servers/'+this.ss.activeServer+'/characters').doc(this.cs.aCharacter.id)
              .update({pulsars: newBalance});
            break;
          default:
            const newQuantity= +this.ws.aaInventory[aItem.name].quantity - +aItem.amount;

            if(newQuantity === 0){
              this.afs.collection('servers/'+this.ss.activeServer+'/inventories').doc(this.ws.aaInventory[aItem.name].id).delete();
            }
            else{
              const cog= +this.ws.aaInventory[aItem.name].quantity * +this.ws.aaInventory[aItem.name].cost;
              const newCost= +newQuantity * +cog;
              this.afs.collection('servers/'+this.ss.activeServer+'/inventories').doc(this.ws.aaInventory[aItem.name].id)
                .update({quantity: newQuantity, cost: newCost});
            }
            break;
        }
      });

      //Add the Structure
      aStructure.ownerID= this.cs.aCharacter.id;
      aStructure.warehouseID= this.ws.aWarehouse.id;
      aStructure.level= 1;
      aStructure.status= 'Idle';
      aStructure.solarBodyID= this.ws.aWarehouse.solarBody;
      // aStructure.solarBodyName= this.ws.aWarehouse;
      aStructure.solarSystemID= this.ws.aWarehouse.solarSystem;
      // aStructure.solarSystemName= this.ws.aWarehouse;

      this.afs.collection('servers/'+this.ss.activeServer+'/businesses').add(aStructure).then(() => {
        this.gs.toastMessage('Business Constructed', 'danger');
        this.modal.dismiss('cancel');
      });
    }
  }
  //endregion

  //region R
  //endregion

  //region U
  //endregion

  //region D
  //endregion

  //region Other
  dismissModal() {
    this.modal.dismiss('cancel');
  }
  //endregion
}
