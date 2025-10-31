'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';

// 動態引入 Testimonials（PastReviews）
const PastReviews = dynamic(() => import('@/components/PastReviews'), { ssr: false });

const HeroSection = () => {
  return (
    <section className="relative pt-12 sm:pt-14 md:pt-16 pb-20 flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 px-6">

      {/* 背景柔光 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>

      {/* 限制最大宽度 */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 公司 Logo */}
        <div className="relative w-48 h-24 sm:w-56 sm:h-28 mb-8 border border-gray-300/40 rounded-2xl flex items-center justify-center overflow-hidden mx-auto">
          <Image
            src="/ipay9.png"
            alt="Company Logo"
            fill
            className="object-contain opacity-90"
          />
        </div>

        {/* Testimonials 區塊放在這裡 */}
        <div className="mt-2">
          <PastReviews />
        </div>

        {/* 滑鼠 Scroll Down 提示 */}
        <div className="scroll-indicator mt-10">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <p className="scroll-text mt-4 text-gray-500 text-sm tracking-wider">
            SCROLL DOWN
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
