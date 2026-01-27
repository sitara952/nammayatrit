@val external parseInt: (string, option<int>) => option<int> = "parseInt"

let hexToRgb = hex => {
  let parseHex = hexStr => parseInt(hexStr, Some(16))->Belt.Option.getWithDefault(0)

  let r = parseHex(Js.String.slice(~from=1, ~to_=3, hex))
  let g = parseHex(Js.String.slice(~from=3, ~to_=5, hex))
  let b = parseHex(Js.String.slice(~from=5, ~to_=7, hex))

  (r, g, b)
}

let rgbToHex = (r, g, b) => {
  let toHex = value => {
    Js.Int.toStringWithRadix(value, ~radix=16)
  }

  "#" ++ toHex(r) ++ toHex(g) ++ toHex(b)
}

@genType
let getGradientColor = (~startColor: string, ~endColor: string, ~length: int): array<string> => {
  let (startR, startG, startB) = hexToRgb(startColor)
  let (endR, endG, endB) = hexToRgb(endColor)
  let getColor = (parts, i) => {
    let r = int_of_float(
      Js.Math.round(
        float_of_int(startR) +.
        float_of_int(endR - startR) *. float_of_int(i) /. float_of_int(parts),
      ),
    )
    let g = int_of_float(
      Js.Math.round(
        float_of_int(startG) +.
        float_of_int(endG - startG) *. float_of_int(i) /. float_of_int(parts),
      ),
    )
    let b = int_of_float(
      Js.Math.round(
        float_of_int(startB) +.
        float_of_int(endB - startB) *. float_of_int(i) /. float_of_int(parts),
      ),
    )
    rgbToHex(r, g, b)
  }
  let segments = 7
  let points_per_seg = length / segments
  let colors = []
  for _index in 0 to segments - 1 {
    for _ in 0 to points_per_seg - 1 {
      colors->Array.push(getColor(segments, _index))
    }
  }

  // Add the remaining colors to make the colors length equal to length
  if Array.length(colors) < length {
    for _ in 0 to length - Array.length(colors) {
      colors->Array.push(getColor(segments, segments - 1))
    }
  }
  colors->Array.slice(~start=0, ~end=length)
}

let pi: float = 3.141592653589793

let toRadians = (degrees: float): float => degrees *. pi /. 180.0

let toDegrees = (radians: float): float => radians *. 180.0 /. pi

let wrap = (value: float, min: float, max: float): float => {
  let range = max -. min
  let wrappedValue = value -. range *. floor(value /. range)
  if wrappedValue < min {
    wrappedValue +. range
  } else {
    wrappedValue
  }
}

// ------------------- computeHeading -------------------
@genType
let computeHeading = (latLng1: ReactMap.latLng, latLng2: ReactMap.latLng): int => {
  let pi: float = 3.14159
  let lat1: float = latLng1.latitude *. pi /. 180.0
  let long1: float = latLng1.longitude *. pi /. 180.0
  let lat2: float = latLng2.latitude *. pi /. 180.0
  let long2: float = latLng2.longitude *. pi /. 180.0
  let dLon: float = long2 -. long1
  let y: float = Js.Math.sin(dLon) *. Js.Math.cos(lat2)
  let x: float =
    Js.Math.cos(lat1) *. Js.Math.sin(lat2) -.
      Js.Math.sin(lat1) *. Js.Math.cos(lat2) *. Js.Math.cos(dLon)
  let brng: float = Js.Math.atan2(~y, ~x, ())
  let brngDeg: float = brng *. 57.29577951308232
  let deltaDeg: float = brngDeg +. 360.0
  let res = mod(Js.Math.floor(deltaDeg), 360)
  res
}

@module("react-native") @scope(("NativeModules", "MapUtils"))
external isCoordinateOnPath: (array<ReactMap.latLng>, ReactMap.latLng) => Promise.t<int> =
  "isCoordinateOnPath"

@module("react-native") @scope(("NativeModules", "MapUtils"))
external getExtendedPath: array<ReactMap.latLng> => Promise.t<array<ReactMap.latLng>> =
  "getExtendedPath"

@module("react-native") @scope(("NativeModules", "MapUtils"))
external computeLength: array<ReactMap.latLng> => Js.Promise.t<float> = "computeLength"
