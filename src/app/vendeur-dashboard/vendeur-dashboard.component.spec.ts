import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendeurDashboardComponent } from './vendeur-dashboard.component';

describe('VendeurDashboardComponent', () => {
  let component: VendeurDashboardComponent;
  let fixture: ComponentFixture<VendeurDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendeurDashboardComponent]
    });
    fixture = TestBed.createComponent(VendeurDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
