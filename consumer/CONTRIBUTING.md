
## Contributing
Thank you for your interest in contributing to this project! We value accessibility and inclusive design as core principles, and this guide will help you adhere to these standards while making contributions.

### Architecture 
- During development, follow the Flux architecture for building the UI.
- To learn more about the Flux architecture, refer to the [official blog post](https://legacy.reactjs.org/blog/2014/05/06/flux.html).

### Accessibility
To ensure an inclusive experience for all users, especially those using assistive technologies, please follow these best practices:

- Ensure buttons, inputs, and important texts are accessible in **voice-over** and **talk-back** modes.
- Avoid using absolute positioning. Instead, rely on **flexbox** concepts for layout.
- Disable accessibility for views not relevant to visually impaired users:
  - On Android: `importantForAccessibility = {'no-hide-descendants'}`
  - On iOS: `accessibilityElementsHidden = {true}`
- Use `accessibilityLabel` to provide meaningful titles and `accessibilityHint` for meaningful subtitles.
- Utilize `accessibilityState` to indicate properties like `selected` or `disabled` for buttons and options.
- Set `accessibilityRole` to specify the purpose of a view (e.g., button, image, menu, or option).
- Announce screen changes dynamically with:
  ```javascript
  AccessibilityInfo.announceForAccessibilityWithOptions('{screen or view name}', {queue: true});
  ```
- Verify accessibility changes without a physical device:
  - On iOS: Use the Accessibility Inspector.
  - On Android: Use Talk-Back (pre-installed on recent emulators).
- Check if talk-back or voice-over is enabled using screenReaderEnabled from session data.
- For bottom sheets, ensure the snap point is always set to 100% when `screenReaderEnabled` is active, regardless of state.
- Dynamically manage view changes using `accessibilityLiveRegion` and `UIManager.sendAccessibilityEvent`.
