echo "Installing Root Dependency"
cd ..
rm -rf node_modules
yarn install
echo "Installing Root Done"

echo "Installing BabyConfig..."
cd babyconfig
yarn install
cd ..
echo "Installing BabyConfig Done"

cd libs/config-types
yarn install
echo "Installing Config Done"

cd ../custom-linters
yarn install
echo "Installing custom-linters Done"

# Disabled Common
# echo "Installing Common Dependency"
# cd ../common
# rm -rf node_modules
# yarn install
# cd ../consumer
# echo "Installing Done"
