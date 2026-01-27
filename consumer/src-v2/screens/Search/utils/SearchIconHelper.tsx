import { DefaultSearchPin } from '@/typescript/components/svg/search/DefaultSearchPin';
import { RestaurantPin } from '@/typescript/components/svg/search/RestaurantPin';
import { WorshipBuildingPin } from '@/typescript/components/svg/search/WorshipBuildingPin';
import { SportPin } from '@/typescript/components/svg/search/SportPin';
import { CartPin } from '@/typescript/components/svg/search/CartPin';
import { MoviePin } from '@/typescript/components/svg/search/MoviePin';
import { ParkingPin } from '@/typescript/components/svg/search/ParkingPin';
import { BookPin } from '@/typescript/components/svg/search/BookPin';
import { CafePin } from '@/typescript/components/svg/search/CafePin';
import { GovernmentPin } from '@/typescript/components/svg/search/GovernmentPin';
import { HospitalPin } from '@/typescript/components/svg/search/HospitalPin';
import { ApartmentPin } from '@/typescript/components/svg/search/ApartmentPin';
import { MetroPin } from '@/typescript/components/svg/search/MetroPin';
import { BusPin } from '@/typescript/components/svg/search/BusPin';
import { AirportPin } from '@/typescript/components/svg/search/AirportPin';
import { BankPin } from '@/typescript/components/svg/search/BankPin';
import { BarPin } from '@/typescript/components/svg/search/BarPin';
import { AttractionPin } from '@/typescript/components/svg/search/AttractionPin';
import { HotelPin } from '@/typescript/components/svg/search/HotelPin';
import { FitnessPin } from '@/typescript/components/svg/search/FitnessPin';
import { MedicalPin } from '@/typescript/components/svg/search/MedicalPin';
import { ParkPin } from '@/typescript/components/svg/search/ParkPin';
import { FuelPin } from '@/typescript/components/svg/search/FuelPin';
import { SalonPin } from '@/typescript/components/svg/search/SalonPin';
import { ServicePin } from '@/typescript/components/svg/search/ServicePin';
import { EventPin } from '@/typescript/components/svg/search/EventPin';
import { BeachPin } from '@/typescript/components/svg/search/BeachPin';

