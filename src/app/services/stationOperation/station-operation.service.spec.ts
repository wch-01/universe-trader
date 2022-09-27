import { TestBed } from '@angular/core/testing';

import { StationOperationService } from './station-operation.service';

describe('StationOperationService', () => {
  let service: StationOperationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StationOperationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
