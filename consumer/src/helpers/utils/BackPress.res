open ReactNative
open ReactNavigation
open Native

type backPressAction = Minimize | ExitApp | OnPress(unit => unit)

let hardwareBackPress = (action: backPressAction) => {
  useFocusEffect(() => {
    let onBackPress = () => {
      switch action {
      | Minimize => ()
      | ExitApp => BackHandler.exitApp()
      | OnPress(onPress) => onPress()
      }
      true
    }
    BackHandler.addEventListener(#hardwareBackPress, onBackPress)->ignore
    Some(() => BackHandler.removeEventListener(#hardwareBackPress, onBackPress))
  })
}
