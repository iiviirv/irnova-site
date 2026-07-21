// Project data for IRNova's open-source tools.
// Sourced from https://github.com/IRNova
// Translatable fields carry both English (en) and Farsi (fa) values.
export const projects = [
  {
    name: 'Nova-Client',
    tagline: {
      en: 'The official Nova app for every device',
      fa: 'اپ رسمی نوا برای همه‌ی دستگاه‌ها',
    },
    description: {
      en: 'A fast, clean proxy client with the Nova Radar clean-IP scanner built right in. Connect with one tap, manage profiles and subscriptions, scan and apply the best IPs, all in one bilingual, dark-first app for Android, Windows, and macOS.',
      fa: 'یک کلاینت پراکسی سریع و ساده با اسکنر آی‌پی تمیز نوا رادار داخل خودش. با یک ضربه وصل شو، پروفایل‌ها و اشتراک‌ها را مدیریت کن و بهترین آی‌پی‌ها را اسکن و اعمال کن، همه در یک اپ دوزبانه و تاریک‌محور برای اندروید، ویندوز و مک.',
    },
    language: 'Flutter',
    stars: 63,
    url: 'https://github.com/IRNova/Nova-Client',
    tags: {
      en: ['Android', 'Windows', 'macOS', 'Nova Radar', 'sing-box'],
      fa: ['اندروید', 'ویندوز', 'مک', 'نوا رادار', 'sing-box'],
    },
    featured: true,
  },
  {
    name: 'Nova-Proxy',
    tagline: {
      en: 'One-click proxy on your own Cloudflare Worker',
      fa: 'پراکسی یک‌کلیکی روی ورکر کلودفلر خودت',
    },
    description: {
      en: 'A personal, censorship-resistant proxy that runs entirely on your own free Cloudflare Worker. Serves VLESS, Trojan, and Shadowsocks over WebSocket+TLS, with a bundled bilingual dashboard, a Telegram bot, per-ISP clean-IP optimization, and easy self-deploy. Set a password in your browser and share your link.',
      fa: 'یک پراکسی شخصی و مقاوم در برابر سانسور که به‌طور کامل روی ورکر رایگان کلودفلر خودت اجرا می‌شود. VLESS، Trojan و Shadowsocks را روی WebSocket+TLS ارائه می‌دهد، همراه با داشبورد دوزبانه‌ی داخلی، ربات تلگرام، بهینه‌سازی آی‌پی تمیز بر اساس اپراتور و استقرار آسان. کافی است در مرورگر یک رمز بگذاری و لینکت را به اشتراک بگذاری.',
    },
    language: 'JavaScript',
    stars: 2830,
    url: 'https://github.com/IRNova/Nova-Proxy',
    tags: {
      en: ['One-click deploy', 'VLESS', 'Trojan', 'Shadowsocks', 'Dashboard'],
      fa: ['استقرار یک‌کلیکی', 'VLESS', 'Trojan', 'Shadowsocks', 'داشبورد'],
    },
    featured: true,
  },
  {
    name: 'Nova-Server',
    tagline: {
      en: 'Self-hosted Nova node on your own VPS',
      fa: 'نود خودمیزبان نوا روی سرور مجازی خودت',
    },
    description: {
      en: 'Turn any VPS into a full Nova server with a one-line installer. A complete xray and sing-box panel with VLESS, VMess, Trojan, Shadowsocks, Hysteria2, WireGuard, and AmneziaWG, plus per-user quotas and expiry, smart routing, and clean-IP outbound, all managed from a bilingual dashboard.',
      fa: 'هر سرور مجازی را با یک نصب‌کننده‌ی تک‌خطی به یک سرور کامل نوا تبدیل کن. یک پنل کامل xray و sing-box با VLESS، VMess، Trojan، Shadowsocks، Hysteria2، WireGuard و AmneziaWG، به‌همراه سهمیه و انقضای هر کاربر، مسیریابی هوشمند و خروجی آی‌پی تمیز، همه از یک داشبورد دوزبانه.',
    },
    language: 'Node.js',
    stars: 1,
    url: 'https://github.com/IRNova/Nova-Server',
    tags: {
      en: ['Self-hosted', 'Hysteria2', 'WireGuard', 'AmneziaWG', 'Dashboard'],
      fa: ['خودمیزبان', 'Hysteria2', 'WireGuard', 'AmneziaWG', 'داشبورد'],
    },
    featured: true,
  },
  {
    name: 'Nova-Proxy-App',
    tagline: {
      en: 'Local proxy engine that bypasses filtering',
      fa: 'موتور پراکسی محلی برای عبور از فیلترینگ',
    },
    description: {
      en: 'A powerful local proxy with GSA capabilities: Domain Fronting, TLS fragmentation, ECH injection, QUIC replay, MITM, and intelligent routing, engineered to slip past filtering systems.',
      fa: 'یک پراکسی محلی قدرتمند با قابلیت‌های GSA: Domain Fronting، تکه‌تکه‌سازی TLS، تزریق ECH، بازپخش QUIC، MITM و مسیریابی هوشمند، طراحی‌شده برای عبور از سامانه‌های فیلترینگ.',
    },
    language: 'Go',
    stars: 839,
    url: 'https://github.com/IRNova/Nova-Proxy-App',
    tags: {
      en: ['Domain Fronting', 'TLS Fragmentation', 'ECH', 'QUIC', 'Smart Routing'],
      fa: ['Domain Fronting', 'تکه‌تکه‌سازی TLS', 'ECH', 'QUIC', 'مسیریابی هوشمند'],
    },
    featured: true,
  },
  {
    name: 'NovaRadar',
    tagline: {
      en: 'Desktop Cloudflare IP scanner',
      fa: 'اسکنر آی‌پی کلودفلر برای دسکتاپ',
    },
    description: {
      en: 'A desktop IP scanner built with Go + React. It scans Cloudflare IP ranges from multiple selectable sources and runs real two-phase verification (TCP + TLS handshake) to surface the cleanest, fastest endpoints.',
      fa: 'یک اسکنر آی‌پی دسکتاپ ساخته‌شده با Go + React. محدوده‌های آی‌پی کلودفلر را از چند منبع قابل‌انتخاب اسکن می‌کند و با بررسی واقعی دومرحله‌ای (دست‌دادن TCP + TLS) تمیزترین و سریع‌ترین نقاط اتصال را پیدا می‌کند.',
    },
    language: 'Go + React',
    stars: 224,
    url: 'https://github.com/IRNova/NovaRadar',
    tags: {
      en: ['IP Scanning', 'Cloudflare', 'TCP + TLS', 'Desktop'],
      fa: ['اسکن آی‌پی', 'Cloudflare', 'TCP + TLS', 'دسکتاپ'],
    },
    featured: false,
  },
  {
    name: 'Tools',
    tagline: {
      en: 'Handy networking utilities',
      fa: 'ابزارهای کاربردی شبکه',
    },
    description: {
      en: 'A growing collection of smaller utilities and helpers that support the Nova toolchain and day-to-day networking workflows.',
      fa: 'مجموعه‌ای رو به رشد از ابزارها و کمک‌ابزارهای کوچک که از مجموعه‌ابزار نوا و کارهای روزمره‌ی شبکه پشتیبانی می‌کنند.',
    },
    language: 'Utilities',
    stars: 27,
    url: 'https://github.com/IRNova/Tools',
    tags: {
      en: ['Utilities', 'Helpers'],
      fa: ['ابزارها', 'کمک‌ابزارها'],
    },
    featured: false,
  },
]

