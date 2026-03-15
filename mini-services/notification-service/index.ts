import { createServer } from 'http'
import { Server } from 'socket.io'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const PORT = 3003

// Create HTTP server
const httpServer = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', service: 'notification-service' }))
    return
  }
  
  res.writeHead(404)
  res.end('Not Found')
})

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Store connected clients
const connectedClients = new Set<string>()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  connectedClients.add(socket.id)
  
  // Send welcome message
  socket.emit('connected', { message: 'Connected to notification service' })
  
  // Handle new order notification
  socket.on('new_order', (data) => {
    console.log('New order received:', data)
    // Broadcast to all connected clients
    io.emit('new_order', data)
  })
  
  // Handle order status update
  socket.on('order_status_update', (data) => {
    console.log('Order status update:', data)
    io.emit('order_status_update', data)
  })
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    connectedClients.delete(socket.id)
  })
})

// API endpoint to broadcast notifications
// This can be called from the main Next.js app
httpServer.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/broadcast') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        io.emit(data.type, data.payload)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, clients: connectedClients.size }))
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
  }
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`)
  console.log(`WebSocket server ready for connections`)
})
