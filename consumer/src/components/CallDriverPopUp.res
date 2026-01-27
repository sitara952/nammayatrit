open ReactNative
open Style
open Tailwind

type callDriverModalType = {
  anonymousNmmber: option<string>,
  driectCallNumber: option<string>,
  onClosePress: unit => unit,
}

@react.component
let make = (~callDriverData: callDriverModalType) => {
  let callDriverView = {
    <View
      style={viewStyle(
        ~flexDirection=#column,
        ~justifyContent=#"space-between",
        ~paddingBottom=16.->dp,
        (),
      )}>
      <Seperator margin=16. height=1. color="#E0E3E8" />
      <TouchableOpacity
        onPress={_ =>
          switch callDriverData.anonymousNmmber {
          | Some(number) => Linking.openURL("tel:" ++ number)->ignore
          | None => callDriverData.onClosePress()
          }}
        style={viewStyle(
          ~flexDirection=#row,
          ~alignItems=#center,
          ~paddingTop=4.->dp,
          ~paddingRight=4.->dp,
          ~paddingBottom=4.->dp,
          ~paddingLeft=4.->dp,
          (),
        )}>
        <View style={viewStyle(~justifyContent=#center, ())}>
          <Svg.SvgXml xml=AnonymousCallerIcon.svg width={"24"} height={"24"} />
        </View>
        <View
          style={viewStyle(~marginLeft=12.->dp, ~marginRight=22.->dp, ~flexDirection=#column, ())}>
          <View style={viewStyle(~flexDirection=#row, ())}>
            <TextWrapper
              text={ANONYMOUS_CALL} textType={SHead_700} color=ThemebasedStyle.colorClass.textBlack
            />
            <View
              style={array([
                viewStyle(
                  ~flexDirection=#row,
                  ~alignItems=#center,
                  ~paddingTop=2.->dp,
                  ~paddingRight=8.->dp,
                  ~paddingBottom=2.->dp,
                  ~paddingLeft=8.->dp,
                  ~borderRadius=14.,
                  ~marginLeft=8.->dp,
                  (),
                ),
                tw(ThemebasedStyle.colorClass.fillPositiveHigh),
              ])}>
              <TextWrapper
                text={RECOMMENDED} textType={SBody_600} color=ThemebasedStyle.colorClass.textWhite
              />
            </View>
          </View>
          <TextWrapper
            text={YOUR_NUMBER_WILL_NOT_BE_SHOWN_}
            textType={SBody_600}
            color=ThemebasedStyle.colorClass.textHigh
          />
        </View>
      </TouchableOpacity>
      <Seperator margin=16. height=1. color="#E0E3E8" />
      <TouchableOpacity
        onPress={_ =>
          switch callDriverData.driectCallNumber {
          | Some(number) => Linking.openURL("tel:" ++ number)->ignore
          | None => callDriverData.onClosePress()
          }}
        style={viewStyle(
          ~flexDirection=#row,
          ~alignItems=#center,
          ~paddingTop=4.->dp,
          ~paddingRight=4.->dp,
          ~paddingBottom=4.->dp,
          ~paddingLeft=4.->dp,
          (),
        )}>
        <View style={viewStyle(~justifyContent=#center, ())}>
          <Svg.SvgXml xml=CallIcon.svg width={"24"} height={"24"} />
        </View>
        <View
          style={viewStyle(~marginLeft=12.->dp, ~marginRight=22.->dp, ~flexDirection=#column, ())}>
          <View style={viewStyle(~flexDirection=#row, ())}>
            <TextWrapper
              text={DIRECT_CALL} textType={SHead_700} color=ThemebasedStyle.colorClass.textBlack
            />
          </View>
          <TextWrapper
            text={YOUR_NUMBER_WILL_BE_VISIBLE_}
            textType={SBody_600}
            color=ThemebasedStyle.colorClass.textHigh
          />
        </View>
      </TouchableOpacity>
    </View>
  }

  <PopUpModal
    popUpModalType=PopUpModal.PopUp2({
      title: {CALL_DRIVER},
      onClose: Some(callDriverData.onClosePress),
      children: callDriverView,
      button1: None,
      button2: None,
    })
  />
}
