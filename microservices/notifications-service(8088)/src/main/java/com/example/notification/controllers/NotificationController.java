package com.example.notification.controllers;

import com.example.notification.entities.Notification;
import com.example.notification.enums.Status;
import com.example.notification.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return notificationService.createNotification(notification);
    }

    @GetMapping("/{userId}")
    public List<Notification> getAll(@PathVariable String userId) {
        return notificationService.getUserNotifications(userId);
    }

    @PutMapping("/{id}/status")
    public Notification updateStatus(@PathVariable String id, @RequestParam Status status) {
        return notificationService.changeStatus(id, status);
    }
}
