open ReactNative
open Style

type borderConfig = {
  top: float,
  bottom: float,
  left: float,
  right: float,
}

type marginConfig = {
  top: float,
  bottom: float,
  left: float,
  right: float,
}

@react.component
let make = (
  ~onPress,
  ~heading=None,
  ~headingTextType: TextWrapper.textType=Body_600,
  ~subHeadingTextType: TextWrapper.textType=SBody_600,
  ~subHeading=None,
  ~location: option<LocationTypes.location>,
  ~prefixImage=HotelSearch.svg,
  ~postfixViewType=AutoComplete.Text,
  ~postfixViewAlignment=#"flex-start",
  ~postfixText="",
  ~feedbackDisabled=false,
  ~marginConfig={
    top: 0.,
    bottom: 0.,
    left: 0.,
    right: 0.,
  },
  ~paddingHorizontal=16.->dp,
  ~paddingVertical=10.->dp,
  ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
  ~borderColor=ThemebasedStyle.colorString.borderNeutralWhite,
  ~borderRadius=8.,
  ~borderConfig={
    top: 0.,
    bottom: 1.,
    left: 0.,
    right: 0.,
  },
) => {
  <TouchableHighlight
    underlayColor={feedbackDisabled ? backgroundColor : ThemebasedStyle.colorString.fillNeutralLow}
    onPress={_ =>
      switch location {
      | Some(loc) => onPress(loc)
      | None => ()
      }}
    style={viewStyle(
      ~width=100.->pct,
      // ~alignItems=#center,
      ~justifyContent=#"space-between",
      ~flexDirection=#row,
      ~paddingVertical,
      ~paddingHorizontal,
      ~borderBottomWidth=borderConfig.bottom,
      ~borderTopWidth=borderConfig.top,
      ~borderLeftWidth=borderConfig.left,
      ~borderRightWidth=borderConfig.right,
      ~borderColor,
      ~backgroundColor,
      ~borderRadius,
      ~marginTop=marginConfig.top->dp,
      ~marginBottom=marginConfig.bottom->dp,
      ~marginLeft=marginConfig.left->dp,
      ~marginRight=marginConfig.right->dp,
      (),
    )}>
    {<>
      {switch prefixImage {
      | "" => React.null
      | _ =>
        <View style={viewStyle(~marginRight=14.->dp, ~alignSelf=#center, ())}>
          <Svg.SvgXml xml=prefixImage height="25" width="25" />
        </View>
      }}
      <View style={viewStyle(~flexDirection=#column, ~height=100.->pct, ~flex=7., ())}>
        {switch heading {
        | Some(heading) =>
          <TextWrapper
            truncate=Ellipsize(#tail)
            textType=headingTextType
            overRideStyle={textStyle(~textAlign=#left, ())}
            text=CUSTOM_TEXT({text: heading})
          />
        | None => React.null
        }}
        {switch subHeading {
        | Some(subHeading) =>
          <>
            <Space height=6. />
            <TextWrapper
              truncate={Ellipsize(#tail)}
              overRideStyle={textStyle(
                ~textAlign=#left,
                ~color=ThemebasedStyle.colorString.textHigh,
                (),
              )}
              textType=subHeadingTextType
              text=CUSTOM_TEXT({text: subHeading})
            />
          </>
        | None => React.null
        }}
      </View>
      <View
        style={viewStyle(
          ~flex=2.,
          ~justifyContent=#"flex-end",
          ~alignItems=postfixViewAlignment,
          ~flexDirection=#row,
          (),
        )}>
        {switch postfixViewType {
        | CustomIcon(element) => element
        | Text =>
          <TextWrapper
            textType={SBody_600}
            overRideStyle={textStyle(~color=ThemebasedStyle.colorString.textHigh, ())}
            text=CUSTOM_TEXT({text: postfixText})
          />
        | NoIcon => React.null
        }}
      </View>
    </>}
  </TouchableHighlight>
}
