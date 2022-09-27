import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ShipService} from '../services/ship/ship.service';
import {GlobalService} from '../services/global/global.service';
import {CharacterService} from '../services/character/character.service';
import {StationPage} from '../stations/station/station.page';
import {IonModal, ModalController} from '@ionic/angular';
import {TransactionModalPage} from '../modals/transaction-modal/transaction-modal.page';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
})
export class LogsPage implements OnInit {
  //region Variables
  @Input() entity: string;

  @ViewChild(IonModal) modal: IonModal;

  logTab= 'transactions';
  aNotifications;
  aTransactions;

  //region Transaction Logs Sort and Filter
  transactionLogsFields= [
    {
      label: 'Time',
      filter: 'time'
    },
    {
      label: 'Type',
      filter: 'type'
    },
    {
      label: 'Item',
      filter: 'item'
    },
    {
      label: 'Pulsars',
      filter: 'pulsars'
    },
    {
      label: 'Balance',
      filter: 'balance'
    },
  ];
  transactionLogsSortField= 'time';
  transactionLogsOrder= false;
  viewTransaction= false;
  aVTransaction;
  //endregion
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    public shipS: ShipService,
    public globalS: GlobalService,
    private charS: CharacterService,
    private modalController: ModalController,
  ) { }
  //endregion

  ngOnInit() {
    switch (this.entity){
      case 'ship':
        this.afs.collection('servers/'+this.ss.activeServer+'/notifications',ref => ref
          .where('shipID', '==', this.shipS.aShip.id).orderBy('time'))
          .valueChanges({idField:'id'}).subscribe((aNotifications: any) => {
          this.aNotifications= aNotifications;
        });
        this.afs.collection('servers/'+this.ss.activeServer+'/transactionLogs',ref => ref
          .where('entityID', '==', this.shipS.aShip.id))
          .valueChanges({idField:'id'}).subscribe((aTransactions: any) => {
          this.aTransactions= aTransactions;
          this.sortTransactions('time', false);
        });
        break;
      case 'wallet':
        this.afs.collection('servers/'+this.ss.activeServer+'/transactionLogs',ref => ref
              .where('characterID', '==', this.charS.id))
          .valueChanges({idField:'id'}).subscribe((aTransactions: any) => {
          this.aTransactions= aTransactions;
          this.sortTransactions('time', false);
        });
        break;
    }
  }

  //region Read
  //endregion

  //region Other
  sortTransactions(field, order){
    if(this.transactionLogsSortField !== field){
      this.transactionLogsOrder= order= true;
    }
    this.transactionLogsSortField= field;
    this.aTransactions.sort((n1,n2) => {
      if(order){
        if (n1[field] > n2[field]) {
          return 1;
        }

        if (n1[field] < n2[field]) {
          return -1;
        }
      }
      else{
        if (n1[field] > n2[field]) {
          return -1;
        }

        if (n1[field] < n2[field]) {
          return 1;
        }
      }

      return 0;
    });
  }

  /*
  async viewTransaction(aTransaction) {
    const stationModal = await this.modalController.create({
      component: TransactionModalPage,
      componentProps: {
        isModal: true,
        trader: this.trader,
        traderID: this.traderID
      },
      cssClass: 'ship_modal',
      showBackdrop: true
    });

    return await stationModal.present();
  }
  */

  close() {
    this.modal.dismiss(null, 'cancel');
    this.viewTransaction= false;
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }
  onWillDismiss(event: Event) {
    //alert('testing');
    /*
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
    */
  }
  //endregion

}
