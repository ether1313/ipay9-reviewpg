'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { reviewBatches } from '@/app/data/reviewBatches'
import { createClient } from '@supabase/supabase-js'

// ✅ 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  const [reviewCount, setReviewCount] = useState(102)
  const [avgRating, setAvgRating] = useState(4.6)
  const containerRef = useRef<HTMLDivElement>(null)

  const virtualSeed = useRef(0)
  const virtualIndex = useRef(0)
  const lastRealReviewTimeRef = useRef<number>(Date.now())

  // 🧩 格式化函数
  const formatReview = (r: any): Review => ({
    name: r.name,
    rating: r.rating,
    games: typeof r.games === 'string' ? r.games.split(',').map((g: string) => g.trim()) : r.games,
    comment: r.experiences || r.comment || '',
    wallet: r.casino_wallet || r.wallet || 'iPay9',
  })

  // 🎲 固定随机数
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // 🎯 抽取虚构 review（带 auto 标记）
  const getVirtualReview = (): Review => {
    const all = reviewBatches.flat()
    const index = (virtualSeed.current * 17 + virtualIndex.current) % all.length
    const v = all[index]
    virtualIndex.current += 1
    const base = formatReview(v)
    return { ...base, comment: `${base.comment} (auto)` }
  }

  useEffect(() => {
    const baseDate = new Date('2025-11-01T00:00:00Z')
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - baseDate.getTime()) / 3600000)
    const fourHourBlock = Math.floor(diffHours / 4)

    virtualSeed.current = fourHourBlock
    const randomGrowth = Math.floor(5 + seededRandom(fourHourBlock) * 6)
    setReviewCount(102 + fourHourBlock * randomGrowth)
    const avg = 4.4 + seededRandom(fourHourBlock + 999) * 0.3
    setAvgRating(parseFloat(avg.toFixed(1)))

    // ✅ 初始载入
    const updateInitialReviews = async () => {
      try {
        const res = await fetch('/api/reviews', { cache: 'no-store' })
        const data = await res.json()

        const realReviews: Review[] = (data || [])
          .sort((a: any, b: any) => b.id - a.id)
          .slice(0, 5)
          .map(formatReview)

        if (data?.length > 0 && data[0]?.created_at) {
          lastRealReviewTimeRef.current = new Date(data[0].created_at).getTime()
        }

        const virtuals = Array.from({ length: 10 - realReviews.length }, () => getVirtualReview())
        setReviews([...realReviews, ...virtuals])
      } catch (err) {
        console.error('❌ Failed to fetch reviews:', err)
      }
    }

    updateInitialReviews()

    // 🕓 每小时检查是否需要补虚构评论
    const hourly = setInterval(() => {
      const oneHourAgo = Date.now() - 10000
      if (lastRealReviewTimeRef.current < oneHourAgo) {
        const fake = getVirtualReview()
        setReviews((prev) => [fake, ...prev].slice(0, 10))
        console.log('❕ Added virtual review as top (no real one in last hour)')
        lastRealReviewTimeRef.current = Date.now()
      }
    }, 10000)

    // 🕓 每4小时更新 seed
    const fourHourly = setInterval(() => {
      virtualSeed.current += 1
      virtualIndex.current = 0
    }, 4 * 60 * 60 * 1000)

    // 🟢 Supabase 实时监听真实评论
    const channel = supabase
      .channel('realtime:ipay9-review')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ipay9-review' },
        (payload) => {
          console.log('🟢 New real review:', payload.new)
          const newReview = formatReview(payload.new)
          lastRealReviewTimeRef.current = payload.new?.created_at
            ? new Date(payload.new.created_at).getTime()
            : Date.now()
          // ✅ 新的真实 review 永远放在最上
          setReviews((prev) => [newReview, ...prev].slice(0, 10))
        }
      )
      .subscribe()

    return () => {
      clearInterval(hourly)
      clearInterval(fourHourly)
      supabase.removeChannel(channel)
    }
  }, [])

  // 滑动控制（桌面）
  const handlePrev = () => setStartIndex((prev) => Math.max(prev - 1, 0))
  const handleNext = () => setStartIndex((prev) => Math.min(prev + 1, reviews.length - 5))

  // 手势滑动（移动端）
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
    <section id="testimonial-section" className="pt-1 pb-10 sm:pt-2 sm:pb-12 px-4 relative bg-transparent">
      <div className="max-w-7xl mx-auto text-center relative">
        {/* ===== Header ===== */}
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">Testimonials</h2>
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
                <div key={index} className="relative min-w-[25%] max-w-[25%] px-3">
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
        <div className="relative sm:hidden flex flex-col gap-4 transition-all duration-700 ease-in-out">
          <div
            className={`grid gap-4 transition-all duration-700 ease-in-out overflow-visible ${
              expandedIndex === -1 ? 'max-h-[4000px]' : 'max-h-[2000px]'
            }`}
          >
            {reviews.slice(0, expandedIndex === -1 ? 10 : 5).map((review, index) => (
              <div key={index} id={`review-${index + 1}`} className="relative transition-all duration-500">
                {index === 0 && (
                  <span className="absolute -top-3 right-4 z-30 bg-gradient-to-r from-indigo-400 to-blue-500 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
                    Latest Review
                  </span>
                )}
                <ReviewCard review={review} isMobile />
              </div>
            ))}
          </div>

          {reviews.length > 5 && (
            <button
              onClick={() => {
                if (expandedIndex === -1) {
                  const sectionTop = document.querySelector('#testimonial-section')?.getBoundingClientRect().top
                  const scrollTop = window.scrollY + (sectionTop ?? 0) - 40
                  window.scrollTo({ top: scrollTop, behavior: 'smooth' })
                  setTimeout(() => setExpandedIndex(null), 400)
                } else {
                  setExpandedIndex(-1)
                  setTimeout(() => {
                    const sixth = document.querySelector('#review-6')
                    if (sixth) {
                      const rect = sixth.getBoundingClientRect().top
                      const scrollTop = window.scrollY + rect - 80
                      window.scrollTo({ top: scrollTop, behavior: 'smooth' })
                    }
                  }, 400)
                }
              }}
              className="mt-3 mx-auto text-sm font-semibold text-blue-600 bg-blue-50 px-5 py-2 rounded-full shadow-sm hover:bg-blue-100 transition-transform duration-500 active:scale-95"
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
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=transparent`

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

        <p
          className={`text-sm mb-3 line-clamp-5 ${
            review.comment.includes('(auto)') ? 'text-gray-400 italic' : 'text-gray-600'
          }`}
        >
          "{review.comment}"
        </p>
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
