import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/client'

// ✅ 禁用 Next.js 缓存，确保返回实时数据
export const revalidate = 0

// ✅ POST：新增一条用户评论
export async function POST(req: Request) {
  try {
    const { name, casino_wallet, games, experiences, rating, others } = await req.json()

    // 🔹 基本字段验证
    if (!name || !casino_wallet || !games || !experiences || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 🔹 插入到 Supabase 表
    const { error } = await supabase.from('ipay9-review').insert([
      {
        name,
        casino_wallet,
        games,
        experiences,
        rating,
        others: others || '',
      },
    ])

    if (error) throw error

    // ✅ 成功响应
    return NextResponse.json({ message: '✅ Review saved successfully!' })
  } catch (error: any) {
    console.error('❌ Error saving review:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// ✅ GET：获取所有评论（最新在最前）
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ipay9-review')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // ✅ 设置响应头：禁止缓存
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('❌ Error fetching reviews:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
