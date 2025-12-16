package com.example.ride.service;

import com.example.ride.dto.CreateRideRequest;
import com.example.ride.dto.ModifyRideRequest;
import com.example.ride.entities.Ride;
import com.example.ride.enums.RideStatus;
import com.example.ride.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideServiceImpl implements RideService {

    private final RideRepository rideRepository;

    @Override
    public Ride createRide(CreateRideRequest request) {
        Ride ride = new Ride();
        ride.setDepartureCity(request.getDepartureCity());
        ride.setDestinationCity(request.getDestinationCity());
        ride.setDepartureDate(request.getDepartureDate());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setTotalSeats(request.getAvailableSeats());
        ride.setDriverId(request.getDriverId());

        if (request.getPricePerSeat() != null) {
            ride.setPricePerSeat(request.getPricePerSeat());
        }

        ride.setCreatedAt(LocalDateTime.now());
        ride.setStatus(RideStatus.SCHEDULED);

        return rideRepository.save(ride);
    }

    @Override
    public Ride modifyRide(String rideId, ModifyRideRequest request) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (request.getDepartureCity() != null) ride.setDepartureCity(request.getDepartureCity());
        if (request.getDestinationCity() != null) ride.setDestinationCity(request.getDestinationCity());
        if (request.getDepartureDate() != null) ride.setDepartureDate(request.getDepartureDate());
        if (request.getAvailableSeats() != null) ride.setAvailableSeats(request.getAvailableSeats());
        if (request.getTotalSeats() != null) ride.setTotalSeats(request.getTotalSeats());
        if (request.getPricePerSeat() != null) ride.setPricePerSeat(request.getPricePerSeat());

        ride.setUpdatedAt(LocalDateTime.now());

        return rideRepository.save(ride);
    }

    @Override
    public void deleteRide(String rideId, String driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriverId().equals(driverId)) {
            throw new RuntimeException("You cannot delete someone else's ride");
        }

        rideRepository.delete(ride);
    }

    @Override
    public List<Ride> getRidesByDriver(String driverId) {
        return rideRepository.findByDriverId(driverId);
    }

    @Override
    public List<Ride> searchRides(String departureCity, String destinationCity, LocalDate date) {
        return rideRepository.findAll().stream()
                .filter(ride -> {
                    boolean matches = true;
                    if (departureCity != null && !departureCity.isEmpty()) {
                        matches = matches && ride.getDepartureCity() != null &&
                                ride.getDepartureCity().getName() != null &&
                                ride.getDepartureCity().getName().toLowerCase().contains(departureCity.toLowerCase());
                    }
                    if (destinationCity != null && !destinationCity.isEmpty()) {
                        matches = matches && ride.getDestinationCity() != null &&
                                ride.getDestinationCity().getName() != null &&
                                ride.getDestinationCity().getName().toLowerCase().contains(destinationCity.toLowerCase());
                    }
                    if (date != null) {
                        matches = matches && ride.getDepartureDate() != null &&
                                ride.getDepartureDate().equals(date);
                    }
                    return matches && ride.getStatus() == RideStatus.SCHEDULED &&
                            ride.getAvailableSeats() > 0;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    @Override
    public Ride getRideById(String rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
    }
}