open ReactNative
open Style
open GestureDetector
open Reanimated

module AnmatingButtonView = {
  @react.component
  let make = (
    ~buttonWidth,
    ~swipeWidth,
    ~onSwipeComplete,
    ~backgroundColorSwipView,
    ~backgroundColor,
    ~height,
    ~width,
    ~animatedWidth: Reanimated.SharedValue.t<float>,
    ~borderRadius,
    ~text,
    ~isLoading=false,
    ~isPaymentFailed=true,
    ~setIsPaymentFailed,
  ) => {
    let extrapolateValue = Some(Reanimated.ExtrapolationType.asString("clamp"))
    let sliderVal = useSharedValue(0.0)
    let animatedStylesSwipeButton = switch buttonWidth {
    | Some(val) =>
      useAnimatedStyle(() =>
        viewStyle(
          ~transform=[
            ReactNative.Style.translateX(
              ~translateX=interpolate(sliderVal.value, [20., val], [0., val], extrapolateValue),
            ),
          ],
          (),
        )
      )
    | None => useAnimatedStyle(() => viewStyle())
    }
    let animatedStylesSwipeText = switch buttonWidth {
    | Some(btWidth) =>
      let swipeRange = btWidth -. swipeWidth
      useAnimatedStyle(() =>
        viewStyle(
          ~opacity=interpolate(sliderVal.value, [0., btWidth /. 3.], [1., 0.], extrapolateValue),
          ~transform=[
            ReactNative.Style.translateX(
              ~translateX=interpolate(
                sliderVal.value,
                [20., swipeRange],
                [0., btWidth /. 3.],
                extrapolateValue,
              ),
            ),
          ],
          (),
        )
      )
    | None => useAnimatedStyle(() => viewStyle())
    }

    let panGesture = switch buttonWidth {
    | Some(btWidth) => {
        let swipeRange = btWidth -. swipeWidth
        Gesture.makePan()
        ->Pan.onUpdate(e => {
          let newValue = e.translationX
          if newValue >= 0.0 && newValue <= swipeRange {
            sliderVal.value = newValue
          }
        })
        ->Pan.onEnd((_event, _success) => {
          if sliderVal.value < swipeRange -. swipeWidth -. 30. {
            sliderVal.value = withSpring(~toValue=0.0)
          } else {
            sliderVal.value = swipeRange -. 2.

            animatedWidth.value = withSpring(
              ~toValue=1.,
              ~userConfig={
                mass: Some(1.),
                stiffness: Some(180.),
                damping: Some(24.),
                overshootClamping: None,
                restDisplacementThreshold: None,
                restSpeedThreshold: None,
                velocity: None,
              },
            )
            setTimeout(() => {
              onSwipeComplete()
            }, 1000)->ignore
            Console.log("go back")
          }
        })
      }
    | None => Gesture.makePan()
    }
    React.useEffect(() => {
      if isPaymentFailed == true {
        sliderVal.value = withSpring(~toValue=0.0)
        animatedWidth.value = withSpring(~toValue=0.)
        setIsPaymentFailed(_ => false)
      }
      None
    }, [isPaymentFailed])

    let animatedSpinnerStyle = useAnimatedStyle(() =>
      viewStyle(
        ~opacity=interpolate(animatedWidth.value, [0.5, 1.], [0., 1.], extrapolateValue),
        (),
      )
    )

    <View
      style={viewStyle(
        ~height=height->dp,
        ~backgroundColor,
        ~borderRadius,
        ~alignItems=#center,
        ~justifyContent=#center,
        ~width,
        ~position=#relative,
        ~overflow=#hidden,
        (),
      )}>
      <AnimatedText
        style={array([viewStyle(~alignSelf=#center, ~zIndex=3, ()), animatedStylesSwipeText])}>
        <TextWrapper
          text={CUSTOM_TEXT({text: text})}
          textType={SHead_700}
          color=ThemebasedStyle.colorClass.textLow
        />
      </AnimatedText>
      <GestureDetector gesture={Gesture.pan(panGesture)}>
        <ReanimatedView
          style={array([
            viewStyle(
              ~alignSelf=#"flex-start",
              ~marginLeft=2.->dp,
              ~position=#absolute,
              ~height=95.->pct,
              ~width=swipeWidth->dp,
              ~borderRadius,
              ~backgroundColor=backgroundColorSwipView,
              ~alignItems=#center,
              ~justifyContent=#center,
              (),
            ),
            animatedStylesSwipeButton,
          ])}>
          {isLoading
            ? <ActivityIndicator color={"#171723"} />
            : <Svg.SvgXml xml=ButtonSwipe.svg width="70%" height="60%" />}
        </ReanimatedView>
      </GestureDetector>
      <ReanimatedView
        style={array([
          viewStyle(
            ~position=#absolute,
            ~alignSelf=#center,
            ~alignItems=#center,
            ~justifyContent=#center,
            (),
          ),
          animatedSpinnerStyle,
        ])}>
        <ActivityIndicator color="white" size={ActivityIndicator.Size.large} />
      </ReanimatedView>
    </View>
  }
}

@react.component
let make = (
  ~height=55.,
  ~backgroundColor=ThemebasedStyle.colorString.ctaPrimaryActive,
  ~backgroundColorSwipView="#C281FF",
  ~borderRadius=11.,
  ~width=100.->pct,
  ~text="Slide to book ride",
  ~swipeWidth=58.,
  ~onSwipeComplete=() => {()},
  ~isLoading=false,
  ~isPaymentFailed=true,
  ~setIsPaymentFailed,
) => {
  LogBox.ignoreLogs(["The final argument passed to useEffect"])
  let (buttonWidth, setButtonWidth) = React.useState(_ => None)
  let (screenWidth, _) = React.useState(_ => Dimensions.get(#screen).width -. 32.)

  let extrapolateValue = Some(Reanimated.ExtrapolationType.asString("clamp"))
  let animatedWidth = useSharedValue(0.0)

  let animatedButtonLoadingStyle = useAnimatedStyle(() =>
    viewStyle(
      ~width=dp(interpolate(animatedWidth.value, [0., 1.], [screenWidth, 55.], extrapolateValue)),
      ~borderRadius=interpolate(animatedWidth.value, [0., 1.], [12., 9999.], extrapolateValue),
      (),
    )
  )

  <ReanimatedView
    onLayout={(event: Event.layoutEvent) => {
      let nativeEvent = Event.LayoutEvent.nativeEvent(event)
      let width =
        nativeEvent
        ->JSON.Decode.object
        ->Option.getOr(Dict.make())
        ->Dict.get("layout")
        ->Option.getOr(JSON.Encode.null)
        ->JSON.Decode.object
        ->Option.getOr(Dict.make())
        ->Dict.get("width")
        ->Option.getOr(JSON.Encode.null)
        ->JSON.Decode.float
        ->Option.getOr(0.)
      width != 0. ? setButtonWidth(_ => Some(width)) : ()
    }}
    style={array([
      viewStyle(
        ~height=height->dp,
        ~backgroundColor,
        ~borderRadius,
        ~alignItems=#center,
        ~justifyContent=#center,
        ~alignSelf=#center,
        ~width,
        ~position=#relative,
        ~overflow=#hidden,
        (),
      ),
      animatedButtonLoadingStyle,
    ])}>
    {switch buttonWidth {
    | Some(_) =>
      <>
        <AnmatingButtonView
          buttonWidth
          swipeWidth
          onSwipeComplete
          backgroundColorSwipView
          borderRadius
          backgroundColor
          height
          width
          text
          isLoading
          animatedWidth
          isPaymentFailed
          setIsPaymentFailed
        />
      </>
    | None => React.null
    }}
  </ReanimatedView>
}
