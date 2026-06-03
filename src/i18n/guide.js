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
      'Follow these friendly, step-by-step instructions to set up Nova Proxy and connect your device. No technical experience needed — just pick a track below and check off each step as you go.',
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
      allDone: 'All steps complete — nicely done! 🎉',
    },
    tracks: {
      panel: {
        label: 'Create your own panel',
        tagline: 'Host on Cloudflare · free',
        time: '~15 minutes',
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
              text: 'Use a password you don’t use anywhere else — this account controls your panel.',
            },
          },
          {
            title: 'Create a Worker',
            body: 'A “Worker” is the small app that runs Nova Proxy.',
            list: [
              'In the left menu, open Workers & Pages',
              'Select Create, then Create Worker',
              'Give it a name like nova (this becomes part of your web address)',
              'Select Deploy to create it, then Edit code',
            ],
          },
          {
            title: 'Add the Nova Proxy code',
            body: 'Now we paste in the Nova Proxy program.',
            list: [
              'Open the Nova-Proxy repository on GitHub',
              'Open the worker file (for example _worker.js) and copy all of its content',
              'Back in the Cloudflare code editor, delete the sample code and paste the Nova Proxy code',
              'Select Deploy (or Save and deploy)',
            ],
            code: [{ label: 'Repository', value: 'https://github.com/IRNova/Nova-Proxy' }],
            note: {
              tone: 'info',
              text: 'Always copy the code from the official repository so you get the latest version.',
            },
          },
          {
            title: 'Create a storage (KV) namespace',
            body: 'Nova Proxy needs a small storage area to remember your settings.',
            list: [
              'In the left menu, open Storage & Databases, then KV',
              'Select Create namespace',
              'Name it NOVA_KV and select Add',
            ],
          },
          {
            title: 'Connect the storage to your Worker',
            body: 'Link the storage you just made to your Worker.',
            list: [
              'Open your Worker, then go to Settings',
              'Find Bindings (or Variables) and add a KV Namespace Binding',
              'Set the Variable name to KV',
              'Choose the NOVA_KV namespace and Save',
            ],
            code: [{ label: 'Variable name', value: 'KV' }],
            note: {
              tone: 'warn',
              text: 'The variable name must be exactly KV (capital letters), or the panel won’t start.',
            },
          },
          {
            title: 'Set your panel password',
            body: 'This password protects your admin panel.',
            list: [
              'In your Worker, open Settings, then Variables and Secrets',
              'Add a variable named PASSWORD',
              'Enter a strong password as the value and choose Encrypt',
              'Save and deploy',
            ],
            code: [{ label: 'Variable name', value: 'PASSWORD' }],
            note: {
              tone: 'tip',
              text: 'Optional: add a variable BEST_SUB with the value true to turn on the automatic subscription generator.',
            },
          },
          {
            title: 'Open your admin panel',
            body: 'Your panel is ready. Open it in your browser.',
            list: [
              'Go to your Worker address followed by /Nova-Proxy',
              'For example: https://nova.yourname.workers.dev/Nova-Proxy',
              'Log in with the PASSWORD you set',
            ],
            code: [
              { label: 'Panel address', value: 'https://<your-worker>.workers.dev/Nova-Proxy' },
            ],
          },
          {
            title: 'Copy your subscription link',
            body: 'Inside the panel you’ll find your personal subscription link and QR code — you’ll use these to connect.',
            list: [
              'In the panel, find the Subscription section',
              'Copy the subscription link, or save the QR code',
              'Keep this link private — anyone who has it can use your proxy',
            ],
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
              text: 'Don’t post your link publicly — treat it like a password.',
            },
          },
          {
            title: 'Install a client app',
            body: 'Pick the recommended app for your device. Hiddify is the most beginner-friendly and works everywhere.',
            list: [
              'Android: Hiddify, v2rayNG, or NekoBox',
              'iPhone / iPad: Hiddify, Streisand, or Shadowrocket',
              'Windows: Hiddify, NekoRay, or v2rayN',
              'macOS: Hiddify or V2Box',
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
              text: 'That’s it — you’re connected. Re-run Update in the app later to refresh your servers.',
            },
          },
        ],
      },
    },
  },

  fa: {
    title: 'راهنمای راه‌اندازی',
    intro:
      'این راهنمای ساده و گام‌به‌گام را دنبال کنید تا نوا پراکسی را راه‌اندازی کنید و دستگاه خود را وصل کنید. به هیچ دانش فنی‌ای نیاز نیست — کافی است یکی از مسیرهای زیر را انتخاب کنید و هر مرحله را که انجام دادید علامت بزنید.',
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
      allDone: 'همه‌ی مراحل تکمیل شد — عالی بود! 🎉',
    },
    tracks: {
      panel: {
        label: 'ساخت پنل اختصاصی',
        tagline: 'میزبانی روی Cloudflare · رایگان',
        time: 'حدود ۱۵ دقیقه',
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
              text: 'از رمزی استفاده کنید که جای دیگری به کار نبرده‌اید — این حساب کنترل پنل شما را در دست دارد.',
            },
          },
          {
            title: 'ساخت یک Worker',
            body: '«Worker» همان برنامه‌ی کوچکی است که نوا پراکسی را اجرا می‌کند.',
            list: [
              'از منوی کناری، بخش Workers & Pages را باز کنید',
              'روی Create و سپس Create Worker بزنید',
              'نامی مانند nova بگذارید (این نام بخشی از آدرس وب شما می‌شود)',
              'Deploy را بزنید تا ساخته شود، سپس Edit code را انتخاب کنید',
            ],
          },
          {
            title: 'افزودن کد نوا پراکسی',
            body: 'حالا برنامه‌ی نوا پراکسی را جای‌گذاری می‌کنیم.',
            list: [
              'مخزن Nova-Proxy را در گیت‌هاب باز کنید',
              'فایل worker (برای مثال _worker.js) را باز کنید و تمام محتوای آن را کپی کنید',
              'در ویرایشگر کد Cloudflare، کد نمونه را پاک کنید و کد نوا پراکسی را جای‌گذاری کنید',
              'روی Deploy (یا Save and deploy) بزنید',
            ],
            code: [{ label: 'مخزن', value: 'https://github.com/IRNova/Nova-Proxy' }],
            note: {
              tone: 'info',
              text: 'همیشه کد را از مخزن رسمی کپی کنید تا آخرین نسخه را داشته باشید.',
            },
          },
          {
            title: 'ساخت فضای ذخیره‌سازی (KV)',
            body: 'نوا پراکسی برای به‌خاطر سپردن تنظیمات شما به فضای ذخیره‌سازی کوچکی نیاز دارد.',
            list: [
              'از منوی کناری، بخش Storage & Databases و سپس KV را باز کنید',
              'روی Create namespace بزنید',
              'نام آن را NOVA_KV بگذارید و Add را بزنید',
            ],
          },
          {
            title: 'اتصال فضای ذخیره‌سازی به Worker',
            body: 'فضای ذخیره‌سازی‌ای را که ساختید به Worker خود متصل کنید.',
            list: [
              'Worker خود را باز کنید و به Settings بروید',
              'بخش Bindings (یا Variables) را پیدا کنید و یک KV Namespace Binding اضافه کنید',
              'مقدار Variable name را KV بگذارید',
              'فضای NOVA_KV را انتخاب کنید و ذخیره کنید',
            ],
            code: [{ label: 'نام متغیر', value: 'KV' }],
            note: {
              tone: 'warn',
              text: 'نام متغیر باید دقیقاً KV (با حروف بزرگ) باشد، وگرنه پنل اجرا نمی‌شود.',
            },
          },
          {
            title: 'تعیین رمز عبور پنل',
            body: 'این رمز از پنل مدیریت شما محافظت می‌کند.',
            list: [
              'در Worker، به Settings و سپس Variables and Secrets بروید',
              'متغیری با نام PASSWORD اضافه کنید',
              'یک رمز قوی به‌عنوان مقدار وارد کنید و گزینه‌ی Encrypt را انتخاب کنید',
              'ذخیره و Deploy کنید',
            ],
            code: [{ label: 'نام متغیر', value: 'PASSWORD' }],
            note: {
              tone: 'tip',
              text: 'اختیاری: متغیری با نام BEST_SUB و مقدار true اضافه کنید تا تولیدکننده‌ی خودکار اشتراک فعال شود.',
            },
          },
          {
            title: 'باز کردن پنل مدیریت',
            body: 'پنل شما آماده است. آن را در مرورگر باز کنید.',
            list: [
              'به آدرس Worker خود و سپس /Nova-Proxy بروید',
              'برای مثال: https://nova.yourname.workers.dev/Nova-Proxy',
              'با همان PASSWORD وارد شوید',
            ],
            code: [
              { label: 'آدرس پنل', value: 'https://<your-worker>.workers.dev/Nova-Proxy' },
            ],
          },
          {
            title: 'کپی لینک اشتراک',
            body: 'داخل پنل، لینک اشتراک شخصی و کد QR شما قرار دارد — برای اتصال از همین‌ها استفاده می‌کنید.',
            list: [
              'در پنل، بخش Subscription را پیدا کنید',
              'لینک اشتراک را کپی کنید یا کد QR را ذخیره کنید',
              'این لینک را خصوصی نگه دارید — هر کسی آن را داشته باشد می‌تواند از پراکسی شما استفاده کند',
            ],
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
              text: 'لینک خود را عمومی منتشر نکنید — با آن مانند یک رمز عبور رفتار کنید.',
            },
          },
          {
            title: 'نصب یک برنامه‌ی کلاینت',
            body: 'برنامه‌ی پیشنهادی دستگاه خود را انتخاب کنید. Hiddify ساده‌ترین گزینه برای تازه‌کارهاست و روی همه‌ی دستگاه‌ها کار می‌کند.',
            list: [
              'اندروید: Hiddify، v2rayNG یا NekoBox',
              'آیفون / آیپد: Hiddify، Streisand یا Shadowrocket',
              'ویندوز: Hiddify، NekoRay یا v2rayN',
              'مک: Hiddify یا V2Box',
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
              text: 'تمام شد — وصل شدید. بعداً برای به‌روزرسانی سرورها دوباره Update را بزنید.',
            },
          },
        ],
      },
    },
  },
}
