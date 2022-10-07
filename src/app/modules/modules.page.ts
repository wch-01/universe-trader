import {Component, Input, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../services/server/server.service';
import {StationService} from '../services/station/station.service';
import {GlobalService} from '../services/global/global.service';
import {CharacterService} from '../services/character/character.service';
import {InventoryService} from '../services/inventory/inventory.service';
import {WarehouseService} from '../services/warehouse/warehouse.service';
import {ShipService} from '../services/ship/ship.service';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.page.html',
  styleUrls: ['./modules.page.scss'],
})
export class ModulesPage implements OnInit {
  //region Variables
  @Input() viewer;

  moduleSlots;
  aModules;
  aaModules;
  //endregion

  //region Constructor
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
  //endregion

  ngOnInit() {
    //get the hard points from rules
    switch (this.viewer){
      case 'station':
        this.moduleSlots= this.ss.aRules.station.moduleSlots;
        this.aModules= this.stationS.rsSM();
        this.aaModules= this.stationS.aaModules;
        break;
      case 'ship':
        this.moduleSlots= this.ss.aRules.ship.moduleSlots;
        this.aModules= this.shipS.rsSM();
        this.aaModules= this.shipS.aaModules;
        break;
    }
  }

  //region Create
  //endregion

  //region Read
  setModules(){
    switch (this.viewer){
      case 'station':
        this.aaModules= this.stationS.aaModules;
        break;
      case 'ship':
        this.aaModules= this.shipS.aaModules;
        break;
    }
  }
  //endregion

  //region Update
  attachModule(aModule){
    if(this.viewer === 'station'){
      this.attachModuleStation(aModule);
    }
    else{
      this.attachModuleShip(aModule);
    }
  }

