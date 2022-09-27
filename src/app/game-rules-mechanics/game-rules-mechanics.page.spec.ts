import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GameRulesMechanicsPage } from './game-rules-mechanics.page';

describe('GameRulesMechanicsPage', () => {
  let component: GameRulesMechanicsPage;
  let fixture: ComponentFixture<GameRulesMechanicsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GameRulesMechanicsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GameRulesMechanicsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
