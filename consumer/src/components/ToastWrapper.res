open ReactNative
open Style
open! Toast
open Tailwind

type defaultToastProps = {
  overrideDarkMode: bool,
  extraInsets: extraInsets,
  onToastHide: toastOption => unit,
  onToastPress: toastOption => unit,
  onToastShow: toastOption => unit,
  providerKey: string,
  defaultStyle: toastStyle,
}

@react.component
let make = (
  ~children: option<React.element>=?,
  ~overrideDarkMode as _: option<bool>=?,
  ~extraInsets as _: option<extraInsets>=?,
  ~onToastHide: option<toastOption => unit>=?,
  ~onToastPress: option<toastOption => unit>=?,
  ~onToastShow: option<toastOption => unit>=?,
  ~providerKey as _: option<string>=?,
) => {
  let intialToast: defaultToastProps = {
    overrideDarkMode: true,
    extraInsets: {top: 0, bottom: 0, right: 0, left: 0},
    onToastHide: _ => (),
    onToastPress: _ => (),
    onToastShow: _ => (),
    providerKey: "DEFAULT",
    defaultStyle: {
      view: viewStyle(~backgroundColor=ThemebasedStyle.colorClass.fillPositiveHigh, ()),
    },
  }
  let (toastProps, setToastProps) = React.useState(() => intialToast)
  let updateProperties = (
    ~overrideDarkMode: option<bool>=?,
    ~extraInsets: option<extraInsets>=?,
    ~onToastHide as _: option<toastOption>=?,
    ~onToastPress as _: option<toastOption>=?,
    ~onToastShow as _: option<toastOption>=?,
    ~providerKey as _: option<string>=?,
    ~defaultStyle: option<toastStyle>=?,
  ) => {
    Console.log2("Inside updateProperties", extraInsets)
    setToastProps(prevToastProps => {
      ...prevToastProps,
      overrideDarkMode: overrideDarkMode->Option.getOr(intialToast.overrideDarkMode),
      extraInsets: extraInsets->Option.getOr({top: 0, bottom: 0, right: 0, left: 0}),
      onToastHide: onToastHide->Option.getOr(intialToast.onToastHide),
      onToastPress: onToastPress->Option.getOr(intialToast.onToastPress),
      onToastShow: onToastShow->Option.getOr(intialToast.onToastShow),
      defaultStyle: defaultStyle->Option.getOr(intialToast.defaultStyle),
    })
  }

  <>
    <Toasts
      overrideDarkMode=toastProps.overrideDarkMode
      extraInsets=toastProps.extraInsets
      onToastHide=Some(toastProps.onToastHide)
      onToastPress=Some(toastProps.onToastPress)
      onToastShow=Some(toastProps.onToastShow)
      providerKey=toastProps.providerKey
      defaultStyle=toastProps.defaultStyle
    />
    <ToastContext.Provider value={updateProperties: updateProperties}>
      {children->Option.getOr({<> </>})}
    </ToastContext.Provider>
  </>
}

let myToast = (
  ~leftIcon: CustomButton.iconType=CustomIcon(<Svg.SvgXml xml=Close.rightArrow />),
  ~rightIcon: CustomButton.iconType=CustomIcon(<Svg.SvgXml xml={Close.svg("white")} />),
  ~bgColor="fillPositiveHigh",
  ~message: LocaleStringType.localeString,
  ~duration,
  ~\"type"=#blank,
  ~position=Toast.toInt(TOP),
  ~marginFromTop="0px",
  ~marginFromBottom="24px",
  ~disableShadow=true,
  ~visible=true,
  ~height=0,
  ~width=Float.toInt(ReactNative.Dimensions.get(#screen).width),
  ~animationConfig={
    flingPositionReturnDuration: 40,
    animationStiffness: 80,
    animationDuration: 300,
  },
) => {
  let screenWidth = ReactNative.Dimensions.get(#screen).width
  let toastIdRef = ref("")
  toastIdRef.contents = Toast.toast(
    ~message="",
    ~opts={
      \"type",
      position,
      duration,
      disableShadow,
      visible,
      height,
      width,
      animationConfig,
      customToast: _ => <>
        <ScreenWrapperWithSafeArearViewAndPadding paddingHorizontal={0.->dp}>
          <Reanimated.ReanimatedView
            style={tw(
              `w-[${Float.toString(
                  screenWidth,
                )}px] bg-transparent  flex justify-center items-center `,
            )}>
            <View
              style={tw(
                `flex-row justify-between items-center  w-[90%] py-1 bg-${bgColor} rounded-lg   ${position == 2
                    ? `bottom-[${marginFromBottom}]`
                    : `top-[${marginFromTop}]`}`,
              )}>
              <View style={tw("max-w-[90%] flex-row items-center justify-start pl-3 pr-4")}>
                {switch leftIcon {
                | CustomIcon(icon) => <View style={tw(" pr-3 ")}> icon </View>
                | NoIcon => <> </>
                }}
                <TextWrapper
                  text={message} textType={Body_600} overRideStyle={tw(" text-textWhite  ")}
                />
              </View>
              <View>
                {switch rightIcon {
                | CustomIcon(icon) =>
                  <View style={tw("pr-2 ")}>
                    <PressableComponent onPress={_ => Toast.dismiss(Some(toastIdRef.contents))}>
                      icon
                    </PressableComponent>
                  </View>
                | NoIcon => <> </>
                }}
              </View>
            </View>
          </Reanimated.ReanimatedView>
        </ScreenWrapperWithSafeArearViewAndPadding>
      </>,
    },
  )
}
