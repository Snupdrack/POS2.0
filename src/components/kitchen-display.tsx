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
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioFileRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session && (session.user as any)?.role === 'KITCHEN' || (session.user as any)?.role === 'ADMIN') {
      // ok
    } else if (session && !['KITCHEN', 'ADMIN'].includes((session.user as any)?.role)) {
      router.push('/pos')
    }
  }, [status, session, router])

  // Mejorado: Sonido más fuerte y confiable
  const playBeep = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      
      // Resumir contexto si está suspendido
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime

      // Primer sonido - más agudo (880 Hz)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.frequency.value = 880
      osc1.type = 'sine'
      gain1.gain.setValueAtTime(0.4, now)
      gain1.gain.exponentialRampToValueAtTime(0.1, now + 0.15)
      osc1.start(now)
      osc1.stop(now + 0.15)

      // Segundo sonido - más grave (1100 Hz)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.frequency.value = 1100
      osc2.type = 'sine'
      gain2.gain.setValueAtTime(0.4, now + 0.2)
      gain2.gain.exponentialRampToValueAtTime(0.1, now + 0.35)
      osc2.start(now + 0.2)
      osc2.stop(now + 0.35)

      // Tercer sonido - agudo final para más impacto
      const osc3 = ctx.createOscillator()
      const gain3 = ctx.createGain()
      osc3.connect(gain3)
      gain3.connect(ctx.destination)
      osc3.frequency.value = 1320
      osc3.type = 'sine'
      gain3.gain.setValueAtTime(0.4, now + 0.4)
      gain3.gain.exponentialRampToValueAtTime(0.1, now + 0.55)
      osc3.start(now + 0.4)
      osc3.stop(now + 0.55)
    } catch (error) {
      console.error('Error reproduciendo sonido:', error)
    }
  }, [soundEnabled])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      const kitchenOrders = data.filter((o: Order) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status))

      // Ahora reproduce sonido SIEMPRE que hay más órdenes que antes
      if (kitchenOrders.length > prevOrderCountRef.current) {
        playBeep()
      }
      prevOrderCountRef.current = kitchenOrders.length
      setOrders(kitchenOrders)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [playBeep])

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

  const OrderCard = ({ order, colorClass, actionLabel, actionIcon, onAction }: {
    order: Order; colorClass: string; actionLabel: string; actionIcon: React.ReactNode; onAction: () => void
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl shadow-lg border-3 ${colorClass} p-4 mb-3`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bebas text-3xl font-bold">#{order.orderNumber}</span>
          <Badge variant="outline" className="text-xs font-semibold">
            {order.type === 'LOCAL' ? '🍽️' : order.type === 'DELIVERY' ? '🚚' : '📦'} {getOrderTypeLabel(order.type)}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <Clock size={14} />
          {getTimeElapsed(order.createdAt)}
        </div>
      </div>

      {order.customerName && (
        <p className="text-sm font-semibold mb-2">👤 {order.customerName}</p>
      )}

      <div className="space-y-2 mb-3">
        {order.items.map(item => (
          <div key={item.id} className="bg-white/90 rounded-lg p-3 border-l-4 border-[#E31E24]">
            <div className="flex items-center gap-2">
              <span className="bg-[#E31E24] text-white font-bold text-xs w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                {item.quantity}
              </span>
              <span className="font-bold text-sm text-gray-900">{item.product.name}</span>
            </div>
            {item.variants && (() => {
              try {
                const vars = JSON.parse(item.variants)
                return vars.length > 0 ? (
                  <p className="text-xs text-gray-700 ml-8 font-semibold">{vars.map((v: any) => v.name).join(', ')}</p>
                ) : null
              } catch { return null }
            })()}
            {item.notes && <p className="text-xs text-orange-700 ml-8 italic font-semibold">📝 {item.notes}</p>}
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="bg-orange-100 border-2 border-orange-500 rounded-lg p-3 mb-3 text-sm text-orange-900 font-semibold">
          📝 {order.notes}
        </div>
      )}

      <Button onClick={onAction} className={`w-full font-bold rounded-xl text-base py-6 ${
        order.status === 'READY' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#E31E24] hover:bg-[#c4191f]'
      } text-white shadow-lg`}>
        {actionIcon} {actionLabel}
      </Button>
    </motion.div>
  )

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
  if (!session) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-nunito text-gray-900">
      {/* Header */}
      <header className="bg-[#1a1a1a] sticky top-0 z-40 shadow-2xl border-b-4 border-[#E31E24]">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat size={28} className="text-[#F5A623]" />
            <span className="font-bebas text-2xl tracking-wider text-white font-bold">COCINA - KDS</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={fetchOrders} className="text-white hover:text-[#F5A623] hover:bg-white/20 transition">
              <RefreshCw size={18} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className={`transition ${soundEnabled ? 'text-green-400 hover:bg-green-500/20' : 'text-red-400 hover:bg-red-500/20'}`}>
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })} className="text-white hover:text-red-400 hover:bg-red-500/20 transition">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* KDS Columns */}
      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Pendientes */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border-4 border-yellow-400">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse" />
                <h2 className="font-bebas text-2xl text-yellow-600 font-bold">PENDIENTES</h2>
                <Badge className="bg-yellow-400 text-yellow-900 text-sm font-bold">{pendingOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {pendingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-yellow-400 bg-yellow-50"
                    actionLabel="Preparar"
                    actionIcon={<ChefHat size={16} className="mr-1" />}
                    onAction={() => updateStatus(order.id, 'PREPARING')}
                  />
                ))}
              </AnimatePresence>
              {pendingOrders.length === 0 && <p className="text-gray-500 text-center py-8 text-sm font-semibold">Sin órdenes pendientes</p>}
            </div>

            {/* En Preparación */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border-4 border-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="font-bebas text-2xl text-blue-700 font-bold">EN PREP.</h2>
                <Badge className="bg-blue-500 text-white text-sm font-bold">{preparingOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {preparingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-blue-500 bg-blue-50"
                    actionLabel="¡Listo!"
                    actionIcon={<Clock size={16} className="mr-1" />}
                    onAction={() => updateStatus(order.id, 'READY')}
                  />
                ))}
              </AnimatePresence>
              {preparingOrders.length === 0 && <p className="text-gray-500 text-center py-8 text-sm font-semibold">Sin órdenes en preparación</p>}
            </div>

            {/* Listos */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border-4 border-green-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                <h2 className="font-bebas text-2xl text-green-700 font-bold">LISTOS</h2>
                <Badge className="bg-green-500 text-white text-sm font-bold">{readyOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {readyOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-green-500 bg-green-50"
                    actionLabel="Entregado"
                    actionIcon={<span className="mr-1">✓</span>}
                    onAction={() => updateStatus(order.id, 'DELIVERED')}
                  />
                ))}
              </AnimatePresence>
              {readyOrders.length === 0 && <p className="text-gray-500 text-center py-8 text-sm font-semibold">Sin órdenes listas</p>}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center border-t-4 border-[#E31E24] bg-[#1a1a1a]">
        <p className="text-xs text-gray-300">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#F5A623] transition">synkdata.online</a>)
        </p>
      </footer>
    </div>
  )
}