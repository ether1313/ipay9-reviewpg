'use client';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const Authorize = () => {
  const ref = useRef(null);

  // 追蹤該 section 的滾動進度 (0 到 1)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'], // 當 section 出現在視窗內時開始
  });

  // 使用滾動比例來控制縮放、位置與透明度
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [2.5, 1.3, 1, 2]); // 大 → 小 → 回大
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -50]); // 位移
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.3, 1, 1, 0.5]);

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-24 bg-gradient-to-br from-white via-blue-50 to-blue-100 overflow-hidden"
    >
      {/* 背景柔光動態 */}
      <motion.div
        className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-300/30 rounded-full blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
      />

      {/* 內容 */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
        <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-lg sm:text-2xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-12 text-gray-800 text-center"
            >
            <span className="block sm:inline">Officially Recognized by</span>{' '}
            <span className="block sm:inline">TPA</span>
        </motion.h2>

        {/* 徽章 + 文字 */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 mt-10 px-4 lg:px-12">
        {/* 👇 動態徽章 */}
        <motion.div
            style={{ scale, y, opacity }}
            className="relative flex flex-col items-center origin-center flex-shrink-0"
        >
            <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-xl"
            animate={{ x: ['-150%', '150%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            />
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
            <Image
                src="/TPA-authorized-nb.png"
                alt="Trusted Pokies Australia Badge"
                fill
                className="object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]"
            />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-gray-500 font-medium text-center">
            Trusted Pokies Australia · 2025 Certification
            </p>
        </motion.div>

        {/* 👇 描述文字 */}
        <motion.div
            initial={{ opacity: 0, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            viewport={{ once: false }}
            className="max-w-xl text-gray-700 text-sm sm:text-base leading-relaxed text-center lg:text-left mt-6 lg:mt-0"
        >
            <p className="mb-3">
            iPay9 Australia Online Casino Wallet has been officially recognized and recommended by{' '}
            <span className="font-semibold text-blue-700">Trusted Pokies Australia</span> for its
            commitment to transparency, security, and entertainment excellence.
            </p>
            <p className="text-gray-600 italic">
            "Play smart. Play secure. Play with iPay9."
            </p>
        </motion.div>
        </div>

        {/* 信任提示 */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        viewport={{ once: false }}
        className="mt-16 sm:mt-20 flex flex-col sm:flex-row items-center justify-center gap-3 text-gray-600 text-center"
        >
        <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto sm:mx-0" />
        <span className="text-sm sm:text-base font-medium">
            Verified & Endorsed by Trusted Pokies Australia
        </span>
        </motion.div>

      </div>
    </section>
  );
};

export default Authorize;
