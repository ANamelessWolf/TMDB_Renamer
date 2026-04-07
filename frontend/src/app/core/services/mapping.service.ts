import { Injectable } from '@angular/core';
import type { TmdbEpisode } from '../models/api.models';
import type { FileMappingDisplay, FileMappingState } from '../models/mapping.models';
import {
  buildDestinationFilename,
  getFileExtension,
  truncateTitle,
} from '../utils/formatter.util';

@Injectable({ providedIn: 'root' })
export class MappingService {
  /**
   * Computes the full display state for all files.
   *
   * Algorithm:
   *  1. Collect all manually reserved episode numbers (from extraEpisodeNumbers across all states).
   *  2. Build an auto-pool: episodes NOT in the reserved set, sorted by episode_number.
   *  3. For each file (sorted alphabetically):
   *     - If the state has extraEpisodeNumbers, look them up in episodes.
   *     - Assign the next auto-pool episode as the "base".
   *     - Combine base + extras as allEpisodes.
   *     - Compute destination filename.
   */
  computeMappings(
    files: string[],
    episodes: TmdbEpisode[],
    seasonNumber: number,
    states: FileMappingState[],
  ): FileMappingDisplay[] {
    const sortedFiles = [...files].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );

    // 1. Collect all manually reserved episode numbers
    const manuallyReserved = new Set<number>();
    for (const state of states) {
      for (const n of state.extraEpisodeNumbers) {
        manuallyReserved.add(n);
      }
    }

    // 2. Auto-pool: episodes not reserved, sorted by episode_number
    const autoPool = [...episodes]
      .filter((e) => !manuallyReserved.has(e.episode_number))
      .sort((a, b) => a.episode_number - b.episode_number);

    let autoIndex = 0;

    return sortedFiles.map((file) => {
      const state = states.find((s) => s.file === file);
      const extraEpisodeNumbers = state?.extraEpisodeNumbers ?? [];

      const extraEpisodes: TmdbEpisode[] = extraEpisodeNumbers
        .map((n) => episodes.find((e) => e.episode_number === n))
        .filter((e): e is TmdbEpisode => e !== undefined)
        .sort((a, b) => a.episode_number - b.episode_number);

      const baseEpisode: TmdbEpisode | null = autoPool[autoIndex] ?? null;
      if (baseEpisode) autoIndex++;

      const allEpisodes: TmdbEpisode[] = baseEpisode
        ? [baseEpisode, ...extraEpisodes].sort((a, b) => a.episode_number - b.episode_number)
        : [...extraEpisodes];

      const extension = getFileExtension(file);
      const customTitle = state?.customTitle;

      const destination =
        allEpisodes.length > 0
          ? buildDestinationFilename(seasonNumber, allEpisodes, extension, customTitle)
          : file;

      const editableTitle =
        customTitle ?? allEpisodes.map((e) => truncateTitle(e.name)).join(' / ');

      return {
        file,
        extension,
        baseEpisode,
        extraEpisodes,
        allEpisodes,
        destination,
        editableTitle,
      } satisfies FileMappingDisplay;
    });
  }

  /**
   * Returns all episode numbers currently used across all computed mappings.
   */
  getUsedEpisodeNumbers(mappings: FileMappingDisplay[]): Set<number> {
    const used = new Set<number>();
    for (const m of mappings) {
      for (const ep of m.allEpisodes) {
        used.add(ep.episode_number);
      }
    }
    return used;
  }

  /**
   * Returns episodes available for selection in the modal for a given file.
   *
   * Rule: exclude episodes used in files[0..fileIndex] (the current file and
   * all files above it in the sorted list). Episodes auto-assigned to files
   * BELOW the current one remain available — the user can "steal" them.
   *
   * Example with 3 files, file[0]=ep1, file[1]=ep2, file[2]=ep3:
   *   modal for file[0] → excludes {ep1}         → ep2,ep3,ep4… available
   *   modal for file[1] → excludes {ep1,ep2,ep3} → ep4,ep5… available
   *   modal for file[2] → excludes {ep1,ep2,ep3,ep4} → ep5… available
   *
   * After user adds ep2 to file[0] (file[0]=ep1+ep2, file[1] shifts to ep3):
   *   modal for file[1] → excludes {ep1,ep2,ep3} → ep4,ep5… available ✓
   */
  getAvailableEpisodesForModal(
    allEpisodes: TmdbEpisode[],
    computedMappings: FileMappingDisplay[],
    fileIndex: number,
  ): TmdbEpisode[] {
    const excluded = new Set<number>();
    for (let i = 0; i <= fileIndex; i++) {
      for (const ep of computedMappings[i]?.allEpisodes ?? []) {
        excluded.add(ep.episode_number);
      }
    }
    return allEpisodes
      .filter((e) => !excluded.has(e.episode_number))
      .sort((a, b) => a.episode_number - b.episode_number);
  }

  /**
   * Adds an extra episode number to a file's state.
   * Creates a new state entry if none exists.
   */
  addExtraEpisode(
    states: FileMappingState[],
    file: string,
    episodeNumber: number,
  ): FileMappingState[] {
    const existing = states.find((s) => s.file === file);
    if (existing) {
      if (existing.extraEpisodeNumbers.includes(episodeNumber)) return states;
      return states.map((s) =>
        s.file === file
          ? { ...s, extraEpisodeNumbers: [...s.extraEpisodeNumbers, episodeNumber] }
          : s,
      );
    }
    return [...states, { file, extraEpisodeNumbers: [episodeNumber] }];
  }

  /**
   * Removes an extra episode number from a file's state.
   */
  removeExtraEpisode(
    states: FileMappingState[],
    file: string,
    episodeNumber: number,
  ): FileMappingState[] {
    return states.map((s) =>
      s.file === file
        ? { ...s, extraEpisodeNumbers: s.extraEpisodeNumbers.filter((n) => n !== episodeNumber) }
        : s,
    );
  }

  /**
   * Updates the custom title for a file.
   */
  setCustomTitle(
    states: FileMappingState[],
    file: string,
    customTitle: string | undefined,
  ): FileMappingState[] {
    const existing = states.find((s) => s.file === file);
    if (existing) {
      return states.map((s) => (s.file === file ? { ...s, customTitle } : s));
    }
    return [...states, { file, extraEpisodeNumbers: [], customTitle }];
  }

  /**
   * Builds initial states (all empty) for a list of files.
   */
  buildInitialStates(files: string[]): FileMappingState[] {
    return files.map((file) => ({ file, extraEpisodeNumbers: [] }));
  }
}
