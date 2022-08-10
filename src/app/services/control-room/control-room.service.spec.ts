import { TestBed } from '@angular/core/testing';

import { ControlRoomService } from './control-room.service';

describe('ControlRoomService', () => {
  let service: ControlRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
