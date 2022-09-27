import { Component, OnInit } from '@angular/core';
import {AngularFirestore, QuerySnapshot} from '@angular/fire/compat/firestore';
import {ServerService} from '../services/server/server.service';
import {Subscription} from 'rxjs';
import {RulePage} from './rule/rule.page';
import {ModalController} from '@ionic/angular';
import {GlobalService} from '../services/global/global.service';

@Component({
  selector: 'app-game-rules-mechanics',
  templateUrl: './game-rules-mechanics.page.html',
  styleUrls: ['./game-rules-mechanics.page.scss'],
})
export class GameRulesMechanicsPage implements OnInit {
  //region Variables
  aRules: any[]= [];
  tab= 'rules';
  //subscriptions: Subscription[] = [];
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public serverS: ServerService,
    public modalController: ModalController,
    public globalS: GlobalService
  ) { }
  //endregion

  ngOnInit() {
    this.readRules();
  }

  //Create

  //region Read
  readRules(){
    this.afs.firestore.collection('servers/'+this.serverS.activeServer+'/zRules')
      .where('name', '!=', 'consoleLogging').get()
      .then((oRules: QuerySnapshot<any>) => {
        oRules.forEach((oRule) => {
          //console.log(oRule.data());
          this.aRules.push(oRule.data());
          // console.log(this.aRules);
        });
        console.log(this.aRules);
      });
  }
  //endregion

  //Update

  //Delete

  //region Other
  async view(aRule){
    const ruleModal = await this.modalController.create({
      component: RulePage,
      componentProps: {isModal: true, aRule},
      cssClass: 'custom-modal',
      showBackdrop: false
    });
    await ruleModal.present();
  }
  //endregion


}
