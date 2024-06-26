import {Component, Input, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../services/server/server.service';
import {UniverseService} from '../services/universe/universe.service';
import {StationService} from '../services/station/station.service';
import {Router} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {StationPage} from './station/station.page';
import {PlatformService} from '../services/platform/platform.service';
import {CharacterService} from '../services/character/character.service';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.page.html',
  styleUrls: ['./stations.page.scss'],
})
export class StationsPage implements OnInit {
  //region Variables
  @Input() trader: any;
  @Input() traderID: any;
  @Input() solarBodyID: any;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    private us: UniverseService,
    private router: Router,
    public stationS: StationService,
    private modalController: ModalController,
    public platform: PlatformService,
    private charS: CharacterService,
  ) { }
  //endregion

  ngOnInit() {
    this.stationS.fsaSBP(this.solarBodyID).then((fsaSBPRes: any) => {});
  }

  async viewStationModal(aStation){
    //this.shipS.shipID= aShip.id;
    //this.shipS.isModal= true;
    this.stationS.rpS(aStation.id).then((rsPRes: any) => {
      this.stationS.rpSI();
    });
    this.stationS.viewer= this.trader;

    const stationModal= await this.modalController.create({
      component: StationPage,
      componentProps: {
        isModal: true,
        trader: this.trader,
        traderID: this.traderID
      },
      cssClass: 'ship_modal',
      showBackdrop: true
    });

    return await stationModal.present();
  }

  checkAccess(aStation){
    return aStation.ownerID === this.charS.aCharacter.id;
  }
}
