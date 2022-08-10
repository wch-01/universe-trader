/**
 * Ship
 * A ship is made up of ship modules. At minimum a ship requires an engine and a work module
 * When a module is added to a ship, that module is removed from inventory and integrated into the ship, and vise versa.
 * */
export class Ship {
  id: string;
  ownerUID: string;
  ownerID: string;
  name: string;
  engine: number;
  jumpEngine: number;
  //hull_level: number; //Calculated on the Fly: Math.floor(modules_total / 4)
  solarSystem: string;
  solarSystemName: string;
  solarBody: string;
  solarBodyName: string;
  modulesTotal: number;
  //modules_available: number;//Calculated on the fly
  installedModules: any;
  status: string;
  orderList: any;
  traveling: any;
  location: any;
  moduleEngine: any;
  moduleEngineLevel: any;
  moduleJumpEngine: any;
  moduleJumpEngineLevel: any;
  moduleCommandCenter: any;
  moduleCommandCenterLevel: any;
  moduleMiningLaser: any;
  moduleMiningLaserLevel: any;
  moduleCount: number;
}

/**
 * Ship modules are the individual parts of the ship.
 *
 * Ideas: Command Module: todo decide on its purpose. Could be required for form a fleet, or allows a ship to hold orders.
 *        Fleet Command Module: todo taking from above idea, except this allows for one ship in the fleet hold orders for the entire fleet.
 * */
export class ShipModule {
  ownerUID: string;
  type: string; //Engine, Jump Engine, Weapon, Shield, Cargo, Passenger, Mining, Refinery
  level: number;
  installed: string;// Yes, No || ID of installed ship
}

export class Order {
  id: string;
  order: string;
  type: string;
  destSSID: string;
  aDestSS: any;
  destSSName: string;
  destSBID: string;
  aDestSB: any;
  destSBName: string;
  item: string;
  quantity: number;
  price: number;
}
