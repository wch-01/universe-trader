import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Components} from '@ionic/core';
import {ShipService} from '../../services/ship/ship.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {UniverseService} from '../../services/universe/universe.service';
import {SolarBody, SolarSystem} from '../../classes/universe';
import {AlertController, ModalController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {CharacterService} from '../../services/character/character.service';
import {ColonyService} from '../../services/colony/colony.service';
import {ColonyModalPage} from '../../modals/colony-modal/colony-modal.page';
import {ShipWarehousePage} from '../ship-warehouse/ship-warehouse.page';
import {ModalPage} from "../../modal/modal.page";

const moment= require('moment');

@Component({
  selector: 'app-ship',
  templateUrl: './ship.page.html',
  styleUrls: ['./ship.page.scss'],
})
export class ShipPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  @Output() traveling: EventEmitter<any> = new EventEmitter();
  id;

  aShip;
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
  foundColony= false;
  aColony;
  aColonies;
  aColonyInventory;
  //endregion

  //region Cargo
  totalCapacity= 0;
  //endregion

  timeOne= moment.utc().format('HH:mm:ss');
  timeTwo= moment().format('HH:mm:ss');
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
    private cs: CharacterService,
    private modalController: ModalController,
  ) { }
  //endregion

  ngOnInit() {
    console.log('Load Ship Page');
    /*
    if(!this.ss.serverBoot){
      console.log('Ship: Boot Server');
      this.ss.bootServer().then(
        bsRes => {
          this.cs.rcP().then(
            rcpRes => {
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
                      if(this.shipS.aShip.status === 'Idle'){
                        this.colonyS.fcIDP(this.shipS.aShip.solarBody).then(
                          (fcIDRes: any) => {
                            this.foundColony= true;
                            this.colonyS.readColony(this.colonyS.colonyID);
                          },
                          (fcIDErr: any) =>{
                            this.foundColony= false;
                          }
                        );
                      }
                    });
                    this.shipBootDone= Promise.resolve(true);
                  });
                  this.aUniverse= this.uniS.readUniverse();
                }
              });
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
        console.log('Ship: Find Character');
        this.cs.rcP().then(
          rcpRes => {
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
                    if(this.shipS.aShip.status === 'Idle'){
                      this.colonyS.fcIDP(this.shipS.aShip.solarBody).then(
                        (fcIDRes: any) => {
                          this.foundColony= true;
                          this.colonyS.readColony(this.colonyS.colonyID);
                        },
                        (fcIDErr: any) =>{
                          this.foundColony= false;
                        }
                      );
                    }
                  });
                  this.shipBootDone= Promise.resolve(true);
                });
                this.aUniverse= this.uniS.readUniverse();
              }
            });
          },
          rcpError =>{
            console.log('No character found.');
          }
        );
      }
      else{
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
              if(this.shipS.aShip.status === 'Idle'){
                this.colonyS.fcIDP(this.shipS.aShip.solarBody).then(
                  (fcIDRes: any) => {
                    this.foundColony= true;
                    this.colonyS.readColony(this.colonyS.colonyID);
                  },
                  (fcIDErr: any) =>{
                    this.foundColony= false;
                  }
                );
              }
              this.shipBootDone= Promise.resolve(true);
            });
            this.aUniverse= this.uniS.readUniverse();
          }
        });
      }
    }
    */


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
            if(this.shipS.aShip.status === 'Idle'){
              this.colonyS.fcIDP(this.shipS.aShip.solarBody).then(
                (fcIDRes: any) => {
                  this.foundColony= true;
                  this.colonyS.readColony(this.colonyS.colonyID);
                },
                (fcIDErr: any) =>{
                  this.foundColony= false;
                }
              );
            }
          });
          this.shipBootDone= Promise.resolve(true);
        });
        this.aUniverse= this.uniS.readUniverse();
      }
    });
  }

  readShip(){
    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.id).valueChanges({idField:'id'})
      .subscribe(aShip=>{
        this.aShip= aShip;
        this.shipS.rslP(this.aShip.solarSystem, this.aShip.solarBody).then((rslP: any) => {
          this.colonyS.fcIDP(this.aShip.solarBody).then(
            (fcIDRes: any) => {
              this.foundColony= true;
              this.colonyS.readColony(this.colonyS.colonyID);
            },
            (fcIDErr: any) =>{
              this.foundColony= false;
            }
          );
        });
      });
  }

  readSSSolarBodies(aSolarSystem){
    this.aSolarBodies= this.uniS.readSSSolarBodies(aSolarSystem.id);
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
  eta(timeStamp){
    return moment.unix(timeStamp).format('HH:mm:ss');
  }
  travel(){
    const arrivalTime= moment().add( +this.aTravel.ssTTms + +this.aTravel.sbTTms, 'milliseconds')
      .unix();
    //console.log(arrivalTime);
    const aShip= {
      status: 'Traveling',
      travelSS: this.aTravel.aSolarSystem.name,
      travelSB: this.aTravel.aSolarBody.name,
      travelSSID: this.aTravel.aSolarSystem.id,
      travelSBID: this.aTravel.aSolarBody.id,
      travelAT: arrivalTime,
    };

    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.shipS.aShip.id)
      .update(Object.assign({}, aShip));
    //this.traveling.emit(null);
    //this.colonyS.colonySub.unsubscribe();
    //this.colonyS.aColony= '';
    //this.colonyS.aSolarSystem= '';
    //this.colonyS.aSolarBody= '';
    //this.colonyS.rCSSSub.unsubscribe();
    //this.colonyS.rCSBSub.unsubscribe();
  }
  //endregion

  dismissModal() {
    //this.shipS.aShip= undefined;
    //this.shipS.shipSub.unsubscribe();//Stopped working after turning the call into a promise.
    this.modal.dismiss('cancel');
  }

  async viewColony(){
    const colonyModal = await this.modalController.create({
      component: ColonyModalPage,
      componentProps: {
        id:this.shipS.aLocation.aColony.id,
        trading: true,
        trader: 'ship'
      },
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await colonyModal.present();
  }

  async viewWarehouse(){
    const colonyModal = await this.modalController.create({
      component: ModalPage,
      componentProps: {
        viewer:'ship',
        modalType: 'warehouse',
        trading: true,
        trader: 'ship'
      },
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await colonyModal.present();
  }
}
