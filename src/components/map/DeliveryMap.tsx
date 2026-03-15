'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { Crosshair, Loader2 } from 'lucide-react'

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Cafe marker icon (green)
const cafeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Delivery marker icon (red)
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Cafe location
const CAFE_LAT = -7.512980736484782
const CAFE_LNG = 110.59586423434448

interface DeliveryMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialLat?: number | null
  initialLng?: number | null
}

// Map click handler component
function MapClickHandler({ 
  onLocationSelect,
  setMarkerPos
}: { 
  onLocationSelect: (lat: number, lng: number, address: string) => void
  setMarkerPos: (pos: [number, number]) => void
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      setMarkerPos([lat, lng])
      
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'User-Agent': 'StarVillageCoffee/1.0' } }
        )
        const data = await res.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        onLocationSelect(lat, lng, address)
      } catch {
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      }
    },
  })
  
  return null
}

// Draggable marker component
function DraggableMarker({
  position,
  onDragEnd
}: {
  position: [number, number]
  onDragEnd: (lat: number, lng: number, address: string) => void
}) {
  const handleDragEnd = async (e: L.DragEndEvent) => {
    const marker = e.target as L.Marker
    const { lat, lng } = marker.getLatLng()
    
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'User-Agent': 'StarVillageCoffee/1.0' } }
      )
      const data = await res.json()
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onDragEnd(lat, lng, address)
    } catch {
      onDragEnd(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }
  
  return (
    <Marker
      position={position}
      icon={deliveryIcon}
      draggable={true}
      eventHandlers={{ dragend: handleDragEnd }}
    />
  )
}

// Map center updater
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

export default function DeliveryMap({ onLocationSelect, initialLat, initialLng }: DeliveryMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(() => {
    if (initialLat && initialLng) return [initialLat, initialLng]
    return [CAFE_LAT, CAFE_LNG]
  })
  const [isLocating, setIsLocating] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  
  // Client-side mounting check
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Update marker when initial values change
  useEffect(() => {
    if (initialLat && initialLng) {
      setMarkerPosition([initialLat, initialLng])
    }
  }, [initialLat, initialLng])
  
  const handleLocationSelect = useCallback((lat: number, lng: number, address: string) => {
    setMarkerPosition([lat, lng])
    onLocationSelect(lat, lng, address)
  }, [onLocationSelect])
  
  // GPS Location detection
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung GPS')
      return
    }
    
    setIsLocating(true)
    setGpsError(null)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setMarkerPosition([lat, lng])
        
        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': 'StarVillageCoffee/1.0' } }
          )
          const data = await res.json()
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          onLocationSelect(lat, lng, address)
        } catch {
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        }
        
        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Izin lokasi ditolak. Aktifkan GPS di pengaturan browser.')
            break
          case error.POSITION_UNAVAILABLE:
            setGpsError('Informasi lokasi tidak tersedia')
            break
          case error.TIMEOUT:
            setGpsError('Timeout mendapatkan lokasi')
            break
          default:
            setGpsError('Gagal mendapatkan lokasi')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [onLocationSelect])
  
  // Loading state
  if (!isClient) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-muted-foreground text-sm">Memuat peta...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={[CAFE_LAT, CAFE_LNG]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Cafe marker */}
        <Marker position={[CAFE_LAT, CAFE_LNG]} icon={cafeIcon} />
        
        {/* Draggable delivery marker */}
        <DraggableMarker 
          position={markerPosition}
          onDragEnd={handleLocationSelect}
        />
        
        {/* Map click handler */}
        <MapClickHandler 
          onLocationSelect={handleLocationSelect}
          setMarkerPos={setMarkerPosition}
        />
        
        {/* Center controller */}
        <MapCenterUpdater center={markerPosition} />
      </MapContainer>
      
      {/* GPS Button */}
      <div className="absolute top-2 right-2 z-[1000]">
        <Button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg border border-gray-200"
          size="sm"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Crosshair className="w-4 h-4 mr-2" />
          )}
          {isLocating ? 'Mencari...' : 'Lokasi Saya'}
        </Button>
      </div>
      
      {/* GPS Error */}
      {gpsError && (
        <div className="absolute top-14 right-2 left-2 bg-red-100 border border-red-300 p-2 rounded-lg text-xs text-red-700 z-[1000]">
          {gpsError}
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow text-xs z-[1000]">
        <div className="flex items-center gap-2 mb-1">
          <img 
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" 
            alt="Cafe" 
            className="w-4 h-6" 
          />
          <span>Star Village Coffee</span>
        </div>
        <div className="flex items-center gap-2">
          <img 
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" 
            alt="Delivery" 
            className="w-4 h-6" 
          />
          <span>Lokasi Pengantaran</span>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-16 left-2 right-2 bg-amber-100/90 backdrop-blur-sm p-2 rounded-lg shadow text-xs text-amber-800 text-center z-[1000]">
        📍 Klik pada peta, geser marker merah, atau gunakan tombol Lokasi Saya
      </div>
    </div>
  )
}
