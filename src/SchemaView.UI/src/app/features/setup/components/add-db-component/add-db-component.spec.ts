import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDbComponent } from './add-db-component';

describe('AddDbComponent', () => {
  let component: AddDbComponent;
  let fixture: ComponentFixture<AddDbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDbComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
