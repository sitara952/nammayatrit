open ReactNavigation
open ReactNative
open Style
module Header = {
  // Module contents
  @react.component
  let make = (
    ~navigation,
    ~handleOnpress=() => (),
    ~showHamburger=true,
    ~showReferral=true,
    ~showCancelPopup=false,
  ) => {
    let (userProfile, _) = React.useContext(UserProfileContext.userProfileContext)
    <SafeAreaView>
      <View
        style={viewStyle(
          ~flexDirection=#row,
          ~justifyContent=#"space-between",
          ~width=100.->pct,
          (),
        )}
        pointerEvents=#auto>
        {showHamburger
          ? <Hamburger onPress={_ => Drawer.Navigation.toggleDrawer(navigation)} />
          : React.null}
        {showReferral
          ? <TouchableTextWithIcon
              paddingVertical={8.->dp}
              onPress={_ => {
                userProfile.referralCode == None
                  ? handleOnpress()
                  : {
                      Core.Navigation.navigateWithParams(
                        navigation,
                        AppRoutes.navigationRouts.bookARideNavigation,
                        {
                          "screen": AppRoutes.navigationRouts.referralScreen,
                        },
                      )
                    }
              }}
              iconSize={"20"}
              icon={Some(userProfile.referralCode == None ? Invite.referralSvg : Invite.addUser)}
              text={userProfile.referralCode == None ? "Have a referral code?" : "Invite friend"}
              componentType={CustomTagIcon({
                backgroundColor: "white",
                color: "black",
                strokeColor: "white",
              })}
            />
          : React.null}
      </View>
    </SafeAreaView>
  }
}
@react.component
let make = (
  ~sheetRef=?,
  ~children,
  ~showCancelPopup=false,
  ~header=() => React.null,
  ~sheetComponent,
  ~initialIndex=0.,
  ~snapPoints as defaultSnapPoints=["18%", "55%", "75%", "85%"],
  ~arrayLength=?,
  ~showBottomSheetHandle=true,
  ~bottomSheetHandleColor="#E5E5E5",
  ~backgroundColor="#FFFFFF",
  ~footer=React.null,
  ~onClose=() => (),
  ~enablePanDownToClose=false,
  ~keyboardBehavior="interactive",
  ~android_keyboardInputMode="adjustPan",
  ~bottomSheetHeader=React.null,
) => {
  let bottomSheetRef = switch sheetRef {
  | Some(ref) => ref
  | None => React.useRef(Nullable.null)
  }
  Console.log2("arrayLength", arrayLength)

  let snapPoints = switch arrayLength {
  | Some(0) => ["15%", "15%", "15%", "15%"]
  | Some(1) => ["18%", "25%", "30%", "40%"]
  | Some(2)
  | Some(3) => ["20%", "40%", "65%", "65%"]
  | Some(4) => ["30%", "40%", "55%", "75%"]
  | Some(_arrLen) => ["30%", "40%", "55%", "85%"]
  | None => defaultSnapPoints
  }

  let (currentSnapPoint, setCurrentSnapPoint) = React.useState(_ => {
    switch snapPoints->Array.get(initialIndex->Belt.Int.fromFloat) {
    | Some(snapPoint) => {
        let stringValue = Js.String.replace("%", "", snapPoint)
        let snapValue = Some(stringValue->Js.Float.fromString)
        snapValue
      }
    | None => None
    }
  })
  Console.log2("snapPoints", snapPoints)
  let snapToIndex = React.useCallback(index => {
    bottomSheetRef.current
    ->Nullable.toOption
    ->Option.forEach((val: GorhomBottomSheet.element) => {
      val.snapToIndex(index)
    })
  }, [])
  let handleClosePress = React.useCallback(() => {
    bottomSheetRef.current
    ->Nullable.toOption
    ->Option.forEach((val: GorhomBottomSheet.element) => {
      val.close()
    })
  }, [])
  let handleExpandPress = React.useCallback(() => {
    bottomSheetRef.current
    ->Nullable.toOption
    ->Option.forEach((val: GorhomBottomSheet.element) => {
      val.expand()
    })
  }, [])
  let handleOnChange = React.useCallback(index => {
    switch snapPoints->Array.get(index) {
    | Some(snapPoint) => {
        let stringValue = Js.String.replace("%", "", snapPoint)
        let snapValue = Some(stringValue->Js.Float.fromString)
        if currentSnapPoint !== snapValue {
          setCurrentSnapPoint(_ => snapValue)
        }
      }
    | None => ()
    }
  }, [])

  <View
    style={viewStyle(
      ~width=100.->pct,
      ~height=100.->pct,
      ~flexDirection=#row,
      ~justifyContent=#"space-between",
      ~backgroundColor="#FFFFFF00",
      ~position=#absolute,
      (),
    )}
    pointerEvents={#"box-none"}>
    {children}
    <View
      style={viewStyle(
        ~position=#absolute,
        ~top=10.->dp,
        ~width=100.->pct,
        ~paddingHorizontal=15.->dp,
        ~paddingTop=15.->dp,
        (),
      )}
      pointerEvents={#"box-none"}>
      {header()}
    </View>
    <CustomBottomSheet
      bottomSheetRef
      initialIndex
      snapPoints
      handleOnChange
      showBottomSheetHandle
      bottomSheetHandleColor
      backgroundColor
      footer
      onClose
      enablePanDownToClose
      keyboardBehavior
      bottomSheetHeader
      android_keyboardInputMode>
      {sheetComponent(~snapToIndex, ~handleClosePress, ~handleExpandPress, ~currentSnapPoint)}
    </CustomBottomSheet>
  </View>
}

let closeBottomSheet = (
  sheetRef: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
) => {
  sheetRef.current
  ->Nullable.toOption
  ->Option.forEach((val: GorhomBottomSheet.element) => {val.close()})
}

let expandBottomSheet = (
  sheetRef: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
) => {
  sheetRef.current
  ->Nullable.toOption
  ->Option.forEach((val: GorhomBottomSheet.element) => {val.expand()})
}

let collapseBottomSheet = (
  sheetRef: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
) => {
  sheetRef.current
  ->Nullable.toOption
  ->Option.forEach((val: GorhomBottomSheet.element) => {val.collapse()})
}
