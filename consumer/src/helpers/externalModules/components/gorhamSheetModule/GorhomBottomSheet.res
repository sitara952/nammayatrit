include GorhomBottomSheetElement
open ReactNative
module BottomSheet = {
  @module("@gorhom/bottom-sheet") @react.component
  external make: (
    ~ref: ref=?,
    ~onChange: int => unit=?,
    ~children: React.element,
    ~snapPoints: array<string>,
    ~index: float,
    ~animateOnMount: bool,
    ~enableDynamicSizing: bool=?,
    ~onAnimate: (~fromIndex: float, ~toIndex: float) => unit=?,
    ~onClose: unit => unit=?,
    ~style: Style.t=?,
    ~handleComponent: 'a => React.element=?,
    ~backgroundComponent: 'a => React.element=?,
    ~backdropComponent: 'a => React.element=?,
    ~footerComponent: 'a => React.element=?,
    ~enableOverDrag: bool=?,
    ~maxDynamicContentSize: float=?,
    ~handleHeight: Reanimated.SharedValue.t<float>=?,
    ~contentHeight: Reanimated.SharedValue.t<float>=?,
    ~enablePanDownToClose: bool=?,
    ~detached: bool=?,
    ~keyboardBehavior: string=?,
    ~keyboardBlurBehavior: string=?,
    ~animationConfigs: Reanimated.Timing.userOption=?,
    ~android_keyboardInputMode: string=?,
    ~topInset: float=?,
  ) => React.element = "default"
}

