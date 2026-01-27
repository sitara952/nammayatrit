open ConfigManager
open Utils

type rcCarousel = {
  text_color: string,
  text: string,
  cta_text: string,
  cta_action: string,
  cta_link: string,
  cta_icon: string,
  banner_color: string,
  banner_image: string,
  cta_background_color: string,
  cta_text_color: string,
  cta_corner_radius: string,
  cta_image_url: string,
  whitelist: option<array<string>>,
  categoryFilter: option<array<string>>,
  image_banner: string,
}

type remoteConfig = {
  bangalore: array<rcCarousel>,
  kolkata: array<rcCarousel>,
  chennai: array<rcCarousel>,
  tumakuru: array<rcCarousel>,
  mysore: array<rcCarousel>,
  kochi: array<rcCarousel>,
  delhi: array<rcCarousel>,
  hyderabad: array<rcCarousel>,
  mumbai: array<rcCarousel>,
  coimbatore: array<rcCarousel>,
  pondicherry: array<rcCarousel>,
  goa: array<rcCarousel>,
  pune: array<rcCarousel>,
  tamilnaducities: array<rcCarousel>,
  default: array<rcCarousel>,
  config: array<rcCarousel>,
}

let getConfig = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Belt.Option.flatMap(Js.Json.decodeArray)
  ->Belt.Option.getExn
  ->Belt.Array.keepMap(Js.Json.decodeObject)
  ->Js.Array2.map(dict => {
    {
      text_color: getOptionString(dict, "text_color")->Belt.Option.getExn,
      text: getOptionString(dict, "text")->Belt.Option.getExn,
      cta_text: getOptionString(dict, "cta_text")->Belt.Option.getExn,
      cta_action: getOptionString(dict, "cta_action")->Belt.Option.getExn,
      cta_link: getOptionString(dict, "cta_link")->Belt.Option.getExn,
      cta_icon: getOptionString(dict, "cta_icon")->Belt.Option.getExn,
      banner_color: getOptionString(dict, "banner_color")->Belt.Option.getExn,
      banner_image: getOptionString(dict, "banner_image")->Belt.Option.getExn,
      cta_background_color: getOptionString(dict, "cta_background_color")->Belt.Option.getExn,
      cta_text_color: getOptionString(dict, "cta_text_color")->Belt.Option.getExn,
      cta_corner_radius: getOptionString(dict, "cta_corner_radius")->Belt.Option.getExn,
      cta_image_url: getOptionString(dict, "cta_image_url")->Belt.Option.getExn,
      whitelist: getOptionStrArrayFromDict(dict, "whitelist"),
      categoryFilter: getOptionStrArrayFromDict(dict, "categoryFilter"),
      image_banner: getOptionString(dict, "image_banner")->Belt.Option.getExn,
    }
  })
}

let decodeToRemoteConfig = dict => {
  try {
    Some({
      bangalore: getConfig(dict, "bangalore"),
      kolkata: getConfig(dict, "kolkata"),
      chennai: getConfig(dict, "chennai"),
      tumakuru: getConfig(dict, "tumakuru"),
      mysore: getConfig(dict, "mysore"),
      kochi: getConfig(dict, "kochi"),
      delhi: getConfig(dict, "delhi"),
      hyderabad: getConfig(dict, "hyderabad"),
      mumbai: getConfig(dict, "mumbai"),
      coimbatore: getConfig(dict, "coimbatore"),
      pondicherry: getConfig(dict, "pondicherry"),
      goa: getConfig(dict, "goa"),
      pune: getConfig(dict, "pune"),
      tamilnaducities: getConfig(dict, "tamilnaducities"),
      default: getConfig(dict, "default"),
      config: getConfig(dict, "config"),
    })
  } catch {
  | _ => None
  }
}

let getCarouselData = (~city, ~key) => {
  let carouselData =
    ConfigManager.getString(key)
    ->JSON.parseExn
    ->getDictFromJson
    ->Dict.get(city)
    ->Option.flatMap(JSON.Decode.array)
    ->Option.getOr([])
    ->Array.filterMap(JSON.Decode.object)
    ->Array.map(dict => {
      {
        text_color: getOptionString(dict, "text_color")->Belt.Option.getExn,
        text: getOptionString(dict, "text")->Belt.Option.getExn,
        cta_text: getOptionString(dict, "cta_text")->Belt.Option.getExn,
        cta_action: getOptionString(dict, "cta_action")->Belt.Option.getExn,
        cta_link: getOptionString(dict, "cta_link")->Belt.Option.getExn,
        cta_icon: getOptionString(dict, "cta_icon")->Belt.Option.getExn,
        banner_color: getOptionString(dict, "banner_color")->Belt.Option.getExn,
        banner_image: getOptionString(dict, "banner_image")->Belt.Option.getExn,
        cta_background_color: getOptionString(dict, "cta_background_color")->Belt.Option.getExn,
        cta_text_color: getOptionString(dict, "cta_text_color")->Belt.Option.getExn,
        cta_corner_radius: getOptionString(dict, "cta_corner_radius")->Belt.Option.getExn,
        cta_image_url: getOptionString(dict, "cta_image_url")->Belt.Option.getExn,
        whitelist: getOptionStrArrayFromDict(dict, "whitelist"),
        categoryFilter: getOptionStrArrayFromDict(dict, "categoryFilter"),
        image_banner: getOptionString(dict, "image_banner")->Belt.Option.getExn,
      }
    })
  carouselData
}

let transformToBannerData = (rc: rcCarousel): BannerCarousel.bannerData => {
  {
    heading: rc.text,
    subHeading: rc.cta_text,
    image: rc.banner_image,
    imageUrl: rc.image_banner,
  }
}

let mapToBannerDataArray = (rcArray: array<rcCarousel>): array<BannerCarousel.bannerData> => {
  Array.map(rcArray, rc => transformToBannerData(rc))
}
