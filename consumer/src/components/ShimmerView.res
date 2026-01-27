module ContentLoaderNative = {
  @module("react-content-loader/native") @react.component
  external make: (
    ~speed: float,
    ~width: string,
    ~height: string,
    ~viewBox: string=?,
    ~backgroundColor: string=?,
    ~foregroundColor: string=?,
    ~children: React.element,
  ) => React.element = "default"
}

module ContentLoader = {
  @react.component
  let make = (
    ~speed,
    ~width,
    ~height,
    ~viewBox=?,
    ~backgroundColor="red",
    ~foregroundColor="black",
    ~children=React.null,
  ) => {
    <ContentLoaderNative speed width height ?viewBox backgroundColor foregroundColor>
      {children}
    </ContentLoaderNative>
  }
}

module Rect = {
  @module("react-content-loader/native") @react.component
  external make: (
    ~width: string,
    ~height: string,
    ~x: string,
    ~y: string,
    ~rx: string,
    ~ry: string,
  ) => React.element = "Rect"
}

@react.component
let make = (
  ~height="45",
  ~width="100%",
  ~speed=1.3,
  ~radius=None,
  ~children=React.null,
  ~isLoading,
  ~bgColor: option<string>=?,
  ~fgColor: option<string>=?,
) => {
  let {borderRadius, loadingBgColor, loadingFgColor} = ThemebasedStyle.useThemeBasedStyle()

  let backgroundColor = bgColor->Option.getOr(loadingBgColor)

  let foregroundColor = fgColor->Option.getOr(loadingFgColor)

  let br = switch radius {
  | Some(var) => var
  | None => borderRadius
  }

  {
    isLoading
      ? <ContentLoader width height speed backgroundColor foregroundColor>
          <Rect x="0" y="0" rx={br->Float.toString} ry={br->Float.toString} width height />
        </ContentLoader>
      : children
  }
}
