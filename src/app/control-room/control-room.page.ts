import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {WarehouseService} from '../services/warehouse/warehouse.service';
import {ColonyService} from '../services/colony/colony.service';
import {Router} from '@angular/router';
import {ControlRoomService} from '../services/control-room/control-room.service';

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
    public warehouseS: WarehouseService,
    public colonyS: ColonyService,
    public us: UniverseService,
    private router: Router,
    private crS: ControlRoomService
  ) { }
  //endregion

  ngOnInit() {
    if(!this.charS.aCharacter){
      this.charS.rcP().then(
        rcpRes => {
          this.rControlRoom();
        },
        rcpError =>{
          console.log('No character found.');
          this.router.navigate(['/character']);
        }
      );
    }
    else{
      this.rControlRoom();
    }
  }

  /**
   * Name: Read Control Room
   * */
  rControlRoom(){
    Promise.all([
      this.us.rpSS(this.charS.aCharacter.solarSystemID),
      this.us.rpSB(this.charS.aCharacter.solarBodyID),
      this.crS.fwIDP(this.charS.aCharacter.solarBodyID, this.charS.id)
    ])
      .then(() => {
        this.warehouseID= this.crS.warehouseID;
        this.warehouseBoot= true;
      });
    /*
    this.crS.fwIDP(this.charS.aCharacter.solarBodyID, this.charS.id).then((fwIDPRes: any) => {
      this.warehouseID= this.crS.warehouseID;
      this.warehouseBoot= true;
    });
    this.colonyS.fcIDP(this.charS.aCharacter.solarBodyID).then((fcIDPRes: any) => {
      this.colonyS.readColony(this.colonyS.colonyID);
    });
    */
  }
}
