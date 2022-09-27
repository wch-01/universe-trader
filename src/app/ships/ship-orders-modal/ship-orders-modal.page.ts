import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Components} from '@ionic/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ShipService} from '../../services/ship/ship.service';
import {ServerService} from '../../services/server/server.service';
import {UniverseService} from '../../services/universe/universe.service';
import {Order} from '../../classes/ship';
import {GlobalService} from '../../services/global/global.service';
import {IonReorderGroup, ItemReorderEventDetail} from '@ionic/angular';

@Component({
  selector: 'app-ship-orders-modal',
  templateUrl: './ship-orders-modal.page.html',
  styleUrls: ['./ship-orders-modal.page.scss'],
})
export class ShipOrdersModalPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  ordersLoaded= false;

  aOrders;
  aUniverse;
  aSolarBodies;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    public ss: ServerService,
    public shipS: ShipService,
    public uniS: UniverseService,
    private gs: GlobalService
  ) { }
  //endregion

  ngOnInit() {
    this.aUniverse = this.uniS.readUniverse();
    //Get existing Orders
    this.afs.collection('servers/'+this.ss.activeServer+'/ships/'+this.shipS.aShip.id+'/orders')
      .valueChanges({idField: 'id'})
      .subscribe((aOrders: any) => {
        this.aOrders= aOrders;
        this.ordersLoaded= true;
      });
  }

  //region Create
  addOrder(){
    const newOrderNumber= +this.aOrders.length + 1;
    const orderNumber= ''+newOrderNumber+'';
    const aUOrder= new Order();
    aUOrder.order= orderNumber;
    this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.shipS.aShip.id + '/orders')
      .doc(orderNumber)
      .set(Object.assign({}, aUOrder))
      .catch( (error) => {
        console.log(error.message);
        this.gs.toastMessage('Please Double check your orders.', 'danger');
      });
  }
  //endregion

  //region Read
  readSSSolarBodies(aSolarSystem){
    this.aSolarBodies= this.uniS.readSSSolarBodies(aSolarSystem.id);
  }
  //endregion

  //region Update
  updateOrders(){
    console.log(this.aOrders);
    let order= 1;
    this.aOrders.some((aOrder: any) => {
      let aUOrder= new Order();
      switch (aOrder.type){
        case 'travel':
          if(aOrder.aDestSS){
            aUOrder.type= 'travel';
            aUOrder.destSSID= aOrder.aDestSS.id;
            aUOrder.aDestSS= aOrder.aDestSS;
            aUOrder.destSSName= aOrder.aDestSS.name;
            aUOrder.destSBID= aOrder.aDestSB.id;
            aUOrder.aDestSB= aOrder.aDestSB;
            aUOrder.destSBName= aOrder.aDestSB.name;
            aUOrder.order= aOrder.order;
            // aUOrder.id= ''+aOrder.order+'';
            aUOrder.id= ''+order+'';
          }
          else{
            aUOrder= aOrder;
            // aUOrder.id= ''+aOrder.order+'';
            aUOrder.id= ''+order+'';
          }
          break;
        default:
          aUOrder= aOrder;
          // aUOrder.id= ''+aOrder.order+'';
          aUOrder.id= ''+order+'';
          break;
      }
      console.log(aUOrder);
      this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.shipS.aShip.id + '/orders')
        .doc(aUOrder.id)
        .update(Object.assign({}, aUOrder))
        .catch( (error) => {
          if(this.ss.aRules.consoleLogging.mode >= 1){
            console.log('Error Updating Orders');
            if(this.ss.aRules.consoleLogging.mode >= 2){
              console.log(error.message);
              console.log(aUOrder);
            }
          }
          this.gs.toastMessage('Please Double check your orders.', 'danger');
        });
      order++;
    });

    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.shipS.aShip.id)
      .update({ordersTotal: this.aOrders.length, ordersError: 0}).then(() => {});
  }

  async activateOrders() {
    await this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.shipS.aShip.id)
      .update({
        status: 'Preparing Next Order',
        orders: true,
        ordersCurrent: 0,
        ordersTotal: this.aOrders.length,
        ordersError: 0
      });

    /*
    switch (this.aOrders[0].type){
      case 'travel':
        console.log('Begin Orders');
        console.log(this.aOrders[0].aDestSS);
        this.shipS.aTravel.aSolarSystem = this.aOrders[0].aDestSS;
        await this.shipS.calcSSTT();
        this.shipS.aTravel.aSolarBody = this.aOrders[0].aDestSB;
        await this.shipS.calcSBTT();
        await this.shipS.travel();
        await this.afs.collection('servers/' + this.ss.activeServer + '/ships')
          .doc(this.shipS.aShip.id)
          .update({orders: true, ordersCurrent: 1, ordersTotal: this.aOrders.length, orderStage: 'next', ordersError: 0});
        break;
      case 'transfer':
        break;
      default:
        console.log('Begin Orders');
        await this.afs.collection('servers/' + this.ss.activeServer + '/ships')
          .doc(this.shipS.aShip.id)
          .update({
            status: 'Preparing Trade Order',
            orders: true,
            ordersCurrent: 1,
            ordersTotal: this.aOrders.length,
            orderStage: 'next',
            ordersError: 0
          });
        break;
    }
    */
    /*
    if (this.aOrders[0].type === 'travel') {
      console.log('Begin Orders');
      console.log(this.aOrders[0].aDestSS);
      this.shipS.aTravel.aSolarSystem = this.aOrders[0].aDestSS;
      await this.shipS.calcSSTT();
      this.shipS.aTravel.aSolarBody = this.aOrders[0].aDestSB;
      await this.shipS.calcSBTT();
      await this.shipS.travel();
      await this.afs.collection('servers/' + this.ss.activeServer + '/ships')
        .doc(this.shipS.aShip.id)
        .update({orders: true, ordersCurrent: 1, ordersTotal: this.aOrders.length});
    }
    */
  }

  cancelOrders(){
    this.afs.collection('servers/' + this.ss.activeServer + '/ships')
      .doc(this.shipS.aShip.id)
      .update({orders: false});
  }
  //endregion

  //region Delete
  deleteOrder(orderID){
    this.afs.collection('servers/' + this.ss.activeServer + '/ships/' + this.shipS.aShip.id + '/orders')
      .doc(orderID)
      .delete()
      .catch( (error) => {
        console.log(error.message);
        this.gs.toastMessage('Please Double check your orders.', 'danger');
      });
  }
  //endregion

  //region Other
  dismissModal() {
    this.modal.dismiss('cancel');
  }

  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    this.aOrders= ev.detail.complete(this.aOrders);
  }
  //endregion

}
