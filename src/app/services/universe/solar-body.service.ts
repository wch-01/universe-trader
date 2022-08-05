import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../server/server.service';

@Injectable({
  providedIn: 'root'
})
export class SolarBodyService {
  //region Variables
  solarBodyID;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService
  ) { }
  //endregion

  //region Read
  readSolarBody(){
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe')
      .doc(this.solarBodyID).valueChanges({idField:'id'});
  }

  readColonies(){
    return this.afs.collection('servers/' + this.ss.activeServer + '/universe',
      ref =>
        ref.where('solarBodyID', '==', this.solarBodyID)
    )
      .valueChanges({idField:'id'});
  }

  readStations(){
    return this.afs.collection('servers/' + this.ss.activeServer + '/stations',
      ref =>
        ref.where('solarBodyID', '==', this.solarBodyID)
    )
      .valueChanges({idField:'id'});
  }

  readInventory(){
    return this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
      ref =>
        ref.where('ownerID', '==', this.solarBodyID)
    )
      .valueChanges({idField:'id'});
  }
  //endregion
}
