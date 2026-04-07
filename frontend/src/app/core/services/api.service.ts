import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  FilesListResponse,
  TmdbSearchResponse,
  TmdbSeasonsResponse,
  RenameRequest,
  RenameResponse,
  HealthResponse,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // ── Health ──────────────────────────────────────────
  health(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.base}/health`);
  }

  // ── Files ───────────────────────────────────────────
  listFiles(path: string): Observable<FilesListResponse> {
    return this.http.post<FilesListResponse>(`${this.base}/files/list`, { path });
  }

  // ── TMDB ────────────────────────────────────────────
  searchShow(query: string): Observable<TmdbSearchResponse> {
    return this.http.post<TmdbSearchResponse>(`${this.base}/tmdb/search`, { query });
  }

  getSeasons(showId: number): Observable<TmdbSeasonsResponse> {
    return this.http.get<TmdbSeasonsResponse>(`${this.base}/tmdb/shows/${showId}/seasons`);
  }

  // ── Rename ──────────────────────────────────────────
  renameFiles(request: RenameRequest): Observable<RenameResponse> {
    return this.http.post<RenameResponse>(`${this.base}/rename`, request);
  }
}
