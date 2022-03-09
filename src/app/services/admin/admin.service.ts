import { Injectable } from '@angular/core';
import {collection, Firestore, query, where} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  //region Constructor
  constructor(
    private fsDB: Firestore
  ) { }
  //endregion

  generateSolarSystems(data, context) {
    let xCoord= 0;
    let yCoord= 0;
    //const aUniverse= db.collection("universe");
    const universe= collection(this.fsDB, 'universe');
    /**
     * Data Should have the following Elements
     * count = number of Solar Systems to generate
     * */
    for (let count= 0; count < data.count; count++) {
      // Generate for each count passed.
      let existingSystem= query(universe, where('xCoord', '==', xCoord), where('yCoord', '==', yCoord));
    }


    // Create indicated number of Solar Systems
    /**
     * Solar Systems should have the following features to some degree
     * Coords, not to repeat any in database already, perhaps random,
     * perhaps just next iteration? Coords should be stored in two fields
     * Produced Resources x2
     * Consumed Resources
     * Planets (Planets may have available room for player bases?)
     * Need unique IDs
     * Colonies, will have own inv and consumption rates, and colonist count
     * Need unique IDs
     * Asteroid belts (random number, and random resource)
     * Need unique IDs
     * Moons (Random Count, Random Resource, Slots for bases)
     * Need unique IDs
     * */
    /*
      // Message text passed from the client.
      const text = data.text;
      // Authentication / user information is automatically added to the request.
      const uid = context.auth.uid;
      const name = context.auth.token.name || null;
      const picture = context.auth.token.picture || null;
      const email = context.auth.token.email || null;
    */

    return {
      firstNumber: 1,
      secondNumber: 2,
      operator: '+',
      operationResult: 1 + 2,
    };
  };
}
