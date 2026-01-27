open ReactNative
open JSON
// Import the JSON files as a Js.Json.t
@module("../../android/app/src/bridge/assets/mobility_assets.json")
external bridgeAssetsAndroid: Js.Json.t = "default"

@module("../../android/app/src/manaYatri/assets/mobility_assets.json")
external manaYatriAssetsAndroid: Js.Json.t = "default"

@module("../../android/app/src/nammaYatri/assets/mobility_assets.json")
external nammaYatriAssetsAndroid: Js.Json.t = "default"

@module("../../android/app/src/yatri/assets/mobility_assets.json")
external yatriAssetsAndroid: Js.Json.t = "default"

@module("../../android/app/src/yatriSathi/assets/mobility_assets.json")
external yatriSathiAssetsAndroid: Js.Json.t = "default"

@module("../../ios/Bridge/Assets/mobility_assets.json")
external bridgeAssetsIOS: Js.Json.t = "default"

@module("../../ios/ManaYatri/Assets/mobility_assets.json")
external manaYatriAssetsIOS: Js.Json.t = "default"

@module("../../ios/Namma_Yatri/Assets/mobility_assets.json")
external nammaYatriAssetsIOS: Js.Json.t = "default"

@module("../../ios/Yatri/Assets/mobility_assets.json")
external yatriAssetsIOS: Js.Json.t = "default"

@module("../../ios/YatriSathi/Assets/mobility_assets.json")
external yatriSathiAssetsIOS: Js.Json.t = "default"

let fetchAssets = (~appId: string) => {
  Platform.os === #ios
    ? {
        switch appId {
        | "bridge" => bridgeAssetsIOS
        | "manayatri" => manaYatriAssetsIOS
        | "nammayatri" => nammaYatriAssetsIOS
        | "yatri" => yatriAssetsIOS
        | "yatrisathi" => yatriSathiAssetsIOS
        | _ => nammaYatriAssetsIOS
        }
      }
    : {
        switch appId {
        | "bridge" => bridgeAssetsAndroid
        | "manayatri" => manaYatriAssetsAndroid
        | "nammayatri" => nammaYatriAssetsAndroid
        | "yatri" => yatriAssetsAndroid
        | "yatrisathi" => yatriSathiAssetsAndroid
        | _ => nammaYatriAssetsAndroid
        }
      }
}

// Decode the JSON into a Js.Dict.t<bool>
let decodeAssetsDict = (json: t): option<Js.Dict.t<bool>> =>
  switch Js.Json.decodeObject(json) {
  | Some(obj) =>
    // Find the "images" key and decode the object
    switch Js.Dict.get(obj, "images") {
    | Some(imagesJson) =>
      switch Js.Json.decodeObject(imagesJson) {
      | Some(imagesObj) =>
        // Map over the entries and decode booleans
        Some(
          Js.Dict.fromArray(
            Js.Dict.entries(imagesObj)->Array.map(((key, value)) => {
              switch Js.Json.decodeBoolean(value) {
              | Some(boolValue) => (key, boolValue)
              | None => (key, false) // Fallback to false if not a boolean
              }
            }),
          ),
        )
      | None => None
      }
    | None => None
    }
  | None => None
  }
