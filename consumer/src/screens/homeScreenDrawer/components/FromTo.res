open ReactNative
open Style
open Reanimated

external runOnUIHack: string => ReactNative.Style.angle = "%identity"

@react.component
let make = (~source, ~destination) => {
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)
  let translateX = useSharedValue(-100.0)
  let (componentHeight, setComponentHeight) = React.useState(_ => None)
  let _ = UseMapRoute.useMapRoute(None, componentHeight)
  let componentRef = React.useRef(Nullable.null)
  let (animationEnd, setAnimationEnd) = React.useState(_ => false)
  let animatedStyle = useAnimatedStyle(() =>
    viewStyle(
      ~transform=[
        ReactNative.Style.translateY(
          ~translateY=withTimingWithCallback(
            ~toValue=translateX.value,
            ~userOption={duration: 300.},
            ~callback=(_, _) => {
              runOnJS({
                setAnimationEnd
              })(_ => true)
            },
          ),
        ),
      ],
      (),
    )
  )

  React.useEffect(() => {
    switch Js.Nullable.toOption(componentRef.current) {
    | Some(view) =>
      ReactNative.View.measureInWindow(view, (~x as _, ~y, ~width as _, ~height) => {
        let height = Utils.dpToPercentageHeight(y +. height)
        if height > 0. {
          setComponentHeight(_ => Some(height +. 2.))
        }
      })
    | None => ()
    }
    None
  }, [animationEnd])

  React.useEffect(() => {
    translateX.value = 0.
    Some(
      () => {
        translateX.value = 0.
      },
    )
  }, [])

  let shadow = ShadowHook.useGetShadowStyle(
    ~shadowIntensity=0.,
    ~shadowColor=Platform.os == #ios ? "#00000050" : "#000000",
    ~elevation=30.,
    ~shadowOpacity=0.5,
    ~shadowRadius=8.,
    ~shadowOffsetHeight=15.,
    (),
  )

  <ReanimatedView
    ref={componentRef->ReactNative.Ref.value}
    style={array([
      viewStyle(
        ~flexDirection=#row,
        ~flexWrap=#nowrap,
        ~justifyContent=#center,
        ~width={(Dimensions.get(#screen).width -. 8.0)->dp},
        ~height=47.->dp,
        ~borderRadius=8.,
        ~paddingHorizontal=6.->dp,
        ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
        ~alignItems=#center,
        ~borderColor="#E0E3E8",
        ~borderWidth=1.,
        ~alignSelf=#center,
        (),
      ),
      shadow,
      animatedStyle,
    ])}>
    <View
      style={viewStyle(
        ~display=#flex,
        ~alignItems=#"flex-end",
        ~justifyContent=#"flex-end",
        ~height=25.->dp,
        ~flex=1.0,
        (),
      )}>
      <TouchableOpacity
        onPress={_ => {
          rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.Search(0)))
        }}>
        <TextWrapper
          textType={Body_600}
          text=CUSTOM_TEXT({text: source, accessibilityHintOverride: "destinationAddress"})
          truncate={Blur}
          overRideStyle={textStyle(
            ~color=ThemebasedStyle.colorString.textBlack,
            ~textAlign=#center,
            ~alignSelf=#"flex-end",
            (),
          )}
        />
      </TouchableOpacity>
    </View>
    <View
      style={viewStyle(
        ~alignSelf=#"flex-end",
        ~width=40.->dp,
        ~height=25.->dp,
        ~marginBottom=10.->dp,
        ~marginHorizontal=4.->dp,
        (),
      )}>
      <Svg.SvgXml xml=HorizontalArrow.svg width="100%" />
    </View>
    <View
      style={viewStyle(
        ~display=#flex,
        ~justifyContent=#"flex-start",
        ~alignItems=#"flex-start",
        ~height=25.->dp,
        ~flex=1.0,
        (),
      )}>
      <TouchableOpacity
        onPress={_ => {
          rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.Search(1)))
        }}>
        <TextWrapper
          textType={Body_600}
          text=CUSTOM_TEXT({text: destination, accessibilityHintOverride: "destinationAddress"})
          truncate={Blur}
          overRideStyle={textStyle(
            ~color=ThemebasedStyle.colorString.textPrimary,
            ~textAlign=#center,
            ~alignSelf=#"flex-end",
            (),
          )}
        />
      </TouchableOpacity>
    </View>
  </ReanimatedView>
}
