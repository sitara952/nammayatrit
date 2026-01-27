var1=$1

# Use a case statement to match var1 against patterns
case $var1 in
  "NY")
    bundle exec fastlane release_ny
    ;;
  "KS")
    bundle exec fastlane release_ks
    ;;
  "MY")
    bundle exec fastlane release_my
    ;;
  "Y")
    bundle exec fastlane release_y
    ;;
  "OY")
    bundle exec fastlane release_oy
    ;;
  "YS")
    bundle exec fastlane release_ys
    ;;
  "CT")
    bundle exec fastlane release_ct
    ;;
  "BT")
    bundle exec fastlane release_bt
    ;;
  *)
    bundle exec fastlane
    ;;
esac