// Nova Client app downloads, rendered in the "Get the apps" section and on the
// installer's success screen. Direct links always resolve to the newest GitHub
// release, so nothing here needs bumping on new versions.
export const clientReleasesUrl = 'https://github.com/IRNova/Nova-Client/releases'
// Each client carries its download URL plus a short, per-platform "how to run"
// checklist. Sideloaded and unsigned builds need a step or two, so the steps live
// right on the card. `detect` holds the platform key auto-detect matches against.
export const clients = [
  {
    key: 'android',
    icon: 'android',
    name: { en: 'Android', fa: 'اندروید' },
    detail: { en: 'Direct APK', fa: 'فایل مستقیم APK' },
    url: `${clientReleasesUrl}/latest/download/nova-client.apk`,
    available: true,
    steps: {
      en: [
        'Download the APK to your phone.',
        'If prompted, allow installing from unknown sources.',
        'Open the file and tap Install.',
      ],
      fa: [
        'فایل APK را روی گوشی‌ات دانلود کن.',
        'اگر پرسیده شد، اجازه‌ی نصب از منابع ناشناس را بده.',
        'فایل را باز کن و روی نصب بزن.',
      ],
    },
  },
  {
    key: 'windows',
    icon: 'windows',
    name: { en: 'Windows', fa: 'ویندوز' },
    detail: { en: 'Portable ZIP', fa: 'نسخه‌ی قابل‌حمل ZIP' },
    url: `${clientReleasesUrl}/latest/download/Nova-Windows.zip`,
    available: true,
    steps: {
      en: [
        'Unzip the downloaded file.',
        'Run nova_client.exe.',
        'Nova is not code-signed yet, so if SmartScreen warns, click More info, then Run anyway.',
      ],
      fa: [
        'فایل دانلودشده را از حالت فشرده خارج کن.',
        'فایل nova_client.exe را اجرا کن.',
        'نوا هنوز امضای دیجیتال ندارد، پس اگر SmartScreen هشدار داد، روی More info و بعد Run anyway بزن.',
      ],
    },
  },
  {
    key: 'macos',
    icon: 'apple',
    name: { en: 'macOS', fa: 'مک' },
    detail: { en: 'Apple Silicon DMG', fa: 'فایل DMG برای اپل سیلیکون' },
    url: `${clientReleasesUrl}/latest/download/Nova-macOS-arm64.dmg`,
    available: true,
    steps: {
      en: [
        'Open the DMG and drag Nova to Applications.',
        'Launch Nova from Applications.',
        'It is Apple-notarized, so it opens with no unidentified developer block. Apple Silicon (M-series) Macs only.',
      ],
      fa: [
        'فایل DMG را باز کن و نوا را به پوشه‌ی Applications بکش.',
        'نوا را از Applications اجرا کن.',
        'نوا توسط اپل تأیید (notarized) شده، پس بدون هشدار سازنده‌ی ناشناس باز می‌شود. فقط مک‌های اپل سیلیکون (سری M).',
      ],
    },
  },
  {
    key: 'ios',
    icon: 'apple',
    name: { en: 'iOS / iPadOS', fa: 'iOS / iPadOS' },
    detail: { en: 'TestFlight beta', fa: 'نسخه‌ی آزمایشی TestFlight' },
    url: 'https://testflight.apple.com/join/bxfK3MyF',
    available: true,
    external: true,
    ctaKey: 'openTestFlight',
    steps: {
      en: [
        'Install TestFlight from the App Store.',
        'Open the Nova join link in TestFlight.',
        'Accept the invite and install Nova.',
      ],
      fa: [
        'اپلیکیشن TestFlight را از اپ‌استور نصب کن.',
        'لینک دعوت نوا را در TestFlight باز کن.',
        'دعوت را بپذیر و نوا را نصب کن.',
      ],
    },
  },
]

