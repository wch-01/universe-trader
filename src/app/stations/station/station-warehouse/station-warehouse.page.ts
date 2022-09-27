import {Component, Input, OnInit} from '@angular/core';
import {ServerService} from '../../../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AlertController} from '@ionic/angular';
import {CharacterService} from '../../../services/character/character.service';
import {UniverseService} from '../../../services/universe/universe.service';
import {WarehouseService} from '../../../services/warehouse/warehouse.service';
import {GlobalService} from '../../../services/global/global.service';
import {Warehouse} from '../../../classes/warehouse';
import {StationService} from '../../../services/station/station.service';

@Component({
  selector: 'app-station-warehouse',
  templateUrl: './station-warehouse.page.html',
  styleUrls: ['./station-warehouse.page.scss'],
})
export class StationWarehousePage implements OnInit {
  //region Variables
  @Input() trader;
  foundWarehouse= false;
  warehouseBoot= false;
  entityViewed;
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    private ionAlert: AlertController,
    private charS: CharacterService,
    public us: UniverseService,
    public stationS: StationService,
    public warehouseS: WarehouseService,
    private gs: GlobalService
  ) { }
  //endregion

  ngOnInit() {
    if(this.charS.aCharacter.id === this.stationS.aStation.ownerID){
      if(this.trader === 'warehouse'){
        this.entityViewed= 'warehouse';
      }
      else{
        this.entityViewed= 'warehouse';
      }
    }
  }

  //region Create
  /*
  cWarehouse(){
    let sufficient= 1;
    //Does ship have 4 Cargo Modules in cargo?
    this.ss.aaDStructures.warehouse.construction.some((aRequirement: any) => {
      switch (aRequirement.name){
        case 'labor':
          if(aRequirement.amount > this.cs.aCharacter.pulsars){
            sufficient= 0;
          }
          break;
        case 'cargo':
          if(aRequirement.amount > this.stationS.aaInventory.cargo.quantity){
            sufficient= 0;
          }
          break;
      }
    });

    if(sufficient === 1){
      //Proceed with Build
      //Remove Cargo from Ship
      this.ss.aaDStructures.warehouse.construction.some((aRequirement: any) => {
        switch (aRequirement.name){
          case 'labor':
            this.cs.aCharacter.pulsars= +this.cs.aCharacter.pulsars - +aRequirement.amount;
            this.afs.collection('servers/'+this.ss.activeServer+'/characters')
              .doc(this.cs.aCharacter.id).update({pulsars: this.cs.aCharacter.pulsars});
            break;
          case 'cargo':
            if(this.stationS.aaInventory.cargo.quantity === aRequirement.amount){
              this.afs.collection('servers/'+this.ss.activeServer+'/inventories')
                .doc(this.stationS.aaInventory.cargo.id).delete();
            }
            else{
              this.afs.collection('servers/'+this.ss.activeServer+'/inventories')
                .doc(this.stationS.aaInventory.cargo.id)
                .update({quantity: +this.stationS.aaInventory.cargo.quantity - +aRequirement.amount});
            }
            break;
        }
      });
      //Build Warehouse
      const aWarehouse= new Warehouse();
      aWarehouse.ownerID= this.cs.aCharacter.id;
      aWarehouse.level= 1;
      aWarehouse.name= 'warehouse';
      aWarehouse.solarSystem= this.stationS.aStation.solarSystem;
      aWarehouse.solarBody= this.stationS.aStation.solarBody;
      this.afs.collection('servers/' + this.ss.activeServer + '/warehouses')
        .add(Object.assign({}, aWarehouse)).then(() => {
        this.stationS.rpShip().then(() => {
          this.stationS.rpLWI();
        });
      });
    }
  }
  */
  //endregion

  getWarehouse(){

  }
}
