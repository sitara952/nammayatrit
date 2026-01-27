@react.component
let make = (~fill="black") => {
  <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
    <Svg.Path d="M16.0039 9L16.0039 10.75L4.00391 10.75L4.00391 9L16.0039 9Z" fill={fill} />
    <Svg.Path
      d="M10.8789 15.875L9.12891 15.875L9.12891 3.875L10.8789 3.875L10.8789 15.875Z" fill={fill}
    />
  </Svg>
}
