'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { reviewBatches } from '@/app/data/reviewBatches'

interface Review {
  name: string
  rating: number
  games: string[]
  comment: string
  wallet: string
}

export default function PastReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [expandedIndex, setExpandedIndex] = useState<number | null | -1>(null)
  const [reviewCount, setReviewCount] = useState(127)
  const [avgRating, setAvgRating] = useState(4.6)
  const containerRef = useRef<HTMLDivElement>(null)
  const nextBatchIndex = useRef(0)
  const [hasRecentRealReview, setHasRecentRealReview] = useState(false)

  // ✅ 拉取数据库最新评论 + 虚拟评论补位
  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' })
      const data = await res.json()

      // 数据库返回字段转成标准结构
      const realReviews: Review[] = (data || []).map((r: any) => ({
        name: r.name,
        rating: r.rating,
        games: typeof r.games === 'string' ? r.games.split(',').map((g: string) => g.trim()) : r.games,
        comment: r.experiences || '',
        wallet: r.casino_wallet || 'iPay9',
      }))

      // 虚拟评论补足
      const allVirtual = reviewBatches.flat()
      const offset = Math.floor(Date.now() / 3600000) % allVirtual.length
      const virtualReviews: Review[] = Array.from({ length: 10 }, (_, i) => {
        const raw = allVirtual[(offset + i) % allVirtual.length]
        return {
          name: raw.name,
          rating: raw.rating,
          games: raw.games || [],
          comment: raw.comment || '',
          wallet: raw.wallet || 'iPay9',
        }
      })

      // 合并：真人评论优先，虚拟补足 10 条
      const combined = [...realReviews, ...virtualReviews].slice(0, 10)
      setReviews(combined)
    } catch (err) {
      console.error('❌ Failed to fetch reviews:', err)
    }
  }

  // ✅ 初始加载 + 每分钟刷新一次（保持同步）
  useEffect(() => {
    fetchReviews()
    const interval = setInterval(fetchReviews, 60000)
    return () => clearInterval(interval)
  }, [])

  // ✅ 每小时自动插入虚拟评论（如果没人提交）
  useEffect(() => {
    const timer = setInterval(() => {
      if (!hasRecentRealReview) {
        const all = reviewBatches.flat()
        const raw = all[nextBatchIndex.current % all.length]
        const next: Review = {
          name: raw.name,
          rating: raw.rating,
          games: raw.games || [],
          comment: raw.comment || '',
          wallet: raw.wallet || 'iPay9',
        }
        nextBatchIndex.current++
        setReviews((prev) => [next, ...prev].slice(0, 10))

        const randomIncrement = Math.floor(Math.random() * 3) + 8
        const randomRating = 4.3 + Math.random() * 0.4
        setReviewCount((prev) => prev + randomIncrement)
        setAvgRating(parseFloat(randomRating.toFixed(1)))
      }
    }, 3600000)

    return () => clearInterval(timer)
  }, [hasRecentRealReview])

  // ✅ 手动滑动控制
  const handlePrev = () => setStartIndex((prev) => Math.max(prev - 1, 0))
  const handleNext = () => setStartIndex((prev) => Math.min(prev + 1, reviews.length - 5))

  // ✅ 滑动手势支持
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let startX = 0
    let endX = 0
    const handleTouchStart = (e: TouchEvent) => (startX = e.touches[0].clientX)
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX
      if (startX - endX > 50) handleNext()
      if (endX - startX > 50) handlePrev()
    }
    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchend', handleTouchEnd)
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <section className="pt-4 pb-10 sm:pt-6 sm:pb-12 px-4 relative bg-transparent">
      <div className="max-w-7xl mx-auto text-center relative">
        {/* ===== Header ===== */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">Player Reviews</h2>
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
            <span className="text-xs text-gray-500">{reviewCount.toLocaleString()} reviews</span>
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
                <div key={index} className="relative min-w-[25%] max-w-[20%] px-2">
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
          {reviews.slice(0, expandedIndex === -1 ? 10 : 5).map((review, index) => (
            <div key={index} className="relative">
              {index === 0 && (
                <span className="absolute -top-3 right-3 z-30 bg-gradient-to-r from-indigo-400 to-blue-500 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
                  Latest Review
                </span>
              )}
              <ReviewCard review={review} isMobile />
            </div>
          ))}

          {reviews.length > 5 && (
            <button
              onClick={() => setExpandedIndex(expandedIndex === -1 ? null : -1)}
              className="mt-3 mx-auto text-sm font-semibold text-blue-600 bg-blue-50 px-5 py-2 rounded-full shadow-sm hover:bg-blue-100 transition"
            >
              {expandedIndex === -1 ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

// ===== Review Card =====
const ReviewCard = ({ review, isMobile = false }: { review: Review; isMobile?: boolean }) => {
  const getAvatarUrl = (name: string) =>
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
      name.trim()
    )}&backgroundColor=transparent`

  return (
    <div
      className={`bg-white border border-gray-100 shadow-sm rounded-3xl ${
        isMobile ? 'p-4 h-auto' : 'p-6 h-[360px]'
      } flex flex-col justify-between text-left transition hover:shadow-lg sm:hover:scale-[1.01]`}
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
          {review.games?.map((game, i) => (
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
        <span className="text-xs text-gray-400">Wallet</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <img src="/australia-flag.png" alt="Flag" className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {review.wallet}
          </span>
        </div>
      </div>
    </div>
  )
}
