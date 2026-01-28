
export const VENUES = [
    {
        id: 'Decathlon Sports Park', // Using title as ID for now based on current routing
        title: 'Decathlon Sports Park',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500',
        price: '₹800',
        rating: '4.9',
        location: 'Sardar Patel Ring Rd, Ahmedabad',
        description: 'A massive multi-sport facility with top-tier equipment. Features include a full-size football pitch, cricket nets, and a skating ring. Well-maintained and perfect for tournaments.',
        amenities: [
            { id: 'parking', label: 'Parking', iconName: 'ParkingCircle' },
            { id: 'water', label: 'Drinking Water', iconName: 'Coffee' },
            { id: 'changing', label: 'Changing Room', iconName: 'Shield' },
        ]
    },
    {
        id: 'Kick Off Turf',
        title: 'Kick Off Turf',
        image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=500',
        price: '₹1200',
        rating: '4.7',
        location: 'Sindhu Bhavan Road, Ahmedabad',
        description: 'Premium FIFA-approved artificial grass. High-intensity LED floodlights make it perfect for night games. Popular for 5v5 and 7v7 football matches.',
        amenities: [
            { id: 'wifi', label: 'Free WiFi', iconName: 'Wifi' },
            { id: 'parking', label: 'Parking', iconName: 'ParkingCircle' },
            { id: 'cctv', label: 'CCTV', iconName: 'Shield' },
            { id: 'cafe', label: 'Cafeteria', iconName: 'Coffee' },
        ]
    },
    {
        id: 'Sardar Patel Stadium',
        title: 'Sardar Patel Stadium',
        image: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=500',
        price: '₹1500',
        rating: '4.8',
        location: 'Navrangpura, Ahmedabad',
        description: 'Historic stadium with modern amenities. Great for professional matches and large events. Offers a true stadium feel with stands and professional groundskeeping.',
        amenities: [
            { id: 'parking', label: 'Large Parking', iconName: 'ParkingCircle' },
            { id: 'medical', label: 'First Aid', iconName: 'Info' },
            { id: 'seating', label: 'Spectator Seats', iconName: 'Users' },
        ]
    },
    {
        id: 'Apex Pickleball',
        title: 'Apex Pickleball',
        image: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=500',
        price: '₹600',
        rating: '4.6',
        location: 'Bodakdev, Ahmedabad',
        description: 'Dedicated pickleball courts with professional surfacing. Ideal for beginners and pros alike. Equipment rental available on site.',
        amenities: [
            { id: 'water', label: 'Water Cooler', iconName: 'Coffee' },
            { id: 'equipment', label: 'Rental Gear', iconName: 'Info' },
        ]
    }
];
