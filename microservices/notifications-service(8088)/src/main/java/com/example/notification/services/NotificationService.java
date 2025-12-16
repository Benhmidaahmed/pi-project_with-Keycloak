package com.example.notification.services;

import com.example.notification.entities.Notification;
import com.example.notification.enums.Status;
import com.example.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(Notification notification) {
        notification.setStatus(Status.UNREAD);
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    public Notification changeStatus(String id, Status status) {
        Notification notif = notificationRepository.findById(id).orElseThrow();
        notif.setStatus(status);
        return notificationRepository.save(notif);
    }
}
