import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {UniverseService} from '../universe/universe.service';
import {CharacterService} from "../character/character.service";

@Injectable({
  providedIn: 'root'
})
export class BusinessesService {
  //region Variables
  aBusinesses;
  aBusiness;
  //endregion

  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    private us: UniverseService,
    private charS: CharacterService
  ) { }

  /**
   * Name: Read Businesses Promise
   *
   * @return Promise
   **/
  rbP(){
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('businessesService');
    }

    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.ss.activeServer + '/businesses',
        ref =>
          ref.where('solarBodyID', '==', this.us.aSolarBody.id).where('ownerID', '==', this.charS.aCharacter.id)
      ).valueChanges({idField: 'id'})
        .subscribe((aBusinesses: any) => {
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(aBusinesses);
          }
          this.aBusinesses= aBusinesses;
          resolve(true);
        });
    });
  }
}
