import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';

@Component({
  selector: 'app-rule',
  templateUrl: './rule.page.html',
  styleUrls: ['./rule.page.scss'],
})
export class RulePage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  isModal;
  aRule;
  aKeys;
  serverTab= 'quickView';
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public ss: ServerService,
  ) { }
  //endregion

  ngOnInit() {
    this.aKeys= Object.keys(this.aRule);
  }

  //region Other
  dismissModal() {
    this.modal.dismiss('cancel');
  }
  //endregion
}
