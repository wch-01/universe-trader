import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/authentication/authentication.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../services/server/server.service';
import {Ship} from '../classes/ship';
import {ModalController} from '@ionic/angular';
import {ShipPage} from '../ships/ship/ship.page';
import {ShipService} from '../services/ship/ship.service';
import {CharacterService} from '../services/character/character.service';
import {Router} from '@angular/router';
import {HousekeepingService} from '../services/housekeeping/housekeeping.service';
import {take} from 'rxjs/operators';
import {PlatformService} from '../services/platform/platform.service';
import {TutorialModalPage} from '../modals/tutorial-modal/tutorial-modal.page';
import {GlobalService} from '../services/global/global.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  //region Variables
  aCharacter;
  user= null;
  characterShips: any;
  characterShipsTwo: [];
  segment= 'ships';
  //endregion

  //region Constructor
  constructor(
    private authService: AuthenticationService,
    private afs: AngularFirestore,
    private ss: ServerService,
    public cs: CharacterService,
    public modalController: ModalController,
    private shipS: ShipService,
    public router: Router,
    private hks: HousekeepingService,
    public platform: PlatformService,
    public globalS: GlobalService,
  ) {
    /*
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('Dashboard Constructor');
    }
    */
  }
  //endregion

  ngOnInit() {
    console.log('Dashboard Init');
    if(!this.ss.serverBoot){
      console.log('Dashboard: Boot Server');
      this.ss.bootServer().then(
        bsRes => {
          this.cs.rcP().then(
            rcpRes => {
              this.cs.readCharacterShips();
              this.cs.rCharacterWarehouses();
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
            this.cs.rCharacterWarehouses();
          },
          rcpError =>{
            console.log('No character found.');
            this.router.navigate(['/character']);
          }
        );
      }
      else{
        this.cs.readCharacterShips();
        this.cs.rCharacterWarehouses();
      }
    }
  }

  /*
  readCharacterShips(){
    const shipsSub= this.afs.collection('servers/' + this.ss.activeServer + '/ships/ships',
        ref => ref.where('ownerUID','==', this.authService.user.uid))
      .valueChanges({idField:'id'})
      .subscribe(aShips=>{
        this.characterShips= [];//Reset the Character ship list each time the DB has changes.
        aShips.some((aShip: Ship)=> {
          const aSolarSystem= this.afs.collection('servers/' + this.ss.activeServer + '/universe')
            .doc(aShip.solarSystem).valueChanges({idField:'id'})
            .pipe(take(1))
            .subscribe((solarSystem: any)=>{
            aShip.location= solarSystem.name;
          });
          this.characterShips.push(aShip);
      });
        this.hks.subscriptions.push(shipsSub);
    });
  }
  */

  getSolarSystem(solarSystemID){
    const aSolarSystem= this.afs.collection('servers/' + this.ss.activeServer + '/solar_systems/solar_systems')
      .doc(solarSystemID).valueChanges();
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('Get Solar System');
    }
    if(this.ss.aRules.consoleLogging.mode >= 2){
      console.log(aSolarSystem);
    }

    return this.afs.collection('servers/' + this.ss.activeServer + '/solar_systems/solar_systems')
      .doc(solarSystemID).valueChanges();
  }

  async viewShipModal(aShip){
    //this.shipS.shipID= aShip.id;
    //this.shipS.isModal= true;
    const shipModal= await this.modalController.create({
      component: ShipPage,
      componentProps: {id: aShip.id},
      cssClass: 'ship_modal',
      showBackdrop: true
    });

    return await shipModal.present();
  }

  async viewShip(aShip){
    this.shipS.id= aShip.id;
    //await this.router.navigate(['/ship', aShip]);// Used this for a while, but want to get away from url params
    await this.router.navigate(['/ship']);
  }

  transfer(aWarehouse){
    this.afs.collection('servers/'+this.ss.activeServer+'/characters')
      .doc(this.cs.id)
      .update({solarBodyID: aWarehouse.solarBody, solarSystemID: aWarehouse.solarSystem});
  }

  //region Other
  ngOnDestroy() {
    this.cs.subscriptions.some((subscription) => {
      subscription.unsubscribe();
    });
  }
  //endregion
}
