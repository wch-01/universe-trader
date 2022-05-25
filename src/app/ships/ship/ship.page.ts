import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {ShipService} from '../../services/ship/ship.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {UniverseService} from '../../services/universe/universe.service';
import {SolarSystem, SolarBody} from '../../classes/universe';
import {AlertController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {CharacterService} from '../../services/character/character.service';
import {ColonyService} from '../../services/colony/colony.service';
const moment= require('moment');

@Component({
  selector: 'app-ship',
  templateUrl: './ship.page.html',
  styleUrls: ['./ship.page.scss'],
})
export class ShipPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  id;
  shipBootDone: Promise<boolean> | undefined;

  aLocation= {
    aSolarSystem: new SolarSystem(),
    aSolarBody: new SolarBody()
  };
  /*
  currentDate= moment().unix();
  currentDateAdd= moment().add(600000).unix();
  timer= this.currentDateAdd - this.currentDate;
  duration= moment.utc(600000).format('HH:mm:ss.SSS');
  date= moment.unix(this.currentDate).format();
  dateTwo= moment.unix(this.currentDateAdd).format();
  arrivalTime;
  */
  //currentDate= this.date.setDate(this.date.getDate() + 1*60000);
  aTravel= {
    aSolarSystem: new SolarSystem(),
    ssTTms: 0,
    solarSystemTime: '00:00:00',
    //currentDate: this.currentDate,
    aSolarBody: new SolarBody(),
    sbTTms: 0,
    solarBodyTime: '00:00:00',
    totalTravelTime: '00:00:00',
  };
  aUniverse: any;
  aSolarBodies;
  nsTab= 'main';

  //region Colonies
  aColony;
  aColonies;
  aColonyInventory;
  //endregion

  //region Cargo
  totalCapacity= 0;
  //endregion
  //endregion

  //region Constructor
  constructor(
    public shipS: ShipService,
    public colonyS: ColonyService,
    private ss: ServerService,
    private afs: AngularFirestore,
    private uniS: UniverseService,
    private ionAlert: AlertController,
    private route: ActivatedRoute,
    public router: Router,
    private cs: CharacterService
  ) { }
  //endregion

  ngOnInit() {
    this.route.params.subscribe(params => {
      if(this.ss.aRules.consoleLogging.mode >= 1){
        console.log('shipPage');
        if(this.ss.aRules.consoleLogging.mode >= 2){
          console.log(params);
        }
      }
      if(Object.keys(params).length === 0){
        this.router.navigate(['/dashboard']);
      }
      else{
        this.id= params.id;
        if(this.ss.aRules.consoleLogging.mode >= 1){
          console.log('shipID Set');
        }
        this.shipS.readShip(this.id).then(res =>{
          if(this.ss.aRules.consoleLogging.mode >= 2){
            console.log(res);
          }
          this.shipS.rsiP().then(rsiPRes => {
            this.shipS.setCargoCapacity();
          });
          this.colonyS.fcIDP(this.shipS.aShip.solarBody).then((fcIDRes: any) => {
            this.colonyS.readColony(this.colonyS.colonyID);
          });
          this.shipBootDone= Promise.resolve(true);
        });
        this.aUniverse= this.uniS.readUniverse();
      }
    });
  }

  readSolarBodies(aSolarSystem){
    this.aSolarBodies= this.uniS.readSolarBodies(aSolarSystem.id);
  }

  //region Travel
  calcSSTT(){//SolarSystemTravelTime
    const distance= Math.sqrt(
      Math.pow((this.aTravel.aSolarSystem.xCoordinate - this.shipS.aLocation.aSolarSystem.xCoordinate),2)
      +
      Math.pow((this.aTravel.aSolarSystem.yCoordinate - this.shipS.aLocation.aSolarSystem.yCoordinate),2)
    );

    //600000
    this.aTravel.ssTTms=
      ((distance * this.ss.aRules.travel.solarSystem) / this.shipS.aShip.jumpEngine)
      *
      (this.shipS.aShip.installedModules.length / 4);
    this.aTravel.solarSystemTime= moment.utc(this.aTravel.ssTTms).format('HH:mm:ss');
  }
  calcSBTT(){//SolarBodyTravelTime
    let xStart: number;
    let yStart: number;
    if(this.aLocation.aSolarSystem.id === this.aTravel.aSolarSystem.id){
      xStart= this.shipS.aLocation.aSolarBody.xCoordinate;
      yStart= this.shipS.aLocation.aSolarBody.yCoordinate;
    }
    else{
      xStart= 0;
      yStart= 0;
    }

    if(this.ss.aRules.consoleLogging.mode >= 2){
      console.log(this.aLocation.aSolarSystem.id + '===' + this.aTravel.aSolarSystem.id);
      console.log(xStart + ',' + yStart);
    }

    const distance= Math.sqrt(
      Math.pow((this.aTravel.aSolarBody.xCoordinate - xStart),2)
      +
      Math.pow((this.aTravel.aSolarBody.yCoordinate - yStart),2)
    );
    //console.log(distance);//300000
    this.aTravel.sbTTms= (
      (distance * this.ss.aRules.travel.solarBody) / this.shipS.aShip.jumpEngine)
      *
      (this.shipS.aShip.installedModules.length / 4)
    ;
    this.aTravel.solarBodyTime= moment.utc(this.aTravel.sbTTms).format('HH:mm:ss');
  }
  calcTTT(mode?){
    let time: any;
    switch (mode){
      case 'arrivalTime':
        time=  moment
          .unix(
            moment()
              .add(this.aTravel.ssTTms + this.aTravel.sbTTms, 'milliseconds')
              .unix()
          )
          .format('HH:mm:ss');
        break;
      default:
        this.aTravel.totalTravelTime= moment.utc(
          this.aTravel.ssTTms
          +
          this.aTravel.sbTTms).format('HH:mm:ss');
        time= this.aTravel.totalTravelTime;
        break;
    }
    return time;
  }
  travel(){
    //console.log('Traveling');
    this.shipS.aShip.status= 'travelling';
    const arrivalTime= moment()
      .unix(
        moment()
          .add( this.aTravel.ssTTms + this.aTravel.sbTTms, 'milliseconds')
          .unix()
      );
    //console.log(arrivalTime);
    const aTraveling= {
      solarSystem: this.aTravel.aSolarSystem.name,
      solarBody: this.aTravel.aSolarBody.name,
      arrival: arrivalTime,
    };

    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.shipS.aShip.id)
      .update({status:'Traveling', traveling:Object.assign({}, aTraveling)});
  }
  //endregion

  dismissModal() {
    //this.shipS.aShip= undefined;
    //this.shipS.shipSub.unsubscribe();//Stopped working after turning the call into a promise.
    this.modal.dismiss('cancel');
  }
}
