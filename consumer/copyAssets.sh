#!/bin/bash

# Define directories
SRC_DIR="./src/assets"  # Path to your source assets directory

# List of build variants
build_variants=("common" "nammaYatri" "yatri" "bridge" "manaYatri"  "yatriSathi")

# Function to create Contents.json for iOS
create_contents_json() {
  local filename=$1
  local ios_dest=$2

  # Create Contents.json file with the required structure
  cat <<EOT > "$ios_dest/Contents.json"
{
  "images" : [
    {
      "filename" : "$filename",
      "idiom" : "universal",
      "scale" : "1x"
    },
    {
      "filename" : "$filename",
      "idiom" : "universal",
      "scale" : "2x"
    },
    {
      "filename" : "$filename",
      "idiom" : "universal",
      "scale" : "3x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOT
}

# Function to get the iOS destination based on the variant
get_ios_destination() {
    local variant=$1

    if [ "$variant" = "common" ]; then
        echo "./ios/Common/Assets"
    elif [ "$variant" = "nammaYatri" ]; then
        echo "./ios/Namma_Yatri/Assets"
    else
        # Capitalize the first letter of the variant name
        capitalized_variant="$(tr '[:lower:]' '[:upper:]' <<< ${variant:0:1})${variant:1}"
        echo "./ios/${capitalized_variant}/Assets"
    fi
}

# Function to get the Android destination based on the variant
get_android_destination() {
    local variant=$1

    if [ "$variant" = "common" ]; then
        echo "./android/app/src/main/res"
    else
        echo "./android/app/src/$variant/res"
    fi
}

# Function to copy files for each build variant
copy_files_for_variant() {
    local variant=$1
    local src_dir="$SRC_DIR/$variant"

    # Get the Android destination folder
    local ANDROID_DIR=$(get_android_destination "$variant")

    echo "Processing variant: $variant"

    # Use find to search for all files starting with mt_ in every subdirectory of src_dir
    find "$src_dir" -type f -name "mt_*" | while read -r file; do
        if [ -e "$file" ]; then
            filename=$(basename "$file")
            filename_no_ext="${filename%.*}"

            if [[ "$filename" == *.png || "$filename" == *.jpg ]]; then
                # Handle PNG/JPG files
                mkdir -p "$ANDROID_DIR/drawable"
                cp "$file" "$ANDROID_DIR/drawable"

                # Get the iOS destination folder
                ios_dest=$(get_ios_destination "$variant" "$filename_no_ext")
                # Conditionally check if 'Common' is in ios_dest
                if [[ "$ios_dest" == *"Common"* ]]; then
                    img_ios_dest="./ios/Common/Assets/Main.xcassets/$filename_no_ext.imageset"
                else
                    img_ios_dest="$ios_dest/Assets.xcassets/$filename_no_ext.imageset"
                fi
                
                mkdir -p "$img_ios_dest"

                # Copy to iOS
                cp "$file" "$img_ios_dest"

                # Create Contents.json for the image in iOS
                create_contents_json "$filename" "$img_ios_dest"
            elif [[ "$filename" == *.json ]]; then
                # Handle Lottie JSON files
                mkdir -p "$ANDROID_DIR/raw"
                cp "$file" "$ANDROID_DIR/raw"

                # For Lottie, just copy to iOS (no Contents.json needed)
                mkdir -p "$ios_dest/Lottie"
                cp "$file" "$ios_dest/Lottie"
            fi
        fi
    done
}

# Iterate through each build variant and copy files
for variant in "${build_variants[@]}"; do
    copy_files_for_variant "$variant"
done

echo "All files copied successfully!"
