open Reanimated
open Tailwind
open ReactNative
open Style

type tipItemHandleRenderProps = {
  item: float,
  index: float,
}

module TipItem = {
  @react.component
  let make = (~item: float, ~index: int, ~isSelected: bool, ~onSelect) => {
    <ReanimatedView>
      <PressableComponent onPress={_ => onSelect(index)}>
        <ReanimatedView
          style={array([
            tw("px-4 py-[11px] rounded-[20px] border-[1px]"),
            tw(index != 0 ? "ml-4" : ""),
            tw(isSelected ? "bg-[#161622] border-[#161622]" : "bg-white border-[#EBEBEE]"),
          ])}>
          <TextWrapper
            text={CUSTOM_TEXT({text: `$ ${Float.toString(item)}`})}
            textType={Head_700}
            overRideStyle={tw(isSelected ? "text-white" : "text-[#2E2C2F]")}
          />
        </ReanimatedView>
      </PressableComponent>
    </ReanimatedView>
  }
}

module TipList = {
  @react.component
  let make = (~tipValues: array<float>, ~selectedIndex: option<int>, ~onSelect) => {
    <FlatList
      keyboardShouldPersistTaps={#handled}
      keyExtractor={(_, index) => Belt.Int.toString(index)}
      contentContainerStyle={tw("pl-5 mt-4")}
      style={tw("overflow-visible")}
      data={tipValues}
      renderItem={({item, index}) => {
        let isSelected = Some(index) == selectedIndex
        <TipItem item={item} index={index} isSelected={isSelected} onSelect />
      }}
      horizontal=true
      showsHorizontalScrollIndicator={false}
    />
  }
}

@react.component
let make = (
  ~params: DriverFeedbackType.driverFeedbackParams,
  ~bottomSheetRef: GorhomBottomSheet.element,
) => {
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)

  let tipValues: array<float> = [3., 5., 7., 10.]
  let (selectedTipIndex, setSelectedTipIndex) = React.useState(() => None)
  let (customTip, setCustomTip) = React.useState(() => None)
  let (tipValue: option<float>, setTipValue) = React.useState(() => None)
  let (isAddTipButtonEnabled, setIsAddTipButtonEnabled) = React.useState(() => false)

  let handleOnBlur = () => {
    bottomSheetRef.collapse()
  }

  let handleOnTipSelect = (index: int) => {
    setSelectedTipIndex(_ => Some(index))
    setTipValue(_ => tipValues[index])
    setIsAddTipButtonEnabled(_ => true)
  }

  let handleCustomTip = (text: string) => {
    // let cleanText = text.replace(/\$/g, "");
    // // Add a single `$` at the beginning
    // if (cleanText.length === 0) {
    //   setCustomTipValue("");
    // } else {
    //   setCustomTipValue("$" + cleanText);
    // }
    setCustomTip(_ => Some(text))
    setSelectedTipIndex(_ => None)
    setCustomTip(_ => Some(text))
    if text === "" {
      setIsAddTipButtonEnabled(_ => false)
    } else {
      setIsAddTipButtonEnabled(_ => true)
    }
  }

  let handleAddTip = () => {
    Console.log("Tip added")

    if tipValue->Option.isSome {
      let addTipReq: Payment.addTipRequest = {
        amount: {currency: USD, amount: tipValue->Option.getExn},
      }

      ApiCall.callPostAPI(
        ~url=ApiRoutes.apiRoutes.addTip(params.rideId),
        ~body={addTipReq->Payment.encodeAddTipRequest},
        ~onSuccess=resp => {
          Console.log2("Tip added", resp)
          rideFlowAction(UpdateRideDetail(None))
        },
        ~onError=err => {
          Console.log2("Error adding tip", err)
        },
      )->ignore
    } else {
      Console.log("No tip value")
    }
  }

  <GorhomBottomSheet.BottomSheetView style={tw("pt-5")}>
    <ReanimatedView style={tw("px-5")}>
      <IconWrapper size="h-10" icon={() => <TipIcon />} />
      <TextWrapper
        text={PLEASE_ADD_TIP_TO_YOUR_DRIVER} textType={Head_800} overRideStyle={tw("pt-4")}
      />
    </ReanimatedView>
    <TipList tipValues selectedIndex={selectedTipIndex} onSelect={handleOnTipSelect} />
    <ReanimatedView style={tw("h-[1px] w-full bg-[#F1F2F7] mx-5 mt-[22px]")} />
    <GorhomBottomSheet.BottomSheetTextInput
      style={tw(
        "text-[17px] font-bold px-4 h-11 w-[170px] border-[1.5px] border-[#14171F] ml-5 rounded-full mt-5",
      )}
      placeholder="Add custom tip"
      placeholderTextColor="#14171F"
      inputMode=#numeric
      value={customTip->Option.getOr("")}
      onChangeText={handleCustomTip}
      onBlur={handleOnBlur}
      onFocus={() => ()}
      maxLength={3}
    />
    <ReanimatedView style={tw("px-5 pt-7")}>
      <FullWidthButton
        //   TODO: Programmatically enable the button, when a tip is selected
        isButtonDisabled={!isAddTipButtonEnabled}
        prefix={<IconWrapper icon={() => <TipIcon fill="white" />} size={"h-5"} />}
        text="Add tip"
        handlePress={_ => handleAddTip()}
      />
    </ReanimatedView>
    <ReanimatedView style={tw("px-5 pt-2")}>
      <FullWidthButton hasArrowRight=true noBackgroundColor=true text="Skip" />
    </ReanimatedView>
  </GorhomBottomSheet.BottomSheetView>
}
