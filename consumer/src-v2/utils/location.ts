import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { locationAddress } from '@/readOnly/api/types/LocationAddress.gen';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen';

export const checkTitleAndSubtitle = (v: location) => {
    return v.title && v.subtitle && v.title !== '' && v.subtitle !== '';
};

export const getFormattedAddress = (location: locationAPIEntity) => {
    return [
        location.door,
        location.building,
        location.street,
        location.area,
        location.city,
        location.state,
        location.country,
    ]
        .map(v => v?.trim())
        .filter(v => v && v !== '')
        .join(' ,');
};

export const getLocationFromLocationEntity = (location: locationAPIEntity): location => {
    const formattedAddress = getFormattedAddress(location);
    return {
        ...location,
        title: location.title !== '' ? location.title : (formattedAddress.split(',')?.at(0)?.trim() ?? ''),
        lng: location.lon,
        subtitle: formattedAddress
            .split(',')
            .slice(1)
            .map(v => v.trim())
            .join(', '),
        formattedAddress: formattedAddress,
        tag: 'AUTOCOMPLETE',
        addressComponents: location,
        serviceable: true,
        serviceabilityCity: undefined,
        specialLocation: undefined,
        locationType: undefined,
        distanceFromCurrentLocation: undefined,
        hotSpotInfo: undefined,
    };
};

export const emptyLocationAddress: locationAddress = {
    area: '',
    areaCode: '',
    building: '',
    city: '',
    country: '',
    door: '',
    extras: '',
    instructions: '',
    placeId: '',
    state: '',
    street: '',
    title: '',
    ward: '',
};
