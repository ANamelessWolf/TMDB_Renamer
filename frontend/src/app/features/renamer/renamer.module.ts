import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

// Shared
import { TopBarComponent } from '../../shared/components/top-bar/top-bar.component';

// Feature components
import { RenamerHomeComponent } from './pages/renamer-home/renamer-home.component';
import { FileMappingItemComponent } from './components/file-mapping-item/file-mapping-item.component';
import { EpisodeLinkModalComponent } from './components/episode-link-modal/episode-link-modal.component';
import { ConfirmSaveModalComponent } from './components/confirm-save-modal/confirm-save-modal.component';

const routes: Routes = [
  { path: '', component: RenamerHomeComponent },
];

const MATERIAL_MODULES = [
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatTooltipModule,
  MatChipsModule,
  MatDividerModule,
  MatDialogModule,
  MatCheckboxModule,
  MatListModule,
  MatBadgeModule,
  MatSnackBarModule,
  MatCardModule,
];

@NgModule({
  declarations: [
    RenamerHomeComponent,
    FileMappingItemComponent,
    EpisodeLinkModalComponent,
    ConfirmSaveModalComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    TopBarComponent,
    ...MATERIAL_MODULES,
  ],
})
export class RenamerModule {}
