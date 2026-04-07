import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { TmdbEpisode } from '../../../../core/models/api.models';
import { buildEpisodePrefix } from '../../../../core/utils/formatter.util';

export interface EpisodeLinkModalData {
  availableEpisodes: TmdbEpisode[];
  seasonNumber: number;
  currentFile: string;
}

export interface EpisodeLinkModalResult {
  selectedEpisodeNumbers: number[];
}

@Component({
  selector: 'app-episode-link-modal',
  templateUrl: './episode-link-modal.component.html',
  styleUrls: ['./episode-link-modal.component.scss'],
})
export class EpisodeLinkModalComponent implements OnInit {
  filterText = '';
  selectedNumbers = new Set<number>();
  filteredEpisodes: TmdbEpisode[] = [];

  constructor(
    public dialogRef: MatDialogRef<EpisodeLinkModalComponent, EpisodeLinkModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: EpisodeLinkModalData,
  ) {}

  ngOnInit(): void {
    this.filteredEpisodes = [...this.data.availableEpisodes];
  }

  get canConfirm(): boolean {
    return this.selectedNumbers.size > 0;
  }

  onFilter(value: string): void {
    this.filterText = value;
    const lower = value.toLowerCase();
    this.filteredEpisodes = this.data.availableEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(lower) ||
        String(ep.episode_number).includes(lower),
    );
  }

  isSelected(episodeNumber: number): boolean {
    return this.selectedNumbers.has(episodeNumber);
  }

  toggleEpisode(episodeNumber: number): void {
    if (this.selectedNumbers.has(episodeNumber)) {
      this.selectedNumbers.delete(episodeNumber);
    } else {
      this.selectedNumbers.add(episodeNumber);
    }
  }

  getEpisodeCode(ep: TmdbEpisode): string {
    return buildEpisodePrefix(ep.season_number, [ep.episode_number]);
  }

  confirm(): void {
    this.dialogRef.close({ selectedEpisodeNumbers: Array.from(this.selectedNumbers) });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
