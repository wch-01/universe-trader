import {Component, Input, OnInit} from '@angular/core';
import {Components} from '@ionic/core';
import {LoadingController} from "@ionic/angular";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-tutorial-modal',
  templateUrl: './tutorial-modal.page.html',
  styleUrls: ['./tutorial-modal.page.scss'],
})
export class TutorialModalPage implements OnInit {
  //region Variables
  @Input() modal: Components.IonModal;
  id;
  //endregion

  //region Constructor
  constructor(
    private afs: AngularFirestore,
    private loadingController: LoadingController,
  ) { }
  //endregion

  async ngOnInit() {
    /*
    const loading = await this.loadingController.create({
      //cssClass: 'my-custom-class',
      message: 'Loading Tutorial',
      //duration: 2000
    });
    await loading.present();
    */
  }

  //region Other
  dismissModal() {
    this.modal.dismiss('cancel');
  }
  //endregion

}
