import { Component, OnInit } from '@angular/core';
import {ServerService} from '../../services/server/server.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {ColonyService} from '../../services/colony/colony.service';

@Component({
  selector: 'app-colony',
  templateUrl: './colony.page.html',
  styleUrls: ['./colony.page.scss'],
})
export class ColonyPage implements OnInit {

  constructor(
    private ss: ServerService,
    private afs: AngularFirestore,
    public colonyS: ColonyService
  ) { }

  ngOnInit() {
  }

}
