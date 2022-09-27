export class Character {
  id: string;
  name: string;
  pulsars: number;
  solarBodyID: string;
  solarSystemID: string;
  uid: string;
  xpTotal: number;
  xpSpent: number;
  skills= new Skills();
}

export class Skills{
  engine: number;
  equipment: number;
  jumpEngine: number;
  station: number;
}
