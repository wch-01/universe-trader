import {Component, Input, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../services/server/server.service';
import {UniverseService} from '../services/universe/universe.service';
import {StationService} from '../services/station/station.service';
import {Router} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {StationPage} from './station/station.page';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.page.html',
  styleUrls: ['./stations.page.scss'],
})
export class StationsPage implements OnInit {
  //region Variables
  @Input() trader: any;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    private us: UniverseService,
    private router: Router,
    public stationS: StationService,
    private modalController: ModalController,
  ) {
    this.stationS.fsaSBP(this.us.aSolarBody.id).then((fsaSBPRes: any) => {});
  }
  //endregion

  ngOnInit() {
  }

  async viewStationModal(aStation){
    //this.shipS.shipID= aShip.id;
    //this.shipS.isModal= true;
    this.stationS.rsP(aStation.id).then((rsPRes: any) => {});

    const stationModal= await this.modalController.create({
      component: StationPage,
      componentProps: {
        isModal: true,
        trader: this.trader
      },
      cssClass: 'ship_modal',
      showBackdrop: true
    });

    return await stationModal.present();
  }

  checkAccess(aStation){}
}
