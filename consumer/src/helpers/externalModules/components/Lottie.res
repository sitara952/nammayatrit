open ReactNative

type animation

type colorFilter = {
  keypath: string,
  color: string,
}
type cache = [
  | #default
  | #reload
  | #"force-cache"
  | #"only-if-cached"
]

type uri = {uri: string}

type uriSource = {
  uri: string,
  bundle?: string,
  method?: string,
  headers?: Js.Dict.t<string>,
  body?: string,
  cache?: cache,
  scale?: float,
  width?: float,
  height?: float,
}

module Source = {
  type t

  external fromRequired: Packager.required => t = "%identity"
  external fromUriSource: uriSource => t = "%identity"
  external fromUriSources: array<uriSource> => t = "%identity"
}

@react.component @module("lottie-react-native")
external make: (
  ~source: Source.t,
  //   ~ref: ref=?,
  ~progress: float=?,
  ~speed: float=?,
  ~duration: float=?,
  ~loop: bool=?,
  ~style: Style.t=?,
  ~imageAssetsFolder: string=?,
  ~hardwareAccelerationAndroid: string=?,
  ~resizeMode: [#cover | #contain | #center]=?,
  ~renderMode: [#AUTOMATIC | #HARDWARE | #SOFTWARE]=?,
  ~cacheStrategy: [#strong | #weak | #none]=?,
  ~autoPlay: bool=?,
  ~autoSize: bool=?,
  ~enableMergePathsAndroidForKitKatAndAbove: bool=?,
  ~onAnimationFinish: (~isCancelled: bool) => unit=?,
  //   ~onLayout: ReactNative2.Event.LayoutEvent.t => unit=?,
  ~colorFilters: array<colorFilter>=?,
  ~testID: string=?,
) => React.element = "default"
