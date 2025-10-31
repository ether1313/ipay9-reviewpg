'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { reviewBatches } from '@/app/data/reviewBatches';

const PastReviews = dynamic(() => Promise.resolve(ClientOnlyPastReviews), { ssr: false });

interface Review {
  name: string;
  rating: number;
  games: string[];
  comment: string;
  wallet: string;
}

// ✅ 數字動畫 Hook（平滑過渡）
function useAnimatedNumber(targetValue: number, duration = 1000) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const ref = useRef<number>(targetValue);

  useEffect(() => {
    const startValue = ref.current;
    const diff = targetValue - startValue;
    const startTime = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = startValue + diff * progress;
      setDisplayValue(eased);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = targetValue;
    }

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

function ClientOnlyPastReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState(127);
  const [avgRating, setAvgRating] = useState(4.6);
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ 固定全局起點時間（全站一致）
  const launchTime = new Date('2025-10-31T00:00:00Z');

  // ✅ 全局伪实时算法（每小时随机增加8–10条）
  const getGlobalStats = () => {
    const elapsedHours = Math.floor((Date.now() - launchTime.getTime()) / (1000 * 60 * 60));
    const pseudoRandom = (seed: number) => Math.abs(Math.sin(seed * 888)) % 1; // 固定伪随机算法

    // 计算累积增加值（全站一致的随机模式）
    let totalIncrease = 0;
    for (let i = 0; i < elapsedHours; i++) {
      totalIncrease += 8 + Math.floor(pseudoRandom(i) * 3); // +8~10
    }

    const baseCount = 127;
    const count = baseCount + totalIncrease;

    // 平均评分平滑波动（4.45~4.75）
    const rating = 4.6 + 0.15 * Math.sin(elapsedHours / 48);

    return { count, rating: Math.min(5, Math.max(3, rating)) };
  };

  // ✅ 每分钟重新计算（所有用户看到相同增长）
  useEffect(() => {
    const update = () => {
      const { count, rating } = getGlobalStats();
      setReviewCount(count);
      setAvgRating(rating);
    };
    update();
    const timer = setInterval(update, 60000); // 每分钟刷新一次
    return () => clearInterval(timer);
  }, []);

  // ✅ Review 列表统一（按时间滚动索引）
  useEffect(() => {
    const all = reviewBatches.flat();
    const elapsedHours = Math.floor((Date.now() - launchTime.getTime()) / (1000 * 60 * 60));
    const lastIndex = (10 + elapsedHours) % all.length;
    const latestBatch = [all[lastIndex], ...all.slice(0, 9)];
    setReviews(latestBatch);
  }, []);

  // ✅ 平滑動畫值
  const animatedReviewCount = useAnimatedNumber(reviewCount, 1500);
  const animatedRating = useAnimatedNumber(avgRating, 1500);

  const handlePrev = () => setStartIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setStartIndex((prev) => Math.min(prev + 1, reviews.length - 5));

  return (
    <section className="pt-4 pb-10 sm:pt-6 sm:pb-12 px-4 relative bg-transparent">
      <div className="max-w-7xl mx-auto text-center relative">
        {/* ===== Header ===== */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-snug">
            Testimonials
          </h2>

          <div className="flex flex-col items-center gap-1 mt-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.round(animatedRating) ? '#facc15' : '#e5e7eb'}
                  stroke="none"
                />
              ))}
              <span className="ml-1 font-semibold text-gray-800 text-sm sm:text-base">
                {animatedRating.toFixed(1)}/5.0
              </span>
            </div>

            <span className="text-xs text-gray-500 transition-all duration-500">
              {Math.round(animatedReviewCount).toLocaleString()} reviews
            </span>
          </div>
        </div>

        {/* ===== Desktop Layout ===== */}
        <div className="relative hidden sm:flex items-center justify-center">
          <button
            onClick={handlePrev}
            className={`absolute left-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition ${
              startIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div ref={containerRef} className="w-full px-10">
            <div
              className="flex transition-transform duration-700 ease-in-out relative"
              style={{ transform: `translateX(-${startIndex * 20}%)` }}
            >
              {reviews.map((review, index) => (
                <div key={index} className="relative min-w-[20%] max-w-[20%] px-2">
                  {index === 0 && (
                    <span className="absolute -top-4 right-4 z-30 bg-gradient-to-r from-indigo-400 to-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">
                      Latest Review
                    </span>
                  )}
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className={`absolute right-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition ${
              startIndex >= reviews.length - 5 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* ===== Mobile Layout ===== */}
        <div className="relative sm:hidden flex flex-col gap-4">
          {reviews.map((review, index) => (
            <div key={index} className="relative">
              {index === 0 && (
                <span className="absolute -top-3 right-3 z-30 bg-gradient-to-r from-indigo-400 to-blue-500 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
                  Latest Review
                </span>
              )}
              <ReviewCard review={review} isMobile />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ✅ Review Card（保持原樣）
const ReviewCard = ({ review, isMobile = false }: any) => {
  const getAvatarUrl = (name: string) =>
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
      name.trim()
    )}&backgroundColor=transparent`;

  return (
    <div
      className={`bg-white border border-gray-100 shadow-sm rounded-3xl ${
        isMobile ? 'p-4 h-auto' : 'p-6 h-[320px]'
      } flex flex-col justify-between text-left transition hover:shadow-lg sm:hover:scale-[1.01] relative`}
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <img
            src={getAvatarUrl(review.name)}
            alt={review.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 bg-gray-50"
          />
          <div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{review.name}</h3>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
          {review.games?.map((game: string, i: number) => (
            <span
              key={i}
              className="text-[10px] sm:text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100"
            >
              {game}
            </span>
          ))}
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-5">"{review.comment}"</p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-2 sm:pt-3">
        <span className="text-xs text-gray-400">Aus Wallet</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <img src="/australia-flag.png" alt="Australian Flag" className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {review.wallet}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PastReviews;
