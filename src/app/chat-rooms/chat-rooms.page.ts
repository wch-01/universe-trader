import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {IonContent} from '@ionic/angular';
import {Observable} from 'rxjs';
import {ServerService} from '../services/server/server.service';
import {CharacterService} from '../services/character/character.service';
import {ChatService} from '../services/chat/chat.service';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/compat/firestore';

const moment= require('moment');

@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.page.html',
  styleUrls: ['./chat-rooms.page.scss'],
})
export class ChatRoomsPage implements OnInit {
  //region Variables
  @ViewChild(IonContent, {read: IonContent, static: false}) chatView: IonContent;

  //@ViewChild('chatContent') private content: any;
  messages: Observable<any[]>;
  newMsg = '';
  unixTimeStamp= moment().valueOf();
  currentTime= moment.unix(this.unixTimeStamp);

  aChatrooms;
  chatTab= 'universe';
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    public cs: CharacterService,
    private chatService: ChatService,
    private router: Router
  ) { }
  //endregion

  async ngOnInit() {
    this.getRooms();
    this.chatService.activeRoom= 'universe';
    this.messages = this.chatService.getChatMessages();
    console.log('Chat Messages');
    this.messages.subscribe((msg: any) => {
      console.log(msg);
      this.scrollToBottom();
    });
    this.scrollToBottom();
  }

  //Get Chat Rooms
  getRooms(){
    this.afs.collection('servers/' + this.ss.activeServer + '/chatrooms').valueChanges({idField: 'id'}).subscribe((aChatrooms: any) => {
      console.log(aChatrooms);
      this.aChatrooms= aChatrooms;
    });
  }
  //change Chat Room
  changeRoom(room){
    console.log('Changing Rooms');
    console.log(room);
    this.chatService.activeRoom= room;
    this.messages = this.chatService.getChatMessages();
    this.messages.subscribe((msg: any) => {
      this.scrollToBottom();
    });
  }

  async scrollToBottomInit(){
    //await this.content.scrollToBottom(300);
  }

  scrollToBottom(){
    setTimeout(() => {
      this.chatView.scrollToBottom();
    }, 500);
  }

  sendMessage() {
    this.scrollToBottom();
    this.chatService.addChatMessage(this.newMsg).then(() => {
      this.newMsg = '';
      this.scrollToBottom();
    });
  }

  /*
  signOut() {
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }
  */
}
