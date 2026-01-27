open ReactNative
open Style
open Suggestions
open! Reanimated

type messageType = USER | DRIVER

type messageData = {
  message: string,
  sentBy: messageType,
  timestamp: string,
}

@react.component
let make = (
  ~item: messageData,
  ~backgroundColor,
  ~borderTopRightRadius=0.,
  ~borderTopLeftRadius=16.0,
  ~alignSelf=#"flex-end",
  ~textcolor,
  ~shouldAnimate,
) => {
  <ReanimatedView
    entering={shouldAnimate
      ? LayoutAnimation.duration(
          item.sentBy == USER ? LayoutAnimation.slideInRight : LayoutAnimation.slideInLeft,
          500.,
        )
      : {LayoutAnimation.duration(LayoutAnimation.fadeIn, 1.)}}
    style={Style.array([
      viewStyle(
        ~flexDirection=#column,
        ~flex=1.,
        ~paddingHorizontal=12.->dp,
        ~paddingVertical=9.->dp,
        ~marginLeft=16.->dp,
        ~marginRight=16.->dp,
        ~borderRadius=18.,
        ~alignItems=#center,
        ~justifyContent=#"flex-end",
        ~alignSelf,
        ~backgroundColor,
        (),
      ),
    ])}>
    <TextWrapper
      text=CUSTOM_TEXT({text: getMessages(item.message)}) textType={SBody_600} color=textcolor
    />
  </ReanimatedView>
}
