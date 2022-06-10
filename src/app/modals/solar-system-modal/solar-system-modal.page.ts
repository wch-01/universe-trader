import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {SolarSystem} from '../../classes/universe';
import {UniverseService} from '../../services/universe/universe.service';
import {ModalController} from '@ionic/angular';
import {take} from 'rxjs/operators';
import {SolarBodyModalPage} from '../solar-body-modal/solar-body-modal.page';

@Component({
  selector: 'app-solar-system-modal',
  templateUrl: './solar-system-modal.page.html',
  styleUrls: ['./solar-system-modal.page.scss'],
})
export class SolarSystemModalPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  id;
  aSolarSystem= new SolarSystem();
  aSolarBodies;
  aFilteredSolarBodies: any;
  sortField= 'name';
  order= true;
  //endregion

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
      label: 'Size',
      filter: 'size'
    },
    {
      label: 'Resource One',
      filter: 'resourceOne'
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
  aSolarBodyFilters= {
    /*
    id: '',
    */
    name: '',
    solarBodyType:'',
    size:'',
    resourceOne: '',
    resourceTwo: '',
    solarYield: '',
    xCoordinate: '',
    yCoordinate: ''
  };

  //region Constructor
  constructor(
    public uniS: UniverseService,
    public modalController: ModalController
  ) { }
  //endregion

  ngOnInit() {
    console.log('Load Solar System Modal');
    this.uniS.readSolarSystem(this.id).pipe(take(1)).subscribe((solarSystem: SolarSystem) => {
      this.aSolarSystem= solarSystem;
    });
    this.uniS.readSSSolarBodies(this.id).pipe(take(1)).subscribe((aSolarBodies: any) => {
      this.aFilteredSolarBodies= aSolarBodies;
    });
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

  dismissModal() {
    this.modal.dismiss('cancel');
  }

}
