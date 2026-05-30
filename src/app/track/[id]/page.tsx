'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { formatMXN, getStatusLabel } from '@/lib/utils'
import { Check, Clock, ChefHat, Package, MessageCircle, Phone } from 'lucide-react'

const FOOTER = `© 2026 Nito's Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, México. Diseño y Software por SynkData`
const WHATSAPP = '+5219514618850'

interface OrderItem { id: string; product: { name: string; image: string }; quantity: number; price: number; variants: string | null }
interface Order { id: string; orderNumber: number; type: string; status: string; customerName: string | null; total: number; items: OrderItem[]; createdAt: string }

const STATUS_STEPS = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED']

export default function TrackOrderPage() {
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) fetchOrder()
    const interval = setInterval(fetchOrder, 10000)
    return () => clearInterval(interval)
  }, [id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        setError('')
      } else {
        setError('Orden no encontrada')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1
  const isCancelled = order?.status === 'CANCELLED'
  const isCancelRequested = order?.status === 'CANCEL_REQUESTED'

  const getStepIcon = (step: string, isCompleted: boolean, isCurrent: boolean) => {
    switch (step) {
      case 'CONFIRMED': return <Check size={20} />
      case 'PREPARING': return <ChefHat size={20} />
      case 'READY': return <Package size={20} />
      case 'DELIVERED': return <Check size={20} />
      default: return <Clock size={20} />
    }
  }

  const getEstimatedTime = () => {
    if (!order) return ''
    switch (order.status) {
      case 'CONFIRMED': return '~25-30 min'
      case 'PREPARING': return '~15-20 min'
      case 'READY': return '¡Listo para recoger!'
      case 'DELIVERED': return 'Entregado'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-nunito">
      <main className="flex-1 p-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E31E24] flex items-center justify-center mb-4">
              <span className="text-2xl">🍕</span>
            </div>
            <h1 className="font-bebas text-3xl">RASTREO DE ORDEN</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <Button onClick={fetchOrder} variant="outline">Reintentar</Button>
            </div>
          ) : order ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Order Info */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bebas text-2xl">Orden #{order.orderNumber}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isCancelled ? 'bg-red-100 text-red-700' :
                    isCancelRequested ? 'bg-orange-100 text-orange-700' :
                    currentStepIndex >= 3 ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {order.customerName && <p className="text-gray-600 text-sm mb-2">👤 {order.customerName}</p>}

                {/* Progress Bar */}
                {!isCancelled && !isCancelRequested && (
                  <div className="my-8">
                    <div className="flex justify-between items-center mb-2">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                            i <= currentStepIndex ? 'bg-[#E31E24]' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {getStepIcon(step, i <= currentStepIndex, i === currentStepIndex)}
                          </div>
                          <span className={`text-xs mt-1 ${i <= currentStepIndex ? 'text-[#E31E24] font-bold' : 'text-gray-400'}`}>
                            {step === 'CONFIRMED' ? 'Confirmado' : step === 'PREPARING' ? 'Preparando' : step === 'READY' ? 'Listo' : 'Entregado'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full mt-2">
                      <motion.div
                        className="absolute top-0 left-0 h-2 bg-[#E31E24] rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-red-700 font-bold">Orden Cancelada</p>
                  </div>
                )}

                {isCancelRequested && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <p className="text-orange-700 font-bold">Cancelación Solicitada</p>
                    <p className="text-orange-600 text-sm mt-1">Esperando confirmación del administrador</p>
                  </div>
                )}

                {/* Estimated Time */}
                {!isCancelled && !isCancelRequested && currentStepIndex < 3 && (
                  <div className="text-center mb-4">
                    <p className="text-gray-500 text-sm">Tiempo estimado</p>
                    <p className="font-bebas text-2xl text-[#E31E24]">{getEstimatedTime()}</p>
                  </div>
                )}

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm mb-3">Detalles del pedido:</h3>
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span className="font-semibold">{formatMXN(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-[#E31E24] pt-2 border-t">
                      <span>Total</span>
                      <span>{formatMXN(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-3">
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">
                    <MessageCircle size={18} className="mr-2" /> WhatsApp
                  </Button>
                </a>
                <a href="tel:9517250827" className="flex-1">
                  <Button variant="outline" className="w-full font-bold py-3 rounded-xl border-[#E31E24] text-[#E31E24]">
                    <Phone size={18} className="mr-2" /> Llamar
                  </Button>
                </a>
              </div>
            </motion.div>
          ) : null}
        </div>
      </main>

      <footer className="py-4 px-6 text-center border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">synkdata.online</a>)
        </p>
      </footer>
    </div>
  )
}
