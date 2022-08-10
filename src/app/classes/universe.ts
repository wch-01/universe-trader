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
export class Universe {}

export class SolarSystem {
  id: string;
  name: string;
  xCoordinate: number;
  yCoordinate: number;
  resourceOne: string;
  resourceTwo: string;
  solarYield: number;

  planets: any;
  asteroidFields: any;
}

export class SolarBody {
  id: string;
  solarSystemID: string;
  solarBodyType: string;
  name: string;
  xCoordinate: number;
  yCoordinate: number;
  resourceOne: string;
  resourceOneYield: number;
  resourceTwo: string;
  resourceTwoYield: number;
  colony: any;
  colonyPopulation: number;
}

export class Colony {
  id: string;
  ownerUID: string;
  solarBodyID: string;
  name: string;
  population: number;
  resourceOneValue: number;
  resourceTwoValue: number;
  power: number;
  food: number;
  ore: number;
  silicone: number;
  metal: number;
  electronics: number;
}

export class SpaceStation {
  ownerUID: string;
  solarBodyID: string;
  name: string;
  population: number;
  resourceOneValue: number;
  resourceTwoValue: number;
  power: number;
  food: number;
  ore: number;
  silicone: number;
  metal: number;
  electronics: number;
}

export class Shipyard {
  ownerUID: string;
  solarBodyID: string;
}
