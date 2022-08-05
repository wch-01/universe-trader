import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ShipService} from '../services/ship/ship.service';
import {GlobalService} from '../services/global/global.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
})
export class LogsPage implements OnInit {
  //region Variables
  logTab= 'transactions';
  aNotifications;
  aTransactions;
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    public shipS: ShipService,
    public globalS: GlobalService
  ) { }
  //endregion

  ngOnInit() {
    this.afs.collection('servers/'+this.ss.activeServer+'/notifications',
      ref =>
        ref.where('shipID', '==', this.shipS.aShip.id)
          .orderBy('time')
      )
      .valueChanges({idField:'id'}).subscribe((aNotifications: any) => {
        this.aNotifications= aNotifications;
    });
    this.afs.collection('servers/'+this.ss.activeServer+'/transactionLogs',
      ref =>
        ref.where('entityID', '==', this.shipS.aShip.id)
          .orderBy('time')
      )
      .valueChanges({idField:'id'}).subscribe((aTransactions: any) => {
      this.aTransactions= aTransactions;
    });
  }

  //region Read
  //endregion

}
