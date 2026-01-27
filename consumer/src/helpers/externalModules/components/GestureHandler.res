open ReactNative
include VirtualizedListElement

@module("react-native-gesture-handler") @react.component
external make: (~children: React.element) => React.element = "GestureHandlerRootView"

module GestureHandlerFlatList = {
  type scrollToIndexParams = {
    index: int,
    animated: option<bool>,
    viewOffset: option<int>,
    viewPosition: option<float>,
  }

  type scrollToOffsetT = {
    animated: bool,
    offset: float,
  }

  type element = {
    expand: unit => unit,
    collapse: unit => unit,
    close: unit => unit,
    scrollToIndex: scrollToIndexParams => unit,
    scrollToOffset: scrollToOffsetT => unit,
  }

  type ref = Ref.t<element>

  @module("react-native-gesture-handler") @react.component
  external make: (
    ~ref: ref=?,
    ~data: array<'item>,
    ~style: Style.t=?,
    ~showsHorizontalScrollIndicator: bool=?,
    ~showsVerticalScrollIndicator: bool=?,
    ~snapToInterval: float=?,
    ~snapToAlignment: ScrollView.snapToAlignment=?,
    ~decelerationRate: ScrollView.decelerationRate=?,
    ~onScroll: Event.scrollEvent => unit=?,
    ~onScrollBeginDrag: Event.scrollEvent => unit=?,
    ~onScrollEndDrag: Event.scrollEvent => unit=?,
    ~onViewableItemsChanged: VirtualizedList.viewableItemsChanged<'item> => unit=?,
    ~keyExtractor: ('item, int) => string,
    ~horizontal: bool=?,
    ~renderItem: VirtualizedList.renderItemCallback<'item>,
    ~onStartShouldSetResponderCapture: Event.pressEvent => bool=?,
  ) => React.element = "FlatList"
}

type gestureT = Gesture.t

module Offset = {
  type t
  type asFloat = float
  type asTuple = (float, float)

  external float: asFloat => t = "%identity"
  external tuple: asTuple => t = "%identity"
}

type handlerStateChangeEventPayload = {
  //  Pan specific
  x: float,
  y: float,
  absoluteX: float,
  absoluteY: float,
  translationX: float,
  translationY: float,
  velocityX: float,
  velocityY: float,
  // Common
  handlerTag: int,
  numberOfPointers: int,
  state: GestureHandlerCommon.state,
  oldState: GestureHandlerCommon.state,
}

type config = {
  // Pan specific
  activeOffsetYStart: option<float>,
  activeOffsetYEnd: option<float>,
  activeOffsetXStart: option<float>,
  activeOffsetXEnd: option<float>,
  failOffsetYStart: option<float>,
  failOffsetYEnd: option<float>,
  failOffsetXStart: option<float>,
  failOffsetXEnd: option<float>,
  activeOffsetY: option<Offset.t>,
  activeOffsetX: option<Offset.t>,
  failOffsetX: option<Offset.t>,
  failOffsetY: option<Offset.t>,
  // Common
  enabled: option<bool>,
  shouldCancelWhenOutside: option<bool>,
  hitSlop: option<GestureHandlerCommon.HitSlop.t>,
  ref: option<Nullable.t<React.ref<GestureHandlerCommon.GestureType.t>>>,
  requireToFail: option<array<GestureHandlerCommon.GestureRef.t>>,
  simultaneousWith: option<array<GestureHandlerCommon.GestureRef.t>>,
  needsPointerData: option<bool>,
  manualActivation: option<bool>,
}

module GestureHandlerCallbacks = GestureHandlerCommon.GestureHandlerCallbacks.Make({
  type gestureStateChangeEvent = handlerStateChangeEventPayload
})

// Pan specific
type onChangeArg = {
  x: float,
  y: float,
  absoluteX: float,
  absoluteY: float,
  translationX: float,
  translationY: float,
  velocityX: float,
  velocityY: float,
  changeX: float,
  changeY: float,
  handlerTag: int,
  numberOfPointers: int,
  state: GestureHandlerCommon.state,
}
type onChangeCallback = onChangeArg => unit

type tapT = {
  // Pan specific
  config: config,
  // Common
  handlerTag: int,
  handlerName: string,
  handlers: GestureHandlerCallbacks.t,
}

external tap: tapT => gestureT = "%identity"

@module("react-native-gesture-handler") @scope("Gesture")
external makeTap: unit => tapT = "Tap"

@send external activeOffsetY: (tapT, Offset.t) => tapT = "activeOffsetY"
@send external activeOffsetX: (tapT, Offset.t) => tapT = "activeOffsetX"
@send external failOffsetY: (tapT, Offset.t) => tapT = "failOffsetY"
@send external failOffsetX: (tapT, Offset.t) => tapT = "failOffsetX"
@send external minPointers: (tapT, int) => tapT = "minPointers"
@send external maxPointers: (tapT, int) => tapT = "maxPointers"
@send external minDistance: (tapT, int) => tapT = "minDistance"
@send external minVelocity: (tapT, int) => tapT = "minVelocity"
@send external minVelocityX: (tapT, int) => tapT = "minVelocityX"
@send external minVelocityY: (tapT, int) => tapT = "minVelocityY"
@send external averageTouches: (tapT, bool) => tapT = "averageTouches"
@send
external enableTrackpadTwoFingerGesture: (tapT, bool) => tapT = "enableTrackpadTwoFingerGesture"
@send external onChange: (tapT, onChangeCallback) => tapT = "onChange"

// Common
include GestureHandlerCommon.Methods({
  type t = tapT
  type gestureStateChangeEvent = handlerStateChangeEventPayload
})
