import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { LogoMarquee } from './LogoMarquee'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4'

const navTextButton =
  'text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors'

const touchButton =
  'flex items-center gap-1 bg-white px-5 py-2 rounded-full text-[12px] font-semibold text-[#0a1b33] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all'

export function FoundationHero() {
  return (
    <main className="w-full px-4 py-10">
      {/* ---------------- Hero container ---------------- */}
      <section className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-white border border-slate-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden h-[600px] flex flex-col">
        {/* Background video layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <video
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105 transition-transform duration-1000"
          />
        </div>

        {/* Text content */}
        <div className="relative z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-start gap-5"
          >
            <h1 className="font-display text-[42px] md:text-[56px] font-medium leading-[1.05] tracking-tight text-[#0a1b33]">
              Foundation of the
              <br />
              new digital epoch
            </h1>

            <p className="max-w-md font-sans text-[14px] md:text-[15px] leading-relaxed text-[#64748b]">
              Designing products, powering ecosystems and laying the foundation
              of a decentralized web for enterprises, builders and communities
              alike.
            </p>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="mt-2 rounded-full bg-[#0a152d] px-7 py-3 text-[14px] font-semibold text-white shadow-lg"
            >
              Contact Us
            </motion.button>
          </motion.div>
        </div>

        {/* ---------------- Floating bottom navbar ---------------- */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
            className="flex items-center bg-white/90 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/40"
          >
            {/* Logo placeholder */}
            <div className="grid place-items-center w-9 h-9 bg-white border border-slate-100 shadow-sm rounded-full text-[#0a1b33]">
              ✦
            </div>

            <button type="button" className={`${navTextButton} ml-3 px-2`}>
              Products
            </button>
            <button type="button" className={`${navTextButton} px-2`}>
              Docs
            </button>

            {/* Get in touch */}
            <button type="button" className={`${touchButton} ml-2`}>
              <span>Get in touch</span>
              <ChevronRight size={14} />
            </button>
          </motion.nav>
        </div>
      </section>

      {/* ---------------- Marquee logo scroller ---------------- */}
      <LogoMarquee />
    </main>
  )
}
