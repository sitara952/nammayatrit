open Tailwind
open Reanimated
open ReactNative
open Style

// Define a type for your feedback items
type feedbackItem = {
  icon: React.element,
  title: string,
}

module FeedbackItem = {
  @react.component
  let make = (~index, ~item, ~isSelected, ~onSelect) => {
    <Pressable
      style={interactionState =>
        array([
          tw("px-5"),
          tw(interactionState.pressed ? "bg-[#E0E3E8]" : ""),
          tw(isSelected ? "bg-[#F1F2F7]" : ""),
        ])}
      onPress={_ => onSelect(index)}>
      {_interactionState =>
        <ReanimatedView
          style={tw(
            "flex flex-row items-center justify-between border-b-[1px] border-[#E0E3E8] py-4",
          )}>
          <ReanimatedView style={tw("flex flex-row items-center")}>
            <IconWrapper icon={() => item.icon} size="h-5" />
            <TextWrapper
              text={CUSTOM_TEXT({text: item.title})}
              textType={SHead_700}
              overRideStyle={tw("text-[#5C6A77] leading-[22px] pl-2.5")}
            />
          </ReanimatedView>
          {isSelected
            ? <IconWrapper size="h-5" icon={() => <TickIcon fill="#161622" />} />
            : React.null}
        </ReanimatedView>}
    </Pressable>
  }
}

module FeedbackList = {
  @react.component
  let make = (~feedbackList: array<feedbackItem>, ~selectedIndex, ~onSelect: int => unit) => {
    <FlatList
      keyExtractor={(_, index) => Belt.Int.toString(index)}
      scrollEnabled={false}
      style={tw("pt-4")}
      data={feedbackList}
      renderItem={({item, index}) => {
        let isSelected = selectedIndex === Some(index)
        <FeedbackItem index item={item} isSelected={isSelected} onSelect />
      }}
    />
  }
}

@react.component
let make = (~bottomSheetRef: GorhomBottomSheet.element) => {
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)

  let feedbackList: array<feedbackItem> = [
    {icon: <FeedbackIcons.DriverAbusive />, title: "The driver is abusive"},
    {icon: <FeedbackIcons.CarUnhygienic />, title: "The car is unhygienic"},
    {icon: <FeedbackIcons.DriverLate />, title: "Driver arrived very late"},
    {icon: <FeedbackIcons.RashDriver />, title: "Dangerous and rash driving"},
  ]

  let (selectedFeedbackIndex, setSelectedFeedbackIndex) = React.useState(() => None)
  let (customFeedback, setCustomFeedback) = React.useState(() => None)
  let (isSubmitEnabled, setIsSubmitEnabled) = React.useState(() => false)

  let handleOnBlur = () => {
    bottomSheetRef.collapse()
  }

  let handleFeedbackSelection = (index: int) => {
    Console.log2("Selected index", index)
    setSelectedFeedbackIndex(_ => Some(index))
    setCustomFeedback(_ => None)
    setIsSubmitEnabled(_ => true)
  }

  let handleCustomFeedback = (text: string) => {
    Console.log2("Custom feedback", text)
    setCustomFeedback(_ => Some(text))
    setSelectedFeedbackIndex(_ => None)
    if text === "" {
      setIsSubmitEnabled(_ => false)
    } else {
      setIsSubmitEnabled(_ => true)
    }
  }

  let handleFeedbackSubmit = () => {
    Console.log("Feedback submitted")
    if selectedFeedbackIndex !== None {
      Console.log2("Selected feedback", feedbackList[selectedFeedbackIndex->Option.getExn])
    } else if customFeedback !== None {
      Console.log2("Custom feedback", customFeedback)
    }
    // TODO: call feedback submit API
    rideFlowAction(UpdateRideDetail(None))
  }

  <GorhomBottomSheet.BottomSheetView style={tw("pt-5")}>
    <ReanimatedView style={tw("px-5")}>
      <IconWrapper size="h-10" icon={() => <FeedbackIcons.UnhappyIcon />} />
      <TextWrapper
        textType={Head_800} text={LET_US_KNOW_THE_ISSUES_YOU_FACED} overRideStyle={tw("pt-4")}
      />
    </ReanimatedView>
    <FeedbackList
      feedbackList
      selectedIndex={selectedFeedbackIndex}
      onSelect={index => handleFeedbackSelection(index)}
    />
    <GorhomBottomSheet.BottomSheetTextInput
      style={tw("text-[17px] font-bold h-11 mx-5 rounded-full mt-4")}
      placeholder="Express your issue"
      placeholderTextColor="#B2B9C7"
      //   TODO: Collapse the sheet onBlur using the ref from context
      onBlur={handleOnBlur}
      onFocus={() => ()}
      onChangeText={text => handleCustomFeedback(text)}
    />
    <ReanimatedView style={tw("px-5 pt-7")}>
      <FullWidthButton
        //   TODO: Programmatically enable/disable button
        isButtonDisabled={!isSubmitEnabled}
        text="Submit"
        handlePress={_ => handleFeedbackSubmit()}
      />
    </ReanimatedView>
    <ReanimatedView style={tw("px-5 pt-2")}>
      <FullWidthButton
        hasArrowRight=true
        noBackgroundColor=true
        text="Skip"
        handlePress={_ => rideFlowAction(UpdateStage(HomeScreen))}
      />
    </ReanimatedView>
  </GorhomBottomSheet.BottomSheetView>
}
