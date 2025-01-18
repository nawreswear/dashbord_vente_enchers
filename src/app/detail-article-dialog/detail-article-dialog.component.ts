import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-detail-article-dialog',
  templateUrl: './detail-article-dialog.component.html',
  styleUrls: ['./detail-article-dialog.component.css']
})
export class DetailArticleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
