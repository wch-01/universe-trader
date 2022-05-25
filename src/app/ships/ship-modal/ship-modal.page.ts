import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {ShipService} from '../../services/ship/ship.service';

@Component({
  selector: 'app-ship-modal',
  templateUrl: './ship-modal.page.html',
  styleUrls: ['./ship-modal.page.scss'],
})
export class ShipModalPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  aShip;
  //endregion

  //region Constructor
  constructor(
    public shipS: ShipService
  ) { }
  //endregion

  ngOnInit() {
    if(!this.shipS.aShip){
      console.log('Ship is not set');
      this.shipS.readShip();
    }
  }

  dismissModal() {
    this.shipS.aShip= undefined;
    this.shipS.shipSub.unsubscribe();
    this.modal.dismiss('cancel');
  }
}
