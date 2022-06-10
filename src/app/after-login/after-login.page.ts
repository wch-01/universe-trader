import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication/authentication.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../services/server/server.service';
import {CharacterService} from '../services/character/character.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-after-login',
  templateUrl: './after-login.page.html',
  styleUrls: ['./after-login.page.scss'],
})
export class AfterLoginPage implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private afs: AngularFirestore,
    private ss: ServerService,
    public cs: CharacterService,
    public router: Router
  ) { }

  ngOnInit() {
    if(!this.ss.serverBoot){
      console.log('After Login: Boot Server');
      this.ss.bootServer().then(
        bsRes => {
          this.cs.rcP().then(
            rcpRes => {
              this.cs.readCharacterShips();
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
    else{
      if(!this.cs.characterFound){
        this.cs.rcP().then(
          rcpRes => {
            this.cs.readCharacterShips();
            this.router.navigate(['/dashboard']);
          },
          rcpError =>{
            console.log('No character found.');
            this.router.navigate(['/character']);
          }
        );
      }
      else{
        this.cs.readCharacterShips();
        this.router.navigate(['/dashboard']);
      }
    }
  }
}
