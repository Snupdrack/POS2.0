'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatMXN, getStatusLabel, getOrderTypeLabel, getTimeElapsed } from '@/lib/utils'
import { toast } from 'sonner'
import { LogOut, ChefHat, Clock, Volume2, VolumeX, RefreshCw } from 'lucide-react'

const FOOTER = `© 2026 Nito's Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, México. Diseño y Software por SynkData`

interface OrderItem { id: string; product: { name: string; image: string }; quantity: number; price: number; variants: string | null; notes: string | null }
interface Order { id: string; orderNumber: number; type: string; status: string; customerName: string | null; notes: string | null; total: number; createdAt: string; items: OrderItem[] }

export default function KitchenDisplay() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const prevOrderCountRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session && (session.user as any)?.role === 'KITCHEN' || (session.user as any)?.role === 'ADMIN') {
      // ok
    } else if (session && !['KITCHEN', 'ADMIN'].includes((session.user as any)?.role)) {
      router.push('/pos')
    }
  }, [status, session, router])

  // Inicializar audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/notification.mp3')
      audioRef.current.volume = 0.85
    }
  }, [])

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return
    
    try {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.error('Error playing notification sound:', err)
        playFallbackBeep()
      })
    } catch (err) {
      console.error('Error:', err)
      playFallbackBeep()
    }
  }, [soundEnabled])

  const playFallbackBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = 880
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch {}
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      const kitchenOrders = data.filter((o: Order) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status))

      if (kitchenOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
        playNotificationSound()
      }
      prevOrderCountRef.current = kitchenOrders.length
      setOrders(kitchenOrders)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [playNotificationSound])

  useEffect(() => {
    if (session) {
      fetchOrders()
      const interval = setInterval(fetchOrders, 10000)
      return () => clearInterval(interval)
    }
  }, [session, fetchOrders])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Orden actualizada: ${getStatusLabel(newStatus)}`)
        fetchOrders()
      } else {
        toast.error('Error al actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const pendingOrders = orders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status))
  const preparingOrders = orders.filter(o => o.status === 'PREPARING')
  const readyOrders = orders.filter(o => o.status === 'READY')

  const OrderCard = ({ order, colorClass, bgClass, actionLabel, actionIcon, onAction }: {
    order: Order; colorClass: string; bgClass: string; actionLabel: string; actionIcon: React.ReactNode; onAction: () => void
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl shadow-xl border-4 ${colorClass} ${bgClass} p-5 mb-4`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-bebas text-4xl font-bold text-white drop-shadow-lg">#{order.orderNumber}</span>
          <Badge className={`text-sm px-3 py-2 font-bold ${
            order.type === 'LOCAL' ? 'bg-purple-600 text-white' : 
            order.type === 'DELIVERY' ? 'bg-blue-600 text-white' : 
            'bg-gray-700 text-white'
          }`}>
            {order.type === 'LOCAL' ? '🍽️ LOCAL' : order.type === 'DELIVERY' ? '🚚 DELIVERY' : '📦 TAKEOUT'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
          <Clock size={16} className="text-white font-bold" />
          <span className="text-white font-bold text-sm">{getTimeElapsed(order.createdAt)}</span>
        </div>
      </div>

      {order.customerName && (
        <p className="text-lg font-bold text-white mb-3 bg-black/20 px-3 py-2 rounded-lg">👤 {order.customerName}</p>
      )}

      <div className="space-y-3 mb-4">
        {order.items.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="bg-red-600 text-white font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md">
                {item.quantity}
              </span>
              <span className="font-bold text-gray-800 text-base flex-1">{item.product.name}</span>
            </div>
            {item.variants && (() => {
              try {
                const vars = JSON.parse(item.variants)
                return vars.length > 0 ? (
                  <p className="text-sm text-gray-600 ml-11 mt-1 font-semibold">{vars.map((v: any) => v.name).join(', ')}</p>
                ) : null
              } catch { return null }
            })()}
            {item.notes && <p className="text-sm text-orange-700 ml-11 mt-1 font-semibold italic">📝 {item.notes}</p>}
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="bg-orange-300 border-2 border-orange-500 rounded-xl p-3 mb-4 text-sm text-gray-900 font-bold">
          📝 {order.notes}
        </div>
      )}

      <Button onClick={onAction} className={`w-full font-bold text-lg rounded-xl py-6 shadow-lg transition-all hover:shadow-xl ${
        order.status === 'READY' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
      }`}>
        {actionIcon} {actionLabel}
      </Button>
    </motion.div>
  )

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!session) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 font-nunito text-white">
      {/* Header */}
      <header className="bg-black sticky top-0 z-40 shadow-2xl border-b-4 border-red-600">
        <div className="px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChefHat size={32} className="text-red-600 drop-shadow-lg" />
            <span className="font-bebas text-3xl tracking-wider font-bold text-white drop-shadow-lg">COCINA - KDS</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={fetchOrders} 
              className="text-white hover:text-red-600 hover:bg-white/10 rounded-xl p-3 transition-all"
              title="Actualizar órdenes"
            >
              <RefreshCw size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className={`rounded-xl p-3 transition-all ${soundEnabled ? 'text-green-400 hover:bg-green-400/20' : 'text-gray-500 hover:bg-gray-500/20'}`}
              title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              className="text-gray-400 hover:text-red-600 hover:bg-white/10 rounded-xl p-3 transition-all"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* KDS Columns */}
      <main className="flex-1 p-6 bg-gradient-to-b from-gray-950 to-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* PENDIENTES - AMARILLO VIBRANTE */}
            <div className="bg-gray-900/50 rounded-2xl p-4 border-2 border-yellow-500/30">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b-3 border-yellow-500">
                <div className="w-5 h-5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse" />
                <h2 className="font-bebas text-2xl text-yellow-400 font-bold">PENDIENTES</h2>
                <Badge className="bg-yellow-500 text-gray-900 text-lg font-bold px-4 py-2">{pendingOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {pendingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-yellow-500"
                    bgClass="bg-yellow-950/40"
                    actionLabel="👨‍🍳 PREPARAR"
                    actionIcon={<ChefHat size={18} className="mr-2" />}
                    onAction={() => updateStatus(order.id, 'PREPARING')}
                  />
                ))}
              </AnimatePresence>
              {pendingOrders.length === 0 && <p className="text-gray-400 text-center py-12 text-lg font-semibold">✓ Sin órdenes pendientes</p>}
            </div>

            {/* EN PREPARACIÓN - AZUL VIBRANTE */}
            <div className="bg-gray-900/50 rounded-2xl p-4 border-2 border-cyan-500/30">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b-3 border-cyan-500">
                <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse" />
                <h2 className="font-bebas text-2xl text-cyan-400 font-bold">EN PREPARACIÓN</h2>
                <Badge className="bg-cyan-500 text-gray-900 text-lg font-bold px-4 py-2">{preparingOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {preparingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-cyan-500"
                    bgClass="bg-cyan-950/40"
                    actionLabel="✓ ¡LISTO!"
                    actionIcon={<Clock size={18} className="mr-2" />}
                    onAction={() => updateStatus(order.id, 'READY')}
                  />
                ))}
              </AnimatePresence>
              {preparingOrders.length === 0 && <p className="text-gray-400 text-center py-12 text-lg font-semibold">Esperando órdenes...</p>}
            </div>

            {/* LISTOS - VERDE VIBRANTE */}
            <div className="bg-gray-900/50 rounded-2xl p-4 border-2 border-green-500/30">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b-3 border-green-500">
                <div className="w-5 h-5 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
                <h2 className="font-bebas text-2xl text-green-400 font-bold">LISTOS</h2>
                <Badge className="bg-green-500 text-gray-900 text-lg font-bold px-4 py-2">{readyOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {readyOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-green-500"
                    bgClass="bg-green-950/40"
                    actionLabel="🎉 ENTREGADO"
                    actionIcon={<span className="mr-2 text-xl">✓</span>}
                    onAction={() => updateStatus(order.id, 'DELIVERED')}
                  />
                ))}
              </AnimatePresence>
              {readyOrders.length === 0 && <p className="text-gray-400 text-center py-12 text-lg font-semibold">Sin órdenes listas</p>}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center border-t-2 border-gray-800 bg-black">
        <p className="text-xs text-gray-500 font-semibold">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">synkdata.online</a>)
        </p>
      </footer>
    </div>
  )
}
