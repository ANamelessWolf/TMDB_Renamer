import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmSaveModalData {
  mappingCount: number;
  folderPath: string;
}

@Component({
  selector: 'app-confirm-save-modal',
  templateUrl: './confirm-save-modal.component.html',
  styleUrls: ['./confirm-save-modal.component.scss'],
})
export class ConfirmSaveModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmSaveModalComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmSaveModalData,
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
