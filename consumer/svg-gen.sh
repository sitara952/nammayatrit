CURRENT_DIR=$(pwd)

OUTPUT_DIR="$CURRENT_DIR/src/typescript/components/svg"

SVG_FILE=$1

FILE_NAME=$(basename "$SVG_FILE" .svg)

if [ -z "$SVG_FILE" ]; then
    echo "Error: No SVG file path provided."
    echo "Usage: ./generate-svg.sh"
    exit 1
fi

if [ ! -f "$SVG_FILE" ]; then
    echo "Error: File $SVG_FILE does not exist."
    exit 1
fi

svgo "$SVG_FILE" -o "./$FILE_NAME/$FILE_NAME.svg"
npx svgr --native --typescript --svgo-config ./svgo.config.js -d "$OUTPUT_DIR" "./$FILE_NAME/$FILE_NAME.svg"
rm -rf "./$FILE_NAME"
echo "SVG components generated in $OUTPUT_DIR"
