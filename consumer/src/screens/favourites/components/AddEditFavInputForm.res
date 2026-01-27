open Reanimated
open FavouritesScreenUtils
open ReactNative
open Tailwind
open Style
open FavouriteFlowTypes

@react.component
let make = (
  ~isEditFavourite: bool,
  ~putFavorite: (
    SavedLocation.putSavedLocationBody,
    option<ReactQuery.mutateParams<SavedLocation.putSavedLocationBody, Js.Json.t, 'a, unit>>,
  ) => unit,
  ~deleteTag: string,
  ~postFavorite: (
    CreateSavedReqLocationReq.createSavedReqLocationReq,
    option<
      ReactQuery.mutateParams<
        CreateSavedReqLocationReq.createSavedReqLocationReq,
        result<APISuccess.aPISuccess, exn>,
        'a,
        'b,
      >,
    >,
  ) => unit,
  ~location: option<LocationTypes.location>,
  ~clearState: unit => unit,
) => {
  let favContext = React.useContext(FavouriteContext.context)
  let handleAddEditFavPress = (_: ReactNative.Event.pressEvent) => {
    handlePostFavEvent(
      isEditFavourite,
      putFavorite,
      favContext->Option.mapOr(
        {
          name: "",
          address: "",
          variantTag: OTHERS,
          placeId: None,
        },
        favContext => favContext.inputForm,
      ),
      deleteTag,
      favContext->Option.mapOr("", favContext => favContext.description),
      postFavorite,
      location,
    )->ignore
    clearState()
  }
  switch favContext {
  | Some(favContext) =>
    let isButtonDisabled = {
      favContext.inputForm.address == "" || favContext.inputForm.name->String.length < 3
    }
    <GorhomBottomSheet.BottomSheetView>
      <ReanimatedView style={array([tw("px-4")])}>
        <TextWrapper text={NAME} textType={Body_700} overRideStyle={tw("text-textHigh")} />
        <GorhomBottomSheet.BottomSheetTextInput
          placeholderTextColor=ThemebasedStyle.colorString.textMid
          editable={favContext.inputForm.variantTag != HOME &&
            favContext.inputForm.variantTag != WORK}
          placeholder=GetLocale.getLocale(TYPE_NAME_FOR_LOCATION).text
          style={array([
            tw(
              "py-4 pl-4 border-[1px] border-borderNeutralMid rounded-2xl text-[15px] font-semibold mt-3",
            ),
            favContext.inputForm.variantTag == HOME || favContext.inputForm.variantTag == WORK
              ? tw("bg-ctaSecondaryDisabled")
              : tw(""),
          ])}
          onChangeText={v => {
            favContext.setInputForm(inputForm => {...inputForm, name: v})
          }}
          value={favContext.inputForm.name}
          onFocus={() => ()}
          onBlur={() => ()}
        />
      </ReanimatedView>
      <ReanimatedView style={array([tw("px-4 pt-5")])}>
        <TextWrapper text={ADDRESS} textType={Body_700} overRideStyle={tw("text-textHigh")} />
        <GorhomBottomSheet.BottomSheetTextInput
          placeholderTextColor=ThemebasedStyle.colorString.textMid
          placeholder=GetLocale.getLocale(TYPE_NAME_FOR_LOCATION).text
          style={tw(
            "py-4 pl-4 border-[1px] border-borderNeutralMid rounded-2xl text-[15px] font-semibold mt-3",
          )}
          value={favContext.inputForm.address}
          onFocus={() => {
            favContext.setAddFavouriteFromSearch(_ => true)
            BottomSheetWrapper.expandBottomSheet(favContext.addFavouriteBottomsheetRef)
          }}
          onBlur={() => ()}
        />
      </ReanimatedView>
      <ReanimatedView style={array([tw("px-4 pt-5")])}>
        <TextWrapper text={CHOOSE_TAG} textType={Body_700} overRideStyle={tw("text-textHigh")} />
        <AddFavouriteTag />
      </ReanimatedView>
      <ReanimatedView style={tw("px-4 pt-5")}>
        <FullWidthButton
          isButtonDisabled
          text={isEditFavourite
            ? GetLocale.getLocale(EDIT_FAVOURITE).text
            : GetLocale.getLocale(ADD_FAVOURITE).text}
          handlePress=handleAddEditFavPress
        />
      </ReanimatedView>
    </GorhomBottomSheet.BottomSheetView>
  | None => React.null
  }
}
