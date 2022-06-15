import { Injectable } from '@angular/core';
//import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {CharacterService} from '../character/character.service';
import {ServerService} from '../server/server.service';
import {AuthenticationService} from '../authentication/authentication.service';
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
  message;
  activeRoom;
  //endregion

  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    private cs: CharacterService,
    private authS: AuthenticationService
  ) { }

  getChatMessages() {
    return this.afs.collection('servers/' + this.ss.activeServer + '/chatrooms/' + this.activeRoom + '/messages',
      ref =>
        ref.orderBy('createdAt')
    ).valueChanges({ idField: 'id' }) as Observable<Message[]>;
  }

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
    this.message= msg;
    return new Promise((resolve, reject) => {
      this.censorChat().then((sr) => {
        this.afs.collection('servers/' + this.ss.activeServer + '/chatrooms/' + this.activeRoom + '/messages').add({
          characterID: this.cs.aCharacter.id,
          userID: this.authS.user.uid,
          msg: this.message,
          from: this.cs.aCharacter.name,
          createdAt: moment().valueOf()
        });
        resolve(true);
      });
    });
  }

  logoutChat(){}

  async censorChat(){
    return new Promise((resolve, reject) => {
      this.afs.collection('badWords').valueChanges().subscribe((aWords: any) => {
        for (const item of aWords) {
          this.message= this.message.replace(item.word, '**');
        }
        resolve(true);
      });
    });
  }
}
