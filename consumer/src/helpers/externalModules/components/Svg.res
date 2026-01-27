type svgBaseProps<'dimension> = {
  width?: 'dimension,
  height?: 'dimension,
  x?: 'dimension,
  y?: 'dimension,
  id?: string,
  children?: React.element,
  fill?: string,
  fillOpacity?: string,
  stroke?: string,
  strokeWidth?: string,
  strokeDasharray?: string,
  strokeLinecap?: string,
  mask?: string,
  onError?: unit => unit,
  onLoad?: unit => unit,
  pointerEvents?: string,
  transform?: string,
  clipPath?: string,
  fillRule?: string,
  clipRule?: string,
}

type svgXmlProps<'dimension> = {
  ...svgBaseProps<'dimension>,
  xml: string,
}
type svgUriProps = {
  ...svgBaseProps<float>,
  uri: string,
}

module SvgXml = {
  @module("react-native-svg") @react.component(: svgXmlProps<string>)
  external make: _ => React.element = "SvgXml"
}

module SvgUri = {
  @module("react-native-svg/src") @react.component(: svgUriProps)
  external make: _ => React.element = "SvgCssUri"
}

module SvgCss = {
  @module("react-native-svg/css") @react.component(: svgXmlProps<float>)
  external make: _ => React.element = "SvgCss"
}

module G = {
  @module("react-native-svg") @react.component(: svgBaseProps<float>)
  external make: _ => React.element = "G"
}
module Defs = {
  @module("react-native-svg") @react.component(: svgBaseProps<float>)
  external make: _ => React.element = "Defs"
}
module Mask = {
  type maskProps = {
    ...svgBaseProps<string>,
    maskUnits?: string,
  }

  @module("react-native-svg") @react.component(: maskProps)
  external make: _ => React.element = "Mask"
}
module LinearGradient = {
  type linearGradientProps = {
    ...svgBaseProps<string>,
    gradientUnits?: string,
    x1?: string,
    x2?: string,
    y1?: string,
    y2?: string,
  }

  @module("react-native-svg") @react.component(: linearGradientProps)
  external make: _ => React.element = "LinearGradient"
}
module Stop = {
  type stopProps = {
    ...svgBaseProps<string>,
    offset?: string,
    stopColor?: string,
    stopOpacity?: string,
  }

  @module("react-native-svg") @react.component(: stopProps)
  external make: _ => React.element = "Stop"
}
module Rect = {
  @module("react-native-svg") @react.component(: svgBaseProps<string>)
  external make: _ => React.element = "Rect"
}
module Path = {
  type pathProps = {
    ...svgBaseProps<string>,
    d: string,
    opacity?: string,
  }
  @module("react-native-svg") @react.component(: pathProps)
  external make: _ => React.element = "Path"
}
module Use = {
  type useProps = {
    ...svgBaseProps<string>,
    href?: string,
  }
  @module("react-native-svg") @react.component(: useProps)
  external make: _ => React.element = "Use"
}
module Text = {
  type textProps = {
    ...svgBaseProps<string>,
    fontFamily?: string,
    fontSize?: string,
    textAnchor?: string,
  }
  @module("react-native-svg") @react.component(: textProps)
  external make: _ => React.element = "Text"
}
module Circle = {
  type props = {
    ...svgBaseProps<string>,
    cx: string,
    cy: string,
    r: string,
  }
  @module("react-native-svg")
  external make: _ => React.element = "Circle"
}
module CircleWrapper = {
  type props = Circle.props
  let make = React.forwardRef((props: props, _ref: 'a) => {
    <Circle {...props} />
  })
}

type svgProps = {
  ...svgBaseProps<string>,
  viewBox?: string,
  style?: ReactNative.Style.t,
}

@module("react-native-svg") @react.component(: svgProps)
external make: _ => React.element = "default"

module ClipPath = {
  type clipPathProps = {
    id: string,
    children?: React.element,
  }
  @module("react-native-svg") @react.component(: clipPathProps)
  external make: _ => React.element = "ClipPath"
}