const locationTypesMapping = {
    airport: ['airport', 'airstrip', 'heliport', 'international_airport'],
    attraction: [
        'amusement_center',
        'amusement_park',
        'aquarium',
        'art_gallery',
        'art_studio',
        'casino',
        'cultural_center',
        'cultural_landmark',
        'ferris_wheel',
        'historical_landmark',
        'historical_place',
        'monument',
        'museum',
        'observation_deck',
        'opera_house',
        'performing_arts_theater',
        'planetarium',
        'plaza',
        'roller_coaster',
        'sculpture',
        'tourist_attraction',
        'tourist_information_center',
        'video_arcade',
        'visitor_center',
        'water_park',
        'zoo',
    ],
    bank: ['bank', 'Finance', 'atm'],
    bar: ['liquor_store', 'comedy_club', 'karaoke', 'night_club', 'bar', 'bar_and_grill', 'pub', 'wine_bar'],
    beach: ['beach'],
    building: ['apartment_building', 'apartment_complex', 'condominium_complex', 'housing_complex', 'mobile_home_park'],
    bus: ['bus_station', 'bus_stop', 'ferry_terminal', 'taxi_stand'],
    cafe: [
        'cafe',
        'internet_cafe',
        'acai_shop',
        'bagel_shop',
        'cafeteria',
        'cat_cafe',
        'coffee_shop',
        'dog_cafe',
        'donut_shop',
        'juice_shop',
        'tea_house',
    ],
    event: [
        'auditorium',
        'amphitheatre',
        'banquet_hall',
        'concert_hall',
        'convention_center',
        'dance_hall',
        'event_venue',
        'philharmonic_hall',
        'wedding_venue',
        'summer_camp_organizer',
    ],
    fitness: ['gym', 'fitness_center', 'yoga_studio', 'wellness_center', 'sauna', 'spa'],
    fuelPump: ['gas_station', 'electric_vehicle_charging_station', 'truck_stop'],
    government: [
        'courthouse',
        'city_hall',
        'embassy',
        'library',
        'fire_station',
        'police',
        'government_office',
        'post_office ',
        'community_center',
    ],
    hotel: [
        'lodging',
        'bed_and_breakfast',
        'budget_japanese_inn',
        'camping_cabin',
        'cottage',
        'extended_stay_hotel',
        'farmstay',
        'guest_house',
        'hostel',
        'hotel',
        'inn',
        'japanese_inn',
        'motel',
        'private_guest_room',
        'resort_hotel',
    ],
    hospital: [
        'dentist',
        'doctor',
        'pharmacy',
        'hospital',
        'veterinary_care',
        'physiotherapist',
        'chiropractor',
        'dental_clinic',
        'medical_lab',
        'skin_care_clinic',
        'foot_care',
        'health',
    ],
    medicalStore: ['drugstore'],
    movie: ['movie_rental', 'movie_theater'],
    parking: ['parking', 'rest_stop', 'park_and_ride'],
    park: [
        'park',
        'campground',
        'rv_park',
        'botanical_garden',
        'childrens_camp',
        'dog_park',
        'garden',
        'hiking_area',
        'national_park',
        'picnic_ground',
        'state_park',
        'wildlife_park',
        'wildlife_refuge',
        'playground',
    ],
    placeOfWorship: ['church', 'hindu_temple', 'mosque', 'synagogue'],
    railway: ['subway_station', 'light_rail_station', 'transit_station', 'train_station', 'transit_depot'],
    restaurant: [
        'bakery',
        'restaurant',
        'food',
        'bar',
        'meal_takeaway',
        'meal_delivery',
        'night_club',
        'afghani_restaurant',
        'african_restaurant',
        'american_restaurant',
        'asian_restaurant',
        'barbecue_restaurant',
        'brazilian_restaurant',
        'breakfast_restaurant',
        'brunch_restaurant',
        'buffet_restaurant',
        'chinese_restaurant',
        'deli',
        'dessert_restaurant',
        'dessert_shop',
        'diner',
        'fast_food_restaurant',
        'fine_dining_restaurant',
        'food_court',
        'french_restaurant',
        'greek_restaurant',
        'hamburger_restaurant',
        'ice_cream_shop',
        'indian_restaurant',
        'indonesian_restaurant',
        'italian_restaurant',
        'japanese_restaurant',
        'korean_restaurant',
        'lebanese_restaurant',
        'mediterranean_restaurant',
        'mexican_restaurant',
        'middle_eastern_restaurant',
        'pizza_restaurant',
        'ramen_restaurant',
        'sandwich_shop',
        'seafood_restaurant',
        'spanish_restaurant',
        'steak_house',
        'sushi_restaurant',
        'thai_restaurant',
        'turkish_restaurant',
        'vegan_restaurant',
        'vegetarian_restaurant',
        'vietnamese_restaurant',
        'catering_service',
        'food_delivery',
    ],
    salon: [
        'beauty_salon',
        'hair_care',
        'tanning_studio',
        'barber_shop',
        'beautician',
        'body_art_service',
        'hair_salon',
        'makeup_artist',
        'nail_salon',
        'massage',
    ],
    school: ['primary_school', 'school', 'secondary_school', 'university', 'preschool', 'school_district'],
    servicesRepair: [
        'car_rental',
        'car_repair',
        'car_wash',
        'accounting',
        'consultant',
        'courier_service',
        'electrician',
        'insurance_agency',
        'laundry',
        'lawyer',
        'locksmith',
        'moving_company',
        'painter',
        'plumber',
        'real_estate_agency',
        'roofing_contractor',
        'storage',
        'tailor',
        'telecommunications_service_provider',
        'tour_agency',
        'travel_agency',
    ],
    shopping: [
        'car_dealer',
        'candy_store',
        'chocolate_factory',
        'chocolate_shop',
        'confectionery',
        'florist',
        'asian_grocery_store',
        'auto_parts_store',
        'bicycle_store',
        'book_store',
        'butcher_shop',
        'cell_phone_store',
        'clothing_store',
        'convenience_store',
        'department_store',
        'discount_store',
        'electronics_store',
        'food_store',
        'furniture_store',
        'gift_shop',
        'grocery_store',
        'hardware_store',
        'home_goods_store',
        'jewelry_store',
        'liquor_store',
        'market',
        'pet_store',
        'shoe_store',
        'shopping_mall',
        'sporting_goods_store',
        'store',
        'supermarket',
        'warehouse_store',
        'wholesaler',
    ],
    sport: [
        'bowling_alley',
        'stadium',
        'adventure_sports_center',
        'cycling_park',
        'off_roading_area',
        'skateboard_park',
        'arena',
        'athletic_field',
        'fishing_charter',
        'fishing_pond',
        'golf_course',
        'ice_skating_rink',
        'ski_resort',
        'sports_activity_location',
        'sports_club',
        'sports_coaching',
        'sports_complex',
        'swimming_pool',
    ],
};

