import {Component, Input, OnInit} from '@angular/core';
import {ServerService} from '../../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {WarehouseService} from '../../services/warehouse/warehouse.service';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.page.html',
  styleUrls: ['./warehouse.page.scss'],
})
export class WarehousePage implements OnInit {
  //region Variables
  @Input() warehouseID: any;
  //endregion

  //region Constructor
  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    public ws: WarehouseService
  ) { }
  //endregion

  ngOnInit() {
    this.ws.readWarehouse(this.warehouseID).then((res: any) => {
      this.ws.rwiP().then((rwiPRes: any) => {
        this.ws.setCargoCapacity();
      });
    });
  }

}
