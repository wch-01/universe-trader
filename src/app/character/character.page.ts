import {Component, NgZone, OnInit} from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {take} from 'rxjs/operators';
import {LoadingController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';

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
    public toastController: ToastController,
    private router: Router,
    public loadingController: LoadingController,
    private zone: NgZone
  ) { }
  //endregion

  ngOnInit() {
    console.log('Character Init');
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

  async createCharacter(characterName){
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Creating Character',
      //duration: 2000
    });
    loading.present();

    this.afs.collection('servers/' + this.ss.activeServer + '/characters',
      ref =>
        ref.where('name', '==', characterName)
    ).valueChanges({idField: 'id'})
      .pipe(take(1))
      .subscribe((aCharacter: any) => {
        if(aCharacter.length > 0){
          loading.dismiss();
          this.presentToast('Character name exists already', 'danger');
        }
        else{
          this.charS.createCharacter(characterName).then(r => {
            loading.dismiss();
            this.router.navigate(['/dashboard']);
            //this.router.navigateByUrl('/dashboard');
            //this.zone.run(() => this.router.navigate(['/dashboard']));
          });
        }
      });
  }
}
