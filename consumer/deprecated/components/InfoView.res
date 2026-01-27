open ReactNative
open Style

@react.component
let make = (
  ~width=100.->pct,
  ~duration="40 min",
  ~destTitle="",
  ~destSubtitle="",
  ~destImage="",
  ~image=FromToArc.svg("vertical"),
) => {
  <View
    style={viewStyle(
      ~width=100.->pct,
      ~flexDirection=#row,
      ~justifyContent=#"space-between",
      ~borderRadius=8.,
      ~paddingHorizontal=16.->dp,
      ~paddingVertical=16.->dp,
      ~backgroundColor="#E6D0FF",
      ~alignItems=#center,
      (),
    )}>
    <View style={viewStyle(~alignItems=#"flex-start", ~justifyContent=#"space-between", ())}>
      <View style={viewStyle(~flexDirection=#row, ~alignItems=#center, ())}>
        <TextWrapper
          text=CUSTOM_TEXT({text: duration})
          color=ThemebasedStyle.colorClass.textBlack
          textType={Body_700}
        />
        <View style={viewStyle(~marginHorizontal=4.->dp, ~marginBottom=8.->dp, ())}>
          <Svg.SvgCss
            xml=image height=18. width=33. fill="#000000" onError={() => {()}} onLoad={() => {()}}
          />
        </View>
        <Svg.SvgCss
          xml=destImage
          height=11.
          width=10.87
          fill="#000000"
          onError={() => {()}}
          onLoad={() => {()}}
        />
        <TextWrapper
          text=CUSTOM_TEXT({text: destTitle})
          color=ThemebasedStyle.colorClass.textBlack
          textType={Body_700}
        />
      </View>
      <TextWrapper
        text=CUSTOM_TEXT({text: destSubtitle})
        color=ThemebasedStyle.colorClass.textMid
        textType={Cap_700}
      />
    </View>
    <View
      style={viewStyle(
        ~alignItems=#center,
        ~backgroundColor="#FCFCFD",
        ~paddingHorizontal=8.->dp,
        ~flexDirection=#row,
        ~gap=8.,
        ~paddingVertical=10.->dp,
        ~borderRadius=24.,
        (),
      )}>
      <Svg.SvgXml xml=PurpleCar.svg />
      <Svg.SvgXml xml=RightArrow.svg />
    </View>
  </View>
}
