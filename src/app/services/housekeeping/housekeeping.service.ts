import { Injectable } from '@angular/core';
import {Subscription} from 'rxjs';
import {AngularFirestore} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class HousekeepingService {
  //region Variables
  subscriptions: Subscription[] = [];
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
  ) {}
  //endregion

  async censorWords(text){
    return new Promise((resolve, reject) => {
      this.afs.collection('badWords').valueChanges().subscribe((aWords: any) => {
        for (const item of aWords) {
          text= text.replace(item.word, 'IllegalWordUsed');
        }
        resolve(text);
      });
    });
  }
}
