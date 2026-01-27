open ReactNative
open Reanimated
open Tailwind

type popUpButton = {
  text: LocaleStringType.localeString,
  textColor?: string,
  backgroundColor?: string,
  enableBorder?: bool,
  onPress: unit => unit,
}

type popUp1 = {
  title: LocaleStringType.localeString,
  onClose: option<unit => unit>,
  primaryText: LocaleStringType.localeString,
  button1: option<popUpButton>,
  button2: option<popUpButton>,
}

type popUp2 = {
  title: LocaleStringType.localeString,
  onClose: option<unit => unit>,
  children: React.element,
  button1: option<popUpButton>,
  button2: option<popUpButton>,
}

type popUpModalType = PopUp1(popUp1) | PopUp2(popUp2)

module PopUp1 = {
  @react.component
  let make = (~popUp1: popUp1) => {
    <TouchableWithoutFeedback onPress={_ => ()}>
      <ReanimatedView style={tw(`p-5 bg-fillNeutralWhite relative rounded-t-3xl pr-4 pb-10`)}>
        <View style={tw(`pb-1 flex-row justify-between`)}>
          <TextWrapper text=popUp1.title textType={Head_800} overRideStyle={tw(`self-center`)} />
          {switch popUp1.onClose {
          | Some(onClose) =>
            <PressableComponent
              style={tw(`px-4 py-3 rounded-full bg-fillNeutralLow`)} onPress={_ => onClose()}>
              <Image
                source={Image.Source.fromRequired(
                  Packager.require("../resources/assets/png/cross_black.png"),
                )}
                style={tw(`w-3 h-3 self-center`)}
              />
            </PressableComponent>
          | None => React.null
          }}
        </View>
        <Seperator margin=10. height=1. color=ThemebasedStyle.colorString.borderNeutralMid />
        <View>
          <TextWrapper text=popUp1.primaryText textType={Body_600} overRideStyle={tw(`py-1.5`)} />
          {switch popUp1.button1 {
          | Some(button1) => {
              let backgroundColor = switch button1.backgroundColor {
              | Some(color) => color
              | None => "fillNeutralLow"
              }
              let textColor = switch button1.textColor {
              | Some(color) => color
              | None => "textNegative"
              }
              let enableBorder = switch button1.enableBorder {
              | Some(val) => val
              | None => false
              }
              <PressableComponent style={tw(`pt-4`)} onPress={_ => button1.onPress()}>
                <View
                  style={tw(
                    `bg-${backgroundColor} py-4 rounded-lg ${enableBorder &&
                      backgroundColor !== "ctaPrimaryActive"
                        ? "border-[1px] border-borderNeutralMid"
                        : ""}`,
                  )}>
                  <TextWrapper
                    text=button1.text
                    textType={SHead_700}
                    overRideStyle={tw(`text-center text-${textColor}`)}
                  />
                </View>
              </PressableComponent>
            }
          | None => React.null
          }}
          {switch popUp1.button2 {
          | Some(button2) => {
              let backgroundColor = switch button2.backgroundColor {
              | Some(color) => color
              | None => "ctaPrimaryActive"
              }
              let textColor = switch button2.textColor {
              | Some(color) => color
              | None => "textWhite"
              }
              let enableBorder = switch button2.enableBorder {
              | Some(val) => val
              | None => false
              }
              <PressableComponent style={tw(`pt-2.5 pb-5`)} onPress={_ => button2.onPress()}>
                <View
                  style={tw(
                    `bg-${backgroundColor} py-4 rounded-lg ${enableBorder &&
                      backgroundColor !== "ctaPrimaryActive"
                        ? "border-[1px] border-borderNeutralMid"
                        : ""}`,
                  )}>
                  <TextWrapper
                    text=button2.text
                    textType={SHead_700}
                    overRideStyle={tw(`text-center text-${textColor}`)}
                  />
                </View>
              </PressableComponent>
            }
          | None => React.null
          }}
        </View>
      </ReanimatedView>
    </TouchableWithoutFeedback>
  }
}

module PopUp2 = {
  @react.component
  let make = (~popUp2: popUp2) => {
    <TouchableWithoutFeedback onPress={_ => ()}>
      <ReanimatedView style={tw(`p-5 bg-fillNeutralWhite relative rounded-t-3xl pr-4 pb-10`)}>
        <View style={tw(`pb-1 flex-row justify-between`)}>
          <TextWrapper text=popUp2.title textType={Head_800} overRideStyle={tw(`self-center`)} />
          {switch popUp2.onClose {
          | Some(onClose) =>
            <PressableComponent
              style={tw(`px-4 py-3 rounded-full bg-fillNeutralLow`)} onPress={_ => onClose()}>
              <Image
                source={Image.Source.fromRequired(
                  Packager.require("../resources/assets/png/cross_black.png"),
                )}
                style={tw(`w-3 h-3 self-center`)}
              />
            </PressableComponent>
          | None => React.null
          }}
        </View>
        {popUp2.children}
        {switch popUp2.button1 {
        | Some(button1) => {
            let backgroundColor = switch button1.backgroundColor {
            | Some(color) => color
            | None => "fillNeutralLow"
            }
            let textColor = switch button1.textColor {
            | Some(color) => color
            | None => "textNegative"
            }
            let enableBorder = switch button1.enableBorder {
            | Some(val) => val
            | None => false
            }
            <PressableComponent style={tw(`pt-4`)} onPress={_ => button1.onPress()}>
              <View
                style={tw(
                  `bg-${backgroundColor} py-4 rounded-lg ${enableBorder &&
                    backgroundColor !== "ctaPrimaryActive"
                      ? "border-[1px] border-borderNeutralMid"
                      : ""}`,
                )}>
                <TextWrapper
                  text=button1.text
                  textType={SHead_700}
                  color=textColor
                  overRideStyle={tw(`text-center`)}
                />
              </View>
            </PressableComponent>
          }
        | None => React.null
        }}
        {switch popUp2.button2 {
        | Some(button2) => {
            let backgroundColor = switch button2.backgroundColor {
            | Some(color) => color
            | None => "ctaPrimaryActive"
            }
            let textColor = switch button2.textColor {
            | Some(color) => color
            | None => "textWhite"
            }
            let enableBorder = switch button2.enableBorder {
            | Some(val) => val
            | None => false
            }
            <PressableComponent style={tw(`pt-2.5 pb-6`)} onPress={_ => button2.onPress()}>
              <View
                style={tw(
                  `bg-${backgroundColor} py-4 rounded-lg ${enableBorder &&
                    backgroundColor !== "ctaPrimaryActive"
                      ? "border-[1px] border-borderNeutralMid"
                      : ""}`,
                )}>
                <TextWrapper
                  text=button2.text
                  textType={SHead_700}
                  overRideStyle={tw(`text-center`)}
                  color=textColor
                />
              </View>
            </PressableComponent>
          }
        | None => React.null
        }}
      </ReanimatedView>
    </TouchableWithoutFeedback>
  }
}

@react.component
let make = (~popUpModalType: popUpModalType) => {
  switch popUpModalType {
  | PopUp1(popUp1) => <PopUp1 popUp1 />
  | PopUp2(popUp2) => <PopUp2 popUp2 />
  }
}
