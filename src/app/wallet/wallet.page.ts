import { Component, OnInit } from '@angular/core';
import {GlobalService} from '../services/global/global.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  constructor(
    public globalS: GlobalService,
  ) { }

  ngOnInit() {
  }

}
