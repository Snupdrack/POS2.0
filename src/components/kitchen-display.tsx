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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session && (session.user as any)?.role === 'KITCHEN' || (session.user as any)?.role === 'ADMIN') {
      // ok
    } else if (session && !['KITCHEN', 'ADMIN'].includes((session.user as any)?.role)) {
      router.push('/pos')
    }
  }, [status, session, router])

  const playBeep = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = 880
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.2)
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.value = 1100
        osc2.type = 'sine'
        gain2.gain.value = 0.3
        osc2.start(ctx.currentTime)
        osc2.stop(ctx.currentTime + 0.2)
      }, 250)
    } catch {}
  }, [soundEnabled])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      const kitchenOrders = data.filter((o: Order) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status))

      if (kitchenOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
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
      className={`rounded-2xl shadow-md border-2 ${colorClass} p-4 mb-3`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bebas text-2xl">#{order.orderNumber}</span>
          <Badge variant="outline" className="text-xs">
            {order.type === 'LOCAL' ? '🍽️' : order.type === 'DELIVERY' ? '🚚' : '📦'} {getOrderTypeLabel(order.type)}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} />
          {getTimeElapsed(order.createdAt)}
        </div>
      </div>

      {order.customerName && (
        <p className="text-sm text-gray-600 mb-2">👤 {order.customerName}</p>
      )}

      <div className="space-y-2 mb-3">
        {order.items.map(item => (
          <div key={item.id} className="bg-white/70 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#E31E24] text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                {item.quantity}
              </span>
              <span className="font-semibold text-sm">{item.product.name}</span>
            </div>
            {item.variants && (() => {
              try {
                const vars = JSON.parse(item.variants)
                return vars.length > 0 ? (
                  <p className="text-xs text-gray-500 ml-8">{vars.map((v: any) => v.name).join(', ')}</p>
                ) : null
              } catch { return null }
            })()}
            {item.notes && <p className="text-xs text-orange-600 ml-8 italic">📝 {item.notes}</p>}
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3 text-xs text-orange-700">
          📝 {order.notes}
        </div>
      )}

      <Button onClick={onAction} className={`w-full font-bold rounded-xl ${
        order.status === 'READY' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#E31E24] hover:bg-[#c4191f]'
      } text-white`}>
        {actionIcon} {actionLabel}
      </Button>
    </motion.div>
  )

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
  if (!session) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 font-nunito text-white">
      {/* Header */}
      <header className="bg-[#111111] sticky top-0 z-40 shadow-lg border-b border-gray-800">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat size={24} className="text-[#F5A623]" />
            <span className="font-bebas text-xl tracking-wider">COCINA - KDS</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={fetchOrders} className="text-gray-400 hover:text-white hover:bg-white/10">
              <RefreshCw size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-400 hover:text-white hover:bg-white/10">
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })} className="text-gray-400 hover:text-white hover:bg-white/10">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* KDS Columns */}
      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* Pendientes */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <h2 className="font-bebas text-xl text-yellow-400">PENDIENTES</h2>
                <Badge className="bg-yellow-400/20 text-yellow-400 text-xs">{pendingOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {pendingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-yellow-400/50 bg-yellow-950/30"
                    actionLabel="Preparar"
                    actionIcon={<ChefHat size={14} className="mr-1" />}
                    onAction={() => updateStatus(order.id, 'PREPARING')}
                  />
                ))}
              </AnimatePresence>
              {pendingOrders.length === 0 && <p className="text-gray-600 text-center py-8 text-sm">Sin órdenes pendientes</p>}
            </div>

            {/* En Preparación */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <h2 className="font-bebas text-xl text-blue-400">EN PREPARACIÓN</h2>
                <Badge className="bg-blue-400/20 text-blue-400 text-xs">{preparingOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {preparingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-blue-400/50 bg-blue-950/30"
                    actionLabel="¡Listo!"
                    actionIcon={<Clock size={14} className="mr-1" />}
                    onAction={() => updateStatus(order.id, 'READY')}
                  />
                ))}
              </AnimatePresence>
              {preparingOrders.length === 0 && <p className="text-gray-600 text-center py-8 text-sm">Sin órdenes en preparación</p>}
            </div>

            {/* Listos */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <h2 className="font-bebas text-xl text-green-400">LISTOS</h2>
                <Badge className="bg-green-400/20 text-green-400 text-xs">{readyOrders.length}</Badge>
              </div>
              <AnimatePresence>
                {readyOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colorClass="border-green-400/50 bg-green-950/30"
                    actionLabel="Entregado"
                    actionIcon={<span className="mr-1">✓</span>}
                    onAction={() => updateStatus(order.id, 'DELIVERED')}
                  />
                ))}
              </AnimatePresence>
              {readyOrders.length === 0 && <p className="text-gray-600 text-center py-8 text-sm">Sin órdenes listas</p>}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center border-t border-gray-800 bg-[#0a0a0a]">
        <p className="text-xs text-gray-600">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">synkdata.online</a>)
        </p>
      </footer>
    </div>
  )
}
