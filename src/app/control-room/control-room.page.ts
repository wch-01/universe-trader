import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {WarehouseService} from '../services/warehouse/warehouse.service';
import {ColonyService} from '../services/colony/colony.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-control-room',
  templateUrl: './control-room.page.html',
  styleUrls: ['./control-room.page.scss'],
})
export class ControlRoomPage implements OnInit {
  //region Variables
  nsTab= 'warehouse';
  warehouseBoot= false;
  warehouseID;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    public charS: CharacterService,
    private warehouseS: WarehouseService,
    public colonyS: ColonyService,
    public us: UniverseService,
    private router: Router,
  ) { }
  //endregion

  ngOnInit() {
    if(!this.charS.aCharacter){
      this.charS.rcP().then(
        rcpRes => {
          //this.router.navigate(['/dashboard']);
          console.log(this.charS.aCharacter);
          this.us.readSolarSystem(this.charS.aCharacter.solarSystemID);
          this.us.readSolarBody(this.charS.aCharacter.solarBodyID);
          //this.findWarehouseID();
          this.warehouseS.fwIDP(this.charS.aCharacter.solarBodyID, this.charS.id).then((fwIDPRes: any) => {
            this.warehouseID= this.warehouseS.id;
            this.warehouseBoot= true;
          });
          this.colonyS.fcIDP(this.charS.aCharacter.solarBodyID).then((fcIDPRes: any) => {
            this.colonyS.readColony(this.colonyS.colonyID);
          });
        },
        rcpError =>{
          console.log('No character found.');
          this.router.navigate(['/character']);
        }
      );
    }
    else{
      console.log(this.charS.aCharacter);
      this.us.readSolarSystem(this.charS.aCharacter.solarSystemID);
      this.us.readSolarBody(this.charS.aCharacter.solarBodyID);
      //this.findWarehouseID();
      this.warehouseS.fwIDP(this.charS.aCharacter.solarBodyID, this.charS.id).then((fwIDPRes: any) => {
        this.warehouseID= this.warehouseS.id;
        this.warehouseBoot= true;
      });
      this.colonyS.fcIDP(this.charS.aCharacter.solarBodyID).then((fcIDPRes: any) => {
        this.colonyS.readColony(this.colonyS.colonyID);
      });
    }
  }
}
