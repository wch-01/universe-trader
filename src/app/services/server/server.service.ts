import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {take} from 'rxjs/operators';
import {DefaultItems, Rules, Structures} from '../../classes/server';
import {Router} from '@angular/router';
import {hasCustomClaim} from '@angular/fire/compat/auth-guard';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  //region Variables
  activeServer: string | undefined;
  aDefaultItems= new DefaultItems();
  aRules= new Rules();
  aStructures: any;
  aaStructures= new Structures();
  serverBoot: Promise<boolean> | undefined;
  aActiveServers;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public router: Router
  ) {
    console.log('Server Service Started.');
    if(!this.activeServer){
      if(localStorage.getItem('utServer')){
        console.log('Get Server from Local Storage');
        this.activeServer= localStorage.getItem('utServer');
        //this.bootServer();
      }
      else{
        console.log('No server in storage');
        //this.router.navigate(['/servers']);
      }
    }
    else{
      this.bootServer();
    }
    /*
    if(!this.activeServer){
      this.activeServer= 'server_1';
    }
    this.readRules().then((res: any) => {
      this.readItems();
      this.readStructures();
      this.serverBoot= Promise.resolve(true);
    });
    */
  }
  //endregion

  async bootServer(){
    console.log('Server Service Boot Function.');

    return await new Promise((resolve, reject) => {
      if(!this.activeServer){
        if(localStorage.getItem('utServer')){
          console.log('Get Server from Local Storage');
          this.activeServer= localStorage.getItem('utServer');
        }
        else{
          console.log('No server in storage');
          this.router.navigate(['/servers']);
        }
      }

      console.log('Server Booting: ' + this.activeServer);

      this.readRules().then((res: any) => {
        this.readItems().then(() => {
          this.readStructures().then(() => {
            this.serverBoot= Promise.resolve(true);
            resolve(true);
          });
        });
      });
    });
  }

  async readRules(){
    return await new Promise((resolve, reject) => {
      this.afs.collection('servers/' + this.activeServer +'/z_rules')
        .valueChanges({idField: 'id'})
        .pipe(take(1))
        .subscribe((aRules: any) =>{
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
    });
  }

  async readItems(){
    await this.afs.collection('servers/' + this.activeServer + '/z_items')
      .valueChanges()
      .pipe(take(1))
      .subscribe((aDefaultItems: any) => {
        if(this.aRules.consoleLogging >= 1){
          console.log('Default Items');
          if(this.aRules.consoleLogging >= 2){
            console.log(aDefaultItems);
          }
        }
        aDefaultItems.some((aDefaultItem: any) => {
          if(this.aRules.consoleLogging >= 1){
            console.log('Default Item');
            if(this.aRules.consoleLogging >= 2){
              console.log(aDefaultItem);
            }
          }
          this.aDefaultItems[aDefaultItem.name]= aDefaultItem;
        });
      });
  }

  async readStructures(){
    const structuresSub= await this.afs.collection('servers/' + this.activeServer +'/z_structures')
      .valueChanges({idField: 'id'})
      .pipe(take(1))
      .subscribe((aStructures: any) =>{
        this.aStructures= aStructures;
        aStructures.some((aStructure: any) => {
          this.aaStructures[aStructure.name]= aStructure;
        });
      });
    //structuresSub.unsubscribe();
  }

  getActiveServerList(){
    if(hasCustomClaim('superAdmin')){
      return new Promise((resolve, reject) => {
        this.afs.collection('servers')
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
    }
    else{
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
    }
  }

  logoutServer(){
    this.activeServer= undefined;
    this.aDefaultItems= new DefaultItems();
    //this.aRules= new Rules();
    this.aStructures= undefined;
    this.aaStructures= new Structures();
    this.serverBoot= undefined;
    this.aActiveServers= undefined;
  }

}
