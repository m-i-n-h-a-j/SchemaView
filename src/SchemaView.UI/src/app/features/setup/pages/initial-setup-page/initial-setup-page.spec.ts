import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialSetupPage } from './initial-setup-page';

describe('InitialSetupPage', () => {
  let component: InitialSetupPage;
  let fixture: ComponentFixture<InitialSetupPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialSetupPage],
    }).compileComponents();

    fixture = TestBed.createComponent(InitialSetupPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
