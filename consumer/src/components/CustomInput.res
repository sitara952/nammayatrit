open ReactNative
open Style

type iconType =
  | NoIcon
  | CustomIcon(React.element)

@react.component
let make = (
  ~state,
  ~setState,
  ~placeholder: LocaleStringType.localeString=LocaleStringType.ENTER_YOUR_TEXT_HERE,
  ~placeholderTextColor=None,
  ~width=100.->pct,
  ~height: float=47.,
  ~secureTextEntry=false,
  ~keyboardType=#default,
  ~iconLeft: iconType=NoIcon,
  ~iconRight: iconType=NoIcon,
  ~multiline: bool=false,
  ~heading="",
  ~mandatory=false,
  ~textContentType=#username,
  ~reference=None,
  ~autoFocus=false,
  ~clearTextOnFocus=false,
  ~maxLength=None,
  ~onKeyPress=?,
  ~enableCrossIcon=true,
  ~textAlign=None,
  ~onPressIconRight=?,
  ~isValid=true,
  ~selectTextOnFocus=false,
  ~showEyeIconaftersecureTextEntry=true,
  ~borderTopWidth=1.,
  ~borderBottomWidth=1.,
  ~borderLeftWidth=1.,
  ~borderRightWidth=1.,
  ~borderTopLeftRadius=7.,
  ~borderTopRightRadius=7.,
  ~borderBottomLeftRadius=7.,
  ~borderBottomRightRadius=7.,
  ~paddingLeft=13.->dp,
  ~paddingRight=13.->dp,
  ~onFocus=() => (),
  ~onBlur=() => (),
  ~textColor="black",
  ~editable=true,
  ~pointerEvents=#auto,
  ~fontSize=16.,
  ~enableShadow=true,
  ~selectionColor="",
  ~cursorColor=ThemebasedStyle.colorString.textBlack,
  ~paddingHorizontal=16.->dp,
  ~paddingBottom=16.->dp,
  ~backgroundColor="#F8F8FB",
  ~clearButtonMode=#"while-editing",
  ~inputBoxBackgroundColor=backgroundColor,
) => {
  let {
    placeholderColor,
    bgColor,
    focusedTextInputBoderColor,
    errorTextInputColor,
    normalTextInputBoderColor,
    shadowColor,
    shadowIntensity,
  } = ThemebasedStyle.useThemeBasedStyle()
  let shadowOffsetHeight = shadowIntensity
  let elevation = shadowIntensity
  let shadowRadius = shadowIntensity
  let shadowOpacity = 0.2
  let shadowOffsetWidth = 0.
  let (showPass, setShowPass) = React.useState(_ => secureTextEntry)
  let (isFocused, setIsFocused) = React.useState(_ => false)

  let focusedTextInputBoderColor = "rgba(0, 153, 255, 1)"
  // let errorTextInputColor = "rgba(218, 14, 15, 1)"
  // let normalTextInputBoderColor = "rgba(204, 210, 226, 0.75)"
  let _ = state != "" && secureTextEntry == false && enableCrossIcon
  let shadwoStyle = enableShadow
    ? viewStyle(
        ~elevation,
        ~shadowRadius,
        ~shadowOpacity,
        ~shadowOffset={
          offset(~width=shadowOffsetWidth, ~height=shadowOffsetHeight)
        },
        ~shadowColor,
        (),
      )
    : viewStyle()
  <View
    style={viewStyle(~width=100.->pct, ~paddingHorizontal, ~paddingBottom, ~backgroundColor, ())}>
    {heading != ""
      ? <TextWrapper
          //          fontFamily=IBMPlexSans_Medium
          textType={SHead_600}
          color=ThemebasedStyle.colorClass.textInfo
          text=CUSTOM_TEXT({text: heading})>
          {mandatory
            ? <TextWrapper
                //   fontFamily=IBMPlexSans_Regular
                color=ThemebasedStyle.colorClass.textNegative
                textType={SHead_600}
                text=CUSTOM_TEXT({text: "*"})
              />
            : React.null}
        </TextWrapper>
      : React.null}
    <View
      style={array([
        bgColor,
        viewStyle(
          ~backgroundColor=inputBoxBackgroundColor,
          ~borderTopWidth,
          ~borderBottomWidth,
          ~borderLeftWidth,
          ~borderRightWidth,
          ~borderTopLeftRadius,
          ~borderTopRightRadius,
          ~borderBottomLeftRadius,
          ~borderBottomRightRadius,
          ~height=height->dp,
          ~flexDirection=#row,
          ~borderColor=isValid
            ? isFocused ? focusedTextInputBoderColor : normalTextInputBoderColor
            : errorTextInputColor,
          ~width,
          ~paddingLeft,
          ~paddingRight,
          ~alignItems=#center,
          ~justifyContent=#center,
          (),
        ),
        shadwoStyle,
        // bgColor,
      ])}>
      {switch iconLeft {
      | CustomIcon(element) => <View style={viewStyle(~paddingRight=10.->dp, ())}> element </View>
      | NoIcon => React.null
      }}
      <TextInput
        ref=?reference
        clearButtonMode={enableCrossIcon ? clearButtonMode : #never}
        style={array([
          textStyle(
            ~flex=1.,
            ~fontStyle=#normal,
            ~color=textColor,
            ~fontSize,
            //  ~lineHeight=1.5,
            ~textAlign?,
            (),
          ),
          viewStyle(~height=100.->pct, ~width=100.->pct, ()),
        ])}
        secureTextEntry=showPass
        autoCapitalize=#none
        multiline
        selectTextOnFocus
        autoCorrect={false}
        clearTextOnFocus
        ?maxLength
        placeholder=GetLocale.getLocale(placeholder).text
        placeholderTextColor={placeholderTextColor->Option.getOr(placeholderColor)}
        value={state}
        ?onKeyPress
        onChangeText={text => {
          setState(text)
        }}
        keyboardType
        autoFocus
        textContentType
        onFocus={_ => {
          setIsFocused(_ => true)
          onFocus()
        }}
        onBlur={_ => {
          onBlur()
          setIsFocused(_ => false)
        }}
        editable
        pointerEvents
        selectionColor
        cursorColor
      />
      {switch iconRight {
      | NoIcon => React.null
      | CustomIcon(element) =>
        <TouchableOpacity activeOpacity=1. onPress=?onPressIconRight>
          <View
            style={viewStyle(
              ~flexDirection=#row,
              ~alignContent=#"space-around",
              ~backgroundColor=inputBoxBackgroundColor,
              (),
            )}>
            element
          </View>
        </TouchableOpacity>
      }}
      {secureTextEntry && showEyeIconaftersecureTextEntry
        ? {
            <TouchableOpacity
              style={viewStyle(~height=100.->pct, ~justifyContent=#center, ~paddingLeft=5.->dp, ())}
              onPress={_ => {setShowPass(prev => !prev)}}>
              <Text> {"eye"->React.string} </Text>
            </TouchableOpacity>
          }
        : React.null}
    </View>
  </View>
}
