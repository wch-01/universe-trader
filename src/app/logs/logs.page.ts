import {Component, Input, OnInit} from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ShipService} from '../services/ship/ship.service';
import {GlobalService} from '../services/global/global.service';
import {CharacterService} from "../services/character/character.service";

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
})
export class LogsPage implements OnInit {
  //region Variables
  @Input() entity: string;

  logTab= 'transactions';
  aNotifications;
  aTransactions;

  //region Transaction Logs Sort and Filter
  transactionLogsFields= [
    {
      label: 'Type',
      filter: 'type'
    },
    {
      label: 'Item',
      filter: 'item'
    },
    {
      label: 'Quantity',
      filter: 'quantity'
    },
    {
      label: 'Profit/Loss',
      filter: 'pl'
    },
    {
      label: 'Balance',
      filter: 'balance'
    },
    {
      label: 'Time',
      filter: 'time'
    },
  ];
  transactionLogsSortField= 'time';
  transactionLogsOrder= true;
  //endregion
  //endregion

  //region Constructor
  constructor(
    public ss: ServerService,
    private afs: AngularFirestore,
    public shipS: ShipService,
    public globalS: GlobalService,
    private charS: CharacterService,
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
        });
        break;
      case 'wallet':
        this.afs.collection('servers/'+this.ss.activeServer+'/transactionLogs',ref => ref
              .where('characterID', '==', this.charS.id))
          .valueChanges({idField:'id'}).subscribe((aTransactions: any) => {
          this.aTransactions= aTransactions;
        });
        break;
    }
  }

  //region Read
  //endregion

  //region Other
  sortSolarSystems(field, order){
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
  //endregion

}
