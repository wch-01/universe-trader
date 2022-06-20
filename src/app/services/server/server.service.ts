import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {take} from 'rxjs/operators';
import {DefaultItems, Rules, Structures} from '../../classes/server';
import {Router} from '@angular/router';
import {hasCustomClaim} from '@angular/fire/compat/auth-guard';
import {Observable, of} from 'rxjs';
// @ts-ignore
const moment= require('moment');

//todo With the new storage method, we need to add a check for server change
@Injectable({
  providedIn: 'root'
})
export class ServerService {
  //region Variables
  lastUpdate= {
    rulesUpdated: '0',
    universeUpdated: '0',
    itemsUpdated: '0',
    structuresUpdated: '0'
  };
  serverBoot: Promise<boolean> | undefined;
  serverBooted= false;
  //obsServerBooted= false as unknown as Observable<any>;
  //obsServerBooted: new Observable<boolean>;
  activeServer: string | undefined;
  aDefaultItems;
  aaDefaultItems= new DefaultItems();
  aDCMI;
  aRules= new Rules();
  aDStructures: any;
  aaDStructures= new Structures();
  aActiveServers;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public router: Router
  ) {
    console.log('Server Service Started.');
    if(!this.activeServer){
      if(localStorage.getItem('ut_server')){
        console.log('Get Server from Local Storage');
        this.activeServer= localStorage.getItem('ut_server');
        //this.bootServer();
      }
      else{
        console.log('No server in storage');
      }
    }
  }
  //endregion

  isServerBooted(): Observable<boolean>{
    while(this.serverBooted === false || this.serverBooted === undefined){
      //return of(false);
    }
    return of(true);
  }

  bootServer(){
    console.log('Server Service Boot Function.');
    // todo need to refine this logic, the find for server still fires even if no server set
    return new Promise((resolve, reject) => {
      if(!this.activeServer){
        if(localStorage.getItem('ut_server')){
          console.log('Get Server from Local Storage');
          this.activeServer= localStorage.getItem('ut_server');
        }
        else{
          console.log('No server in storage');
          reject('No Server selected');
          //this.router.navigate(['/servers']);
        }
      }
      console.log('Server Booting: ' + this.activeServer);
      this.afs.collection('servers/').doc(this.activeServer).valueChanges().pipe(take(1))
        .subscribe((aActiveServer: any) => {
          //this.lastUpdate= aActiveServer.lastUpdate.seconds;
          this.lastUpdate.rulesUpdated= aActiveServer.rules_updated;
          this.lastUpdate.universeUpdated= aActiveServer.universe_updated;
          this.lastUpdate.itemsUpdated= aActiveServer.items_updated;
          this.lastUpdate.structuresUpdated= aActiveServer.structures_updated;
          Promise
            .all([
            this.readRules(),
            this.readItems(),
            this.readStructures(),
            this.rDCMI()
          ])
            .then((result: any) => {
              this.serverBoot= Promise.resolve(true);
              this.serverBooted= true;
              //this.obsServerBooted= true as unknown as Observable<boolean>;
              resolve(true);
            });
        });
    });
  }

  async readRules(){
    return await new Promise((resolve, reject) => {
      //if(localStorage.getItem('ut_server_rules') && localStorage.getItem('ut_server_rules_time') < moment().add(7, 'days').unix()){
      if(
        localStorage.getItem('ut_server_rules')
        &&
        localStorage.getItem('ut_server_rules_time') < moment().add(7, 'days').unix()
        &&
        localStorage.getItem('ut_server_rules_time') > this.lastUpdate.rulesUpdated
      ){
        //Stored Rules are good
        const aRules= JSON.parse(localStorage.getItem('ut_server_rules'));
        aRules.some((aRule: any) => {
          this.aRules[aRule.name]= aRule;
        });
        resolve(true);
      }
      else{
        this.afs.collection('servers/' + this.activeServer +'/z_rules')
          .valueChanges({idField: 'id'})
          .pipe(take(1))
          .subscribe((aRules: any) =>{
            localStorage.setItem('ut_server_rules', JSON.stringify(aRules));
            localStorage.setItem('ut_server_rules_time', moment().unix());
            aRules.some((aRule: any) => {
              this.aRules[aRule.name]= aRule;
            });
            if(this.aRules.consoleLogging >= 1){
              console.log('Default Rule');
              if(this.aRules.consoleLogging >= 2){
                console.log(this.aRules);
              }
            }
            resolve(true);
          });
      }
    });
  }

  async readItems(){
    return await new Promise((resolve, reject) => {
      if(
        localStorage.getItem('ut_server_items')
        &&
        localStorage.getItem('ut_server_items_time') < moment().add(7, 'days').unix()
        &&
        localStorage.getItem('ut_server_items_time') > this.lastUpdate.itemsUpdated
      ){
        //Stored Rules are good
        this.aDefaultItems= JSON.parse(localStorage.getItem('ut_server_items'));
        this.aDefaultItems.some((aRule: any) => {
          this.aaDefaultItems[aRule.name]= aRule;
        });
        resolve(true);
      }
      else{
        this.afs.collection('servers/' + this.activeServer + '/z_items')
          .valueChanges()
          .pipe(take(1))
          .subscribe((aDefaultItems: any) => {
            if(this.aRules.consoleLogging >= 1){
              console.log('Default Items');
              if(this.aRules.consoleLogging >= 2){
                console.log(aDefaultItems);
              }
            }
            this.aDefaultItems= aDefaultItems;
            localStorage.setItem('ut_server_items', JSON.stringify(this.aDefaultItems));
            localStorage.setItem('ut_server_items_time', moment().unix());
            aDefaultItems.some((aDefaultItem: any) => {
              if(this.aRules.consoleLogging >= 1){
                console.log('Default Item');
                if(this.aRules.consoleLogging >= 2){
                  console.log(aDefaultItem);
                }
              }
              this.aaDefaultItems[aDefaultItem.name]= aDefaultItem;
            });
            resolve(true);
          });
      }
    });
  }

  async readStructures(){
    return await new Promise((resolve, reject) => {
      // eslint-disable-next-line max-len
      if(localStorage.getItem('ut_server_structures')
        &&
        localStorage.getItem('ut_server_structures_time') < moment().add(7, 'days').unix()
        &&
        localStorage.getItem('ut_server_structures_time') > this.lastUpdate.structuresUpdated
      ){
        //Stored Rules are good
        this.aDStructures= JSON.parse(localStorage.getItem('ut_server_structures'));
        this.aDStructures.some((aRule: any) => {
          this.aaDStructures[aRule.name]= aRule;
        });
        resolve(true);
      }
      else{
        this.afs.collection('servers/' + this.activeServer +'/z_structures')
          .valueChanges({idField: 'id'})
          .pipe(take(1))
          .subscribe((aDStructures: any) =>{
            this.aDStructures= aDStructures;
            localStorage.setItem('ut_server_structures', JSON.stringify(this.aDStructures));
            localStorage.setItem('ut_server_structures_time', moment().unix());
            aDStructures.some((aDStructure: any) => {
              this.aaDStructures[aDStructure.name]= aDStructure;
            });
            resolve(true);
          });
      }
    });
  }

  getActiveServerList(){
    //todo add other custom claims like beta, dev, admin etc.
    console.log('Getting Servers');
    console.log(hasCustomClaim('admin'));
    //hasCustomClaim('admin')
    /*
    if(hasCustomClaim('developer')){
      return new Promise((resolve, reject) => {
        this.afs.collection('servers')
          .valueChanges({idField:'id'})
          .pipe(take(1))
          .subscribe((aActiveServers: any) => {
            if(this.aRules.consoleLogging.mode >= 1){
              console.log('Server List');
              if(this.aRules.consoleLogging.mode >= 2){
                console.log(aActiveServers);
              }
            }
            this.aActiveServers= aActiveServers;
            resolve(true);
          });
      });
    }
    */
    // else{
      return new Promise((resolve, reject) => {
        this.afs.collection('servers',
          ref =>
            ref.where('status', '==', 'active'))
          .valueChanges({idField:'id'})
          .pipe(take(1))
          .subscribe((aActiveServers: any) => {
            /*
            if(this.aRules.consoleLogging.mode >= 1){
              console.log('Server List');
              if(this.aRules.consoleLogging.mode >= 2){
                console.log(aActiveServers);
              }
            }
            */
            this.aActiveServers= aActiveServers;
            resolve(true);
          });
      });
    // }
  }

  /**
   * Name: Read Default Colony Market Items
   * */
  rDCMI(){
    return new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.activeServer + '/z_items',
        ref =>
          ref.where('market', '==', true)
      )
        .valueChanges()
        .pipe(take(1))
        .subscribe((aDCMI: any) => {
          if(this.aRules.consoleLogging >= 1){
            console.log('Default Items');
            if(this.aRules.consoleLogging >= 2){
              console.log(aDCMI);
            }
          }
          this.aDCMI= aDCMI;
          //console.log('dmci');
          //console.log(this.aDCMI);
          resolve(true);
        });
    });
  }

  logoutServer(){
    this.activeServer= undefined;
    this.aDefaultItems= new DefaultItems();
    //this.aRules= new Rules();
    this.aDStructures= undefined;
    this.aaDStructures= new Structures();
    this.serverBoot= undefined;
    this.aActiveServers= undefined;
  }

}
