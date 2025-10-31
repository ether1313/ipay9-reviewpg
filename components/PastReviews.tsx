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

function ClientOnlyPastReviews() {
  const LOCAL_STORAGE_KEY = 'player_reviews';
  const LAST_INDEX_KEY = 'player_reviews_last_index';
  const COUNT_KEY = 'player_review_count';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null | -1>(null);
  const [reviewCount, setReviewCount] = useState(127);
  const [avgRating, setAvgRating] = useState(4.6);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ 初始化评论数（从 localStorage 读取）
  useEffect(() => {
    const savedCount = localStorage.getItem(COUNT_KEY);
    if (savedCount) {
      setReviewCount(parseInt(savedCount, 10));
    } else {
      setReviewCount(127);
      localStorage.setItem(COUNT_KEY, '127');
    }
  }, []);

  // ✅ 定期更新评论数并持久保存
  useEffect(() => {
    const updateCount = () => {
      const randomIncrement = Math.floor(Math.random() * 6) + 10; // +10 ~ +15
      setReviewCount((prev) => {
        const updated = prev + randomIncrement;
        localStorage.setItem(COUNT_KEY, updated.toString());
        return updated;
      });

      const randomRating = 4 + Math.random() * 1;
      setAvgRating(Math.max(3, Math.min(5, randomRating)));
    };

    const getRandomInterval = () => (30 + Math.floor(Math.random() * 31)) * 60 * 1000; // 30~60分钟
    let timer = setTimeout(function repeat() {
      updateCount();
      timer = setTimeout(repeat, getRandomInterval());
    }, getRandomInterval());

    return () => clearTimeout(timer);
  }, []);

  // ✅ 初始化 review 列表
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let lastIndex = parseInt(localStorage.getItem(LAST_INDEX_KEY) || '10');

    if (saved) {
      setReviews(JSON.parse(saved) as Review[]);
    } else {
      const initial = reviewBatches.flat().slice(0, 10) as Review[];
      setReviews(initial);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      localStorage.setItem(LAST_INDEX_KEY, '10');
    }

    const interval = setInterval(() => {
      const allReviews = reviewBatches.flat();
      if (lastIndex >= allReviews.length) lastIndex = 10;
      const nextReview = allReviews[lastIndex];
      lastIndex += 1;

      setReviews((prev) => {
        const updated = [nextReview, ...prev.slice(0, 9)];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(LAST_INDEX_KEY, lastIndex.toString());
        return updated;
      });
    }, 3600000); // 每小时更新一条新review

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => setStartIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setStartIndex((prev) => Math.min(prev + 1, reviews.length - 5));

  // ✅ 触控滑动控制
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let startX = 0;
    let endX = 0;
    const handleTouchStart = (e: TouchEvent) => (startX = e.touches[0].clientX);
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) handleNext();
      if (endX - startX > 50) handlePrev();
    };
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <section className="pt-4 pb-10 sm:pt-6 sm:pb-12 px-4 relative bg-transparent">
      <div className="max-w-7xl mx-auto text-center relative">
        {/* ===== Header ===== */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">Testimonials</h2>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.round(avgRating) ? '#facc15' : '#e5e7eb'}
                  stroke="none"
                />
              ))}
              <span className="ml-1 font-semibold text-gray-800 text-sm sm:text-base">
                {avgRating.toFixed(1)}/5.0
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {reviewCount.toLocaleString()} reviews
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
                  <ReviewCard
                    review={review}
                    index={index}
                    expandedIndex={expandedIndex}
                    setExpandedIndex={setExpandedIndex}
                  />
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
      </div>
    </section>
  );
}

// ✅ Review Card 保持不变
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
