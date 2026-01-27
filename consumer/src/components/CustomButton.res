open ReactNative
open Style
open Tailwind

type buttonState = Normal | LoadingButton | Completed | Disabled
type buttonType = Primary
type buttonSize = Medium | Small | Large

type iconType = CustomIcon(React.element) | NoIcon

external toSize: ReactNative.Animated.Interpolation.t => size = "%identity"

module Window = {
  @scope("window") @val
  external alert: string => unit = "alert"
}

@react.component
let make = (
  ~loadingText="Loading..",
  ~buttonState: buttonState=Normal,
  ~text=?,
  ~name as _=?,
  ~buttonType: buttonType=Primary,
  ~buttonSize: buttonSize=Medium,
  ~leftIcon: iconType=NoIcon,
  ~rightIcon: iconType=NoIcon,
  ~onPress=?,
  ~fullLength=true,
  ~linearGradientColorTuple=None,
  ~borderWidth=0.,
  ~borderRadius=8.,
  ~borderColor="#ffffff",
  ~useFlex=true,
  ~backgroundColor="#7435FC",
  ~shadowIntensity=?,
  ~overRideStyle: option<Style.t>=?,
  ~textType=TextWrapper.SBody_700,
) => {
  let fillAnimation = React.useRef(Animated.Value.create(0.)).current
  let {
    payNowButtonTextColor,
    payNowButtonShadowColor,
    payNowButtonShadowIntensity,
    component,
  } = ThemebasedStyle.useThemeBasedStyle()
  let shadowOffsetHeight = shadowIntensity->Option.getOr(payNowButtonShadowIntensity)
  let elevation = shadowIntensity->Option.getOr(payNowButtonShadowIntensity)
  let shadowRadius = shadowIntensity->Option.getOr(payNowButtonShadowIntensity)
  let shadowOpacity = 0.2
  let shadowOffsetWidth = 0.
  let viewFlex = useFlex ? 1.0 : 0.0
  let styles = {
    StyleSheet.create({
      "lengthStyle": fullLength ? viewStyle(~width=100.->pct, ()) : viewStyle(~width=300.->dp, ()),
      "buttonSizeClass": {
        switch buttonSize {
        | Small => viewStyle(~height=40.->dp, ())
        | Medium => viewStyle(~height=45.->dp, ())
        | Large => viewStyle(~height=52.->dp, ())
        }
      },
      "textColor": textStyle(~color=payNowButtonTextColor, ()),
      "buttonTextClass": switch buttonSize {
      | Small => textStyle(~fontSize=14., ~paddingHorizontal=6.->dp, ())
      | Medium => textStyle(~fontSize=17., ~paddingHorizontal=8.->dp, ())
      | Large => tw("text-base font-bold text-center tracking-tight")
      },
    })
  }
  // let iconSize = switch buttonSize {
  // | Small => 14.
  // | Medium => 16.
  // }

  // let iconColor = switch buttonState {
  // | Normal => "white"
  // | Loading => "#bbbbbb"
  // | Disabled => "#bbbbbb"
  // | Transparent => "#bbbbbb"
  // }

  let disabled = switch buttonState {
  | Normal => false
  | _ => true
  }
  let isdisabledColor = switch buttonState {
  | Disabled => true
  | _ => false
  }

  // let loaderIconColor = switch buttonType {
  // | Primary => Some(payNowButtonTextColor)
  // }

  let fillStyle = viewStyle(
    ~position=#absolute,
    ~top=0.->dp,
    ~bottom=0.->dp,
    ~right=0.->dp,
    ~opacity=0.4,
    ~backgroundColor={component.background},
    (),
  )
  let widthStyle = viewStyle(
    ~width=Animated.Interpolation.interpolate(
      fillAnimation,
      {
        inputRange: [0.0, 1.0],
        outputRange: ["95%", "0%"]->Animated.Interpolation.fromStringArray,
      },
    )->toSize,
    (),
  )

  let fillButton = () => {
    Animated.timing(
      fillAnimation,
      {
        toValue: 1.0->Animated.Value.Timing.fromRawValue,
        duration: 1800.0,
        useNativeDriver: false,
      },
    )->Animated.start()
  }

  <PressableComponent
    disabled
    style={array([
      viewStyle(
        ~justifyContent=#center,
        ~alignItems=#center,
        ~elevation,
        ~shadowRadius,
        ~shadowOpacity,
        ~width=100.->pct,
        ~height=100.->pct,
        ~shadowOffset={
          offset(~width=shadowOffsetWidth, ~height=shadowOffsetHeight /. 2.)
        },
        ~shadowColor=payNowButtonShadowColor,
        //  ~shadowRadius=3.,
        ~margin=1.->dp,
        ~borderRadius,
        ~borderWidth,
        ~borderColor,
        // ~overflow=#hidden,
        ~backgroundColor,
        (),
      ),
      styles["lengthStyle"],
      styles["buttonSizeClass"],
      overRideStyle->Option.getOr(viewStyle()),
    ])}
    onPress={switch onPress {
    | Some(val) =>
      x => {
        fillButton()
        val(x)
      }
    | None => _ => ()
    }}>
    <View
      style={array([
        viewStyle(
          ~flex=1.,
          ~flexDirection=#row,
          ~justifyContent=#center,
          ~alignItems=#center,
          ~borderRadius,
          ~overflow=#hidden,
          ~opacity={isdisabledColor ? 0.6 : 1.},
          (),
        ),
      ])}>
      // onPress={if Platform.os === #web {
      //   _ => Window.alert(name->Option.getOr("") ++ " Button Pressed")
      // } else {
      //   onPress->Option.getOr(_ => ())
      // }}
      {switch leftIcon {
      | CustomIcon(element) => element
      | NoIcon => React.null
      }}
      {if buttonState == LoadingButton {
        <Animated.View style={array([fillStyle, widthStyle])} />
      } else {
        React.null
      }}
      {switch text {
      | Some(textStr) =>
        textStr == ""
          ? React.null
          : <View
              style={viewStyle(~flex=viewFlex, ~alignItems=#center, ~justifyContent=#center, ())}>
              <TextWrapper
                text={switch buttonState {
                | LoadingButton =>
                  CUSTOM_TEXT({text: loadingText, accessibilityHintOverride: loadingText})
                | Completed =>
                  CUSTOM_TEXT({text: "Complete", accessibilityHintOverride: "Complete"})
                | _ => CUSTOM_TEXT({text: textStr, accessibilityHintOverride: textStr})
                }}
                textType
                color=ThemebasedStyle.colorClass.textWhite
              />
            </View>
      | None => React.null
      }}
      {if buttonState == LoadingButton || buttonState == Completed {
        //   <Loadericon iconColor=?loaderIconColor />
        React.null
      } else {
        switch rightIcon {
        | CustomIcon(element) => element
        | NoIcon => React.null
        }
      }}
    </View>
  </PressableComponent>
}
