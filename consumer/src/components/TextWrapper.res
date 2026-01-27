open ReactNative
open Style
open Tailwind

module BlurView = {
  @react.component
  let make = (~textWidth, ~textView) => {
    let (layoutWidth, setLayoutWidth) = React.useState(_ => 0.0)

    <View
      onLayout={layoutEvent => {
        let width = layoutEvent.nativeEvent.layout.width +. 1.
        setLayoutWidth(_ => width)
      }}>
      {textWidth > layoutWidth
        ? <Gradient.LinearGradient
            style={viewStyle(
              ~position=#absolute,
              ~top=0.->dp,
              ~bottom=0.->dp,
              ~right=0.->dp,
              ~width=30.->dp,
              ~zIndex=3,
              (),
            )}
            start={{x: 0.0, y: 0.0}}
            end={{x: 1., y: 0.0}}
            locations=[0., 1.]
            colors=["#FFFFFF00", "#FFFFFFFF"]
          />
        : React.null}
      <ScrollView horizontal=true scrollEnabled=false showsHorizontalScrollIndicator=false>
        textView
      </ScrollView>
    </View>
  }
}

type textType =
  | Disp_800
  | Title_900
  | Title_800
  | Head_900
  | Head_800
  | Head_700
  | SHead_800
  | SHead_700
  | SHead_600
  | Body_800
  | Body_700
  | Body_600
  | Body_400
  | SBody_800
  | SBody_700
  | SBody_600
  | SBody_400
  | Cap_700

type truncate =
  | Ellipsize(Text.ellipsizeMode)
  | Blur
  | None

@react.component
let make = (
  ~text: LocaleStringType.localeString,
  ~color=ThemebasedStyle.colorClass.textBlack,
  ~textType: textType,
  ~children: option<React.element>=?,
  ~overRideStyle=?,
  ~truncate: truncate=None,
  ~wrapeText=false,
  ~accessible=true,
  ~accessibilityLabel="Text view",
  ~accessibilityActions=[],
  ~onAccessibilityAction=?,
  ~marginBottom=0.->dp,
  ~marginTop=0.->dp,
  ~marginLeft=0.->dp,
  ~marginRight=0.->dp,
  ~numberOfLines=1,
) => {
  let textFont = switch textType {
  | Disp_800 => "Disp_800"
  | Title_900 => "Title_900"
  | Title_800 => "Title_800"
  | Head_900 => "Head_900"
  | Head_800 => "Head_800"
  | Head_700 => "Head_700"
  | SHead_800 => "sHead_800"
  | SHead_700 => "sHead_700"
  | SHead_600 => "sHead_600"
  | Body_800 => "Body_800"
  | Body_700 => "Body_700"
  | Body_600 => "Body_600"
  | Body_400 => "Body_400"
  | SBody_800 => "sBody_800"
  | SBody_700 => "sBody_700"
  | SBody_600 => "sBody_600"
  | SBody_400 => "sBody_400"
  | Cap_700 => "Cap_700"
  }
  let renderStyle = array([tw(textFont ++ " " ++ color)])
  let textStyle = array([
    renderStyle,
    textStyle(),
    viewStyle(
      ~flexWrap={wrapeText ? #wrap : #nowrap},
      ~marginLeft,
      ~marginRight,
      ~marginTop,
      ~marginBottom,
      (),
    ),
    overRideStyle->Option.getOr(textStyle()),
  ])

  let renderChildren = children =>
    switch children {
    | Some(children) => children
    | None => React.null
    }

  let (textWidth, setTextWidth) = React.useState(_ => 0.0)

  let accessibilityHint = switch GetLocale.getLocale(text).accessibilityHintOverride {
  | None => GetLocale.getLocale(text).text
  | Some(a) => a
  }

  {
    switch truncate {
    | None =>
      <Text
        style=textStyle
        accessible
        accessibilityLabel
        accessibilityHint
        accessibilityActions
        ?onAccessibilityAction>
        {React.string(GetLocale.getLocale(text).text)}
        {renderChildren(children)}
      </Text>

    | Blur =>
      <BlurView
        textWidth
        textView={<Text
          onLayout={layoutEvent => {
            let width = layoutEvent.nativeEvent.layout.width
            setTextWidth(_ => width)
          }}
          ellipsizeMode=#tail
          numberOfLines
          style=textStyle
          accessible
          accessibilityLabel
          accessibilityHint
          accessibilityActions
          ?onAccessibilityAction>
          {React.string(GetLocale.getLocale(text).text)}
          {renderChildren(children)}
        </Text>}
      />
    | Ellipsize(ellipsize) =>
      <Text
        numberOfLines
        ellipsizeMode=ellipsize
        style=textStyle
        accessible
        accessibilityLabel
        accessibilityHint
        accessibilityActions
        ?onAccessibilityAction>
        {React.string(GetLocale.getLocale(text).text)}
        {renderChildren(children)}
      </Text>
    }
  }
}
