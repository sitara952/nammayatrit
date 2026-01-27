import Svg, { Path } from "react-native-svg";
const ExportIcon = ({ fill = "#14171F" }: { fill: string | undefined }) => (
  <Svg
    width={"100%"}
    height={"100%"}
    viewBox="0 0 16 16"
    fill="none"
  >
    <Path
      d="M1.99988 8C1.99988 11.3137 4.68619 14.0001 7.9999 14.0001C11.3136 14.0001 14 11.3137 14 8"
      stroke={fill}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M7.99997 9.50007V2M7.99997 2L10.25 4.25002M7.99997 2L5.74994 4.25002"
      stroke={fill}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default ExportIcon;
