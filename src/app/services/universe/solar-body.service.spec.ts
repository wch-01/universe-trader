import { TestBed } from '@angular/core/testing';

import { SolarBodyService } from './solar-body.service';

describe('SolarBodyService', () => {
  let service: SolarBodyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolarBodyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
