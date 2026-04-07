import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { ApiService } from '../../../../core/services/api.service';
import { MappingService } from '../../../../core/services/mapping.service';
import { StorageService } from '../../../../core/services/storage.service';

import type { TmdbEpisode, TmdbSeason, TmdbShowResult } from '../../../../core/models/api.models';
import type {
  FileMappingDisplay,
  FileMappingState,
} from '../../../../core/models/mapping.models';

import {
  EpisodeLinkModalComponent,
  type EpisodeLinkModalData,
  type EpisodeLinkModalResult,
} from '../../components/episode-link-modal/episode-link-modal.component';
import {
  ConfirmSaveModalComponent,
  type ConfirmSaveModalData,
} from '../../components/confirm-save-modal/confirm-save-modal.component';
import { getSeasonLabel } from '../../../../core/utils/formatter.util';
import type { AddEpisodeEvent, RemoveEpisodeEvent, UpdateTitleEvent } from '../../components/file-mapping-item/file-mapping-item.component';

@Component({
  selector: 'app-renamer-home',
  templateUrl: './renamer-home.component.html',
  styleUrls: ['./renamer-home.component.scss'],
})
export class RenamerHomeComponent implements OnInit, OnDestroy {
  // ── Form controls ───────────────────────────────────
  pathControl = new FormControl('');
  filterControl = new FormControl('');
  seasonControl = new FormControl<number>(1);
  tmdbQueryControl = new FormControl('');

  // ── State ────────────────────────────────────────────
  isLoadingFiles = false;
  isLoadingSeasons = false;
  isSaving = false;

  pathError: string | null = null;
  seasonError: string | null = null;

  sourceFiles: string[] = [];
  extractedTitle = '';

  allSeasons: TmdbSeason[] = [];
  currentSeasonEpisodes: TmdbEpisode[] = [];

  matchedShows: TmdbShowResult[] = [];
  selectedShowId: number | null = null;
  selectedShowName = '';

  mappingStates: FileMappingState[] = [];
  computedMappings: FileMappingDisplay[] = [];
  filteredMappings: FileMappingDisplay[] = [];

  private readonly destroy$ = new Subject<void>();
  readonly getSeasonLabel = getSeasonLabel;

  constructor(
    private readonly api: ApiService,
    private readonly mappingService: MappingService,
    private readonly storage: StorageService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.tryRestoreSession();

    this.filterControl.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilter());

