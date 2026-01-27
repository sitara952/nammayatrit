let getBody = async (~tag, ~placeId, ~description, ~location) => {
  let body = await SavedLocation.postSavedLocation({
    tag,
    placeId,
    description,
    location,
  })
  CreateSavedReqLocationReq.decodeCreateSavedReqLocationReq(body)->Belt.Result.getExn
}
let handlePostFavEvent = async (
  isEditFavourite,
  putFavorite: (
    SavedLocation.putSavedLocationBody,
    option<
      ReactQuery.mutateParams<SavedLocation.putSavedLocationBody, RescriptCore.JSON.t, 'a, unit>,
    >,
  ) => unit,
  inputForm: FavouriteFlowTypes.favInputForm,
  deleteTag: string,
  description: string,
  postFavorite: (
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
  location: option<LocationTypes.location>,
) => {
  let titletag = inputForm.name->String.trim->String.toLowerCase
  let titletag = switch titletag {
  | "home" => "Home"
  | "work" => "Work"
  | val => val
  }
  switch isEditFavourite {
  | true =>
    putFavorite(
      {
        tag: titletag,
        placeId: inputForm.placeId,
        description,
        location,
        deleteTag,
      },
      None,
    )
  | false =>
    switch inputForm.placeId {
    | Some(_) =>
      postFavorite(
        await getBody(~tag=titletag, ~placeId=inputForm.placeId, ~description, ~location=None),
        None,
      )
    | None =>
      postFavorite(
        await getBody(~tag=inputForm.name->String.trim, ~placeId=None, ~description, ~location),
        None,
      )
    }
  }
}

let handleDeleteFav = (
  deleteFavorite: (
    string,
    option<ReactQuery.mutateParams<string, result<APISuccess.aPISuccess, exn>, 'a, 'b>>,
  ) => unit,
  deleteTag: string,
  setInputForm: (FavouriteFlowTypes.favInputForm => FavouriteFlowTypes.favInputForm) => unit,
  setDeleteTag: (string => string) => unit,
  setShowOptions: (bool => bool) => unit,
  addFavouriteBottomsheetRef: React.ref<RescriptCore.Nullable.t<GorhomBottomSheet.element>>,
) => {
  deleteFavorite(deleteTag, None)
  setInputForm(_ => {name: "", address: "", variantTag: OTHERS, placeId: None})
  setDeleteTag(_ => "")
  setShowOptions(_ => false)
  BottomSheetWrapper.closeBottomSheet(addFavouriteBottomsheetRef)
}
