import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {Router} from '@angular/router';
import {CharacterService} from '../services/character/character.service';

@Component({
  selector: 'app-servers',
  templateUrl: './servers.page.html',
  styleUrls: ['./servers.page.scss'],
})
export class ServersPage implements OnInit {
  //region Variables
  aServerList;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private cs: CharacterService,
    public router: Router
  ) { }
  //endregion

  ngOnInit() {
    this.ss.getActiveServerList().then((gaslRes: any) => {
      this.aServerList= this.ss.aActiveServers;
    });
  }

  async setServer(server){
    this.ss.activeServer= server;
    localStorage.setItem('utServer', server);
    console.log(localStorage.getItem('utServer'));
    await this.ss.bootServer().then((bsRes: any) => {
      this.cs.rcP().then(
        rcpRes => {
          this.router.navigate(['/dashboard']);
        },
          rcpError =>{
            this.router.navigate(['/character']);
          }
      );
    });
  }

}
