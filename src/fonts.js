// Self-hosted fonts — bundled into the build so the site makes NO third-party
// requests (no Google Fonts CDN). This protects at-risk visitors and ensures
// the Persian font loads even where Google services are blocked or throttled.
//
// Inter (Latin) for the LTR UI; Vazirmatn (Arabic/Persian subset) for Farsi.
// Latin characters inside Farsi text fall back to Inter via the CSS stack.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/inter/latin-800.css'

import '@fontsource/vazirmatn/arabic-400.css'
import '@fontsource/vazirmatn/arabic-500.css'
import '@fontsource/vazirmatn/arabic-600.css'
import '@fontsource/vazirmatn/arabic-700.css'
import '@fontsource/vazirmatn/arabic-800.css'
