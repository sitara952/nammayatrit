open ReactNative
open Style

module BottomSheetHeader = {
  @react.component
  let make = (~bottomSheetHandleColor="#E5E5E5", ~backgroundColor="#FFFFFF") => {
    <View
      style={viewStyle(
        ~alignItems=#center,
        ~justifyContent=#center,
        ~padding=10.->dp,
        ~backgroundColor,
        ~borderTopLeftRadius=20.,
        ~borderTopRightRadius=20.,
        (),
      )}>
      <View
        style={viewStyle(
          ~backgroundColor=bottomSheetHandleColor,
          ~width=28.->dp,
          ~height=4.->dp,
          ~borderRadius=8.,
          (),
        )}
      />
    </View>
  }
}

@react.component
let make = (
  ~bottomSheetRef: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
  ~showBottomSheetHandle,
  ~bottomSheetHandleColor="#E5E5E5",
  ~backgroundColor,
  ~snapPoints=["20%", "55%", "75%", "95%"],
  ~initialIndex,
  ~children,
  ~backgroundHandleColor="#FFFFFF",
  ~footer=React.null,
  ~handleOnChange,
  ~isShadowStyle=true,
  ~onClose,
  ~enablePanDownToClose,
  ~keyboardBehavior,
  ~android_keyboardInputMode,
  ~bottomSheetHeader,
) => {
  let handleSheetAnimate = React.useCallback((~fromIndex as _: float, ~toIndex as _: float) => {
    ()
  }, [])

  let renderFooter = footerView => React.useCallback(props => {
      <GorhomBottomSheet.BottomSheetFooter {...props}>
        footerView
      </GorhomBottomSheet.BottomSheetFooter>
    }, [footer])

  <GorhomBottomSheet.BottomSheet
    index=initialIndex
    ref={bottomSheetRef->ReactNative.Ref.value}
    animateOnMount=true
    onChange=handleOnChange
    snapPoints
    onAnimate=handleSheetAnimate
    enableOverDrag=false
    backgroundComponent={_ => <View style={viewStyle(~backgroundColor, ())} />}
    handleComponent={_ => {
      showBottomSheetHandle
        ? <>
            {bottomSheetHeader}
            <BottomSheetHeader bottomSheetHandleColor backgroundColor />
          </>
        : {bottomSheetHeader}
    }}
    footerComponent={renderFooter(footer)}
    onClose
    enablePanDownToClose
    keyboardBehavior
    android_keyboardInputMode>
    {children}
  </GorhomBottomSheet.BottomSheet>
}
