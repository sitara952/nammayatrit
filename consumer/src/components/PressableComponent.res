open ReactNative
open Reanimated
open Style

@react.component
let make = (
  ~children,
  ~activeOpacity: float=1.,
  ~focusedOpacity: float=1.,
  ~hasTVPreferredFocus: bool=false,
  ~style: Style.t=viewStyle(),
  ~tvParallaxProperties: TV.parallax={
    enabled: false,
    shiftDistanceX: 2.,
    shiftDistanceY: 2.,
    tiltAngle: 0.05,
    magnification: 1.,
    pressMagnification: 1.,
    pressDuration: 0.3,
    pressDelay: 0.3,
  },
  ~accessible: bool=true,
  ~accessibilityElementsHidden: bool=true,
  ~accessibilityHint: string="",
  ~accessibilityIgnoresInvertColors: bool=false,
  ~accessibilityLabel: string="",
  ~accessibilityLanguage: string="",
  ~accessibilityLiveRegion: Accessibility.liveRegion=#none,
  ~accessibilityRole: Accessibility.role=#none,
  ~accessibilityViewIsModal: bool=false,
  ~delayLongPress: int=200,
  ~delayPressIn: int=0,
  ~delayPressOut: int=0,
  ~disabled: bool=false,
  ~hitSlop: View.edgeInsets={
    top: 0.,
    left: 0.,
    bottom: 0.,
    right: 0.,
  },
  ~importantForAccessibility: View.importantForAccessibility=#auto,
  ~onLayout: Event.layoutEvent => unit=_ => (),
  ~onPress: Event.pressEvent => unit=_ => (),
  ~onLongPress: Event.pressEvent => unit=_ => (),
  ~onPressIn: Event.pressEvent => unit=_ => (),
  ~onPressOut: Event.pressEvent => unit=_ => (),
  ~pressRetentionOffset: View.edgeInsets={
    top: 20.,
    left: 20.,
    bottom: 20.,
    right: 20.,
  },
  ~testID: string="",
  ~touchSoundDisabled: bool=false,
  ~href: string="",
  ~hrefAttrs: Web.hrefAttrs={
    target: #_blank,
    download: "",
    rel: #noopener,
  },
  ~onMouseDown: ReactEvent.Mouse.t => unit=_ => (),
  ~onMouseEnter: ReactEvent.Mouse.t => unit=_ => (),
  ~onMouseLeave: ReactEvent.Mouse.t => unit=_ => (),
  ~onMouseMove: ReactEvent.Mouse.t => unit=_ => (),
  ~onMouseOver: ReactEvent.Mouse.t => unit=_ => (),
  ~onMouseOut: ReactEvent.Mouse.t => unit=_ => (),
  ~onMouseUp: ReactEvent.Mouse.t => unit=_ => (),
) => {
  let scaleDownAnimation = useSharedValue(1.)
  let animatedStyle = useAnimatedStyle(() =>
    viewStyle(~transform=[ReactNative.Style.scale(~scale=scaleDownAnimation.value)], ())
  )

  <ReanimatedView style={array([animatedStyle])}>
    <TouchableOpacity
      activeOpacity
      focusedOpacity
      hasTVPreferredFocus
      style
      tvParallaxProperties
      accessible
      accessibilityElementsHidden
      accessibilityHint
      accessibilityIgnoresInvertColors
      accessibilityLabel
      accessibilityLanguage
      accessibilityLiveRegion
      accessibilityRole
      accessibilityViewIsModal
      delayLongPress
      delayPressIn
      delayPressOut
      disabled
      hitSlop
      importantForAccessibility
      onLayout
      onLongPress
      onPress={_ => ()}
      onPressIn={press => {
        scaleDownAnimation.value = withSpring(~toValue=0.95)
        onPressIn(press)
      }}
      onPressOut={press => {
        scaleDownAnimation.value = withSpring(~toValue=1.0)
        onPressOut(press)
        onPress(press)
      }}
      pressRetentionOffset
      touchSoundDisabled=false
      href
      testID
      onMouseDown
      onMouseEnter
      onMouseLeave
      onMouseMove
      onMouseOver
      onMouseOut
      onMouseUp>
      {children}
    </TouchableOpacity>
  </ReanimatedView>
}
