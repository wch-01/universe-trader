import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {Colony} from '../../classes/universe';
import {ColonyService} from '../../services/colony/colony.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ServerService} from '../../services/server/server.service';
import {LoadingController} from '@ionic/angular';
import {PlatformService} from "../../services/platform/platform.service";

@Component({
  selector: 'app-colony-modal',
  templateUrl: './colony-modal.page.html',
  styleUrls: ['./colony-modal.page.scss'],
})
export class ColonyModalPage implements OnInit, OnDestroy {
  //region Variables
  @Input() modal: Components.IonModal;
  @Input() id: any;
  @Input() trading= false;
  @Input() trader: any;
  @Input() traderID: any;

  aColony= new Colony();
  aInventory;
  aDefaultItems: any;
  ssLoaded: Promise<boolean> | undefined;
  sbLoaded: Promise<boolean> | undefined;
  colonyLoaded: Promise<boolean> | undefined;
  //endregion

  //region Constructor
  constructor(
    public colonyS: ColonyService,
    private afs: AngularFirestore,
    private ss: ServerService,
    public loadingController: LoadingController,
    public platform: PlatformService
  ) { }
  //endregion

  ngOnInit() {
    if(this.ss.aRules.consoleLogging.mode >= 1){
      console.log('Colony Modal Page Loading');
      if(this.ss.aRules.consoleLogging.mode >= 2){
        console.log(this.id);
      }
    }

    this.colonyS.id= this.id;
    this.colonyS.rpColony().then(
      (aColony) => {
        //this.aColony= aColony;
        this.colonyLoaded= Promise.resolve(true);
        this.colonyS.rCSS().then(() => {
          this.ssLoaded= Promise.resolve(true);
        });
        this.colonyS.rCSB().then(() => {
          this.sbLoaded= Promise.resolve(true);
        });
        this.colonyS.rciP().then((aInventory) => {
          this.aInventory= aInventory;
        });
      },
      (rpcError) => {}
    );
    /*
    this.colonyS.readColony(this.id).then((rcRes) => {
      this.aColony= this.colonyS.aColony;
      this.colonyS.readColonyMarketInventory().then((rcmiRes) => {
        this.aInventory= this.colonyS.aMarketInventory;
      });
      this.colonyS.rCSS().then(() => {
        this.ssLoaded= Promise.resolve(true);
      });
      this.colonyS.rCSB().then(() => {
        this.sbLoaded= Promise.resolve(true);
      });
    });
    */
  }

  dismissModal() {
    this.modal.dismiss('cancel');
  }

  ngOnDestroy(){
    this.colonyS.colonySub.unsubscribe();
    console.log('Ondestroy');
    console.log(this.colonyS.colonySub);
  }

  /*
    async readInventory(){
      const aInventory= await this.sbs.readInventory();
      aInventory.subscribe((inventory:any) => {
        this.aInventory= inventory;
      });
    }
    */
}
