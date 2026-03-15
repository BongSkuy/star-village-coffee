import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Star Village Coffee'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1310',
          backgroundImage: 'linear-gradient(135deg, #1a1310 0%, #2c2018 50%, #3d2a1f 100%)',
          padding: '60px',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(184, 131, 79, 0.2)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(212, 165, 116, 0.15)',
            filter: 'blur(80px)',
          }}
        />
        
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Coffee Icon */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #b8834f 0%, #d4a574 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
              boxShadow: '0 20px 60px rgba(184, 131, 79, 0.4)',
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#faf6f1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="2" y2="4" />
              <line x1="10" x2="10" y1="2" y2="4" />
              <line x1="14" x2="14" y1="2" y2="4" />
            </svg>
          </div>
          
          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#faf6f1',
              marginBottom: '10px',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            Star Village Coffee
          </div>
          
          {/* Tagline */}
          <div
            style={{
              fontSize: '32px',
              color: '#d4a574',
              marginBottom: '40px',
            }}
          >
            Start Your Vibes Here
          </div>
          
          {/* Info Pills */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                background: 'rgba(184, 131, 79, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.5)',
                color: '#f5ebe0',
                fontSize: '20px',
              }}
            >
              ⭐ 4.6 Rating
            </div>
            <div
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                background: 'rgba(184, 131, 79, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.5)',
                color: '#f5ebe0',
                fontSize: '20px',
              }}
            >
              📍 Boyolali
            </div>
            <div
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                background: 'rgba(184, 131, 79, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.5)',
                color: '#f5ebe0',
                fontSize: '20px',
              }}
            >
              ☕ 50+ Menu
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            color: '#8a5435',
            fontSize: '18px',
          }}
        >
          Coffee Shop Terbaik di Boyolali • Free WiFi • Area Luas
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