export const getPinMapping = (tag: string | undefined) => {
    if (!tag) return <DefaultSearchPin />;
    else if (locationTypesMapping.placeOfWorship.includes(tag)) return <WorshipBuildingPin />;
    else if (locationTypesMapping.sport.includes(tag)) return <SportPin />;
    else if (locationTypesMapping.shopping.includes(tag)) return <CartPin />;
    else if (locationTypesMapping.movie.includes(tag)) return <MoviePin />;
    else if (locationTypesMapping.parking.includes(tag)) return <ParkingPin />;
    else if (locationTypesMapping.building.includes(tag)) return <ApartmentPin />;
    else if (locationTypesMapping.cafe.includes(tag)) return <CafePin />;
    else if (locationTypesMapping.hospital.includes(tag)) return <HospitalPin />;
    else if (locationTypesMapping.school.includes(tag)) return <BookPin />;
    else if (locationTypesMapping.government.includes(tag)) return <GovernmentPin />;
    else if (locationTypesMapping.railway.includes(tag)) return <MetroPin />;
    else if (locationTypesMapping.bus.includes(tag)) return <BusPin />;
    else if (locationTypesMapping.airport.includes(tag)) return <AirportPin />;
    else if (locationTypesMapping.bank.includes(tag)) return <BankPin />;
    else if (locationTypesMapping.bar.includes(tag)) return <BarPin />;
    else if (locationTypesMapping.beach.includes(tag)) return <BeachPin />;
    else if (locationTypesMapping.hotel.includes(tag)) return <HotelPin />;
    else if (locationTypesMapping.attraction.includes(tag)) return <AttractionPin />;
    else if (locationTypesMapping.park.includes(tag)) return <ParkPin />;
    else if (locationTypesMapping.fitness.includes(tag)) return <FitnessPin />;
    else if (locationTypesMapping.medicalStore.includes(tag)) return <MedicalPin />;
    else if (locationTypesMapping.fuelPump.includes(tag)) return <FuelPin />;
    else if (locationTypesMapping.salon.includes(tag)) return <SalonPin />;
    else if (locationTypesMapping.servicesRepair.includes(tag)) return <ServicePin />;
    else if (locationTypesMapping.restaurant.includes(tag)) return <RestaurantPin />;
    else if (locationTypesMapping.event.includes(tag)) return <EventPin />;

    return <DefaultSearchPin />;
};

const regexPatternMapping = {
    airport: ['airport', 'airport terminal'],
    attraction: [
        'aquatic',
        'zoo',
        'amusement',
        'water park',
        'snow world',
        'film city',
        'wonderla',
        'essel world',
        'adventure park',
        'planetarium',
    ],
    bank: ['bank', 'co-operative society', 'atm'],
    bar: ['pub'],
    beach: ['beach'],
    building: [
        'business park',
        'industrial park',
        'office center',
        'office centre',
        'apartment',
        'it park',
        'tech park',
        'technology park',
        'estate',
        'estates',
        'hall',
        'convention',
    ],
    bus: ['bus terminal', 'bus station', 'bus terminus'],
    cafe: ['cafe'],
    event: ['comedy', 'event'],
    fitness: ['gym', 'fitness'],
    fuelPump: ['petrol pump', 'diesel pump'],
    government: [
        'post office',
        'library',
        'high court',
        'civil court',
        'family court',
        'magistrate',
        'police station',
        'department',
        'corporation',
        'municipal',
        'tribunal',
        'administrative',
        'office',
        'administrative',
        'building',
        'secretariat',
        'panchayat',
    ],
    hospital: [
        'hospital',
        'clinic',
        'health',
        'care',
        'health hub',
        'health centre',
        'doctor',
        'physician',
        'general practitioner',
    ],
    hotel: ['hotel'],
    medicalStore: ['pharmacy', 'medical shop', 'medical store'],
    movie: ['theatre', 'pvr', 'inox', 'cinepolis', 'cinema'],
    parking: ['parking'],
    park: ['garden'],
    placeOfWorship: [
        'temple',
        'church',
        'mosque',
        'dargah',
        'mandir',
        'iskcon',
        'masjid',
        'gurudwara',
        'devasthana',
        'devasthanam',
        'gudi',
    ],
    railway: ['train station', 'railway station', 'metro station'],
    restaurants: ['restaurant', 'thindi', 'ahaara', 'tiffin', 'tiffins', 'mess', 'canteen'],
    salon: ['hair salon', 'hair cut'],
    school: ['school', 'college', 'learning center', 'university', 'academy'],
    servicesRepair: [
        'repair',
        'carpenter',
        'wood works',
        'electrician',
        'electrical works',
        'plumbing',
        'sanitary works',
    ],
    shopping: [
        'mall',
        'shopping',
        'jewellary',
        'saree',
        'market',
        'musical',
        'hypermarket',
        'hardware',
        'super bazaar',
        'hyper bazaar',
        'supermarket',
        'sanitary',
        'showroom',
        'sanitaryware',
        'titan world',
        'factory outlet',
        'mart',
        'croma',
        'mobile',
        'zudio',
        'appliances',
        'parts',
        'automobile',
        'accessories',
    ],
    sport: [
        'cricket',
        'badminton',
        'basketball',
        'volleyball',
        'swimming',
        'tennis',
        'hockey',
        'golf',
        'play arena',
        'gaming',
        'games',
        'playground',
        'play ground',
    ],
    exclusion: ['road', 'circle', 'street', 'lane', 'cross', 'colony', 'nagar'],
};

