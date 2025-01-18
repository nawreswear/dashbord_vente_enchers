import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationCommentaireDialog } from './modification-commentaire.component';

describe('ModificationCommentaireComponent', () => {
  let component: ModificationCommentaireDialog;
  let fixture: ComponentFixture<ModificationCommentaireDialog>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModificationCommentaireDialog]
    });
    fixture = TestBed.createComponent(ModificationCommentaireDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
