// UI string translations for the Nova Proxy site.
// The brand wordmark is centralized in `brand` so the displayed name can be
// changed in one place. @IRNova remains the GitHub handle for links.
export const LANGS = [
  { code: 'en', label: 'EN', name: 'English', dir: 'ltr' },
  { code: 'fa', label: 'فا', name: 'فارسی', dir: 'rtl' },
]

export const ui = {
  en: {
    brand: 'Nova Proxy',
    nav: {
      projects: 'Projects',
      capabilities: 'Capabilities',
      guide: 'Setup Guide',
      about: 'About',
      github: 'GitHub',
    },
    hero: {
      pill: 'Open-source networking tools',
      titleLine1: 'Keep the internet',
      titleAccent: 'open, fast, and reachable.',
      sub: 'Nova Proxy is a suite of open-source proxy and networking tools — engineered to slip past filtering, find the cleanest routes, and deliver reliable connectivity on every platform.',
      explore: 'Explore Projects',
      guide: 'Setup Guide',
      follow: 'Follow on GitHub',
    },
    stats: {
      stars: 'GitHub Stars',
      projects: 'Open Projects',
      builtWith: 'Built With',
      openSource: 'Open Source',
    },
    projectsSection: {
      eyebrow: 'The toolkit',
      title: 'Projects',
      desc: 'Four open-source projects that work together — from a full control panel to a low-level proxy engine and an IP scanner that proves what actually works.',
    },
    capsSection: {
      eyebrow: 'Under the hood',
      title: 'Capabilities',
      desc: 'The techniques behind the Nova toolchain — built to stay reliable in hostile network conditions.',
    },
    about: {
      eyebrow: 'About',
      title: 'Built in the open',
      p1: 'Nova Proxy is an open-source project focused on connectivity and circumvention tooling, built by IRNova. Every tool ships openly on GitHub — auditable, free to run, and shaped by a community that depends on an open internet.',
      p2: 'Written primarily in Go and React, the tools favor real-world reliability: two-phase endpoint verification, intelligent routing, and a steady stream of techniques to stay ahead of filtering.',
      cta: 'Visit the GitHub profile',
      list: [
        'Proxy & routing infrastructure',
        'Network scanning & verification',
        'Anti-censorship techniques',
        'Fully open source',
      ],
    },
    footer: { note: 'Open-source networking tools. Built for an open internet.' },
    viewOnGithub: 'View on GitHub',
    flagship: 'Flagship',
  },
  fa: {
    brand: 'نوا پراکسی',
    nav: {
      projects: 'پروژه‌ها',
      capabilities: 'قابلیت‌ها',
      guide: 'راهنمای راه‌اندازی',
      about: 'درباره',
      github: 'گیت‌هاب',
    },
    hero: {
      pill: 'ابزارهای شبکه متن‌باز',
      titleLine1: 'اینترنت را',
      titleAccent: 'باز، سریع و در دسترس نگه دارید.',
      sub: 'نوا پراکسی مجموعه‌ای از ابزارهای پراکسی و شبکه‌ی متن‌باز است — طراحی‌شده برای عبور از فیلترینگ، یافتن پاک‌ترین مسیرها و ارائه‌ی اتصالی پایدار روی هر پلتفرم.',
      explore: 'مشاهده پروژه‌ها',
      guide: 'راهنمای راه‌اندازی',
      follow: 'دنبال کردن در گیت‌هاب',
    },
    stats: {
      stars: 'ستاره‌های گیت‌هاب',
      projects: 'پروژه‌های متن‌باز',
      builtWith: 'ساخته‌شده با',
      openSource: 'متن‌باز',
    },
    projectsSection: {
      eyebrow: 'جعبه‌ابزار',
      title: 'پروژه‌ها',
      desc: 'چهار پروژه‌ی متن‌باز که در کنار هم کار می‌کنند — از یک پنل مدیریت کامل تا یک موتور پراکسی سطح‌پایین و یک اسکنر آی‌پی که نشان می‌دهد چه چیزی واقعاً کار می‌کند.',
    },
    capsSection: {
      eyebrow: 'پشت صحنه',
      title: 'قابلیت‌ها',
      desc: 'تکنیک‌های پشت مجموعه‌ابزار نوا — ساخته‌شده برای پایداری در شرایط دشوار شبکه.',
    },
    about: {
      eyebrow: 'درباره',
      title: 'ساخته‌شده به‌صورت متن‌باز',
      p1: 'نوا پراکسی یک پروژه‌ی متن‌باز با تمرکز بر ابزارهای اتصال و عبور از محدودیت است که توسط IRNova ساخته می‌شود. هر ابزار به‌صورت متن‌باز روی گیت‌هاب منتشر می‌شود — قابل‌بازبینی، رایگان برای اجرا و شکل‌گرفته توسط جامعه‌ای که به اینترنت آزاد وابسته است.',
      p2: 'این ابزارها که عمدتاً با Go و React نوشته شده‌اند، بر پایداری در دنیای واقعی تمرکز دارند: بررسی دومرحله‌ای نقاط اتصال، مسیریابی هوشمند و جریانی پیوسته از تکنیک‌ها برای پیشی‌گرفتن از فیلترینگ.',
      cta: 'مشاهده پروفایل گیت‌هاب',
      list: [
        'زیرساخت پراکسی و مسیریابی',
        'اسکن و بررسی شبکه',
        'تکنیک‌های ضد سانسور',
        'کاملاً متن‌باز',
      ],
    },
    footer: { note: 'ابزارهای شبکه‌ی متن‌باز. ساخته‌شده برای اینترنتی آزاد.' },
    viewOnGithub: 'مشاهده در گیت‌هاب',
    flagship: 'پرچم‌دار',
  },
}
