// Project data for IRNova's open-source tools.
// Sourced from https://github.com/IRNova
// Translatable fields carry both English (en) and Farsi (fa) values.
export const projects = [
  {
    name: 'Nova-Proxy',
    tagline: {
      en: 'Proxy + dashboard on a single Cloudflare Worker',
      fa: 'پراکسی و داشبورد روی یک Cloudflare Worker',
    },
    description: {
      en: 'A censorship-resistant proxy and control panel that runs on a single Cloudflare Worker. Delivers VLESS, Trojan, and Shadowsocks over WebSocket + TLS, with multi-format subscriptions, load balancing, health checks, encrypted DNS (DoH), GeoIP routing, per-user quotas, and 2FA.',
      fa: 'یک پراکسی و پنل مدیریت ضد سانسور که روی یک Cloudflare Worker اجرا می‌شود. پروتکل‌های VLESS، Trojan و Shadowsocks را روی WebSocket + TLS ارائه می‌دهد، همراه با اشتراک‌های چندقالبی، توزیع بار، بررسی سلامت، DNS رمزگذاری‌شده (DoH)، مسیریابی GeoIP، سهمیه‌ی کاربری و احراز هویت دومرحله‌ای.',
    },
    language: 'HTML',
    stars: 1301,
    url: 'https://github.com/IRNova/Nova-Proxy',
    tags: {
      en: ['VLESS', 'Trojan', 'Shadowsocks', 'Subscriptions', 'WARP', '2FA'],
      fa: ['VLESS', 'Trojan', 'Shadowsocks', 'اشتراک‌ها', 'WARP', '2FA'],
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
    stars: 709,
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
    stars: 97,
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
    stars: 5,
    url: 'https://github.com/IRNova/Tools',
    tags: {
      en: ['Utilities', 'Helpers'],
      fa: ['ابزارها', 'کمک‌ابزارها'],
    },
    featured: false,
  },
]

export const capabilities = [
  {
    icon: 'shield',
    title: { en: 'Bypass Filtering', fa: 'عبور از فیلترینگ' },
    text: {
      en: 'Domain fronting, TLS fragmentation, ECH injection and QUIC replay work together to keep connections alive where they would otherwise be blocked.',
      fa: 'Domain fronting، تکه‌تکه‌سازی TLS، تزریق ECH و بازپخش QUIC در کنار هم کار می‌کنند تا اتصال‌ها را جایی که در غیر این صورت مسدود می‌شدند، برقرار نگه دارند.',
    },
  },
  {
    icon: 'route',
    title: { en: 'Intelligent Routing', fa: 'مسیریابی هوشمند' },
    text: {
      en: 'Proxy chains, rule-based routing, and clean-IP selection automatically steer traffic down the fastest, most reliable path.',
      fa: 'زنجیره‌ی پراکسی، مسیریابی مبتنی بر قاعده و انتخاب آی‌پی تمیز، ترافیک را به‌صورت خودکار از سریع‌ترین و پایدارترین مسیر هدایت می‌کنند.',
    },
  },
  {
    icon: 'radar',
    title: { en: 'Real Verification', fa: 'بررسی واقعی' },
    text: {
      en: 'Two-phase TCP + TLS handshake testing means every endpoint is proven reachable before you ever rely on it.',
      fa: 'آزمایش دومرحله‌ای دست‌دادن TCP + TLS یعنی پیش از آنکه به هر نقطه‌ی اتصالی تکیه کنید، دسترس‌پذیری آن اثبات شده است.',
    },
  },
  {
    icon: 'globe',
    title: { en: 'Cross-Platform', fa: 'چندسکویی' },
    text: {
      en: 'A consistent experience across desktop and every major platform, with subscription delivery that just works.',
      fa: 'تجربه‌ای یکپارچه روی دسکتاپ و همه‌ی پلتفرم‌های اصلی، با ارائه‌ی اشتراکی که به‌سادگی کار می‌کند.',
    },
  },
  {
    icon: 'dns',
    title: { en: 'Full DNS Control', fa: 'کنترل کامل DNS' },
    text: {
      en: 'Complete DNS settings management with support for Warp, Trojan, and custom upstreams baked right in.',
      fa: 'مدیریت کامل تنظیمات DNS با پشتیبانی داخلی از Warp، Trojan و سرورهای بالادست سفارشی.',
    },
  },
  {
    icon: 'open',
    title: { en: 'Open Source', fa: 'متن‌باز' },
    text: {
      en: 'Every project is open source on GitHub, auditable, community-driven, and free to study, run, and improve.',
      fa: 'هر پروژه روی گیت‌هاب متن‌باز است، قابل‌بازبینی، جامعه‌محور و رایگان برای مطالعه، اجرا و بهبود.',
    },
  },
]
