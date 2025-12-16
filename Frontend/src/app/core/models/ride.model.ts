import { User, UserRole } from './user.model';

/**
 * Ride status enum
 */
export enum RideStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * Ride model interface
 */
export interface Ride {
  id: string;
  driverId: string;
  driver?: User;
  departureCity: string;
  destinationCity: string;
  departureDate: Date;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat?: number;
  status: RideStatus;
  passengers?: Booking[];
  createdAt: Date;
}

/**
 * Booking status enum
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

/**
 * Booking model interface
 */
export interface Booking {
  id: string;
  rideId: string;
  ride?: Ride;
  passengerId: string;
  passenger?: User;
  status: BookingStatus;
  seatsRequested: number;
  createdAt: Date;
}