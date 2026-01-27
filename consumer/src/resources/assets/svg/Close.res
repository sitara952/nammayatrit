let svg = color =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 8L8 16" stroke=` ++
  color ++
  ` stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 8L16 16" stroke=` ++
  color ++ ` stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
let rightArrow = `<svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.75 4.5L4.5 8.25L12 0.75" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
