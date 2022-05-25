import { Injectable } from '@angular/core';
//import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {CharacterService} from '../character/character.service';
import {ServerService} from '../server/server.service';
// @ts-ignore
const moment= require('moment');

export interface User {
  uid: string;
  email: string;
}

export interface Message {
  // @ts-ignore
  //createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
  createdAt: string;
  dateTime: string;
}



@Injectable({
  providedIn: 'root'
})
export class ChatService {
  //region Variables
  //endregion

  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    private cs: CharacterService
  ) { }

  getTimeStamp() {
    const now = new Date();
    const date = now.getUTCFullYear() + '/' +
      (now.getUTCMonth() + 1) + '/' +
      now.getUTCDate();
    const time = now.getUTCHours() + ':' +
      now.getUTCMinutes() + ':' +
      now.getUTCSeconds();

    return (date + ' ' + time);
  }
  // Chat functionality

  addChatMessage(msg) {
    return this.afs.collection('servers/' + this.ss.activeServer + '/chat/rooms/global').add({
      msg,
      from: this.cs.aCharacter.name,
      // @ts-ignore
      //createdAt: firebase.firestore.FieldValue.serverTimestamp()
      createdAt: moment().unix()
    });
  }

  getChatMessages() {
    let users = [];
    return this.getUsers().pipe(
      switchMap(res => {
        users = res;
        return this.afs.collection('servers/' + this.ss.activeServer + '/chat/rooms/global',
            ref =>
              ref.orderBy('createdAt')
        )
          .valueChanges({ idField: 'id' }) as Observable<Message[]>;
      }),
      map(messages => {
        // Get the real name for each user
        for (const m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.cs.aCharacter.name === m.from;
          m.dateTime= moment.unix(m.createdAt);
        }
        return messages;
      })
    );
  }

  logoutChat(){}

  private getUsers() {
    return this.afs.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }

  private getUserForMsg(msgFromId, users: User[]): string {
    for (const usr of users) {
      if (usr.uid === msgFromId) {
        return usr.email;
      }
    }
    return 'Deleted';
  }
}
