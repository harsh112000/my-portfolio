import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { SectionHeading, FadeIn } from './Reveal';
import Counter from './Counter';
import { stats } from '../data/content';
import { ease, viewport } from '../lib/motion';

const story =
  'I started out building crypto payment rails at BloqueLabs, where a transaction can look final and still disappear. That taught me to treat every payment as a state machine. Today at Zoop I break monoliths into services, push money and messages through Kafka, and design ledgers that reconcile to the last rupee. I care about the parts of a system nobody sees until they fail.';

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const blur = useTransform(progress, range, ['blur(2px)', 'blur(0px)']);
  return <motion.span style={{ opacity, filter: blur }} className="mr-[0.26em] inline-block">{children}</motion.span>;
}

function ScrollLitParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className="text-[clamp(1.35rem,2.6vw,2.05rem)] font-normal leading-[1.35] tracking-[-0.02em] text-fog-100">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
      ))}
    </p>
  );
}

export default function About() {
  return (
    <section id="about" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading index="01" eyebrow="About" title="Calm systems for messy, real-world money." accent={['money.']} />
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <ScrollLitParagraph text={story} />
          <FadeIn delay={0.1} className="flex flex-col justify-end gap-6 text-[15px] leading-relaxed text-fog-400">
            <p>
              Most of my work lives where correctness is not optional: payments, settlements, wallets and loan disbursement. I like
              <span className="text-fog-100"> boring, observable infrastructure</span>, explicit state machines, and APIs that behave
              the same on the hundredth retry as on the first.
            </p>
            <p>
              Before that: a B.Tech in Computer Science from KIET Group of Institutions, and a steady habit of
              <a className="text-mint underline decoration-mint/30 underline-offset-4 transition hover:decoration-mint" href="https://leetcode.com/u/harsh1105" target="_blank" rel="noreferrer"> solving problems on LeetCode</a>.
            </p>
          </FadeIn>
        </div>

        <motion.dl initial="hidden" whileInView="show" viewport={viewport} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-24 grid grid-cols-2 border-t hairline lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }}
              className={`group relative hairline px-5 py-8 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b' : ''} lg:border-b-0 ${i < 3 ? 'lg:border-r' : 'lg:border-r-0'}`}>
              <span className="absolute left-0 top-0 h-px w-0 bg-gradient-to-r from-mint to-iris transition-all duration-700 group-hover:w-full" />
              <dd className="text-[clamp(2.4rem,5vw,3.8rem)] font-medium leading-none tracking-tightest text-fog-100"><Counter to={s.value} suffix={s.suffix} /></dd>
              <dt className="mt-4 max-w-[220px] text-[13px] leading-snug text-fog-400">{s.label}</dt>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
