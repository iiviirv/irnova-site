// Project data for IRNova's open-source tools.
// Sourced from https://github.com/IRNova
export const projects = [
  {
    name: 'Nova-Proxy',
    tagline: 'Subscription & routing control panel',
    description:
      'A graphical panel for delivering Worker subscriptions with proxies, Trojan, and Warp — alongside proxy chains, full DNS management, clean-IP selection, and advanced routing for users on every platform.',
    language: 'HTML',
    stars: 1301,
    url: 'https://github.com/IRNova/Nova-Proxy',
    tags: ['Subscriptions', 'Trojan', 'Warp', 'DNS', 'Routing'],
    featured: true,
  },
  {
    name: 'Nova-Proxy-App',
    tagline: 'Local proxy engine that bypasses filtering',
    description:
      'A powerful local proxy with GSA capabilities: Domain Fronting, TLS fragmentation, ECH injection, QUIC replay, MITM, and intelligent routing — engineered to slip past filtering systems.',
    language: 'Go',
    stars: 709,
    url: 'https://github.com/IRNova/Nova-Proxy-App',
    tags: ['Domain Fronting', 'TLS Fragmentation', 'ECH', 'QUIC', 'Smart Routing'],
    featured: true,
  },
  {
    name: 'NovaRadar',
    tagline: 'Desktop Cloudflare IP scanner',
    description:
      'A desktop IP scanner built with Go + React. It scans Cloudflare IP ranges from multiple selectable sources and runs real two-phase verification (TCP + TLS handshake) to surface the cleanest, fastest endpoints.',
    language: 'Go + React',
    stars: 97,
    url: 'https://github.com/IRNova/NovaRadar',
    tags: ['IP Scanning', 'Cloudflare', 'TCP + TLS', 'Desktop'],
    featured: false,
  },
  {
    name: 'Tools',
    tagline: 'Handy networking utilities',
    description:
      'A growing collection of smaller utilities and helpers that support the Nova toolchain and day-to-day networking workflows.',
    language: 'Utilities',
    stars: 5,
    url: 'https://github.com/IRNova/Tools',
    tags: ['Utilities', 'Helpers'],
    featured: false,
  },
]

export const capabilities = [
  {
    icon: 'shield',
    title: 'Bypass Filtering',
    text: 'Domain fronting, TLS fragmentation, ECH injection and QUIC replay work together to keep connections alive where they would otherwise be blocked.',
  },
  {
    icon: 'route',
    title: 'Intelligent Routing',
    text: 'Proxy chains, rule-based routing, and clean-IP selection automatically steer traffic down the fastest, most reliable path.',
  },
  {
    icon: 'radar',
    title: 'Real Verification',
    text: 'Two-phase TCP + TLS handshake testing means every endpoint is proven reachable before you ever rely on it.',
  },
  {
    icon: 'globe',
    title: 'Cross-Platform',
    text: 'A consistent experience across desktop and every major platform, with subscription delivery that just works.',
  },
  {
    icon: 'dns',
    title: 'Full DNS Control',
    text: 'Complete DNS settings management with support for Warp, Trojan, and custom upstreams baked right in.',
  },
  {
    icon: 'open',
    title: 'Open Source',
    text: 'Every project is open source on GitHub — auditable, community-driven, and free to study, run, and improve.',
  },
]
