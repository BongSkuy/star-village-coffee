import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// AI Menu Recommendation API - Uses Groq (FREE) or OpenAI

interface AIConfig {
  provider: 'groq' | 'openai'
  apiKey: string
  model: string
  baseUrl: string
}

// Load AI config from environment variables
function getAIConfig(): AIConfig | null {
  // First, check for Groq API key (FREE!)
  if (process.env.GROQ_API_KEY) {
    return {
      provider: 'groq',
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      baseUrl: 'https://api.groq.com/openai/v1',
    }
  }
  
  // Second, check for OpenAI API key
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1',
    }
  }
  
  return null
}

// Call OpenAI-compatible API (works for OpenAI and Groq)
async function callAI(baseUrl: string, apiKey: string, model: string, systemPrompt: string, userMessage: string) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`API error: ${response.status} - ${errorBody}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, mood, preference } = body

    const categories = await db.menuCategory.findMany({
      include: { items: { include: { variants: true } } },
      orderBy: { order: 'asc' }
    })

    const menuItems = categories.flatMap(cat => 
      cat.items.map(item => ({
        name: item.name,
        category: cat.name,
        variants: item.variants.map(v => `${v.name}: Rp ${(v.price * 1000).toLocaleString('id-ID')}`).join(', '),
        isPopular: item.isPopular,
        isNew: item.isNew
      }))
    )

    const menuContext = menuItems.map(item => 
      `- ${item.name} (${item.category}) - ${item.variants}${item.isPopular ? ' [Popular]' : ''}${item.isNew ? ' [Baru]' : ''}`
    ).join('\n')

    const config = getAIConfig()
    
    if (!config) {
      return NextResponse.json({ 
        success: false, 
        response: 'Maaf, layanan AI belum dikonfigurasi.' 
      }, { status: 500 })
    }

    let userMessage = message || ''
    if (mood) userMessage = `Saya lagi merasa ${mood}. ${message || 'Apa yang cocok?'}`
    if (preference) userMessage = `Saya pengen yang ${preference}. ${message || 'Ada rekomendasi?'}`
    if (!userMessage) userMessage = 'Halo! Saya butuh rekomendasi menu.'

    const systemPrompt = `Kamu adalah asisten menu AI untuk Star Village Coffee. Bantu customer memilih menu berdasarkan suasana hati, preferensi rasa, atau kebutuhan mereka.

Menu tersedia:
 ${menuContext}

Aturan:
1. Berikan rekomendasi 2-4 menu yang paling cocok
2. Jelaskan singkat kenapa menu itu cocok
3. Sebutkan varian dan harganya
4. Gunakan bahasa ramah seperti barista
5. Gunakan emoji 🎯☕✨`

    const aiResponse = await callAI(config.baseUrl, config.apiKey, config.model, systemPrompt, userMessage)

    return NextResponse.json({ 
      success: true, 
      response: aiResponse || 'Maaf, tidak bisa memberikan rekomendasi.' 
    })
  } catch (error) {
    console.error('AI Menu error:', error)
    return NextResponse.json({ 
      success: false, 
      response: 'Terjadi kesalahan. Coba lagi.' 
    }, { status: 500 })
  }
}