  /**
   * Name: Attach Module to Station
   * */
  attachModuleStation(aModule){
    if(this.ss.aaDefaultItems[aModule.itemID].slot !== 'dynamic'){
      this.afs.firestore.collection('servers/'+this.ss.activeServer+'/stations/'+this.stationS.aStation.id+'/installedModules')
        .doc(this.ss.aaDefaultItems[aModule.itemID].slot).get().then((oModule) => {
        if(oModule.data() !== undefined){
          this.gs.toastMessage('Module is already installed and is not stackable.', 'danger').then(() => {});
        }
        else{
          console.log('Install Slotted Module');
          //region Add Mock Business for Automation Operations
          //Add the Structure
          const aStructure= {
            name: this.ss.aaDefaultItems[aModule.itemID].slot,
            type: this.ss.aaDStructures[this.ss.aaDefaultItems[aModule.itemID].slot].type,
            ownerID: this.stationS.aStation.id,
            warehouseID: this.stationS.aStation.id,
            level: aModule.level,
            status: 'Idle',
            solarBodyID: this.stationS.aStation.solarBodyID,
            solarSystemID: this.stationS.aStation.solarSystemID,
            power: 0
          };
          if(this.ss.aaDStructures[this.ss.aaDefaultItems[aModule.itemID].slot].power){
            aStructure.power= this.ss.aaDStructures[this.ss.aaDefaultItems[aModule.itemID].slot].power;
          }

          this.afs.collection('servers/'+this.ss.activeServer+'/stationOperations').add(Object.assign({}, aStructure)).then((addedStructure) => {
            aModule.businessID= addedStructure.id;
            this.afs.collection('servers/' + this.ss.activeServer + '/stations/' + this.stationS.aStation.id + '/installedModules')
              .doc(this.ss.aaDefaultItems[aModule.itemID].slot).set(Object.assign({}, aModule)).then(() => {
              //region Adjust Inv Levels
              const cog= +aModule.cost / +aModule.quantity;
              this.invS.upUI(cog, 1, aModule, '-').then(() => {});
              aModule.quantity= +aModule.quantity - 1;
              aModule.cost= +aModule.quantity * +cog;
              this.setModules();
              //endregion
            });
          });
          //endregion
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
        this.setModules();
        //endregion
      });
    }
  }

  /**
   * Name: Attach Module to Ship
   * */
  attachModuleShip(aModule){
    if(this.ss.aaDefaultItems[aModule.itemID].slot !== 'dynamic'){
      this.afs.firestore.collection('servers/'+this.ss.activeServer+'/ships/'+this.shipS.aShip.id+'/installedModules')
        .doc(this.ss.aaDefaultItems[aModule.itemID].slot).get().then((oModule) => {
        if(oModule.data() !== undefined){
          this.gs.toastMessage('Module is already installed and is not stackable.', 'danger').then(() => {});
        }
        else{
          console.log('Install Slotted Module');
          this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.shipS.aShip.id + '/installedModules')
            .doc(this.ss.aaDefaultItems[aModule.itemID].slot).set(Object.assign({}, aModule)).then(() => {
            //region Adjust Inv Levels
            const cog= +aModule.cost / +aModule.quantity;
            this.invS.upUI(cog, 1, aModule, '-');
            aModule.quantity= +aModule.quantity - 1;
            aModule.cost= +aModule.quantity * +cog;
            this.setModules();
            //endregion
          });
        }
      });
    }
    else{
      console.log('Install Dynamic Module');
      this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.shipS.aShip.id + '/installedModules')
        .add(Object.assign({}, aModule)).then(() => {
        //region Adjust Inv Levels
        const cog= +aModule.cost / +aModule.quantity;
        this.invS.upUI(cog, 1, aModule, '-');
        this.setModules();
        //endregion
      });
    }
  }

  detachModuleCheck(aModule, aEntity: any, entityType){
    console.log(aModule);
    let inUse= 0;
    switch (this.viewer){
      case 'station':
        if(aModule.name === 'stationStorageModule'){
          if((+this.stationS.capacityAvailable - (+aModule.level * +this.ss.aRules.storage.stationCargoModule)) < 0){
            this.gs.toastMessage('Storage Module cannot be removed as it is in use: ' + this.stationS.capacityAvailable, 'danger');
            inUse= 1;
          }
          else{
            this.stationS.capacityAvailable= +this.stationS.capacityAvailable - (+aModule.level * +this.ss.aRules.storage.stationCargoModule);
          }
          /*
          else{
            this.detachModuleStation(aModule, aEntity, entityType);
          }
          */
        }
        /*
        else{
          this.detachModuleStation(aModule, aEntity, entityType);
        }
        */
        break;
      case 'ship':
        if(aModule.name === 'cargo'){
          if((+this.shipS.capacityAvailable - (+aModule.level * +this.ss.aRules.storage.cargoModule)) < 0){
            this.gs.toastMessage('Storage Module cannot be removed as it is in use', 'danger');
            inUse= 1;
          }
          else{
            console.log(this.shipS.capacityAvailable);
            this.shipS.capacityAvailable= +this.shipS.capacityAvailable - (+aModule.level * +this.ss.aRules.storage.cargoModule);
            console.log(this.shipS.capacityAvailable);
          }
          /*
          else{
            this.detachModuleShip(aModule, aEntity, entityType);
          }
          */
        }
        else{
          this.detachModuleShip(aModule, aEntity, entityType);
        }
        break;
    }

    if(inUse === 0){
      let hasRoom= 1;
      switch (entityType){
        case 'warehouse':
          if(this.warehouseS.capacityAvailable < 1){
            this.gs.toastMessage('Warehouse does not have enough room to store module', 'danger');
            hasRoom= 0;
            this.warehouseS.setCargoCapacity();
          }
          break;
        case 'station':
          if(this.stationS.capacityAvailable < 1){
            this.gs.toastMessage('Station does not have enough room to store module', 'danger');
            hasRoom= 0;
            this.stationS.setCargoCapacity();
          }
          break;
        case 'ship':
          if(this.shipS.capacityAvailable < 1){
            this.gs.toastMessage('Ship does not have enough room to store module', 'danger');
            hasRoom= 0;
            this.shipS.setCargoCapacity();
          }
          break;
      }

      if(hasRoom === 1){
        switch (this.viewer){
          case 'station':
            this.detachModuleStation(aModule, aEntity, entityType);
            break;
          case 'ship':
            this.detachModuleShip(aModule, aEntity, entityType);
            break;
        }
      }
    }
  }

  detachModuleStation(aModule, aEntity: any, entityType){
    this.afs.collection('servers/' + this.ss.activeServer + '/stations/'+this.stationS.aStation.id+'/installedModules')
      .doc(aModule.id).delete().then(() => {
      aModule.ownerID= aEntity.id;
      this.invS.upAI(aModule).then(() => {
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
        this.setModules();
      });
    });
  }
  detachModuleShip(aModule, aEntity: any, entityType){
    this.afs.collection('servers/' + this.ss.activeServer + '/ships/'+this.shipS.aShip.id+'/installedModules')
      .doc(aModule.id).delete().then(() => {
      aModule.ownerID= aEntity.id;
      this.invS.upAI(aModule).then(() => {
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
        this.setModules();
      });
    });
  }
  //endregion

  //region Delete
  //endregion
}
