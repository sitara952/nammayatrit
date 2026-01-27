open ReactNative
open Style
open Tailwind
open Reanimated
open Carousel

type bannerData = {
  heading: string,
  subHeading: string,
  image: string,
  imageUrl: string,
}

type bannerWithTextData = {
  heading: string,
  subHeading: string,
  image: ReactNative.Image.Source.t,
}

type bannerList = Banner(array<bannerData>) | BannerWithText(array<bannerWithTextData>)

@react.component
let make = (~bannerList: bannerList=Banner([]), ~showDotIndicator: bool=false) => {
  let currentBanner = useSharedValue(0.)

  <View style={viewStyle(~alignContent=#center, ~alignItems=#center, ~justifyContent=#center, ())}>
    {switch bannerList {
    | Banner(bannerList) =>
      <Carousel
        loop={bannerList->Array.length > 1}
        data=bannerList
        width={Dimensions.get(#screen).width}
        height=110.
        autoPlayInterval=2500
        scrollAnimationDuration=1000
        onProgressChange={ProgressChangeType.sharedValue(currentBanner)}
        onSnapToItem={_ => ()}
        vertical=false
        autoPlay=true
        renderItem={({index}) =>
          switch bannerList[index] {
          | Some(banner) =>
            <Banner
              imageUrl=banner.imageUrl
              heading=banner.heading
              subHeading=banner.subHeading
              image=banner.image
              height={113.->dp}
            />
          | None => React.null
          }}
      />
    | BannerWithText(bannerList) =>
      <Carousel
        loop={bannerList->Array.length > 1}
        data=bannerList
        width={Dimensions.get(#screen).width}
        height=260.
        autoPlayInterval=2500
        scrollAnimationDuration=1000
        onSnapToItem={_ => ()}
        vertical=false
        autoPlay=true
        renderItem={({index}) =>
          switch bannerList[index] {
          | Some(banner) =>
            <BannerWithText
              heading=banner.heading subHeading=banner.subHeading image=banner.image
            />
          | None => React.null
          }}
      />
    }}
    {showDotIndicator
      ? <Pagination
          data={switch bannerList {
          | Banner(arr) => arr
          | _ => [] //other cases needs to be handled accordingly
          }}
          containerStyle={tw("bg-white gap-4px")}
          dotStyle={tw("bg-inActiveDotColor mt-5px rounded-full ")}
          activeDotStyle={tw("bg-activeDotColor rounded-full")}
          size={switch bannerList {
          | Banner(arr) => Array.length(arr)
          | BannerWithText(arr) => Array.length(arr)
          }}
          progress=currentBanner
        />
      : React.null}
  </View>
}
