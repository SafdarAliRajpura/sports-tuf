
import { create } from 'zustand';

interface Booking {
    id: string;
    arena: string;
    sport: string;
    date: string;
    time: string;
    location: string;
    image: string;
    status: string;
}

interface BookingStore {
    upcomingBookings: Booking[];
    pastBookings: Booking[];
    addBooking: (booking: Booking) => void;
    cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
    upcomingBookings: [
        {
            id: '1',
            arena: 'Decathlon Sports Park',
            sport: 'Football',
            date: 'Jan 28, 2026',
            time: '06:00 PM - 07:00 PM',
            location: 'Sardar Patel Ring Rd, Ahmedabad',
            image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500',
            status: 'Confirmed'
        }
    ],
    pastBookings: [
        {
            id: '101',
            arena: 'Ace Badminton Club',
            sport: 'Badminton',
            date: 'Jan 15, 2026',
            time: '08:00 AM - 09:00 AM',
            location: 'Bopal, Ahmedabad',
            image: 'https://picsum.photos/id/43/400/300',
            status: 'Completed'
        }
    ],
    addBooking: (booking) => set((state) => ({
        upcomingBookings: [booking, ...state.upcomingBookings]
    })),
    cancelBooking: (id) => set((state) => {
        const bookingToCancel = state.upcomingBookings.find((b) => b.id === id);
        if (!bookingToCancel) return state;

        return {
            upcomingBookings: state.upcomingBookings.filter((b) => b.id !== id),
            pastBookings: [{ ...bookingToCancel, status: 'Cancelled' }, ...state.pastBookings]
        };
    })
}));
