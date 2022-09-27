import {Component, NgZone, OnInit} from '@angular/core';
import {ServerService} from '../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {CharacterService} from '../services/character/character.service';
import {UniverseService} from '../services/universe/universe.service';
import {take} from 'rxjs/operators';
import {LoadingController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {GlobalService} from '../services/global/global.service';

@Component({
  selector: 'app-character',
  templateUrl: './character.page.html',
  styleUrls: ['./character.page.scss'],
})
export class CharacterPage implements OnInit {
  //region Variables
  characterTab= 'skills';
  responseMessageType = '';
  responseMessage = '';
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public ss: ServerService,
    public charS: CharacterService,
    private globalS: GlobalService,
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
    if(this.charS.characterFound){
    }
  }

  //region Creation
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
          this.globalS.toastMessage('Character name exists already', 'danger');
        }
        else{
          this.charS.createCharacter(characterName).then(r => {
            loading.dismiss();
            //todo this still sometimes does not load ships at first
            this.router.navigate(['/dashboard']);
            //this.router.navigateByUrl('/dashboard');
            //this.zone.run(() => this.router.navigate(['/dashboard']));
          });
        }
      });
  }
  //endregion

  //region Read
  //endregion

  //region Update
  levelUpSkill(skillName){
    //determine the xp needed
    if(this.charS.aCharacter.skills[skillName]){
      this.charS.aCharacter.skills[skillName]= +this.charS.aCharacter.skills[skillName] + 1;
    }
    else{
      this.charS.aCharacter.skills[skillName]= 1;
    }

    this.charS.aCharacter.xpSpent= +this.charS.aCharacter.xpSpent + (+this.ss.aRules.skills.incrementCost * this.charS.aCharacter.skills[skillName]);
    this.afs.collection('servers/' + this.ss.activeServer + '/characters').doc(this.charS.aCharacter.id)
      .update(Object.assign({}, this.charS.aCharacter)).then(() => {});
  }
  //endregion
}
