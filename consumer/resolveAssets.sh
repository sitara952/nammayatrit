#!/bin/bash

VARIANT=$1

if [ -z "$VARIANT" ]; then
  echo "Usage: $0 [variant]"
  exit 1
fi

# Convert the variant name to lowercase for case-insensitive comparison
LOWERCASE_VARIANT=$(echo "$VARIANT" | tr '[:upper:]' '[:lower:]')

# Convert the variant name for iOS if it matches "nammayatri" (case-insensitive)
IOS_VARIANT=$VARIANT
if [ "$LOWERCASE_VARIANT" == "nammayatri" ]; then
  IOS_VARIANT="Namma_Yatri"
fi

echo " ---------- Start assets for variant ($VARIANT) :- --------------"
echo "{\"images\":{" > assets.json 

# iOS specific directories
for imageset_dir in $(find ./ios/$IOS_VARIANT/Assets/Assets.xcassets ./ios/Common/Assets/Main.xcassets -type d -name "*.imageset"); do
  # Extract the base name of the imageset (e.g., ny_ic_no_past_rides)
  base_name=$(basename "$imageset_dir" .imageset)
  
  # Check if the corresponding .png file exists within the imageset directory
  png_file="$imageset_dir/$base_name.png"
  
  # Add only if both base_name is non-empty and png_file exists
  if [ -n "$base_name" ] && [ -f "$png_file" ]; then
    echo "\"$base_name\" : true," >> assets.json
  fi
done

# Android specific directories
find android/app/src/main/res/drawable | grep ".png" | cut -d "/" -f 7 | sed 's/.png//' | awk '{if(NF > 0) print "\"" $1 "\" : true,"}' >> assets.json
find android/app/src/$VARIANT/res/drawable | grep ".png" | cut -d "/" -f 8 | sed 's/.png//' | awk '{if(NF > 0) print "\"" $1 "\" : true,"}' >> assets.json

# Finalizing the JSON structure by removing trailing comma and closing brackets
sed '$ s/,$//' assets.json > mobility_assets.json
echo "}}" >> mobility_assets.json

# Output the final JSON file to appropriate directory
cat mobility_assets.json | json_pp | tee ./ios/$IOS_VARIANT/Assets/mobility_assets.json
cat mobility_assets.json | json_pp | tee android/app/src/$VARIANT/assets/mobility_assets.json

# Clean up temporary files
rm mobility_assets.json assets.json

echo " ---------- End assets for variant ($VARIANT) :- --------------"
