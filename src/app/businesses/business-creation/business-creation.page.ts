import {Component, Input, OnInit} from '@angular/core';
import {ServerService} from '../../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {UniverseService} from '../../services/universe/universe.service';
import {Business} from '../../classes/business';
import {WarehouseService} from '../../services/warehouse/warehouse.service';
import {Components} from '@ionic/core';

@Component({
  selector: 'app-business-creation',
  templateUrl: './business-creation.page.html',
  styleUrls: ['./business-creation.page.scss'],
})
export class BusinessCreationPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  aNewBusiness= { } as Business;
  //endregion

  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    private us: UniverseService,
    public ws: WarehouseService
  ) { }

  ngOnInit() {
  }

  dismissModal() {
    this.modal.dismiss('cancel');
  }
}
