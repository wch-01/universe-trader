import { Component, OnInit } from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {take} from "rxjs/operators";
import {ToastController} from "@ionic/angular";

@Component({
  selector: 'app-character',
  templateUrl: './character.page.html',
  styleUrls: ['./character.page.scss'],
})
export class CharacterPage implements OnInit {
  //region Variables
  nsTab= 'main';
  responseMessageType = '';
  responseMessage = '';
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    public charS: CharacterService,
    public us: UniverseService,
    public toastController: ToastController
  ) { }
  //endregion

  ngOnInit() {
    //this.us.readSolarSystem(this.charS.aCharacter.solarSystemID);
    //this.us.readSolarBody(this.charS.aCharacter.solarBodyID);
  }

  // Common Method to Show Message and Hide after 2 seconds
  showMessage(type, msg) {
    this.responseMessageType = type;
    this.responseMessage = msg;
    setTimeout(() => {
      this.responseMessage = '';
    }, 2000);
  }

  async presentToast(msg, type?) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: type
    });
    toast.present();
  }

  createCharacter(characterName){
    this.afs.collection('servers/' + this.ss.activeServer + '/characters',
      ref =>
        ref.where('name', '==', characterName)
    ).valueChanges({idField: 'id'})
      .pipe(take(1))
      .subscribe((aCharacter: any) => {
        if(aCharacter.length > 0){
          //Character name exists already
          //this.showMessage('danger', 'Character name exists already');
          this.presentToast('Character name exists already', 'danger');
        }
        else{
          this.charS.createCharacter(characterName);
        }
      });
  }
}
