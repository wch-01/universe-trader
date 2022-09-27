export class Station {
  id: string;
  ownerID: string;
  name: string;
  solarSystemID: string;
  solarBodyID: string;

  moduleCommandCenter: boolean;
  moduleCommandCenterLevel: number;

  moduleStorage: boolean;
  moduleStorageLevel: number;

  moduleSolarFarm: boolean;
  moduleSolarFarmLevel: number;
  moduleSolarFarmActive: boolean;
  moduleSolarFarmTime: number;
  moduleSolarFarmCycles: number;

  moduleMiningLaser: boolean;
  moduleMiningLaserLevel: number;
  moduleMiningLaserActive: boolean;
  moduleMiningLaserTime: number;
  moduleMiningLaserCycles: number;

  moduleMREPlant: boolean;
  moduleMREPlantLevel: number;
  moduleMREPlantActive: boolean;
  moduleMREPlantTime: number;
  moduleMREPlantCycles: number;

  moduleRefinery: boolean;
  moduleRefineryLevel: number;
  moduleRefineryActive: boolean;
  moduleRefineryTime: number;
  moduleRefineryCycles: number;

  modulePartFactory: boolean;
  modulePartFactoryLevel: number;
  modulePartFactoryActive: boolean;
  modulePartFactoryTime: number;
  modulePartFactoryCycles: number;

  moduleAssemblyPlant: boolean;
  moduleAssemblyPlantLevel: number;
  moduleAssemblyPlantActive: boolean;
  moduleAssemblyPlantTime: number;
  moduleAssemblyPlantCycles: number;
}