export const getPinRegex = (title: string, tag: string | undefined) => {
    const titleArray = title.split(' ');
    if (regexPatternMapping.exclusion.some(v => titleArray.includes(v))) return getPinMapping(tag);
    else if (
        regexPatternMapping.placeOfWorship.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <WorshipBuildingPin />;
    else if (
        regexPatternMapping.sport.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <SportPin />;
    else if (
        regexPatternMapping.shopping.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <CartPin />;
    else if (
        regexPatternMapping.movie.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <MoviePin />;
    else if (
        regexPatternMapping.parking.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <ParkingPin />;
    else if (
        regexPatternMapping.building.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <ApartmentPin />;
    else if (
        regexPatternMapping.cafe.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <CafePin />;
    else if (
        regexPatternMapping.hospital.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <HospitalPin />;
    else if (
        regexPatternMapping.school.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <BookPin />;
    else if (
        regexPatternMapping.government.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <GovernmentPin />;
    else if (
        regexPatternMapping.railway.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <MetroPin />;
    else if (
        regexPatternMapping.bus.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <BusPin />;
    else if (
        regexPatternMapping.airport.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <AirportPin />;
    else if (
        regexPatternMapping.bank.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <BankPin />;
    else if (
        regexPatternMapping.bar.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <BarPin />;
    else if (
        regexPatternMapping.beach.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <BeachPin />;
    else if (
        regexPatternMapping.hotel.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <HotelPin />;
    else if (
        regexPatternMapping.attraction.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <AttractionPin />;
    else if (
        regexPatternMapping.park.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <ParkPin />;
    else if (
        regexPatternMapping.fitness.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <FitnessPin />;
    else if (
        regexPatternMapping.medicalStore.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <MedicalPin />;
    else if (
        regexPatternMapping.fuelPump.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <FuelPin />;
    else if (
        regexPatternMapping.salon.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <SalonPin />;
    else if (
        regexPatternMapping.servicesRepair.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <ServicePin />;
    else if (
        regexPatternMapping.restaurants.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <RestaurantPin />;
    else if (
        regexPatternMapping.event.some(v => {
            const regex = new RegExp(`\\b${v}\\b`, 'i');
            return regex.test(title);
        })
    )
        return <EventPin />;

    return getPinMapping(tag);
};

const exclusionCategory = [
    'farm',
    'ranch',
    'barbecue_area',
    'marina',
    'public_bath',
    'public_bathroom',
    'stable',
    'administrative_area_level_1',
    'administrative_area_level_2',
    'country',
    'postal_code',
    'astrologer',
    'cemetery',
    'child_care_agency',
    'funeral_home',
    'psychic',
    'sublocality_level_1',
    'sublocality_level_2',
    'sublocality',
    'geocode',
    'point_of_interest',
    'establishment',
    'locality',
    'administrative_area_level_3',
    'administrative_area_level_4',
    'administrative_area_level_5',
    'administrative_area_level_6',
    'administrative_area_level_7',
    'archipelago',
    'colloquial_area',
    'continent',
    'finance',
    'floor',
    'food',
    'general_contractor',
    'intersection',
    'landmark',
    'natural_feature',
    'neighborhood',
    'place_of_worship',
    'plus_code',
    'political',
    'post_box',
    'postal_code_prefix',
    'postal_code_suffix',
    'postal_town',
    'postal_box',
    'premise',
    'room',
    'route',
    'street_address',
    'street_number',
    'subpremise',
    'town_square',
    'health',
];

// NOTE:- it is needed for future refining of this logic, DO NOT REMOVE
// const priorityCategory = {
//     stores: ['shopping_mall', 'supermarket', 'market', 'sporting_goods_store'],
// };

// const prelogicFilter = (tags: string[]) => {
//     if (tags.some(v => priorityCategory.stores.includes(v))) {
//         return <CartPin />;
//     }
//     return undefined;
// };

export const getSearchListIcon = (tags: string[], title: string) => {
    const filteredTags = tags.filter(v => !exclusionCategory.includes(v));

    // const preLogicIcon = prelogicFilter(filteredTags);
    // if (preLogicIcon != undefined) {
    //     return preLogicIcon;
    // }

    return filteredTags.length > 0 && filteredTags.length <= 3
        ? getPinMapping(filteredTags[0])
        : getPinRegex(title?.toLowerCase() ?? '', filteredTags[0]);
};
