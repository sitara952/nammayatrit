open ReactNative

type renderItem = {index: int}

module ProgressChangeType: {
  type t
  let method: ((float, float) => unit) => t
  let sharedValue: Reanimated.SharedValue.t<float> => t
} = {
  @unboxed
  type rec t = Any('a): t
  let method = (v: (float, float) => unit) => Any(v)
  let sharedValue = (v: Reanimated.SharedValue.t<float>) => Any(v)
}

module Carousel = {
  @module("react-native-reanimated-carousel") @react.component
  external make: (
    ~loop: bool,
    ~width: float,
    ~height: float,
    ~autoPlay: bool,
    ~autoPlayInterval: int,
    ~data: array<'item>,
    ~scrollAnimationDuration: int,
    ~onSnapToItem: int => unit,
    ~renderItem: renderItem => React.element,
    ~vertical: bool,
    ~onProgressChange: ProgressChangeType.t=?,
  ) => React.element = "default"
}
module Pagination = {
  @module("react-native-reanimated-carousel/src/components/Pagination/Basic") @react.component
  external make: (
    ~data: array<'item>=?,
    ~dotStyle: Style.t=?,
    ~containerStyle: Style.t=?,
    ~activeDotStyle: Style.t=?,
    ~size: int,
    ~onPress: int => unit=?,
    ~progress: Reanimated.SharedValue.t<float>=?,
    ~horizontal: bool=?,
  ) => React.element = "Basic"
}
