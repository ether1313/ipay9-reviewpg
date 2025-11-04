import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 禁止快取，確保即時更新
export const revalidate = 0

// GET：取得最新 10 条评论
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ipay9_review')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json(data || [], {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error: any) {
    console.error('❌ Error fetching reviews:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST：插入新评论（真实评论）
export async function POST(req: Request) {
  try {
    const { name, casino_wallet, games, experiences, rating, others } = await req.json()

    // 基础验证
    if (!name || !casino_wallet || !games || !experiences || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 插入数据到表 ipay9_review
    const { error } = await supabase.from('ipay9_review').insert([
      {
        name,
        casino_wallet,
        games: Array.isArray(games) ? games.join(', ') : games,
        experiences: Array.isArray(experiences) ? experiences.join(', ') : experiences,
        rating,
        others: others || '',
      },
    ])

    if (error) throw error

    return NextResponse.json({ message: '✅ Review saved successfully!' })
  } catch (error: any) {
    console.error('❌ Error saving review:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
