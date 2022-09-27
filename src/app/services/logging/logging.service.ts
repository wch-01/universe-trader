import { Injectable } from '@angular/core';
import {ServerService} from '../server/server.service';
import {AngularFirestore, DocumentData, QueryDocumentSnapshot} from '@angular/fire/compat/firestore';
import {Transaction} from '../../classes/transaction';
import {Character} from '../../classes/character';
// @ts-ignore
const moment= require('moment');

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
  ) { }

  logTransaction(aTransaction: Transaction){
    //todo Add in any Mission or Event Check that relies on Transactions
    aTransaction.time= moment().valueOf();
    aTransaction.details= Object.assign({}, aTransaction.details);
    this.afs.collection('servers/' + this.ss.activeServer + '/transactionLogs')
      .add(Object.assign({}, aTransaction)).then(() => {
        //Add Min of 5 xp for sale. Additional 5 xp every 100,000 pulsars
        //todo pull the number from the rules
        if(aTransaction.flow === 'in'){
          const multiplier= Math.floor(+aTransaction.pulsars / 100000);
          const totalXP= 5 + (5 * +multiplier);
          this.afs.firestore.collection('servers/'+this.ss.activeServer+'/characters')
            .doc(aTransaction.characterID).get().then((oCharacter: QueryDocumentSnapshot<DocumentData>) => {
              const aCharacter= oCharacter.data() as Character;
              aCharacter.xpTotal= +aCharacter.xpTotal + +totalXP;
              this.afs.collection('servers/' + this.ss.activeServer + '/characters')
                .doc(aTransaction.characterID).update({xpTotal: aCharacter.xpTotal}).then(() => {});
          });
        }
    });
  }
}
