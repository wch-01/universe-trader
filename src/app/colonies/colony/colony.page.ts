import {Component, Input, OnInit} from '@angular/core';
import {ServerService} from '../../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ColonyService} from '../../services/colony/colony.service';
import {ShipService} from '../../services/ship/ship.service';

@Component({
  selector: 'app-colony',
  templateUrl: './colony.page.html',
  styleUrls: ['./colony.page.scss'],
})
export class ColonyPage implements OnInit {
  //region Variables
  @Input() viewer: any;

  ssLoaded: Promise<boolean> | undefined;
  sbLoaded: Promise<boolean> | undefined;

  foundColony= false;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    public colonyS: ColonyService,
    private shipS: ShipService
  ) { }
  //endregion

  ngOnInit() {
    console.log('Load Colony Page');
    switch (this.viewer){
      case 'ship':
        console.log('Ship View');
        //if(this.shipS.aShip.status === 'Idle'){
          this.colonyS.fcIDP(this.shipS.aShip.solarBody).then(
            (fcIDRes: any) => {
              this.foundColony= true;
              this.colonyS.readColony(this.colonyS.colonyID);
              this.colonyS.rCSS().then(() => {
                this.ssLoaded= Promise.resolve(true);
              });
              this.colonyS.rCSB().then(() => {
                this.sbLoaded= Promise.resolve(true);
              });
            },
            (fcIDErr: any) =>{
              this.foundColony= false;
            }
          );
        //}
        break;
      case 'warehouse':
        break;
    }
  }

}
