import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import type { FileMappingDisplay } from '../../../../core/models/mapping.models';
import type { TmdbEpisode } from '../../../../core/models/api.models';
import { buildEpisodePrefix } from '../../../../core/utils/formatter.util';
import { validateWindowsTitle } from '../../../../core/utils/validator.util';

export interface AddEpisodeEvent {
  file: string;
}

export interface RemoveEpisodeEvent {
  file: string;
  episodeNumber: number;
}

export interface UpdateTitleEvent {
  file: string;
  title: string;
}

@Component({
  selector: 'app-file-mapping-item',
  templateUrl: './file-mapping-item.component.html',
  styleUrls: ['./file-mapping-item.component.scss'],
})
export class FileMappingItemComponent implements OnInit, OnChanges {
  @Input() mapping!: FileMappingDisplay;
  @Input() index!: number;

  @Output() addEpisode = new EventEmitter<AddEpisodeEvent>();
  @Output() removeEpisode = new EventEmitter<RemoveEpisodeEvent>();
  @Output() updateTitle = new EventEmitter<UpdateTitleEvent>();

  isEditingTitle = false;
  titleControl = new FormControl('');
  titleError: string | null = null;

  ngOnInit(): void {
    this.titleControl.setValue(this.mapping.editableTitle);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mapping'] && !this.isEditingTitle) {
      this.titleControl.setValue(this.mapping.editableTitle);
    }
  }

  getEpisodeCode(ep: TmdbEpisode): string {
    return buildEpisodePrefix(ep.season_number, [ep.episode_number]);
  }

  isBaseEpisode(ep: TmdbEpisode): boolean {
    return this.mapping.baseEpisode?.id === ep.id;
  }

  isLastEpisode(ep: TmdbEpisode): boolean {
    const all = this.mapping.allEpisodes;
    return all.length > 0 && all[all.length - 1].id === ep.id;
  }

  onAddEpisode(): void {
    this.addEpisode.emit({ file: this.mapping.file });
  }

  onRemoveEpisode(ep: TmdbEpisode): void {
    this.removeEpisode.emit({ file: this.mapping.file, episodeNumber: ep.episode_number });
  }

  startEditTitle(): void {
    this.isEditingTitle = true;
    this.titleControl.setValue(this.mapping.editableTitle);
    this.titleError = null;
  }

  cancelEditTitle(): void {
    this.isEditingTitle = false;
    this.titleControl.setValue(this.mapping.editableTitle);
    this.titleError = null;
  }

  confirmEditTitle(): void {
    const value = this.titleControl.value?.trim() ?? '';
    const error = validateWindowsTitle(value);
    if (error) {
      this.titleError = error;
      return;
    }
    this.isEditingTitle = false;
    this.titleError = null;
    this.updateTitle.emit({ file: this.mapping.file, title: value });
  }

  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.confirmEditTitle();
    if (event.key === 'Escape') this.cancelEditTitle();
  }

  get hasNoMapping(): boolean {
    return this.mapping.allEpisodes.length === 0;
  }

  get destinationPrefix(): string {
    if (this.mapping.allEpisodes.length === 0) return '';
    const ep = this.mapping.allEpisodes[0];
    return buildEpisodePrefix(
      ep.season_number,
      this.mapping.allEpisodes.map((e) => e.episode_number),
    );
  }
}
