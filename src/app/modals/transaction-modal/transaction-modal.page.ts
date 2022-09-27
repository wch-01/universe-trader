import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.page.html',
  styleUrls: ['./transaction-modal.page.scss'],
})
export class TransactionModalPage implements OnInit {
  //region Variables
  @Input() id: any;
  @Input() modal: Components.IonModal;
  isModal;
  trader;traderID;
  stationLoaded= false;
  nsTab= 'market';
  //endregion

  constructor() { }

  ngOnInit() {
  }

}
