import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {UniverseService} from '../../services/universe/universe.service';
import {Router} from '@angular/router';
import {StationService} from '../../services/station/station.service';
import {ModalController} from '@ionic/angular';
import {Components} from '@ionic/core';
import {GlobalService} from '../../services/global/global.service';
import {CharacterService} from '../../services/character/character.service';
import {Warehouse} from '../../classes/warehouse';
import {WarehouseService} from '../../services/warehouse/warehouse.service';

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
})
export class StationPage implements OnInit, OnDestroy {
  //region Variables
  @Input() id: any;
  @Input() modal: Components.IonModal;
  isModal;
  trader;traderID;
  stationLoaded= false;
  nsTab= 'market';
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public charS: CharacterService,
    private ss: ServerService,
    private us: UniverseService,
    private router: Router,
    public stationS: StationService,
    private modalController: ModalController,
    public globalS: GlobalService,
    private warehouseS: WarehouseService
  ) {}
  //endregion

  ngOnInit() {
    console.log('Modal Load: ' + this.trader);
    if(!this.isModal){
      console.log('Is Not Modal');
      this.stationS.rpS(this.id).then((rsPRes: any) => {
        this.stationS.rpSI();
      });
    }
  }

  dismissModal() {
    this.modal.dismiss('cancel');
  }

  ngOnDestroy() {
    this.stationS.subscriptions.some((subscription) => {
      subscription.unsubscribe();
    });
    if(this.trader === 'ship'){
      this.warehouseS.subscriptions.some((subscription) => {
        subscription.unsubscribe();
      });
    }
    this.stationS.aStation= undefined;
  }
}
