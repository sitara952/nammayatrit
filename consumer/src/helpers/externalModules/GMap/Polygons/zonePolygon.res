@react.component
let make = (~coordinates: array<ReactMap.latLng>) => {
  <ReactMap.Polygon
    coordinates
    strokeWidth=1.
    strokeColor="#9221FB"
    fillColor="rgba(224,209,255, 0.5)"
    lineDashPattern={[5., 5.]}
    key="zonePolygon"
  />
}