    this.seasonControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((seasonNum) => {
        if (seasonNum !== null) this.onSeasonChange(seasonNum);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Session restore ──────────────────────────────────
  private tryRestoreSession(): void {
    const session = this.storage.loadSession();
    if (!session) return;

    this.pathControl.setValue(session.folderPath);
    this.selectedShowId = session.showId;
    this.selectedShowName = session.showName;
    this.mappingStates = session.mappingStates;
    this.seasonControl.setValue(session.selectedSeasonNumber, { emitEvent: false });
  }

  // ── Refresh ───────────────────────────────────────────
  onRefresh(): void {
    const path = this.pathControl.value?.trim();
    if (!path) {
      this.pathError = 'Please enter a folder path';
      return;
    }
    this.pathError = null;
    this.loadFiles(path);
  }

  private loadFiles(path: string): void {
    this.isLoadingFiles = true;
    this.sourceFiles = [];
    this.computedMappings = [];
    this.filteredMappings = [];

    this.api.listFiles(path).subscribe({
      next: (res) => {
        this.sourceFiles = res.data.items.map((i) => i.file);
        this.extractedTitle = res.data.extractedTitle;
        this.tmdbQueryControl.setValue(res.data.extractedTitle);
        this.isLoadingFiles = false;
        this.searchAndLoadSeasons(res.data.extractedTitle, path);
      },
      error: (err) => {
        this.isLoadingFiles = false;
        const msg = err?.error?.error || 'Failed to read folder. Check the path and try again.';
        this.pathError = msg;
        this.showToast(msg, 'error');
      },
    });
  }

  onSearchTmdb(): void {
    const query = this.tmdbQueryControl.value?.trim();
    if (!query) return;
    const path = this.pathControl.value?.trim() ?? '';
    this.allSeasons = [];
    this.selectedShowId = null;
    this.selectedShowName = '';
    this.searchAndLoadSeasons(query, path);
  }

  private searchAndLoadSeasons(title: string, folderPath: string): void {
    this.isLoadingSeasons = true;
    this.api.searchShow(title).subscribe({
      next: (res) => {
        this.matchedShows = res.data.results;
        if (this.matchedShows.length === 0) {
          this.isLoadingSeasons = false;
          this.showToast(`No TMDB results for "${title}"`, 'info');
          return;
        }

        // Use first result (best match) unless user had a previously selected show
        const showToUse = this.selectedShowId
          ? this.matchedShows.find((s) => s.id === this.selectedShowId) ?? this.matchedShows[0]
          : this.matchedShows[0];

        this.selectedShowId = showToUse.id;
        this.selectedShowName = showToUse.name;
        this.loadSeasons(showToUse.id, folderPath);
      },
      error: (err) => {
        this.isLoadingSeasons = false;
        const msg = err?.error?.error || 'Failed to search TMDB';
        this.showToast(msg, 'error');
      },
    });
  }

  private loadSeasons(showId: number, folderPath: string): void {
    this.api.getSeasons(showId).subscribe({
      next: (res) => {
        this.allSeasons = res.data.seasons;
        this.isLoadingSeasons = false;

        // Default to season 1 if available, else first season
        const defaultSeason = this.allSeasons.find((s) => s.season_number === 1)
          ?? this.allSeasons.find((s) => s.season_number !== 0)
          ?? this.allSeasons[0];

        const targetSeasonNum = defaultSeason?.season_number ?? 1;
        this.seasonControl.setValue(targetSeasonNum, { emitEvent: false });
        this.setActiveSeason(targetSeasonNum, folderPath);
      },
      error: (err) => {
        this.isLoadingSeasons = false;
        const msg = err?.error?.error || 'Failed to load seasons from TMDB';
        this.showToast(msg, 'error');
      },
    });
  }

  private setActiveSeason(seasonNumber: number, folderPath?: string): void {
    const season = this.allSeasons.find((s) => s.season_number === seasonNumber);
    this.currentSeasonEpisodes = season?.episodes ?? [];

    // Determine if we have a saved session to restore
    const path = folderPath ?? this.pathControl.value?.trim() ?? '';
    if (this.storage.hasSessionForPath(path)) {
      const session = this.storage.loadSession();
      if (session && session.selectedSeasonNumber === seasonNumber) {
        this.mappingStates = session.mappingStates;
      } else {
        this.mappingStates = this.mappingService.buildInitialStates(this.sourceFiles);
      }
    } else {
      this.mappingStates = this.mappingService.buildInitialStates(this.sourceFiles);
    }

    this.recalculate();
    this.saveSessionState();
  }

  onSeasonChange(seasonNumber: number): void {
    this.mappingStates = this.mappingService.buildInitialStates(this.sourceFiles);
    this.setActiveSeason(seasonNumber);
  }

  // ── Mapping mutations ────────────────────────────────
  onAddEpisode(event: AddEpisodeEvent): void {
    const fileIndex = this.computedMappings.findIndex((m) => m.file === event.file);
    const available = this.mappingService.getAvailableEpisodesForModal(
      this.currentSeasonEpisodes,
      this.computedMappings,
      fileIndex,
    );

    if (available.length === 0) {
      this.showToast('No more episodes available to link', 'info');
      return;
    }

    const seasonNumber = this.seasonControl.value ?? 1;

    const ref = this.dialog.open<EpisodeLinkModalComponent, EpisodeLinkModalData, EpisodeLinkModalResult>(
      EpisodeLinkModalComponent,
      {
        data: { availableEpisodes: available, seasonNumber, currentFile: event.file },
        panelClass: 'tmdb-dialog',
        autoFocus: true,
      },
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      for (const n of result.selectedEpisodeNumbers) {
        this.mappingStates = this.mappingService.addExtraEpisode(this.mappingStates, event.file, n);
      }
      this.recalculate();
      this.saveSessionState();
    });
  }

  onRemoveEpisode(event: RemoveEpisodeEvent): void {
    this.mappingStates = this.mappingService.removeExtraEpisode(
      this.mappingStates,
      event.file,
      event.episodeNumber,
    );
    this.recalculate();
    this.saveSessionState();
  }

  onUpdateTitle(event: UpdateTitleEvent): void {
    this.mappingStates = this.mappingService.setCustomTitle(
      this.mappingStates,
      event.file,
      event.title,
    );
    this.recalculate();
    this.saveSessionState();
  }

  private recalculate(): void {
    const seasonNumber = this.seasonControl.value ?? 1;
    this.computedMappings = this.mappingService.computeMappings(
      this.sourceFiles,
      this.currentSeasonEpisodes,
      seasonNumber,
      this.mappingStates,
    );
    this.applyFilter();
  }

  private applyFilter(): void {
    const filter = (this.filterControl.value ?? '').toLowerCase().trim();
    if (!filter) {
      this.filteredMappings = [...this.computedMappings];
      return;
    }
    this.filteredMappings = this.computedMappings.filter(
      (m) =>
        m.file.toLowerCase().includes(filter) ||
        m.destination.toLowerCase().includes(filter) ||
        m.allEpisodes.some((e) => e.name.toLowerCase().includes(filter)),
    );
  }

  // ── Save ─────────────────────────────────────────────
  onSave(): void {
    const path = this.pathControl.value?.trim();
    if (!path || this.computedMappings.length === 0) return;

    const mappings = this.computedMappings
      .filter((m) => m.allEpisodes.length > 0 && m.file !== m.destination)
      .map((m) => ({ source: m.file, destination: m.destination }));

    if (mappings.length === 0) {
      this.showToast('Nothing to rename — all files already match destination names', 'info');
      return;
    }

    const ref = this.dialog.open<ConfirmSaveModalComponent, ConfirmSaveModalData, boolean>(
      ConfirmSaveModalComponent,
      {
        data: { mappingCount: mappings.length, folderPath: path },
        panelClass: 'tmdb-dialog',
      },
    );

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.executeSave(path, mappings);
    });
  }

  private executeSave(
    folderPath: string,
    mappings: Array<{ source: string; destination: string }>,
  ): void {
    this.isSaving = true;
    this.saveSessionState(); // persist before save in case of error

    this.api.renameFiles({ folderPath, mappings }).subscribe({
      next: (res) => {
        this.isSaving = false;
        const { successCount, failureCount } = res.data;

        if (failureCount === 0) {
          this.showToast(`Successfully renamed ${successCount} file(s)`, 'success');
        } else {
          this.showToast(
            `Renamed ${successCount} file(s), ${failureCount} failed. Check logs.`,
            'error',
          );
        }

        // Refresh the file list
        this.storage.clearSession();
        this.mappingStates = [];
        this.loadFiles(folderPath);
      },
      error: (err) => {
        this.isSaving = false;
        const msg = err?.error?.error || 'Rename operation failed';
        this.showToast(msg, 'error');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────
  private saveSessionState(): void {
    const path = this.pathControl.value?.trim() ?? '';
    if (!path) return;
    this.storage.saveSession({
      folderPath: path,
      showId: this.selectedShowId,
      showName: this.selectedShowName,
      selectedSeasonNumber: this.seasonControl.value ?? 1,
      mappingStates: this.mappingStates,
      savedAt: Date.now(),
    });
  }

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: type === 'error' ? 6000 : 3500,
      panelClass: [`snack-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  get isLoading(): boolean {
    return this.isLoadingFiles || this.isLoadingSeasons;
  }

  get hasData(): boolean {
    return this.sourceFiles.length > 0 && this.allSeasons.length > 0;
  }

  get hasMappingsToSave(): boolean {
    return this.computedMappings.some(
      (m) => m.allEpisodes.length > 0 && m.file !== m.destination,
    );
  }

  trackByFile(_index: number, item: FileMappingDisplay): string {
    return item.file;
  }

  getSeasonOptionLabel(season: TmdbSeason): string {
    return getSeasonLabel(season.season_number, season.name);
  }
}
