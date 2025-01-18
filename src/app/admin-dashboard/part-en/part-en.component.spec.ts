import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartEnComponent } from './part-en.component';

describe('PartEnComponent', () => {
  let component: PartEnComponent;
  let fixture: ComponentFixture<PartEnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartEnComponent]
    });
    fixture = TestBed.createComponent(PartEnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
