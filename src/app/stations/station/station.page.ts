import {Component, Input, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {UniverseService} from '../../services/universe/universe.service';
import {Router} from '@angular/router';
import {StationService} from '../../services/station/station.service';
import {ModalController} from '@ionic/angular';
import {Components} from '@ionic/core';

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
})
export class StationPage implements OnInit {
  //region Variables
  @Input() id: any;
  @Input() modal: Components.IonModal;
  isModal;
  trader;
  stationLoaded= false;
  nsTab= 'market';
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    private us: UniverseService,
    private router: Router,
    public stationS: StationService,
    private modalController: ModalController,
  ) {}
  //endregion

  ngOnInit() {
    console.log('Modal Load: ' + this.trader);
    if(!this.isModal){
      this.stationS.rsP(this.id).then((rsPRes: any) => {});
    }
  }

  dismissModal() {
    this.modal.dismiss('cancel');
  }
}