type textInputMode = [#none | #text | #tel | #url | #email | #numeric | #decimal | #search]

module BottomSheetTextInput = {
  @module("@gorhom/bottom-sheet") @react.component
  external make: (
    ~ref: ref=?,
    ~onFocus: unit => unit,
    ~onBlur: unit => unit,
    ~editable: bool=?,
    ~style: Style.t=?,
    ~multiline: bool=?,
    ~onChangeText: string => unit=?,
    ~placeholder: string=?,
    ~placeholderTextColor: Color.t=?,
    ~inputMode: textInputMode=?,
    ~value: string=?,
    ~maxLength: int=?,
  ) => React.element = "BottomSheetTextInput"
}

module BottomSheetView = {
  @module("@gorhom/bottom-sheet") @react.component
  external make: (~style: Style.t=?, ~children: React.element) => React.element = "BottomSheetView"
}

module BottomSheetFooter = {
  @module("@gorhom/bottom-sheet") @react.component
  external make: (~style: Style.t=?, ~children: React.element) => React.element =
    "BottomSheetFooter"
}

module BottomSheetScrollView = {
  @module("@gorhom/bottom-sheet") @react.component
  external make: (
    ~ref: ref=?,
    // ScrollView props
    ~alwaysBounceHorizontal: bool=?,
    ~alwaysBounceVertical: bool=?,
    ~automaticallyAdjustContentInsets: bool=?,
    ~bounces: bool=?,
    ~bouncesZoom: bool=?,
    ~canCancelContentTouches: bool=?,
    ~centerContent: bool=?,
    ~contentContainerStyle: Style.t=?,
    ~contentInset: View.edgeInsets=?,
    // ~contentInsetAdjustmentBehavior: contentInsetAdjustmentBehavior=?,
    // ~contentOffset: contentOffset=?,
    ~decelerationRate: ScrollView.decelerationRate=?,
    ~directionalLockEnabled: bool=?,
    ~endFillColor: Color.t=?,
    ~fadingEdgeLength: float=?,
    ~horizontal: bool=?,
    ~indicatorStyle: ScrollView.indicatorStyle=?,
    // ~keyboardDismissMode: keyboardDismissMode=?,
    // ~keyboardShouldPersistTaps: keyboardShouldPersistTaps=?,
    ~maximumZoomScale: float=?,
    ~minimumZoomScale: float=?,
    ~nestedScrollEnabled: bool=?,
    ~onContentSizeChange: ((float, float)) => unit=?,
    ~onMomentumScrollBegin: Event.scrollEvent => unit=?,
    ~onMomentumScrollEnd: Event.scrollEvent => unit=?,
    ~onScroll: Event.scrollEvent => unit=?,
    ~onScrollBeginDrag: Event.scrollEvent => unit=?,
    ~onScrollEndDrag: Event.scrollEvent => unit=?,
    // ~overScrollMode: overScrollMode=?,
    ~pagingEnabled: bool=?,
    ~pinchGestureEnabled: bool=?,
    ~refreshControl: React.element=?,
    ~scrollEnabled: bool=?,
    ~scrollEventThrottle: int=?,
    ~scrollIndicatorInsets: View.edgeInsets=?,
    ~scrollPerfTag: string=?,
    ~scrollsToTop: bool=?,
    ~scrollToOverflowEnabled: bool=?,
    ~showsHorizontalScrollIndicator: bool=?,
    ~showsVerticalScrollIndicator: bool=?,
    // ~snapToAlignment: snapToAlignment=?,
    ~snapToEnd: bool=?,
    ~snapToInterval: float=?,
    ~snapToOffsets: array<float>=?,
    ~snapToStart: bool=?,
    ~stickyHeaderHiddenOnScroll: bool=?,
    ~stickyHeaderIndices: array<int>=?,
    ~zoomScale: float=?,
    // rescript-react-native 0.71.3 View props
    ~accessibilityActions: array<Accessibility.actionInfo>=?,
    ~accessibilityElementsHidden: bool=?,
    ~accessibilityHint: string=?,
    ~accessibilityIgnoresInvertColors: bool=?,
    ~accessibilityLabel: string=?,
    ~accessibilityLabelledBy: array<string>=?,
    ~accessibilityLanguage: string=?,
    ~accessibilityLiveRegion: Accessibility.liveRegion=?,
    ~accessibilityRole: Accessibility.role=?,
    // `role` has precedence over the accessibilityRole prop
    ~role: Role.t=?,
    ~accessibilityState: Accessibility.state=?,
    ~accessibilityValue: Accessibility.value=?,
    ~accessibilityViewIsModal: bool=?,
    ~accessible: bool=?,
    ~collapsable: bool=?,
    ~hitSlop: View.edgeInsets=?,
    ~importantForAccessibility: View.importantForAccessibility=?,
    ~nativeID: string=?,
    ~needsOffscreenAlphaCompositing: bool=?,
    ~onAccessibilityAction: Accessibility.actionEvent => unit=?,
    ~onAccessibilityEscape: unit => unit=?,
    ~onAccessibilityTap: unit => unit=?,
    ~onLayout: Event.layoutEvent => unit=?,
    ~onMagicTap: unit => unit=?,
    // Gesture Responder props
    ~onMoveShouldSetResponder: Event.pressEvent => bool=?,
    ~onMoveShouldSetResponderCapture: Event.pressEvent => bool=?,
    ~onResponderEnd: Event.pressEvent => unit=?,
    ~onResponderGrant: Event.pressEvent => unit=?,
    ~onResponderMove: Event.pressEvent => unit=?,
    ~onResponderReject: Event.pressEvent => unit=?,
    ~onResponderRelease: Event.pressEvent => unit=?,
    ~onResponderStart: Event.pressEvent => unit=?,
    ~onResponderTerminate: Event.pressEvent => unit=?,
    ~onResponderTerminationRequest: Event.pressEvent => bool=?,
    ~onStartShouldSetResponder: Event.pressEvent => bool=?,
    ~onStartShouldSetResponderCapture: Event.pressEvent => bool=?,
    ~pointerEvents: View.pointerEvents=?,
    ~removeClippedSubviews: bool=?,
    ~renderToHardwareTextureAndroid: bool=?,
    ~shouldRasterizeIOS: bool=?,
    ~style: Style.t=?,
    ~testID: string=?,
    ~children: React.element=?,
    // react-native-web 0.17 View props
    ~href: string=?,
    ~hrefAttrs: Web.hrefAttrs=?,
    // react-native-web 0.17 View props, ClickProps
    ~onClick: option<ReactEvent.Mouse.t => unit>=?,
    ~onClickCapture: option<ReactEvent.Mouse.t => unit>=?,
    ~onContextMenu: option<ReactEvent.Mouse.t => unit>=?,
    // react-native-web 0.17 View props, FocusProps
    ~onFocus: option<ReactEvent.Focus.t => unit>=?,
    ~onBlur: option<ReactEvent.Focus.t => unit>=?,
    // react-native-web 0.17 View props, KeyboardProps
    ~onKeyDown: option<ReactEvent.Keyboard.t => unit>=?,
    ~onKeyDownCapture: option<ReactEvent.Keyboard.t => unit>=?,
    ~onKeyUp: option<ReactEvent.Keyboard.t => unit>=?,
    ~onKeyUpCapture: option<ReactEvent.Keyboard.t => unit>=?,
    // react-native-web 0.17 View props, Mouse forwarded props
    ~onMouseDown: option<ReactEvent.Mouse.t => unit>=?,
    ~onMouseEnter: option<ReactEvent.Mouse.t => unit>=?,
    ~onMouseLeave: option<ReactEvent.Mouse.t => unit>=?,
    ~onMouseMove: option<ReactEvent.Mouse.t => unit>=?,
    ~onMouseOut: option<ReactEvent.Mouse.t => unit>=?,
    ~onMouseOver: option<ReactEvent.Mouse.t => unit>=?,
    ~onMouseUp: option<ReactEvent.Mouse.t => unit>=?,
  ) => React.element = "BottomSheetScrollView"
}

module BottomSheetFlatList = {
  @module("@gorhom/bottom-sheet") @react.component
  external make: (
    ~ref: ref=?,
    ~data: array<'item>,
    ~keyExtractor: ('item, int) => string,
    ~renderItem: VirtualizedList.renderItemCallback<'item>,
    ~style: Style.t=?,
    ~showsHorizontalScrollIndicator: bool=?,
    ~showsVerticalScrollIndicator: bool=?,
    ~snapToInterval: float=?,
    ~snapToAlignment: ScrollView.snapToAlignment=?,
    ~decelerationRate: ScrollView.decelerationRate=?,
    ~onScroll: Event.scrollEvent => unit=?,
    ~onViewableItemsChanged: VirtualizedList.viewableItemsChanged<'item> => unit=?,
    ~horizontal: bool=?,
    ~onStartShouldSetResponderCapture: Event.pressEvent => bool=?,
  ) => React.element = "BottomSheetFlatList"
}

module BottomSheetBackdrop = {
  @module("@gorhom/bottom-sheet") @react.component
  external make: (
    ~ref: ref=?,
    ~animatedIndex: int=?,
    ~animatedPosition: int=?,
    ~opacity: float=?,
    ~appearsOnIndex: int=?,
    ~disappearsOnIndex: int=?,
    ~enableTouchThrough: bool=?,
    ~onPress: unit => unit=?,
    ~style: ReactNative.Style.t=?,
    ~children: React.element=?,
  ) => React.element = "BottomSheetBackdrop"
}
