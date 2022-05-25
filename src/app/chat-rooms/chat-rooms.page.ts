import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {IonContent} from '@ionic/angular';
import {Observable} from 'rxjs';
import {ServerService} from '../services/server/server.service';
import {CharacterService} from '../services/character/character.service';
import {ChatService} from '../services/chat/chat.service';
import {Router} from '@angular/router';

const moment= require('moment');

@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.page.html',
  styleUrls: ['./chat-rooms.page.scss'],
})
export class ChatRoomsPage implements OnInit {
  @ViewChild(IonContent, {read: IonContent, static: false}) chatView: IonContent;

  //@ViewChild('chatContent') private content: any;
  messages: Observable<any[]>;
  newMsg = '';
  unixTimeStamp= moment().unix();
  currentTime= moment.unix(this.unixTimeStamp);

  constructor(
    private ss: ServerService,
    private cs: CharacterService,
    private chatService: ChatService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.messages = this.chatService.getChatMessages();
    console.log('Chat Messages');
    this.messages.subscribe((msg: any) => {
      console.log(msg);
      this.scrollToBottom();
    });
    this.scrollToBottom();
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
