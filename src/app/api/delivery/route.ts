import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validationErrorResponse } from '@/lib/api-auth'
import { updateDeliveryZonesSchema } from '@/lib/validations'

// Cafe coordinates
const CAFE_LAT = -7.512980736484782
const CAFE_LNG = 110.59586423434448

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// GET - Get all delivery zones (public)
export async function GET() {
  try {
    const zones = await db.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { minDistance: 'asc' }
    })
    
    // If no zones exist, create default ones
    if (zones.length === 0) {
      const defaultZones = await Promise.all([
        db.deliveryZone.create({
          data: {
            name: 'Zona 1',
            minDistance: 0,
            maxDistance: 2,
            fee: 5,
            minOrder: 20,
            isActive: true
          }
        }),
        db.deliveryZone.create({
          data: {
            name: 'Zona 2',
            minDistance: 2,
            maxDistance: 4,
            fee: 8,
            minOrder: 30,
            isActive: true
          }
        }),
        db.deliveryZone.create({
          data: {
            name: 'Zona 3',
            minDistance: 4,
            maxDistance: 6,
            fee: 12,
            minOrder: 40,
            isActive: true
          }
        })
      ])
      
      return NextResponse.json({ 
        zones: defaultZones,
        cafeLocation: { lat: CAFE_LAT, lng: CAFE_LNG },
        maxDistance: 6
      })
    }
    
    const maxDistance = Math.max(...zones.map(z => z.maxDistance))
    
    return NextResponse.json({ 
      zones,
      cafeLocation: { lat: CAFE_LAT, lng: CAFE_LNG },
      maxDistance
    })
  } catch (error) {
    console.error('Error fetching delivery zones:', error)
    return NextResponse.json({ error: 'Failed to fetch delivery zones' }, { status: 500 })
  }
}

// POST - Calculate delivery fee based on coordinates (public - for checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lat, lng, address } = body
    
    let deliveryLat = lat
    let deliveryLng = lng
    
    // If address provided but no coordinates, geocode it
    if (!lat && !lng && address) {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Boyolali, Jawa Tengah, Indonesia')}&limit=1`
      
      try {
        const response = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'StarVillageCoffee/1.0'
          }
        })
        const data = await response.json()
        
        if (data && data.length > 0) {
          deliveryLat = parseFloat(data[0].lat)
          deliveryLng = parseFloat(data[0].lon)
        } else {
          return NextResponse.json({ 
            error: 'Alamat tidak ditemukan',
            needsManualDistance: true
          }, { status: 400 })
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError)
        return NextResponse.json({ 
          error: 'Gagal mencari lokasi',
          needsManualDistance: true
        }, { status: 400 })
      }
    }
    
    // Calculate distance
    const distance = calculateDistance(CAFE_LAT, CAFE_LNG, deliveryLat, deliveryLng)
    
    // Get zones
    const zones = await db.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { minDistance: 'asc' }
    })
    
    // If no zones, create defaults
    if (zones.length === 0) {
      await Promise.all([
        db.deliveryZone.create({
          data: { name: 'Zona 1', minDistance: 0, maxDistance: 2, fee: 5, minOrder: 20, isActive: true }
        }),
        db.deliveryZone.create({
          data: { name: 'Zona 2', minDistance: 2, maxDistance: 4, fee: 8, minOrder: 30, isActive: true }
        }),
        db.deliveryZone.create({
          data: { name: 'Zona 3', minDistance: 4, maxDistance: 6, fee: 12, minOrder: 40, isActive: true }
        })
      ])
      
      zones.push(
        { id: '1', name: 'Zona 1', minDistance: 0, maxDistance: 2, fee: 5, minOrder: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Zona 2', minDistance: 2, maxDistance: 4, fee: 8, minOrder: 30, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'Zona 3', minDistance: 4, maxDistance: 6, fee: 12, minOrder: 40, isActive: true, createdAt: new Date(), updatedAt: new Date() }
      )
    }
    
    const maxDistance = Math.max(...zones.map(z => z.maxDistance))
    
    // Check if out of range
    if (distance > maxDistance) {
      return NextResponse.json({
        distance: Math.round(distance * 10) / 10,
        inRange: false,
        zone: null,
        fee: 0,
        minOrder: 0,
        message: `Lokasi di luar jangkauan delivery (max ${maxDistance} km). Gunakan GoSend.`,
        gosendLink: 'https://gojek.com/gosend/'
      })
    }
    
    // Find matching zone
    let matchedZone = null
    for (const zone of zones) {
      if (distance >= zone.minDistance && distance < zone.maxDistance) {
        matchedZone = zone
        break
      }
      // Handle edge case for max distance
      if (distance >= zone.minDistance && distance <= zone.maxDistance && zone.maxDistance === maxDistance) {
        matchedZone = zone
        break
      }
    }
    
    if (!matchedZone) {
      return NextResponse.json({
        distance: Math.round(distance * 10) / 10,
        inRange: false,
        zone: null,
        fee: 0,
        minOrder: 0,
        message: 'Zona tidak ditemukan'
      })
    }
    
    return NextResponse.json({
      distance: Math.round(distance * 10) / 10,
      inRange: true,
      zone: matchedZone,
      fee: matchedZone.fee,
      minOrder: matchedZone.minOrder,
      coordinates: { lat: deliveryLat, lng: deliveryLng },
      message: `${matchedZone.name}: ${distance.toFixed(1)} km - Ongkir Rp${(matchedZone.fee * 1000).toLocaleString('id-ID')}`
    })
    
  } catch (error) {
    console.error('Error calculating delivery:', error)
    return NextResponse.json({ error: 'Failed to calculate delivery' }, { status: 500 })
  }
}

// PUT - Update delivery zones - Admin only
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = updateDeliveryZonesSchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { zones } = parseResult.data
    
    // Delete existing zones
    await db.deliveryZone.deleteMany()
    
    // Create new zones
    const newZones = await Promise.all(
      zones.map((zone) => 
        db.deliveryZone.create({
          data: {
            name: zone.name,
            minDistance: zone.minDistance,
            maxDistance: zone.maxDistance,
            fee: zone.fee,
            minOrder: zone.minOrder,
            isActive: true
          }
        })
      )
    )
    
    return NextResponse.json({ zones: newZones })
  } catch (error) {
    console.error('Error updating delivery zones:', error)
    return NextResponse.json({ error: 'Failed to update delivery zones' }, { status: 500 })
  }
})
