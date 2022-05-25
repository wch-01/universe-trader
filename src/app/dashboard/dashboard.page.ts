import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../services/server/server.service';
import { Ship } from '../classes/ship';
import {ModalController} from '@ionic/angular';
import { ShipPage } from '../ships/ship/ship.page';
import {ModalPage} from '../modal/modal.page';
import {ShipService} from '../services/ship/ship.service';
import {ShipModalPage} from '../ships/ship-modal/ship-modal.page';
import {CharacterService} from '../services/character/character.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
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
    public router: Router
  ) {
    console.log('Loading Dashboard');
    if(!this.ss.activeServer){
      console.log('No server Selected.');
      this.router.navigate(['/servers']);
    }
    else {
      console.log('Dashboard: Boot Server');
      this.ss.bootServer().then(
        bsRes => {
          this.cs.rcP().then(
            rcpRes => {
              this.cs.readCharacterShips();
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
    else if(!this.cs.characterFound){
      console.log('No character found.');
      this.router.navigate(['/character']);
    }
    */

    //this.cs.readCharacter();
    /*
    this.characterShips= this.cs.readCharacterShips();
    console.log('Character Ships');
    console.log(this.characterShips);
    */
    /*
    this.characterShips.then((aShip: any) =>{
      console.log(aShip);
    });
    */
    //this.cs.readCharacterShips();


    /*
    this.user= this.authService.user;
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('Dashboard User Log');
      if(this.ss.aRules.consoleLogging.mode >= 2){
        console.log(this.user);
      }
    }
    */
  }
  //endregion

  async ngOnInit() {
  }

  readCharacterShips(){
    //return this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.user.uid).valueChanges({idField:'id'});
    this.afs.collection('servers/' + this.ss.activeServer + '/ships/ships',
        ref => ref.where('ownerUID','==', this.authService.user.uid))
      .valueChanges({idField:'id'})
      .subscribe(aShips=>{
        this.characterShips= [];//Reset the Character ship list each time the DB has changes.
        aShips.some((aShip: Ship)=> {
          const aSolarSystem= this.afs.collection('servers/' + this.ss.activeServer + '/universe')
            .doc(aShip.solarSystem).valueChanges({idField:'id'});

          aSolarSystem.subscribe((solarSystem: any)=>{
            const location= solarSystem.name;
            // @ts-ignore
            aShip.location= location;
            //console.log(solarSystem.get('id'));
            //console.log(solarSystem.data());
            //console.log(location);
          });

          this.characterShips.push(aShip);
      });
    });
  }

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
/*
    aSolarSystem.pipe(first()).subscribe((solarSystem: any) => {
      console.log(solarSystem);
      return solarSystem.name;
    });
    */
    //return aSolarSystem;
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
    //await this.shipS.readShip(aShip.id);
    await this.router.navigate(['/ship', aShip]);
  }
}
