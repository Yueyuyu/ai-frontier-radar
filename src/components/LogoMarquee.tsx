import { cn } from '../lib/cn'

/** Each logo: remote src from svgl.app, alt text, and a hover gradient. */
type Logo = {
  src: string
  alt: string
  gradient: string
}

const SVG_BASE = 'https://svgl.app/library'

const logos: Logo[] = [
  {
    src: `${SVG_BASE}/procure.svg`,
    alt: 'Procure',
    // blue gradient
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  },
  {
    src: `${SVG_BASE}/shopify.svg`,
    alt: 'Shopify',
    // yellow gradient
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  },
  {
    src: `${SVG_BASE}/blender.svg`,
    alt: 'Blender',
    // blue gradient
    gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
  },
  {
    src: `${SVG_BASE}/figma.svg`,
    alt: 'Figma',
    // purple gradient
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
  },
  {
    src: `${SVG_BASE}/spotify.svg`,
    alt: 'Spotify',
    // pink/red gradient
    gradient: 'linear-gradient(135deg, #fb7185, #e11d48)',
  },
  {
    src: `${SVG_BASE}/lottielab.svg`,
    alt: 'Lottielab',
    // yellow/green gradient
    gradient: 'linear-gradient(135deg, #facc15, #22c55e)',
  },
  {
    src: `${SVG_BASE}/google-cloud.svg`,
    alt: 'Google Cloud',
    // light blue gradient
    gradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
  },
  {
    src: `${SVG_BASE}/bing.svg`,
    alt: 'Bing',
    // cyan/teal gradient
    gradient: 'linear-gradient(135deg, #22d3ee, #14b8a6)',
  },
]

const cardClass = cn(
  'group relative h-24 w-40 shrink-0 flex items-center justify-center',
  'rounded-full bg-white border border-slate-200/60 shadow-sm',
  'hover:border-slate-300 transition-all overflow-hidden',
)

function LogoCard({ logo }: { logo: Logo }) {
  return (
    <div className={cardClass}>
      {/* gradient wash: hidden & oversized, expands to fill on hover */}
      <div
        className="absolute inset-0 opacity-0 scale-[1.5] transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
        style={{ backgroundImage: logo.gradient }}
        aria-hidden="true"
      />
      <img
        src={logo.src}
        alt={logo.alt}
        loading="lazy"
        className="relative h-8 w-auto object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert"
      />
    </div>
  )
}

/**
 * Seamless infinite logo marquee.
 * Renders the list twice inline so the -50% keyframe translation lines
 * up exactly with the start of the duplicate, producing a gap-free loop.
 */
export function LogoMarquee() {
  return (
    <div
      className="relative w-full max-w-[1400px] mx-auto mt-10 overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
      }}
    >
      <div className="marquee-track flex w-max items-center gap-4">
        {[...logos, ...logos].map((logo, index) => (
          <LogoCard key={`${logo.alt}-${index}`} logo={logo} />
        ))}
      </div>
    </div>
  )
}
