open ReactNative
let getVehicleName = (title: string): string => {
  switch title {
  | "Auto" | "Non-AC Mini" => Vehicle.express
  | "AC Mini" => Vehicle.premium
  | "Sedan" => Vehicle.black
  | "SUV" | "XL Cab" => Vehicle.xl
  | _ => Vehicle.express
  }
}

let getVehicleImageName = (title: string) => {
  switch title {
  | "Auto" | "Non-AC Mini" =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/new-ride-express.png"),
    )
  | "AC Mini" =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/choose-ride-assets/new-ride-premier.png"),
    )
  | "Sedan" =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/choose-ride-assets/new-ride-black.png"),
    )
  | "SUV" | "XL Cab" =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/choose-ride-assets/new-ride-xl.png"),
    )
  | _ =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/new-ride-express.png"),
    )
  }
}

let getVehicleMarker = (title: string) => {
  switch title {
  | "AUTO_RICKSHAW" =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/cab-markers/ic_auto_nav_on_map.png"),
    )
  | "HATCHBACK" =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/cab-markers/ic_hatchback_nav_on_map.png"),
    )
  | "SEDAN" =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/cab-markers/ic_sedan_nav_on_map.png"),
    )
  | "SUV" =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/cab-markers/ic_suv_nav_on_map.png"),
    )
  | _ =>
    ReactNative.Image.Source.fromRequired(
      Packager.require("../../resources/assets/png/cab-markers/ic_sedan_nav_on_map.png"),
    )
  }
}
