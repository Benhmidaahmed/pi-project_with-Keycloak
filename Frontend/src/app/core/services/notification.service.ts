import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly apiUrl = `${environment.apiUrl}${environment.services.notifications}`;

  constructor(private http: HttpClient) {}

  /**
   * Get notifications for a specific user
   */
  getUserNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Get all notifications (optional)
   */
  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  /**
   * Create a new notification
   * Backend automatically sets status = UNREAD
   */
  createNotification(notification: { userId: string; message: string }): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }

  /**
   * Update the status of a notification
   */
  updateStatus(notificationId: string, status: 'READ' | 'UNREAD'): Observable<Notification> {
    return this.http.put<Notification>(
        `${this.apiUrl}/${notificationId}/status`,
        null,
        { params: { status } }
    );
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string): Observable<Notification> {
    return this.updateStatus(notificationId, 'READ');
  }

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): Observable<void> {
    return new Observable(observer => {
      this.getUserNotifications(userId).subscribe(notifications => {
        const unread = notifications.filter(n => n.status !== 'READ');

        if (unread.length === 0) {
          observer.complete();
          return;
        }

        let completed = 0;
        unread.forEach(n => {
          this.markAsRead(n.id).subscribe(() => {
            completed++;
            if (completed === unread.length) observer.complete();
          });
        });
      });
    });
  }
}
