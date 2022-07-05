import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {SolarBody, SolarSystem} from '../../classes/universe';
import {UniverseService} from '../../services/universe/universe.service';
import {ColonyService} from '../../services/colony/colony.service';
import {StationService} from '../../services/station/station.service';
import {ModalController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {take} from 'rxjs/operators';
import {ColonyModalPage} from '../colony-modal/colony-modal.page';
import {SolarBodyService} from '../../services/universe/solar-body.service';
import {PlatformService} from "../../services/platform/platform.service";

@Component({
  selector: 'app-solar-body-modal',
  templateUrl: './solar-body-modal.page.html',
  styleUrls: ['./solar-body-modal.page.scss'],
})
export class SolarBodyModalPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  id;
  aSolarBody= new SolarBody();
  aSolarSystem= new SolarSystem();
  aInventory;
  nsTab= 'colonies';
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

  //region stations
  aStations: any;
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
  aFilteredStations: any;
  //endregion

  //region Constructor
  constructor(
    private uniS: UniverseService,
    private sbs: SolarBodyService,
    public colonyS: ColonyService,
    public stationS: StationService,
    public modalController: ModalController,
    private afs: AngularFirestore,
    private ss: ServerService,
    public platform: PlatformService
  ) { }
  //endregion

  ngOnInit() {
    this.sbs.solarBodyID= this.id;
    this.sbs.readSolarBody();
    this.sbs.readSolarBody().pipe(take(1)).subscribe((solarBody: SolarBody) => {
      this.aSolarBody= solarBody;
      //this.readSolarSystem(this.aSolarBody.solarSystemID);
    });
    this.readColony();
    this.readStations();
  }

  async readColony(){
    const aColony= await this.sbs.readColonies();
    aColony.subscribe((colony) =>{
      console.log('Colony');
      console.log(colony);
    });


    this.sbs.readColonies().subscribe((aColonies: any) => {
      console.log('aColonies');
      console.log(aColonies);
      this.aColonies= aColonies;

      this.aFilteredColonies= this.aColonies;
      //this.filterUniverse();
    });
  }

  async readStations(){
    const aStation= await this.sbs.readStations();
    //aStation.subscribe((aStation))

    this.sbs.readStations().subscribe((aStations: any) => {
      this.aStations= aStations;
      this.aFilteredStations= this.aStations;
    });
  }

  /*
  async readSolarSystem(id){
    const aSolarSystem= await this.uniS.readSolarSystem(id);
    aSolarSystem.pipe(take(1)).subscribe((solarSystem: SolarSystem) => {
      this.aSolarSystem= solarSystem;
    });
  }
  */

  filterColonies(){
    this.aFilteredColonies= this.aColonies.filter((aColony) =>
      /*aColony.id.toLowerCase().indexOf(this.colonyS.aColoniesFilters.id.toLowerCase()) > -1*/
      aColony.name.toLowerCase().indexOf(this.colonyS.aColoniesFilters.name.toLowerCase()) > -1
      && aColony.population.toString().toLowerCase().indexOf(this.colonyS.aColoniesFilters.population.toLowerCase()) > -1);
  }

  filterStations(){
    this.aFilteredStations= this.aStations.filter((aStation) =>
      /*aStation.id.toLowerCase().indexOf(this.stationS.aStationsFilters.id.toLowerCase()) > -1*/
      aStation.name.toLowerCase().indexOf(this.stationS.aStationsFilters.name.toLowerCase()) > -1);
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

  async viewStation(station){
    const colonyModal = await this.modalController.create({
      component: ColonyModalPage,
      componentProps: {id:station.id},
      cssClass: 'solar_system_modal',
      showBackdrop: false
    });

    return await colonyModal.present();
  }

  dismissModal() {
    this.modal.dismiss('cancel');
  }

}