// The people behind Nova Proxy, shown in the Contributors section.
// Avatars come from GitHub's `https://github.com/<user>.png` endpoint (no API,
// no rate limit). Roles are easy to edit; adjust as the team grows.
export const team = [
  {
    handle: 'IRNova',
    name: 'IRNova',
    url: 'https://github.com/IRNova',
    avatar: 'https://github.com/IRNova.png?size=200',
    role: { en: 'Creator & maintainer', fa: 'سازنده و نگه‌دارنده' },
  },
  {
    handle: 'iiviirv',
    name: 'iiviirv',
    url: 'https://github.com/iiviirv',
    avatar: 'https://github.com/iiviirv.png?size=200',
    role: { en: 'Contributor', fa: 'مشارکت‌کننده' },
  },
  {
    handle: 'Vahid-4444',
    name: 'Vahid',
    url: 'https://github.com/Vahid-4444',
    avatar: 'https://github.com/Vahid-4444.png?size=200',
    role: { en: 'Design', fa: 'طراحی' },
  },
]

// Feature cards for the Nova Proxy Worker product. Rendered in the
// "Capabilities" / features grid on the landing page.
export const capabilities = [
  {
    icon: 'bolt',
    title: { en: 'One-click deploy, free', fa: 'استقرار یک‌کلیکی و رایگان' },
    text: {
      en: 'Deploy to your own free Cloudflare account in one click. Cloudflare creates the Worker and the KV database for you, then you set a password in the browser and share your link. No CLI, no API tokens.',
      fa: 'با یک کلیک روی حساب رایگان کلودفلر خودت مستقر کن. Cloudflare ورکر و دیتابیس KV را برایت می‌سازد، بعد در مرورگر یک رمز می‌گذاری و لینکت را به اشتراک می‌گذاری. بدون خط فرمان و بدون توکن API.',
    },
  },
  {
    icon: 'globe',
    title: { en: 'Built-in bilingual dashboard', fa: 'داشبورد دوزبانه‌ی داخلی' },
    text: {
      en: 'A self-contained dashboard in English and Farsi is bundled into the Worker itself. There is no separate site or backend to set up or maintain.',
      fa: 'یک داشبورد مستقل به دو زبان انگلیسی و فارسی داخل خود ورکر قرار دارد. هیچ سایت یا بک‌اند جداگانه‌ای برای راه‌اندازی یا نگهداری لازم نیست.',
    },
  },
  {
    icon: 'link',
    title: { en: 'Works in every major client', fa: 'سازگار با همه‌ی کلاینت‌های اصلی' },
    text: {
      en: 'One subscription link works in Hiddify, v2rayNG, MahsaNG, FlClash, Clash Meta, NekoBox/sing-box, Karing, Streisand and more, with per-format links (mihomo.yaml / base64.txt / singbox.json).',
      fa: 'یک لینک اشتراک در Hiddify، v2rayNG، MahsaNG، FlClash، Clash Meta، NekoBox/sing-box، Karing، Streisand و بقیه کار می‌کند، با لینک‌های جداگانه برای هر قالب (mihomo.yaml / base64.txt / singbox.json).',
    },
  },
  {
    icon: 'radar',
    title: { en: 'Per-ISP clean-IP optimization', fa: 'بهینه‌سازی آی‌پی تمیز بر اساس اپراتور' },
    text: {
      en: 'Each user automatically gets clean IPs tuned to their own network (MCI, Irancell, or Shatel), so configs use the endpoints that actually work on that ISP.',
      fa: 'هر کاربر به‌صورت خودکار آی‌پی‌های تمیز متناسب با شبکه‌ی خودش می‌گیرد (همراه اول، ایرانسل یا شاتل) تا کانفیگ‌ها از نقاطی استفاده کنند که واقعاً روی همان اپراتور کار می‌کنند.',
    },
  },
  {
    icon: 'gauge',
    title: { en: 'Built-in speed test', fa: 'تست سرعت داخلی' },
    text: {
      en: 'A built-in speed test finds the fastest clean IPs for your ISP and applies them to your configs with one tap.',
      fa: 'تست سرعت داخلی سریع‌ترین آی‌پی‌های تمیز را برای اپراتور تو پیدا می‌کند و با یک ضربه روی کانفیگ‌هایت اعمال می‌کند.',
    },
  },
  {
    icon: 'telegram',
    title: { en: 'Telegram bot & Mini App', fa: 'ربات تلگرام و مینی‌اپ' },
    text: {
      en: 'A Telegram bot sends every sub-link format, status, and announcements with colored inline buttons, plus host management and a Mini App that opens the panel right inside Telegram.',
      fa: 'یک ربات تلگرام همه‌ی قالب‌های لینک اشتراک، وضعیت و اعلان‌ها را با دکمه‌های رنگی درون‌خطی می‌فرستد، به‌همراه مدیریت هاست و یک مینی‌اپ که پنل را همان داخل تلگرام باز می‌کند.',
    },
  },
  {
    icon: 'shield',
    title: { en: 'Resilience for Iran', fa: 'پایداری برای ایران' },
    text: {
      en: 'Multi-protocol and multi-transport configs, a self-healing front-domain pool with auto-failover, a cross-infrastructure blend of non-Cloudflare nodes, NAT64 fallback, and a permanent GitHub subscription mirror.',
      fa: 'کانفیگ‌های چندپروتکلی و چندترنسپورتی، استخر دامنه‌ی جلویی خودترمیم با جابه‌جایی خودکار، ترکیب زیرساختی با نودهای غیرکلودفلر، پشتیبان NAT64 و یک آینه‌ی اشتراک دائمی روی گیت‌هاب.',
    },
  },
  {
    icon: 'key',
    title: { en: 'WARP / WireGuard generator', fa: 'سازنده‌ی WARP / WireGuard' },
    text: {
      en: 'Generate WARP and WireGuard configurations on the fly, exported as ready-to-import wireguard:// and nekoray:// lists.',
      fa: 'کانفیگ‌های WARP و WireGuard را در لحظه بساز، به‌صورت فهرست‌های آماده‌ی وارد کردن wireguard:// و nekoray:// خروجی بگیر.',
    },
  },
  {
    icon: 'app',
    title: { en: 'Installable PWA', fa: 'اپ نصب‌شدنی (PWA)' },
    text: {
      en: 'Add to Home Screen installs the panel as a standalone “Nova Proxy” app, so it opens like any other app on your phone.',
      fa: 'با «افزودن به صفحه‌ی اصلی»، پنل به‌صورت یک اپ مستقل «نوا پراکسی» نصب می‌شود و مثل هر اپ دیگری روی گوشی‌ات باز می‌شود.',
    },
  },
  {
    icon: 'lock',
    title: { en: 'Private by design', fa: 'حریم خصوصی از پایه' },
    text: {
      en: 'Everything runs on your own Cloudflare account. There is no shared server in the middle, and your traffic isn’t logged by anyone.',
      fa: 'همه‌چیز روی حساب کلودفلر خودت اجرا می‌شود. هیچ سرور مشترکی در میانه نیست و ترافیک تو توسط هیچ‌کس ذخیره نمی‌شود.',
    },
  },
]
