@genType
type locationTag =
  | AUTOCOMPLETE
  | RECENTS
  | FAVOURITES(string)
  | PRIORITIZE_RECENT
  | PRIORITIZE_FAVOURITE
  | PUBLIC_TRANSPORT_RECENTS

@genType
type location = {
  lat: option<float>,
  lng: option<float>,
  placeId: option<string>,
  title: option<string>,
  subtitle: option<string>,
  formattedAddress: option<string>,
  tag: locationTag,
  addressComponents: option<LocationAddress.locationAddress>,
  serviceable: option<bool>,
  hotSpotInfo: option<array<ServiceabilityApi.hotSpotInfo>>,
  serviceabilityCity: option<string>,
  specialLocation: option<ServiceabilityApi.specialLocation>,
  locationType: option<array<string>>,
  distanceFromCurrentLocation: option<string>,
}

@genType
type locationInfo = {
  ward: string,
  address: string,
  lat: option<float>,
  lon: option<float>,
}
@genType
type locationApiEntity = {
  door: option<string>,
  building: option<string>,
  street: option<string>,
  area: option<string>,
  city: option<string>,
  state: option<string>,
  country: option<string>,
  lat: option<float>,
  lon: option<float>,
  ward: option<string>,
}

@genType
type searchLocationObject = {
  source: location,
  destination: location,
  stops: array<location>,
}

@genType
type locationWithServiceability = {
  location: location,
  isMetroServiceable: option<bool>,
  isSubwayServiceable: option<bool>,
  ptRestrictedHours: option<ServiceabilityApi.ptRestrictedHours>,
}
