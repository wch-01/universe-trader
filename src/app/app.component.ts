import { Component } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AuthenticationService} from './services/authentication/authentication.service';
import {CharacterService} from './services/character/character.service';
import {Router} from '@angular/router';
import {ServerService} from './services/server/server.service';
import {PlatformLocation} from '@angular/common';
import {WarehouseService} from './services/warehouse/warehouse.service';
import {StationService} from './services/station/station.service';
import {ColonyService} from './services/colony/colony.service';
import {ChatService} from './services/chat/chat.service';

//todo rebuild this to present a server selection firs, store last used server in local storage/user record.
// Need to bypass server not loaded before other modules
//todo round all pulsar values up.
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  //region Variables
  menu: false;
  user = null;
  userLoggedIn: Promise<boolean> | undefined;
  userLoggedInTwo= false;
  bootDone: Promise<boolean> | undefined;
  public appPages = [
    /*{ title: 'Login', url: '/login', icon: '', role: 'admin' },*/
    { title: 'Dashboard', url: '/dashboard', icon: '', role: 'any', auth: true },
    { title: 'Control Room', url: '/control-room', icon: '', role: 'any', auth: true },
    /*{ title: 'Character', url: '/character', icon: '', role: 'any', auth: true },*/
    { title: 'Shipyard', url: '/shipyard', icon: '', auth: true },
    /*{ title: 'Ships', url: '/ships', icon: '', role: 'any', auth: true },*/
    { title: 'Chatroom', url: '/chat-rooms', icon: '', auth: true },
    /*{ title: 'Favorites', url: '/folder/Favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/Spam', icon: 'warning' },*/
  ];
  //endregion

  //region Constructor
  constructor(
    public authService: AuthenticationService,
    public ss: ServerService,
    public cs: CharacterService,
    private router: Router,
    private pLocation: PlatformLocation,
    private ws: WarehouseService,
    private stationS: StationService,
    private colonyService: ColonyService,
    private chatService: ChatService
    //public fireAuth: AngularFireAuth
  ) {
    //this.logout();
    console.log('App Boot');
    this.bootDone= Promise.resolve(true);
    //console.log(this.authService.userLoggedIn);

    /*
    this.authService.userOBS.subscribe((user) => {
      console.log('User Check');
      console.log(user);
      if(user === null){
      }
      else{
      }
    });
    */
    //console.log((pLocation as any).location);
    //if(this.router.url === '/login-register'){
    if((pLocation as any).location.hash === '#/login-register'){
      //this.bootDone= Promise.resolve(true);
    }
    else{
      /*
      this.authService.userOBS.subscribe((user) => {
        //this.bootDone= Promise.resolve(true);
      });
      */
      if(!this.ss.activeServer){
        console.log('No server Selected.');
        this.router.navigate(['/servers']);
      }
      else{
        console.log('AppC Boot Server');
        this.ss.bootServer().then(
          bsRes => {
            this.cs.rcP().then(
              rcpRes => {
                this.router.navigate(['/dashboard']);
              },
              rcpError =>{
                console.log('No character found.');
                this.router.navigate(['/character']);
              }
            );
          },
          bsError =>{
            console.log('Server Boot Failed');
            this.router.navigate(['/servers']);
          }
        );
      }

      /*
      if(this.ss.activeServer){
        this.ss.bootServer().then((res: any) => {
          this.authService.userOBS.subscribe((user) => {
            if(this.ss.aRules.consoleLogging.mode >= 1){
              console.log('App Component User Subscribe');
              if(this.ss.aRules.consoleLogging.mode >= 2){
                console.log(user);
              }
            }

            if(user.uid){
              this.cs.readCharacter();
              this.cs.obsCharacter.subscribe((aCharacter: any) => {
                if(this.ss.aRules.consoleLogging.mode >= 1){
                  console.log('Character');
                  if(this.ss.aRules.consoleLogging.mode >= 2){
                    console.log(aCharacter);
                  }
                }

                this.bootDone= Promise.resolve(true);
              });
            }
          });
        });
      }
      */
    }
  }
  //endregion

  async authBoot(){
    await this.authService.checkUser().subscribe((userResponse: any) => {
      if (userResponse) {
        console.log('App Component: Check User True');
        this.user= userResponse;
        //this.cs.readCharacter();
      }
      else {
        console.log('App Component: Check User False');
        this.user= undefined;
      }
    });
  }

  async logout() {
    this.stationS.logoutStation();
    this.colonyService.logoutColony();
    this.chatService.logoutChat();
    this.ws.logoutWarehouse();
    this.cs.logoutCharacter();
    this.ss.logoutServer();
    await this.authService.logout();
    /*
    switch (this.authService.loginType){
      case 'email':
        return this.authService.logout();
        break;
      case 'google':
        this.fireAuth.signOut();
        break;
    }
    */
  }
}
