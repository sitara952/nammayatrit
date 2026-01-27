open ReactNative
open Style

type snackBarType = SUCCESS | WARNING | ERROR | NONE

@react.component
let make = (
  ~textType=TextWrapper.Body_700,
  ~snackBarType=NONE,
  ~message="",
  ~buttonAction=_ => (),
) => {
  let backgroundColor = switch snackBarType {
  | SUCCESS => "#378C66"
  | WARNING => "#FCD818"
  | ERROR => "#EC4F2C"
  | NONE => "#00000090"
  }

  <View
    style={viewStyle(
      ~paddingHorizontal=10.0->dp,
      ~paddingVertical=5.0->dp,
      ~borderRadius=8.0,
      ~backgroundColor,
      ~flexDirection=#row,
      ~justifyContent=#"space-between",
      ~alignItems=#center,
      (),
    )}>
    <TextWrapper
      textType text=CUSTOM_TEXT({text: message}) overRideStyle={textStyle(~color="white", ())}
    />
    <TouchableTextWithIcon onPress={_ => ()} icon={Some(WhiteCancel.svg)} />
  </View>
}
