import {Component, Input, OnInit} from '@angular/core';
import {StationService} from '../../../services/station/station.service';
import {Ship} from '../../../classes/ship';
import {GlobalService} from '../../../services/global/global.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../../services/server/server.service';
import {CharacterService} from '../../../services/character/character.service';
import {refEqual} from '@angular/fire/firestore';
import {InventoryService} from '../../../services/inventory/inventory.service';
import {WarehouseService} from '../../../services/warehouse/warehouse.service';
import {ShipService} from '../../../services/ship/ship.service';

@Component({
  selector: 'app-station-admin',
  templateUrl: './station-admin.page.html',
  styleUrls: ['./station-admin.page.scss'],
})
export class StationAdminPage implements OnInit {
  //region Variables
  @Input() trader;
  adminTab= 'details';
  //endregion

  constructor(
    private afs: AngularFirestore,
    public ss: ServerService,
    public stationS: StationService,
    private gs: GlobalService,
    public charS: CharacterService,
    private invS: InventoryService,
    public warehouseS: WarehouseService,
    public shipS: ShipService
  ) { }

  ngOnInit() {
    console.log(this.stationS.aModules);
  }

  attachModule(aModule){
    if(aModule.slot !== 'dynamic'){
      this.afs.firestore.collection('servers/'+this.ss.activeServer+'/stations/'+this.stationS.aStation.id+'/installedModules')
        .doc(aModule.slot).get().then((oModule) => {
        if(oModule.data() !== undefined){
          this.gs.toastMessage('Module is already installed and is not stackable.', 'danger').then(() => {});
        }
        else{
          console.log('Install Slotted Module');
          this.afs.collection('servers/' + this.ss.activeServer + '/stations/' + this.stationS.aStation.id + '/installedModules')
            .doc(aModule.slot).set(Object.assign({}, aModule)).then(() => {
            //region Adjust Inv Levels
            const cog= +aModule.cost / +aModule.quantity;
            this.invS.upUI(cog, 1, aModule, '-');
            aModule.quantity= +aModule.quantity - 1;
            aModule.cost= +aModule.quantity * +cog;

            /*
            if(aModule.quantity === 0){
              this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aModule.id).delete().then(() => {});
            }
            else{
              this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aModule.id)
                .update({quantity: aModule.quantity, cost: aModule.cost}).then(() => {});
            }
            */
            //endregion
          });
        }
      });
    }
    else{
      console.log('Install Dynamic Module');
      this.afs.collection('servers/' + this.ss.activeServer + '/stations/' + this.stationS.aStation.id + '/installedModules')
        .add(Object.assign({}, aModule)).then(() => {
        //region Adjust Inv Levels
        const cog= +aModule.cost / +aModule.quantity;
        this.invS.upUI(cog, 1, aModule, '-');
        /*
        aModule.quantity= +aModule.quantity - 1;
        aModule.cost= +aModule.quantity * +cog;

        if(aModule.quantity === 0){
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aModule.id).delete().then(() => {});
        }
        else{
          this.afs.collection('servers/' + this.ss.activeServer + '/inventories').doc(aModule.id)
            .update({quantity: aModule.quantity, cost: aModule.cost}).then(() => {});
        }
        */
        //endregion
      });
    }
  }

  detachModuleCheck(aModule, aEntity: any, entityType){
    let hasRoom= 1;
    switch (entityType){
      case 'warehouse':
        if(this.warehouseS.capacityAvailable < 1){
          this.gs.toastMessage('Warehouse does not have enough room to store module', 'danger');
          hasRoom= 0;
        }
        break;
      case 'station':
        if(this.stationS.capacityAvailable < 1){
          this.gs.toastMessage('Station does not have enough room to store module', 'danger');
          hasRoom= 0;
        }
        break;
      case 'ship':
        if(this.shipS.capacityAvailable < 1){
          this.gs.toastMessage('Ship does not have enough room to store module', 'danger');
          hasRoom= 0;
        }
        break;
    }

    if(hasRoom === 1){
      if(aModule.name === 'stationStorageModule' || aModule.name === 'cargo'){
        //todo check for storage being used
        if((+this.stationS.capacityAvailable - (+this.stationS.aStation.moduleStorageLevel * this.ss.aRules.storage.stationCargoModule)) < 0){
          this.gs.toastMessage('Storage Module cannot be removed as it is in use', 'success');
        }
        else{
          this.detachModule(aModule, aEntity, entityType);
        }
      }
      else{
        this.detachModule(aModule, aEntity, entityType);
      }
    }
  }

  detachModule(aModule, aEntity: any, entityType){
    this.afs.collection('servers/' + this.ss.activeServer + '/stations/'+this.stationS.aStation.id+'/installedModules')
      .doc(aModule.id).delete().then(() => {
        this.invS.upAI(aModule).then(() => {
          aModule.ownerID= aEntity.id;
          switch (entityType){
            case 'warehouse':
              this.gs.toastMessage('Module detached and moved to local warehouse', 'success');
              break;
            case 'station':
              this.gs.toastMessage('Module detached and moved to station storage', 'success');
              break;
            case 'ship':
              this.gs.toastMessage('Module detached and moved to ship storage', 'success');
              break;
          }
        });
    });
  }
}
