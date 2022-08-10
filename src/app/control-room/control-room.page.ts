import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {WarehouseService} from '../services/warehouse/warehouse.service';
import {ColonyService} from '../services/colony/colony.service';
import {Router} from '@angular/router';
import {ControlRoomService} from '../services/control-room/control-room.service';
import {LoadingController} from '@ionic/angular';
import {GlobalService} from "../services/global/global.service";

@Component({
  selector: 'app-control-room',
  templateUrl: './control-room.page.html',
  styleUrls: ['./control-room.page.scss'],
})
export class ControlRoomPage implements OnInit {
  //region Variables
  controlRoomLoading;
  controlRoomLoaded= false;
  controlRoomTab= 'overview';
  warehouseBoot= false;
  warehouseID;
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    public charS: CharacterService,
    public warehouseS: WarehouseService,
    public colonyS: ColonyService,
    public uniS: UniverseService,
    private router: Router,
    private crS: ControlRoomService,
    private loadingController: LoadingController,
    public globalS: GlobalService,
  ) { }
  //endregion

  async ngOnInit() {
    this.controlRoomLoading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Loading Control Room',
      //duration: 2000
    });
    await this.controlRoomLoading.present();

    if (!this.charS.aCharacter) {
      this.charS.rcP().then(
        rcpRes => {
          this.rControlRoom();
        },
        rcpError => {
          console.log('No character found.');
          this.router.navigate(['/character']);
        }
      );
    }
    else {
      this.rControlRoom();
    }
  }

  /**
   * Name: Read Control Room
   * */
  rControlRoom(){
    Promise.all([
      this.uniS.rpSS(this.charS.aCharacter.solarSystemID),
      this.uniS.rpSB(this.charS.aCharacter.solarBodyID),
      this.crS.fwIDP(this.charS.aCharacter.solarBodyID, this.charS.id)
    ])
      .then(() => {
        this.warehouseS.readWarehouse(this.crS.warehouseID).then(() => {
          this.warehouseS.setCargoCapacity().then(() => {
            this.controlRoomLoaded= true;
            this.controlRoomLoading.dismiss();
          });
        });
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
