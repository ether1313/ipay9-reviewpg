'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Review {
  id?: number
  name: string
  rating: number
  games: string[]
  comment: string
  wallet: string
  created_at?: string
}

export default function PastReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [expandedIndex, setExpandedIndex] = useState<number | null | -1>(null)
  const [reviewCount, setReviewCount] = useState(102)
  const [avgRating, setAvgRating] = useState(4.6)
  const containerRef = useRef<HTMLDivElement>(null)

  // 格式化函数
  const formatReview = (r: any): Review => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    games: typeof r.games === 'string' ? r.games.split(',').map((g: string) => g.trim()) : r.games,
    comment: r.experiences || r.comment || '',
    wallet: r.casino_wallet || r.wallet || 'iPay9',
    created_at: r.created_at,
  })

  // 固定随机函数（全球一致）
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // 计算虚拟统计数（每4小时更新一次）
  const updateVirtualStats = () => {
    const baseDate = new Date('2025-11-01T00:00:00Z')
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - baseDate.getTime()) / 3600000)
    const fourHourBlock = Math.floor(diffHours / 4) // 每4小时一个周期

    // 固定随机增长：5~10
    const randomGrowth = Math.floor(5 + seededRandom(fourHourBlock) * 6)
    const count = 102 + fourHourBlock * randomGrowth
    setReviewCount(count)

    // 平均评分在 4.4~4.7 之间浮动
    const avg = 4.4 + seededRandom(fourHourBlock + 999) * 0.3
    setAvgRating(parseFloat(avg.toFixed(1)))
  }

  // 初始化加载评论 + 虚拟统计
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('ipay9_review')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
        if (error) throw error
        if (data) setReviews(data.map(formatReview))
      } catch (err) {
        console.error('❌ Fetch reviews failed:', err)
      }
    }

    fetchReviews()
    updateVirtualStats() // 初次计算虚拟数

    // 每4小时重新计算一次虚拟数
    const interval = setInterval(updateVirtualStats, 4 * 60 * 60 * 1000)

    // Supabase Realtime 监听新评论
    const channel = supabase
      .channel('realtime:ipay9_review')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ipay9_review' },
        (payload) => {
          const newReview = formatReview(payload.new)
          setReviews((prev) => [newReview, ...prev].slice(0, 10))
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
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
        <div className="relative hidden sm:flex items-center justify-start">
          {/* ← 左箭头 */}
          <button
            onClick={handlePrev}
            className={`absolute -left-6 z-20 p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition ${
              startIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          {/* 卡片容器 */}
          <div ref={containerRef} className="w-full overflow-visible px-10">
            <div
              className="flex gap-6 transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${startIndex * 22}%)`,
              }}
            >
              {reviews.map((review, index) => (
                <div
                  key={review.id || index}
                  className="relative min-w-[20%] max-w-[20%] flex-shrink-0"
                >
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

          {/* → 右箭头 */}
          <button
            onClick={handleNext}
            className={`absolute -right-6 z-20 p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition ${
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
              <div key={review.id || index} id={`review-${index + 1}`} className="relative transition-all duration-500">
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
              onClick={() => setExpandedIndex(expandedIndex === -1 ? null : -1)}
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
