open ReactNative
open Style

// TODO: Make it dynamic to support image path as well along with image uri's
@react.component
let make = (~uri, ~style=imageStyle(~width=300.->dp, ~height=100.->dp, ())) => {
  let assetsDict: Js.Dict.t<bool> = switch AssetsHelper.decodeAssetsDict(
    AssetsHelper.fetchAssets(~appId=""),
  ) {
  | Some(dict) => dict
  | None => Js.Dict.empty()
  }

  let isImagePresent = (~imageName: string): bool =>
    Js.Dict.get(assetsDict, imageName) == Some(true)

  let imageUri: string = isImagePresent(~imageName=uri) ? uri : uri // TODO: change this uri to remote url

  <Image style source={Image.Source.fromUriSource({uri: imageUri})} />
}
