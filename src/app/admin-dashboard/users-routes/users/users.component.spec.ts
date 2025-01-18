import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtulisateursComponent } from './users.component';

describe('ProductsComponent', () => {
  let component: UtulisateursComponent;
  let fixture: ComponentFixture<UtulisateursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UtulisateursComponent]
    });
    fixture = TestBed.createComponent(UtulisateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
