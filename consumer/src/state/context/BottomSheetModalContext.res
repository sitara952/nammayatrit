open ReactNative
open Style
open Tailwind

type bottomSheetModalType = {
  backgroundColor: string,
  modalComponent: option<React.element>,
  backgroundClick: unit => unit,
  onClose: unit => unit,
}

let defaultSetter = (_: bottomSheetModalType) => ()
let defaultState = {
  backgroundColor: "#171723b3",
  modalComponent: None,
  backgroundClick: () => (),
  onClose: () => (),
}
let defaultCloseModal = () => ()
let modalContext = React.createContext((defaultState, defaultSetter, defaultCloseModal))

module Provider = {
  let make = React.Context.provider(modalContext)
}

@react.component
let make = (~children) => {
  let (state, setState) = React.useState(_ => defaultState)
  let setState = React.useCallback1(val => {
    Console.log2("debug modal state changed", val)
    setState(_ => val)
  }, [setState])

  let sheetRef = React.useRef(Nullable.null)
  let closeModal = React.useCallback(() => {
    sheetRef.current
    ->Nullable.toOption
    ->Option.forEach((val: GorhomBottomSheet.element) => {
      val.close()
    })
  }, [])

  let onClose = () => {
    state.onClose()
    setState(defaultState)
  }

  <Provider value=(state, setState, closeModal)>
    {<View style={tw(`relative h-full w-full`)}>
      <View style={tw(`absolute h-full w-full`)}> children </View>
      {switch state.modalComponent {
      | Some(component) =>
        <View style={tw(`absolute h-full w-full bg-[#171723b3]`)}>
          <BottomSheetWrapper
            sheetRef
            initialIndex=0.
            snapPoints=["100%"]
            showBottomSheetHandle=false
            onClose
            enablePanDownToClose=true
            android_keyboardInputMode="adjustResize"
            sheetComponent={(
              ~snapToIndex as _,
              ~handleClosePress as _,
              ~handleExpandPress as _,
              ~currentSnapPoint as _,
            ) => {
              <GorhomBottomSheet.BottomSheetView
                style={viewStyle(~height=100.->pct, ~justifyContent=#"flex-end", ())}>
                <TouchableWithoutFeedback onPress={_ => state.backgroundClick()}>
                  <View style={viewStyle(~flex=1., ~justifyContent=#"flex-end", ())}>
                    {component}
                  </View>
                </TouchableWithoutFeedback>
              </GorhomBottomSheet.BottomSheetView>
            }}>
            {<> </>}
          </BottomSheetWrapper>
        </View>
      | None => React.null
      }}
    </View>}
  </Provider>
}
