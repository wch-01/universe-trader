import {Component, OnDestroy, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {UniverseService} from '../services/universe/universe.service';
import {AlertController, LoadingController, ModalController, PopoverController} from '@ionic/angular';
import {ServerService} from '../services/server/server.service';
import {ColonyService} from '../services/colony/colony.service';
import {take} from 'rxjs/operators';
import {SolarSystemModalPage} from '../modals/solar-system-modal/solar-system-modal.page';
import {SolarBodyModalPage} from '../modals/solar-body-modal/solar-body-modal.page';
import {ColonyModalPage} from '../modals/colony-modal/colony-modal.page';
const moment= require('moment');

@Component({
  selector: 'app-universe',
  templateUrl: './universe.page.html',
  styleUrls: ['./universe.page.scss'],
})
export class UniversePage implements OnInit, OnDestroy {
  //region Variables
  resources= ['power','food','ore','silicone','metal','electronics'];
  nsTab= 'solarSystems';
  order= true;
  sortField= 'name';
  currentPopover;

  //region Solar Systems
  aUniverse: any;
  aSolarSystemsTable= [
    /*
    {
      label: 'ID',
      filter: 'id'
    },
    */
    {
      label: 'Name',
      filter: 'name'
    },
    {
      label: 'Primary Export',
      filter: 'resourceOne'
    },
    {
      label: 'Secondary Export',
      filter: 'resourceTwo'
    },
    {
      label: 'Solar Yield',
      filter: 'solarYield'
    },
    {
      label: 'X Coordinate',
      filter: 'xCoordinate'
    },
    {
      label: 'Y Coordinate',
      filter: 'yCoordinate'
    }
  ];
  aSolarSystemFilters= {
    /*id: '',*/
    name: '',
    resourceOne: '',
    resourceTwo: '',
    solarYield: '',
    xCoordinate: '',
    yCoordinate: ''
  };
  aFilteredUniverse: any;
  //endregion

  //region Solar Bodies
  aSolarBodies;
  aSolarBodiesTable= [
    /*
    {
      label: 'ID',
      filter: 'id'
    },
    */
    {
      label: 'Name',
      filter: 'name'
    },
    {
      label: 'Type',
      filter: 'solarBodyType'
    },
    {
      label: 'Primary Export',
      filter: 'resourceOne'
    },
    {
      label: 'Secondary Export',
      filter: 'resourceTwo'
    },
    {
      label: 'X Coordinate',
      filter: 'xCoordinate'
    },
    {
      label: 'Y Coordinate',
      filter: 'yCoordinate'
    }
  ];
  aSolarBodyFilters= {
    /*
    id: '',
    */
    name: '',
    solarBodyType: '',
    resourceOne: '',
    resourceTwo: '',
    solarYield: '',
    xCoordinate: '',
    yCoordinate: ''
  };
  aFilteredSolarBodies: any;
  //endregion

  //region Colonies
  aColonies;
  /*
  aColoniesTable= [
    {
      label: 'ID',
      filter: 'id'
    },
    {
      label: 'Name',
      filter: 'name'
    },
    {
      label: 'Population',
      filter: 'population'
    },
    {
      label: 'Resource Two',
      filter: 'resourceTwo'
    },
    {
      label: 'X Coordinate',
      filter: 'xCoordinate'
    },
    {
      label: 'Y Coordinate',
      filter: 'yCoordinate'
    }
  ];
  aColoniesFilters= {
    id: '',
    name: '',
    solarBodyType: '',
    resourceOne: '',
    resourceTwo: '',
    solarYield: '',
    xCoordinate: '',
    yCoordinate: ''
  };
  */
  aFilteredColonies: any;
  //endregion
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private ss: ServerService,
    private uniS: UniverseService,
    public colonyS: ColonyService,
    public modalController: ModalController,
    public loadingController: LoadingController,
    private popoverController: PopoverController,
    private ionAlert: AlertController,
  ) {}
  //endregion

  ngOnInit() {
    console.log('Load Universe Page');
    Promise
      .all([
      this.uniS.rpSolarSystems(),
      this.uniS.rpSolarBodies(),
      this.uniS.rpColonies()
    ])
      .then(() => {
        this.aFilteredUniverse= this.uniS.aSolarSystems;
        this.aFilteredSolarBodies= this.uniS.aSolarBodies;
        this.aFilteredColonies= this.uniS.aColonies;
      });
    /*
    this.uniS.rpSolarSystems().then((rpSolarSystemsRes: any) => {
      this.aFilteredUniverse= this.uniS.aSolarSystems;
    });
    this.uniS.rpSolarBodies().then((rpSolarBodiesRes: any) => {
      this.aFilteredSolarBodies= this.uniS.aSolarBodies;
    });
    this.uniS.rpColonies().then((rpColoniesRes: any) => {
      this.aFilteredColonies= this.uniS.aColonies;
    });
    */
  }

  filterSolarSystems(){
    this.aFilteredUniverse= this.aUniverse.filter((aUniverse) =>
      /*aUniverse.id.toLowerCase().indexOf(this.aSolarSystemFilters.id.toLowerCase()) > -1 */
        aUniverse.name.toLowerCase().indexOf(this.aSolarSystemFilters.name.toLowerCase()) > -1
        && aUniverse.resourceOne.toLowerCase().indexOf(this.aSolarSystemFilters.resourceOne.toLowerCase()) > -1
        && aUniverse.resourceTwo.toLowerCase().indexOf(this.aSolarSystemFilters.resourceTwo.toLowerCase()) > -1
        && aUniverse.solarYield.toString().toLowerCase().indexOf(this.aSolarSystemFilters.solarYield.toLowerCase()) > -1
        && aUniverse.xCoordinate.toString().toLowerCase().indexOf(this.aSolarSystemFilters.xCoordinate.toLowerCase()) > -1
        && aUniverse.yCoordinate.toString().toLowerCase().indexOf(this.aSolarSystemFilters.yCoordinate.toLowerCase()) > -1);
  }
  sortSolarSystems(field, order){
    if(this.sortField !== field){
      this.order= order= true;
    }
    this.sortField= field;
    this.aFilteredUniverse.sort((n1,n2) => {
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
      //this.aFilteredSolarBodies.sort
    });

    console.log('Filter');
    console.log(order);
  }
  async viewSolarSystem(solarSystem){
    const solarSystemModal = await this.modalController.create({
      component: SolarSystemModalPage,
      componentProps: {id:solarSystem.id},
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await solarSystemModal.present();
  }

  filterSolarBodies(){
    this.aFilteredSolarBodies= this.aSolarBodies.filter((aSolarBody) =>
      /*aSolarBody.id.toLowerCase().indexOf(this.aSolarBodyFilters.id.toLowerCase()) > -1*/
      aSolarBody.name.toLowerCase().indexOf(this.aSolarBodyFilters.name.toLowerCase()) > -1
      && aSolarBody.solarBodyType.toLowerCase().indexOf(this.aSolarBodyFilters.solarBodyType.toLowerCase()) > -1
      && aSolarBody.resourceOne.toLowerCase().indexOf(this.aSolarBodyFilters.resourceOne.toLowerCase()) > -1
      && aSolarBody.resourceTwo.toLowerCase().indexOf(this.aSolarBodyFilters.resourceTwo.toLowerCase()) > -1
      && aSolarBody.xCoordinate.toString().toLowerCase().indexOf(this.aSolarBodyFilters.xCoordinate.toLowerCase()) > -1
      && aSolarBody.yCoordinate.toString().toLowerCase().indexOf(this.aSolarBodyFilters.yCoordinate.toLowerCase()) > -1);
  }
  sortSolarBodies(field, order){
    if(this.sortField !== field){
      this.order= order= true;
    }
    this.sortField= field;
    this.aFilteredSolarBodies.sort((n1,n2) => {
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
      //this.aFilteredSolarBodies.sort
    });

    console.log('Filter');
    console.log(order);
  }
  async viewSolarBody(aSolarBody){
    const solarBodyModal = await this.modalController.create({
      component: SolarBodyModalPage,
      componentProps: {id:aSolarBody.id},
      cssClass: 'custom-modal',
      showBackdrop: false
    });

    return await solarBodyModal.present();
  }

  filterColonies(){
    this.aFilteredColonies= this.aColonies.filter((aColony) =>
      /*aColony.id.toLowerCase().indexOf(this.colonyS.aColoniesFilters.id.toLowerCase()) > -1*/
      aColony.name.toLowerCase().indexOf(this.colonyS.aColoniesFilters.name.toLowerCase()) > -1
      && aColony.population.toString().toLowerCase().indexOf(this.colonyS.aColoniesFilters.population.toLowerCase()) > -1
      && aColony.resourceOne.toLowerCase().indexOf(this.colonyS.aColoniesFilters.resourceOne.toLowerCase()) > -1
      && aColony.resourceTwo.toLowerCase().indexOf(this.colonyS.aColoniesFilters.resourceTwo.toLowerCase()) > -1);
  }
  sortColonies(field, order){
    if(this.sortField !== field){
      this.order= order= true;
    }
    this.sortField= field;
    this.aFilteredColonies.sort((n1,n2) => {
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
      //this.aFilteredSolarBodies.sort
    });

    console.log('Filter');
    console.log(order);
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

  ngOnDestroy() {
    this.uniS.ssSub.unsubscribe();
    this.uniS.sbSub.unsubscribe();
    this.uniS.cSub.unsubscribe();
  }
}
