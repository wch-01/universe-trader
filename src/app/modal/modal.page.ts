import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  @Input() viewer: any;
  @Input() modalType: any;
  @Input() aData: any;
  //endregion

  //region Constructor
  constructor() { }
  //endregion

  ngOnInit() {
    console.log('Modal Type');
    console.log(this.modalType);

    console.log('Data view');
    console.log(this.aData);
  }

  dismissModal() {
    this.modal.dismiss('cancel');
  }

}
