// Step-by-step setup guide content, in English and Farsi.
// Based on the Nova-Proxy README (Cloudflare Worker + KV deployment) and
// common client-app workflows. Written for non-technical users.
//
// Step schema:
//   { title, body, list?, code?: [{label?, value}], note?: {tone, text} }
//   tone: 'tip' | 'warn' | 'info'

export const guide = {
  en: {
    title: 'Setup Guide',
    intro:
      'Follow these friendly, step-by-step instructions to set up Nova Proxy and connect your device. No technical experience needed, just pick a track below and check off each step as you go.',
    backHome: 'Back to home',
    tracksTitle: 'Choose what you want to do',
    ui: {
      step: 'Step',
      of: 'of',
      markDone: 'Mark as done',
      done: 'Done',
      next: 'Next step',
      copy: 'Copy',
      copied: 'Copied!',
      prereqTitle: 'Before you start',
      timeLabel: 'Time',
      complete: 'complete',
      allDone: 'All steps complete, nicely done! 🎉',
    },
    tracks: {
      panel: {
        label: 'Create your own panel',
        tagline: 'Host on Cloudflare · free',
        time: '~10 minutes',
        prereq: [
          'A free Cloudflare account (we’ll create one)',
          'An email address',
          'A device with a web browser',
        ],
        steps: [
          {
            title: 'Create a free Cloudflare account',
            body: 'Cloudflare runs your panel for free. If you already have an account, skip to the next step.',
            list: [
              'Go to dash.cloudflare.com/sign-up',
              'Enter your email and a password, then select Sign up',
              'Open the verification email from Cloudflare and confirm your address',
              'Log in to your new dashboard',
            ],
            note: {
              tone: 'tip',
              text: 'Use a password you don’t use anywhere else, this account controls your panel.',
            },
          },
          {
            title: 'Get the latest Worker file',
            body: 'Nova Proxy ships as a single .js file on GitHub Releases that bundles the dashboard, install wizard, and Telegram bot.',
            list: [
              'Open the Releases page below',
              'Download the latest Worker .js asset (the newest version)',
              'Open it in a text editor and copy everything, or keep the file handy',
            ],
            code: [{ label: 'Latest release', value: 'https://github.com/IRNova/Nova-Proxy/releases/latest' }],
            note: {
              tone: 'info',
              text: 'Always grab it from Releases so you get the newest version with the latest fixes.',
            },
          },
          {
            title: 'Create a Worker and paste the code',
            body: 'A “Worker” is the small app that runs Nova Proxy.',
            list: [
              'In Cloudflare, open Workers & Pages, then Create, then Create Worker',
              'Give it a name like nova (this becomes part of your web address)',
              'Select Deploy to create it, then Edit code',
              'Delete the sample code, paste the Nova Proxy .js, then Deploy',
            ],
          },
          {
            title: 'Add a storage (KV) namespace',
            body: 'Nova Proxy keeps your settings in a small KV database.',
            list: [
              'Open Storage & Databases, then KV, then Create namespace',
              'Give it any name (for example nova) and create it',
              'Open your Worker, then Settings, then Bindings, and add a KV Namespace binding',
              'Set the Variable name to KV, choose your namespace, and Save',
            ],
            code: [{ label: 'Variable name', value: 'KV' }],
            note: {
              tone: 'warn',
              text: 'The binding name must be exactly KV (capital letters), or the install page can’t find your database.',
            },
          },
          {
            title: 'Open the install wizard and set a password',
            body: 'Open your Worker URL with /install and a setup wizard appears.',
            list: [
              'Open https://<your-worker>.workers.dev/install',
              'The KV database row should show green',
              'Type an admin password and select Create password',
            ],
            code: [{ label: 'Setup wizard', value: 'https://<your-worker>.workers.dev/install' }],
            note: {
              tone: 'tip',
              text: 'Pick a strong password, it’s the only thing protecting your panel.',
            },
          },
          {
            title: 'Add a custom domain (for Iran)',
            body: 'Inside Iran, *.workers.dev is blocked, so give your Worker its own domain.',
            list: [
              'In your Worker, open Settings, then Domains & Routes',
              'Add a Custom Domain you control (or a free subdomain)',
              'Your configs will then use that domain’s SNI instead of workers.dev',
            ],
            note: {
              tone: 'warn',
              text: 'Skip this only if you can already reach *.workers.dev. In Iran you’ll almost always need a custom domain.',
            },
          },
          {
            title: 'Log in and copy your subscription link',
            body: 'After creating the password you’re sent to /login. Sign in to see your link and QR.',
            list: [
              'Open https://<your-domain>/login and sign in with your password',
              'The panel shows your personal subscription link and a QR code',
              'Copy the link or save the QR — keep it private, anyone with it can use your proxy',
            ],
            code: [{ label: 'Login', value: 'https://<your-domain>/login' }],
            note: {
              tone: 'info',
              text: 'Next, switch to the “Connect a device” track to start browsing.',
            },
          },
        ],
      },
      connect: {
        label: 'Connect a device',
        tagline: 'Use a subscription link',
        time: '~5 minutes',
        prereq: [
          'A subscription link or QR code (from your panel or a provider)',
          'A phone or computer',
        ],
        steps: [
          {
            title: 'Get your subscription link',
            body: 'You need a subscription link that starts with https://. You can get it from your own Nova Proxy panel, or from whoever shared it with you.',
            note: {
              tone: 'tip',
              text: 'Don’t post your link publicly, treat it like a password.',
            },
          },
          {
            title: 'Install a client app',
            body: 'Pick the recommended app for your device. Hiddify is the most beginner-friendly and works everywhere.',
            list: [
              'Android: Hiddify, v2rayNG, MahsaNG, FlClash, or NekoBox',
              'iPhone / iPad: Hiddify, Streisand, or Karing',
              'Windows: Hiddify, FlClash, Clash Meta, or NekoBox',
              'macOS: Hiddify, FlClash, or Karing',
            ],
            note: {
              tone: 'info',
              text: 'Install apps only from the official App Store, Google Play, or the app’s official GitHub page.',
            },
          },
          {
            title: 'Import your subscription',
            body: 'Add your link to the app.',
            list: [
              'Copy your subscription link to the clipboard',
              'Open the app and look for Add subscription, Import, or the + button',
              'Choose Import from clipboard, or scan your QR code',
              'Select Update to load the available servers',
            ],
          },
          {
            title: 'Connect',
            body: 'Choose a server and turn it on.',
            list: [
              'Pick a server from the list',
              'Press the large Connect button (or power icon)',
              'Allow the VPN permission if your device asks',
            ],
            note: {
              tone: 'tip',
              text: 'Use the app’s speed or ping test to find the fastest server.',
            },
          },
          {
            title: 'Check that it’s working',
            body: 'Confirm you’re connected.',
            list: [
              'Open a website that was previously blocked, or search “what is my IP”',
              'Your IP and location should now be different',
              'If a server is slow or fails, go back and try another one',
            ],
            note: {
              tone: 'info',
              text: 'That’s it, you’re connected. Re-run Update in the app later to refresh your servers.',
            },
          },
        ],
      },
    },
  },

  fa: {
    title: 'راهنمای راه‌اندازی',
    intro:
      'این راهنمای ساده و گام‌به‌گام را دنبال کنید تا نوا پراکسی را راه‌اندازی کنید و دستگاه خود را وصل کنید. به هیچ دانش فنی‌ای نیاز نیست، کافی است یکی از مسیرهای زیر را انتخاب کنید و هر مرحله را که انجام دادید علامت بزنید.',
    backHome: 'بازگشت به خانه',
    tracksTitle: 'انتخاب کنید چه می‌خواهید انجام دهید',
    ui: {
      step: 'مرحله',
      of: 'از',
      markDone: 'علامت‌گذاری به‌عنوان انجام‌شده',
      done: 'انجام شد',
      next: 'مرحله‌ی بعد',
      copy: 'کپی',
      copied: 'کپی شد!',
      prereqTitle: 'پیش از شروع',
      timeLabel: 'زمان',
      complete: 'تکمیل‌شده',
      allDone: 'همه‌ی مراحل تکمیل شد، عالی بود! 🎉',
    },
    tracks: {
      panel: {
        label: 'ساخت پنل اختصاصی',
        tagline: 'میزبانی روی Cloudflare · رایگان',
        time: 'حدود ۱۰ دقیقه',
        prereq: [
          'یک حساب رایگان Cloudflare (با هم می‌سازیم)',
          'یک آدرس ایمیل',
          'دستگاهی با مرورگر وب',
        ],
        steps: [
          {
            title: 'ساخت حساب رایگان Cloudflare',
            body: 'Cloudflare پنل شما را به‌صورت رایگان اجرا می‌کند. اگر از قبل حساب دارید، به مرحله‌ی بعد بروید.',
            list: [
              'به نشانی dash.cloudflare.com/sign-up بروید',
              'ایمیل و یک رمز عبور وارد کنید و سپس Sign up را بزنید',
              'ایمیل تأیید Cloudflare را باز کنید و آدرس خود را تأیید کنید',
              'وارد داشبورد جدید خود شوید',
            ],
            note: {
              tone: 'tip',
              text: 'از رمزی استفاده کنید که جای دیگری به کار نبرده‌اید، این حساب کنترل پنل شما را در دست دارد.',
            },
          },
          {
            title: 'دریافت آخرین فایل ورکر',
            body: 'نوا پراکسی به‌صورت یک فایل .js در GitHub Releases منتشر می‌شود که داشبورد، راهنمای نصب و ربات تلگرام را در خود دارد.',
            list: [
              'صفحه‌ی Releases زیر را باز کنید',
              'آخرین فایل ورکر (.js) را دانلود کنید (جدیدترین نسخه)',
              'آن را در یک ویرایشگر متن باز کنید و همه‌چیز را کپی کنید، یا فایل را دم‌دست نگه دارید',
            ],
            code: [{ label: 'آخرین نسخه', value: 'https://github.com/IRNova/Nova-Proxy/releases/latest' }],
            note: {
              tone: 'info',
              text: 'همیشه آن را از Releases بگیرید تا جدیدترین نسخه با آخرین اصلاحات را داشته باشید.',
            },
          },
          {
            title: 'ساخت ورکر و جای‌گذاری کد',
            body: '«Worker» همان برنامه‌ی کوچکی است که نوا پراکسی را اجرا می‌کند.',
            list: [
              'در Cloudflare، بخش Workers & Pages، سپس Create و سپس Create Worker را باز کنید',
              'نامی مانند nova بگذارید (این نام بخشی از آدرس وب شما می‌شود)',
              'Deploy را بزنید تا ساخته شود، سپس Edit code را انتخاب کنید',
              'کد نمونه را پاک کنید، فایل .js نوا پراکسی را جای‌گذاری کنید و Deploy بزنید',
            ],
          },
          {
            title: 'افزودن فضای ذخیره‌سازی (KV)',
            body: 'نوا پراکسی تنظیمات شما را در یک دیتابیس کوچک KV نگه می‌دارد.',
            list: [
              'بخش Storage & Databases، سپس KV و سپس Create namespace را باز کنید',
              'هر نامی (برای مثال nova) بگذارید و آن را بسازید',
              'Worker خود را باز کنید، به Settings و سپس Bindings بروید و یک KV Namespace binding اضافه کنید',
              'مقدار Variable name را KV بگذارید، فضای خود را انتخاب کنید و Save کنید',
            ],
            code: [{ label: 'نام متغیر', value: 'KV' }],
            note: {
              tone: 'warn',
              text: 'نام متغیر باید دقیقاً KV (با حروف بزرگ) باشد، وگرنه صفحه‌ی نصب نمی‌تواند دیتابیس شما را پیدا کند.',
            },
          },
          {
            title: 'باز کردن راهنمای نصب و گذاشتن رمز',
            body: 'آدرس Worker خود را با /install باز کنید تا راهنمای راه‌اندازی ظاهر شود.',
            list: [
              'آدرس https://<your-worker>.workers.dev/install را باز کنید',
              'ردیف دیتابیس KV باید سبز نشان داده شود',
              'یک رمز مدیر تایپ کنید و روی Create password بزنید',
            ],
            code: [{ label: 'راهنمای نصب', value: 'https://<your-worker>.workers.dev/install' }],
            note: {
              tone: 'tip',
              text: 'یک رمز قوی انتخاب کنید، تنها چیزی است که از پنل شما محافظت می‌کند.',
            },
          },
          {
            title: 'افزودن دامنه‌ی اختصاصی (برای ایران)',
            body: 'داخل ایران، *.workers.dev فیلتر است، پس به Worker خود یک دامنه‌ی اختصاصی بدهید.',
            list: [
              'در Worker، به Settings و سپس Domains & Routes بروید',
              'یک دامنه‌ی اختصاصی که در اختیار دارید (یا یک زیردامنه‌ی رایگان) اضافه کنید',
              'کانفیگ‌های شما به‌جای workers.dev از SNI همان دامنه استفاده می‌کنند',
            ],
            note: {
              tone: 'warn',
              text: 'فقط در صورتی این مرحله را رد کنید که از قبل به *.workers.dev دسترسی دارید. در ایران تقریباً همیشه به دامنه‌ی اختصاصی نیاز دارید.',
            },
          },
          {
            title: 'ورود و کپی لینک اشتراک',
            body: 'پس از ساختن رمز، به /login هدایت می‌شوید. وارد شوید تا لینک و QR خود را ببینید.',
            list: [
              'آدرس https://<your-domain>/login را باز کنید و با رمز خود وارد شوید',
              'پنل، لینک اشتراک شخصی و یک کد QR به شما نشان می‌دهد',
              'لینک را کپی کنید یا QR را ذخیره کنید — آن را خصوصی نگه دارید، هر کسی آن را داشته باشد می‌تواند از پراکسی شما استفاده کند',
            ],
            code: [{ label: 'ورود', value: 'https://<your-domain>/login' }],
            note: {
              tone: 'info',
              text: 'حالا به مسیر «اتصال دستگاه» بروید تا مرور را آغاز کنید.',
            },
          },
        ],
      },
      connect: {
        label: 'اتصال دستگاه',
        tagline: 'با لینک اشتراک',
        time: 'حدود ۵ دقیقه',
        prereq: [
          'یک لینک اشتراک یا کد QR (از پنل خودتان یا یک سرویس‌دهنده)',
          'یک گوشی یا رایانه',
        ],
        steps: [
          {
            title: 'دریافت لینک اشتراک',
            body: 'به یک لینک اشتراک نیاز دارید که با https:// شروع می‌شود. می‌توانید آن را از پنل نوا پراکسی خودتان یا از کسی که برایتان فرستاده دریافت کنید.',
            note: {
              tone: 'tip',
              text: 'لینک خود را عمومی منتشر نکنید، با آن مانند یک رمز عبور رفتار کنید.',
            },
          },
          {
            title: 'نصب یک برنامه‌ی کلاینت',
            body: 'برنامه‌ی پیشنهادی دستگاه خود را انتخاب کنید. Hiddify ساده‌ترین گزینه برای تازه‌کارهاست و روی همه‌ی دستگاه‌ها کار می‌کند.',
            list: [
              'اندروید: Hiddify، v2rayNG، MahsaNG، FlClash یا NekoBox',
              'آیفون / آیپد: Hiddify، Streisand یا Karing',
              'ویندوز: Hiddify، FlClash، Clash Meta یا NekoBox',
              'مک: Hiddify، FlClash یا Karing',
            ],
            note: {
              tone: 'info',
              text: 'برنامه‌ها را فقط از App Store، Google Play یا صفحه‌ی رسمی گیت‌هاب برنامه نصب کنید.',
            },
          },
          {
            title: 'وارد کردن اشتراک',
            body: 'لینک خود را به برنامه اضافه کنید.',
            list: [
              'لینک اشتراک را در کلیپ‌بورد کپی کنید',
              'برنامه را باز کنید و دنبال Add subscription، Import یا دکمه‌ی + بگردید',
              'گزینه‌ی Import from clipboard را انتخاب کنید یا کد QR را اسکن کنید',
              'روی Update بزنید تا سرورها بارگذاری شوند',
            ],
          },
          {
            title: 'اتصال',
            body: 'یک سرور انتخاب کنید و آن را روشن کنید.',
            list: [
              'یک سرور از فهرست انتخاب کنید',
              'دکمه‌ی بزرگ Connect (یا نماد روشن/خاموش) را بزنید',
              'اگر دستگاه اجازه‌ی VPN خواست، آن را بدهید',
            ],
            note: {
              tone: 'tip',
              text: 'برای یافتن سریع‌ترین سرور از آزمون سرعت یا پینگ برنامه استفاده کنید.',
            },
          },
          {
            title: 'بررسی درست کار کردن',
            body: 'از وصل بودن مطمئن شوید.',
            list: [
              'سایتی که قبلاً مسدود بود را باز کنید یا «what is my IP» را جست‌وجو کنید',
              'آی‌پی و موقعیت شما باید اکنون متفاوت باشد',
              'اگر سروری کند بود یا کار نکرد، برگردید و سرور دیگری را امتحان کنید',
            ],
            note: {
              tone: 'info',
              text: 'تمام شد، وصل شدید. بعداً برای به‌روزرسانی سرورها دوباره Update را بزنید.',
            },
          },
        ],
      },
    },
  },
}
