import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GeminiModerationService {

    private readonly url = `${environment.apiUrl}${environment.services.moderation}`;

    constructor(private http: HttpClient) {}

    async checkTextSafety(text: string): Promise<boolean> {
        try {
            const resp = await firstValueFrom(
                this.http.post<{ safe: boolean }>(this.url, { text })
            );
            return resp.safe;
        } catch (err) {
            console.error('Moderation error:', err);
            return false;
        }
    }
}
