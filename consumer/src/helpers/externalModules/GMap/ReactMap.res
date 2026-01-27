type mapStyleElement = {
  elementType: string,
  featureType: string,
  stylers: array<JSON.t>,
}

@genType
type latLng = {
  mutable latitude: float,
  mutable longitude: float,
}

@genType
type region = {
  latitude: float,
  longitude: float,
  latitudeDelta: float,
  longitudeDelta: float,
}

@genType
type camera = {
  center: latLng,
  pitch: float,
  heading: float,
  altitude: float,
  zoom: float,
}

type marker = {
  coordinate: latLng,
  description: string,
  title: string,
  key: string,
}

@genType
type point = {
  x: float,
  y: float,
}

type details = {isGesture: bool}

@genType
type edgePadding = {
  top: float,
  right: float,
  bottom: float,
  left: float,
}
@genType
type options = {
  edgePadding: edgePadding,
  animated: bool,
  duration: float,
}
@genType
type animateCameraOptions = {duration: float}
type edgeInsets = {
  top: float,
  left: float,
  bottom: float,
  right: float,
}

type cameraZoomRange = {
  minCenterCoordinateDistance?: float,
  maxCenterCoordinateDistance?: float,
  animated?: bool,
}

@genType
type address = {
  administrativeArea: string,
  country: string,
  countryCode: string,
  locality: string,
  name: string,
  postalCode: string,
  subAdministrativeArea: string,
  subLocality: string,
  thoroughfare: string,
  subThoroughfare?: string,
}
@genType
type mapNativeProps = {
  animateToRegion: (region, float) => unit, // Do not use this method directly use animateCamera instead
  fitToCoordinates: (array<latLng>, options) => unit,
  getCamera: unit => promise<camera>,
  animateCamera: (camera, animateCameraOptions) => unit,
  animateToCamera: (camera, float) => unit,
  fitToElements: options => unit,
  addressForCoordinate: latLng => promise<address>,
}
type markerNativeProps = {
  animateMarkerToCoordinate: (latLng, float) => unit,
  showCallout: unit => unit,
  redrawCallout: unit => unit,
}

@genType
type polylineNativeProps = {
  startPolylineAnimation: (string, float, float) => unit,
  stopPolylineAnimation: unit => unit,
}

@genType
type currentRegion = {
  region: region,
  isGesture: bool,
}

type nativeSyntheticEvent = {}

type panNativeEvent = {
  coordinate: latLng,
  position: point,
  numberOfTouches: int, // NOTE numberOfTouches is iOS only
}
type panDragEvent = {nativeEvent: panNativeEvent}

