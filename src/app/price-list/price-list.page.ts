import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication/authentication.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../services/server/server.service';
import {UniverseService} from '../services/universe/universe.service';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';
import {ColonyModalPage} from '../modals/colony-modal/colony-modal.page';
import {ModalController} from '@ionic/angular';
const moment= require('moment');

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.page.html',
  styleUrls: ['./price-list.page.scss'],
})
export class PriceListPage implements OnInit {
  //region Variables
  pricesLoaded= false;
  aColonies;
  aFilteredList;
  aFilters= {
    name: ''
  };
  sortField= 'name';
  sortOrder= true;
  //endregion

  //region Constructor
  constructor(
    private authS: AuthenticationService,
    private afs: AngularFirestore,
    public ss: ServerService,
    private us: UniverseService,
    public router: Router,
    public modalController: ModalController,
  ) { }
  //endregion

  ngOnInit() {
    console.log('Price List init');
    console.log(this.ss.serverBoot);
    //console.log(this.ss.obsServerBooted);

    /*
    if(this.ss.isServerBooted()){
      console.log('Watching Boot Promise');
      console.log(this.ss.aDCMI);
    }
    */
    //this.ss.serverBoot.

    if(localStorage.getItem('ut_server_price_list_colonies')
      &&
      localStorage.getItem('ut_server_price_list_colonies_time') < moment().add(7, 'days').unix()
      &&
      localStorage.getItem('ut_server_price_list_colonies_time') > this.ss.lastUpdate.universeUpdated
    ){
      console.log('Local Storage is in date');
      //Stored Rules are good
      this.aColonies= JSON.parse(localStorage.getItem('ut_server_price_list_colonies'));
      console.log(this.aColonies);
      this.sort('name', true);
      this.pricesLoaded= true;
      //resolve(true);
    }
    else{
      console.log('Local Storage is out of date');
      console.log(localStorage.getItem('ut_server_price_list_colonies_time') + ' < ' + moment().add(7, 'days').unix());
      console.log(localStorage.getItem('ut_server_price_list_colonies_time') + ' > ' + this.ss.lastUpdate);
      const coloniesSub= this.us.readColonies().subscribe((aColonies: any) => {
        this.aColonies= aColonies;
        this.aColonies.some((aColony: any) => {
          //aColony.aInventory;
          aColony.aaInventory= [];
          const invSub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories/',
            ref =>
              ref.where('ownerID', '==', aColony.id)
          )
            .valueChanges().pipe(take(1)).subscribe((aInventory: any) => {
            //aColony.aInventory= aInventory;
            aInventory.some((aItem: any) => {
              aColony.aaInventory[aItem.name]= aItem;
              aColony[aItem.name + '_lp']= aItem.listPrice;
              aColony[aItem.name + '_bp']= aItem.buyPrice;
            });
            localStorage.setItem('ut_server_price_list_colonies', JSON.stringify(this.aColonies));
            localStorage.setItem('ut_server_price_list_colonies_time', moment().unix());
            this.pricesLoaded= true;
            invSub.unsubscribe();
            coloniesSub.unsubscribe();
            this.sort('name', true);
          });
        });
      });
    }
  }

  getColonyItems(aColonies){
    return new Promise((resolve, reject) => {
      /*
      const coloniesSub= this.us.readColonies().subscribe((aColonies: any) => {
        this.aColonies= aColonies;
        localStorage.setItem('ut_server_price_list_colonies', JSON.stringify(this.aColonies));
        localStorage.setItem('ut_server_price_list_colonies_time', moment().unix());
        this.aColonies.some((aColony: any) => {
          //aColony.aInventory;
          aColony.aaInventory= [];
          const invSub= this.afs.collection('servers/' + this.ss.activeServer + '/inventories',
            ref =>
              ref.where('ownerID', '==', aColony.id)
                .where('market', '==', true)
          ).valueChanges().pipe(take(1)).subscribe((aInventory: any) => {
            //aColony.aInventory= aInventory;
            aInventory.some((aItem: any) => {
              aColony.aaInventory[aItem.name]= aItem;
              aColony[aItem.name + '_lp']= aItem.listPrice;
              aColony[aItem.name + '_bp']= aItem.buyPrice;
            });
            console.log(this.aColonies);
            this.pricesLoaded= true;
            invSub.unsubscribe();
            coloniesSub.unsubscribe();
            this.sort('name', true);
          });
        });
      });
      */
    });
  }

  filter(){
    this.aColonies= this.aColonies.filter((aColony) =>
      aColony.name.toLowerCase().indexOf(this.aFilters.name.toLowerCase()) > -1
    );
  }

  sort(field, order){
    if(this.sortField !== field){
      this.sortOrder= order= true;
    }
    this.sortField= field;
    this.aColonies.sort((n1,n2) => {
      if(order){
        if (n1[field] > n2[field]) {
          return 1;
        }

        if (n1[field] < n2[field]) {
          return -1;
        }
      }
      else{
        if (n1[field] > n2[field]) {
          return -1;
        }

        if (n1[field] < n2[field]) {
          return 1;
        }
      }
      return 0;
    });
  }

  async viewColony(colony){
    const colonyModal = await this.modalController.create({
      component: ColonyModalPage,
      componentProps: {id:colony.id},
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await colonyModal.present();
  }

}