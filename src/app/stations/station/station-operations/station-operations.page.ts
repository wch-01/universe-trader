import { Component, OnInit } from '@angular/core';
import {ServerService} from '../../../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {BusinessesService} from '../../../services/businesses/businesses.service';
import {ModalController} from '@ionic/angular';
import {WarehouseService} from '../../../services/warehouse/warehouse.service';
import {GlobalService} from '../../../services/global/global.service';
import {CharacterService} from '../../../services/character/character.service';
import {BusinessPage} from '../../../businesses/business/business.page';
import {BusinessCreationPage} from '../../../businesses/business-creation/business-creation.page';
import {StationService} from '../../../services/station/station.service';
import {StationOperationPage} from '../station-operation/station-operation.page';

@Component({
  selector: 'app-station-operations',
  templateUrl: './station-operations.page.html',
  styleUrls: ['./station-operations.page.scss'],
})
export class StationOperationsPage implements OnInit {
  //region Variables
  aStationOperations;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    public busS: BusinessesService,
    public modalController: ModalController,
    public ws: WarehouseService,
    public globalS: GlobalService,
    public charS: CharacterService,
    private stationS: StationService
  ) { }
  //endregion

  ngOnInit() {
    this.afs.collection('servers/'+this.ss.activeServer+'/stationOperations',
      ref => ref.where('ownerID', '==', this.stationS.aStation.id)).valueChanges({idField: 'id'})
      .subscribe((aStationOperations) => {
        this.aStationOperations= aStationOperations;
      });
  }

  //region C
  //endregion

  //region R
  //endregion

  //region U
  //endregion

  //region D
  //endregion

  //region Other
  async viewOperationModal(aOperation){
    const operationModal= await this.modalController.create({
      component: StationOperationPage,
      componentProps: {
        isModal: true,
        id: aOperation.id,
      },
      cssClass: 'ship_modal',
      showBackdrop: true
    });

    return await operationModal.present();
  }

  async viewOperationModalTwo(aOperation){
    const operationModal= await this.modalController.create({
      component: BusinessPage,
      componentProps: {
        isModal: true,
        type: 'stationOperation',
        id: aOperation.id,
      },
      cssClass: 'ship_modal',
      showBackdrop: true
    });

    return await operationModal.present();
  }
  //endregion
}