module MapView = {
  @module("react-native-maps") @react.component
  external make: (
    ~initialRegion: region=?,
    ~initialCamera: camera,
    ~style: ReactNative.Style.t=?,
    ~customMapStyle: array<mapStyleElement>=?,
    ~onRegionChangeComplete: (region, details) => unit=?,
    ~children: React.element=?,
    ~showsUserLocation: bool=?,
    ~region: region=?,
    ~camera: camera=?,
    ~provider: string=?,
    ~ref: Js.nullable<mapNativeProps> => unit=?,
    ~onMapReady: (~event: nativeSyntheticEvent=?) => unit=?,
    ~onPanDrag: panDragEvent => unit=?,
    ~mapPadding: edgePadding=?,
    ~paddingAdjustmentBehavior: [#always | #automatic | #never]=?,
    ~liteMode: bool=?,
    ~mapType: [#standard | #satellite | #hybrid | #terrain | #none]=?,
    ~userInterfaceStyle: [#light | #dark]=?,
    ~showsMyLocationButton: bool=?,
    ~userLocationPriority: [#balanced | #high | #low | #passive]=?,
    ~userLocationUpdateInterval: float=?,
    ~userLocationFastestInterval: float=?,
    ~userLocationAnnotationTitle: string=?,
    ~followsUserLocation: bool=?,
    ~userLocationCalloutEnabled: bool=?,
    ~showsCompass: bool=?,
    ~showsScale: bool=?,
    ~showsBuildings: bool=?,
    ~showsTraffic: bool=?,
    ~showsIndoors: bool=?,
    ~showsIndoorLevelPicker: bool=?,
    ~zoomEnabled: bool=?,
    ~zoomTapEnabled: bool=?,
    ~zoomControlEnabled: bool=?,
    ~minZoomLevel: float=?,
    ~maxZoomLevel: float=?,
    ~rotateEnabled: bool=?,
    ~scrollEnabled: bool=?,
    ~scrollDuringRotateOrZoomEnabled: bool=?,
    ~pitchEnabled: bool=?,
    ~toolbarEnabled: bool=?,
    ~cacheEnabled: bool=?,
    ~loadingEnabled: bool=?,
    ~loadingIndicatorColor: string=?,
    ~loadingBackgroundColor: string=?,
    ~tintColor: string=?,
    ~moveOnMarkerPress: bool=?,
    ~legalLabelInsets: edgeInsets=?,
    ~kmlSrc: string=?,
    ~compassOffset: point=?,
    ~isAccessibilityElement: bool=?,
    ~cameraZoomRange: cameraZoomRange=?,
    ~googleRenderer: [#LATEST | #LEGACY]=?,
  ) => React.element = "default"
}

module Polyline = {
  @module("react-native-maps") @react.component
  external make: (
    ~coordinates: array<latLng>,
    ~strokeColor: string=?,
    ~strokeWidth: float=?,
    ~lineDashPattern: array<float>=?,
    ~strokeColors: array<string>=?,
    ~key: string,
    ~ref: polylineNativeProps => unit=?,
  ) => React.element = "Polyline"
}

module Marker = {
  @module("react-native-maps") @react.component
  external make: (
    ~coordinate: latLng,
    ~description: string,
    ~title: string,
    ~key: string,
    ~style: ReactNative.Style.t=?,
    ~image: ReactNative.Image.Source.t=?,
    ~icon: ReactNative.Image.Source.t=?,
    ~anchor: point=?,
    ~children: React.element=?,
    ~rotation: float=?,
    ~pinColor: string=?,
    ~centerOffset: point=?,
    ~calloutOffset: point=?,
    ~flat: bool=?,
    ~zIndex: float=?,
    ~identifier: string=?,
    ~ref: markerNativeProps => unit=?,
    ~tracksViewChanges: bool=?,
    ~calloutAnchor: point=?,
  ) => React.element = "Marker"
}

module Polygon = {
  @module("react-native-maps") @react.component
  external make: (
    ~coordinates: array<latLng>,
    ~holes: array<array<latLng>>=?,
    ~strokeWidth: float=?,
    ~strokeColor: string=?,
    ~strokeColors: array<string>=?,
    ~fillColor: string=?,
    ~lineCap: string=?,
    ~lineJoin: array<latLng>=?,
    ~miterLimit: float=?,
    ~geodesic: bool=?,
    ~lineDashPhase: float=?,
    ~lineDashPattern: array<float>=?,
    ~tappable: bool=?,
    ~zIndex: float=?,
    ~onPress: unit => unit=?,
  ) => React.element = "Polygon"
}

module Circle = {
  @module("react-native-maps") @react.component
  external make: (
    ~center: latLng,
    ~radius: float,
    ~strokeColor: string=?,
    ~strokeWidth: float=?,
    ~fillColor: string=?,
    ~zIndex: float=?,
    ~lineCap: string=?,
    ~lineJoin: string=?,
    ~miterLimit: float=?,
    ~lineDashPhase: float=?,
    ~lineDashPattern: array<float>=?,
  ) => React.element = "Circle"
}
module Callout = {
  @module("react-native-maps") @react.component
  external make: (
    ~alphaHitTest: bool=?,
    ~tooltip: bool=?,
    ~onPress: unit => unit=?,
    ~children: React.element=?,
  ) => React.element = "Callout"
}

module CalloutSubview = {
  @module("react-native-maps") @react.component
  external make: (
    ~onPress: unit => unit=?,
    ~style: ReactNative.Style.t=?,
    ~children: React.element=?,
  ) => React.element = "CalloutSubview"
}
