let svg = (~width: int, ~height: int) =>
  `<svg width="${Int.toString(width)}" height="${Int.toString(
      height,
    )}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_3915_14613)">
<ellipse cx="10" cy="8" rx="5" ry="5" transform="rotate(-90 10 8)" fill="#9221FB"/>
<path d="M15.5 8C15.5 4.96243 13.0376 2.5 10 2.5C6.96243 2.5 4.5 4.96243 4.5 8C4.5 11.0376 6.96243 13.5 10 13.5C13.0376 13.5 15.5 11.0376 15.5 8Z" stroke="white"/>
</g>
<defs>
<filter id="filter0_d_3915_14613" x="0" y="0" width="20" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3915_14613"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3915_14613" result="shape"/>
</filter>
</defs>
</svg>`
