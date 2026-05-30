'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { formatMXN, getStatusLabel, getStatusColor, getOrderTypeLabel, getTimeElapsed } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Plus, Minus, Trash2, LogOut, ChefHat, Clock, ShoppingBag,
  UtensilsCrossed, Truck, Phone, User, CreditCard, DollarSign,
  AlertCircle, Check, X, Ban
} from 'lucide-react'

const FOOTER = `© 2026 Nito's Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, México. Diseño y Software por SynkData`

interface Variant { id: string; name: string; extraPrice: number }
interface Product { id: string; name: string; description: string; price: number; image: string; variants: Variant[]; categoryId: string; isAvailable: boolean }
interface Category { id: string; name: string; icon: string; products: Product[] }
interface Order { id: string; orderNumber: number; type: string; status: string; customerName: string | null; customerPhone: string | null; address: string | null; notes: string | null; total: number; discount: number; tax: number; tip: number; deliveryFee: number; paymentMethod: string | null; paymentStatus: string | null; createdAt: string; items: OrderItem[]; user: { name: string } }
interface OrderItem { id: string; productId: string; product: { name: string; image: string }; quantity: number; price: number; variants: string | null; notes: string | null }
interface TableInfo { id: string; number: number; capacity: number; status: string; area: string }
interface CartItem { product: Product; quantity: number; selectedVariants: Variant[]; notes: string }

export default function PosSystem() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = (session?.user as any)?.role

  const [categories, setCategories] = useState<Category[]>([])
  const [tables, setTables] = useState<TableInfo[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [activeTab, setActiveTab] = useState('new-order')
  const [orders, setOrders] = useState<Order[]>([])

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState('LOCAL')
  const [selectedTable, setSelectedTable] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [discount, setDiscount] = useState(0)
  const [tip, setTip] = useState(0)
  const [orderNotes, setOrderNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchData()
      const interval = setInterval(fetchOrders, 15000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [catRes, tableRes, orderRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tables'),
        fetch('/api/orders')
      ])
      const catData = await catRes.json()
      const tableData = await tableRes.json()
      const orderData = await orderRes.json()
      setCategories(catData)
      setTables(tableData)
      setOrders(orderData)
      if (catData.length > 0 && !activeCategory) setActiveCategory(catData[0].id)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch {}
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.findIndex(item => item.product.id === product.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 }
        return updated
      }
      return [...prev, { product, quantity: 1, selectedVariants: product.variants.length > 0 ? [product.variants[0]] : [], notes: '' }]
    })
  }

  const updateQuantity = (idx: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + delta }
      if (updated[idx].quantity <= 0) updated.splice(idx, 1)
      return updated
    })
  }

  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }

  const cartSubtotal = cart.reduce((sum, item) => {
    const variantExtra = item.selectedVariants.reduce((s, v) => s + v.extraPrice, 0)
    return sum + (item.product.price + variantExtra) * item.quantity
  }, 0)

  const cartTax = cartSubtotal * 0.16
  const cartTotal = cartSubtotal - discount + cartTax + tip

  const submitOrder = async () => {
    if (cart.length === 0) { toast.error('Agrega productos al carrito'); return }
    setSubmitting(true)
    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price + item.selectedVariants.reduce((s, v) => s + v.extraPrice, 0),
        variants: item.selectedVariants.length > 0 ? JSON.stringify(item.selectedVariants.map(v => ({ name: v.name, extraPrice: v.extraPrice }))) : null,
        notes: item.notes || null
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: orderType,
          customerName: customerName || (orderType === 'LOCAL' ? `Mesa ${selectedTable}` : ''),
          customerPhone: customerPhone || null,
          customerEmail: customerEmail || null,
          address: address || null,
          notes: orderNotes || null,
          items,
          discount,
          tax: cartTax,
          tip,
          tableId: orderType === 'LOCAL' ? selectedTable : null,
          paymentMethod,
          deliveryFee: 0
        })
      })

      if (res.ok) {
        toast.success('¡Orden creada exitosamente!')
        setCart([])
        setCustomerName('')
        setCustomerPhone('')
        setCustomerEmail('')
        setAddress('')
        setOrderNotes('')
        setDiscount(0)
        setTip(0)
        fetchOrders()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al crear orden')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Estado actualizado: ${getStatusLabel(newStatus)}`)
        fetchOrders()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Orden eliminada')
        fetchOrders()
      } else {
        toast.error('Error al eliminar')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const filteredOrders = statusFilter === 'ALL' ? activeOrders : activeOrders.filter(o => o.status === statusFilter)

  const statusFlow: Record<string, string[]> = {
    PENDING: ['CONFIRMED'],
    CONFIRMED: ['PREPARING'],
    PREPARING: ['READY'],
    READY: ['DELIVERED'],
    CANCEL_REQUESTED: ['CANCELLED']
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
  if (!session) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-nunito">
      {/* Header */}
      <header className="bg-[#111111] text-white sticky top-0 z-40 shadow-lg">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E31E24] flex items-center justify-center">
              <span className="text-sm">🍕</span>
            </div>
            <span className="font-bebas text-xl tracking-wider">NITO&apos;S POS</span>
            <Badge className={`${role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-600'} text-white text-xs`}>
              {role}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300 hidden sm:block">{session.user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })} className="text-gray-400 hover:text-white hover:bg-white/10">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="new-order" className="flex-1">🛒 Nueva Orden</TabsTrigger>
              <TabsTrigger value="active-orders" className="flex-1">
                📋 Órdenes Activas {activeOrders.length > 0 && <Badge className="ml-2 bg-[#E31E24] text-white h-5 min-w-5 text-xs">{activeOrders.length}</Badge>}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* New Order Tab */}
          <TabsContent value="new-order" className="mt-4">
            <div className="flex flex-col lg:flex-row gap-4 p-4">
              {/* Left: Products */}
              <div className="flex-1 min-w-0">
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-4">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                        activeCategory === cat.id ? 'bg-[#E31E24] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.find(c => c.id === activeCategory)?.products.filter(p => p.isAvailable).map(product => (
                    <motion.button
                      key={product.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => addToCart(product)}
                      className="bg-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{product.image}</span>
                        <span className="font-bold text-sm truncate flex-1">{product.name}</span>
                      </div>
                      <span className="text-[#E31E24] font-bold text-sm">{formatMXN(product.price)}</span>
                      {product.variants.length > 0 && (
                        <span className="text-xs text-gray-400 block">{product.variants.length} opciones</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Right: Cart */}
              <div className="w-full lg:w-96 shrink-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sticky top-20">
                  <h3 className="font-bebas text-xl mb-4">ORDEN</h3>

                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin mb-4">
                    {cart.length === 0 ? (
                      <p className="text-gray-400 text-center py-8 text-sm">Agrega productos del menú</p>
                    ) : (
                      cart.map((item, idx) => {
                        const variantExtra = item.selectedVariants.reduce((s, v) => s + v.extraPrice, 0)
                        const itemTotal = (item.product.price + variantExtra) * item.quantity
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                            <span className="text-lg">{item.product.image}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{item.product.name}</p>
                              {item.selectedVariants.length > 0 && (
                                <p className="text-xs text-gray-400 truncate">{item.selectedVariants.map(v => v.name).join(', ')}</p>
                              )}
                              <p className="text-sm font-bold text-[#E31E24]">{formatMXN(itemTotal)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateQuantity(idx, -1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs"><Minus size={12} /></button>
                              <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(idx, 1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs"><Plus size={12} /></button>
                              <button onClick={() => removeFromCart(idx)} className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500"><Trash2 size={10} /></button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Order Type */}
                  <div className="space-y-3 mb-4">
                    <Label className="text-xs font-semibold">Tipo de Orden</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'LOCAL', label: 'Local', icon: <UtensilsCrossed size={14} /> },
                        { value: 'DELIVERY', label: 'Domicilio', icon: <Truck size={14} /> },
                        { value: 'TAKEOUT', label: 'Llevar', icon: <ShoppingBag size={14} /> },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setOrderType(opt.value)}
                          className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                            orderType === opt.value ? 'bg-[#E31E24] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table Selection (LOCAL) */}
                  {orderType === 'LOCAL' && (
                    <div className="mb-4">
                      <Label className="text-xs font-semibold">Mesa</Label>
                      <Select value={selectedTable} onValueChange={setSelectedTable}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar mesa" /></SelectTrigger>
                        <SelectContent>
                          {tables.filter(t => t.status === 'AVAILABLE').map(t => (
                            <SelectItem key={t.id} value={t.id}>Mesa {t.number} ({t.area}, {t.capacity} personas)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Customer Info (DELIVERY/TAKEOUT) */}
                  {(orderType === 'DELIVERY' || orderType === 'TAKEOUT') && (
                    <div className="space-y-2 mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs font-semibold">Nombre</Label>
                          <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Cliente" className="h-8 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Teléfono</Label>
                          <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="951..." className="h-8 text-sm" />
                        </div>
                      </div>
                      {orderType === 'DELIVERY' && (
                        <div>
                          <Label className="text-xs font-semibold">Dirección</Label>
                          <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección de entrega" className="h-8 text-sm" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="mb-4">
                    <Label className="text-xs font-semibold">Método de Pago</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {[
                        { value: 'CASH', label: 'Efectivo', icon: <DollarSign size={14} /> },
                        { value: 'CARD', label: 'Tarjeta', icon: <CreditCard size={14} /> },
                        { value: 'TRANSFER', label: 'Transfer.', icon: <Phone size={14} /> },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setPaymentMethod(opt.value)}
                          className={`flex items-center gap-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                            paymentMethod === opt.value ? 'bg-[#F5A623] text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discount, Tip, Notes */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <Label className="text-xs font-semibold">Descuento</Label>
                      <Input type="number" value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} placeholder="$0" className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Propina</Label>
                      <Input type="number" value={tip || ''} onChange={e => setTip(parseFloat(e.target.value) || 0)} placeholder="$0" className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <Label className="text-xs font-semibold">Notas</Label>
                    <Textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Notas del pedido..." className="h-16 text-sm resize-none" />
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 text-sm mb-4">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatMXN(cartSubtotal)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-green-600"><span>Descuento</span><span>-{formatMXN(discount)}</span></div>}
                    <div className="flex justify-between"><span>IVA (16%)</span><span>{formatMXN(cartTax)}</span></div>
                    {tip > 0 && <div className="flex justify-between"><span>Propina</span><span>{formatMXN(tip)}</span></div>}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg text-[#E31E24]">
                      <span>Total</span><span>{formatMXN(cartTotal)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={submitOrder}
                    disabled={submitting || cart.length === 0}
                    className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold py-3 rounded-xl"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </span>
                    ) : (
                      'Enviar Orden'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Active Orders Tab */}
          <TabsContent value="active-orders" className="mt-4 p-4">
            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-6">
              {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'CANCEL_REQUESTED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    statusFilter === s ? 'bg-[#E31E24] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s === 'ALL' ? 'Todas' : getStatusLabel(s)}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay órdenes activas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bebas text-lg">#{order.orderNumber}</span>
                        <Badge className={`${getStatusColor(order.status)} text-xs border`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400">{getTimeElapsed(order.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {order.type === 'LOCAL' ? '🍽️ Local' : order.type === 'DELIVERY' ? '🚚 Domicilio' : '📦 Llevar'}
                      </Badge>
                      {order.customerName && <span className="text-gray-600 truncate">{order.customerName}</span>}
                    </div>

                    <div className="space-y-1 mb-3 max-h-32 overflow-y-auto scrollbar-thin">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                          <span className="font-semibold">{formatMXN(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-[#E31E24] text-lg">{formatMXN(order.total)}</span>
                      <span className="text-xs text-gray-400">{order.paymentMethod || 'Efectivo'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {statusFlow[order.status]?.map(nextStatus => (
                        <Button
                          key={nextStatus}
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className={`text-xs ${
                            nextStatus === 'CANCELLED'
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : nextStatus === 'DELIVERED'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-[#E31E24] hover:bg-[#c4191f]'
                          } text-white`}
                        >
                          {nextStatus === 'CONFIRMED' && <Check size={12} className="mr-1" />}
                          {nextStatus === 'PREPARING' && <ChefHat size={12} className="mr-1" />}
                          {nextStatus === 'READY' && <Clock size={12} className="mr-1" />}
                          {nextStatus === 'DELIVERED' && <Check size={12} className="mr-1" />}
                          {nextStatus === 'CANCELLED' && <Ban size={12} className="mr-1" />}
                          {getStatusLabel(nextStatus)}
                        </Button>
                      ))}

                      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'CANCEL_REQUESTED' && (
                        role === 'ADMIN' ? (
                          <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="text-xs">
                            <X size={12} className="mr-1" /> Eliminar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="text-xs text-orange-600 border-orange-300">
                            <AlertCircle size={12} className="mr-1" /> Solicitar Cancel.
                          </Button>
                        )
                      )}

                      {order.status === 'CANCEL_REQUESTED' && role === 'ADMIN' && (
                        <>
                          <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="text-xs">
                            <Check size={12} className="mr-1" /> Aprobar Cancel.
                          </Button>
                          <Button size="sm" onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                            <X size={12} className="mr-1" /> Rechazar Cancel.
                          </Button>
                        </>
                      )}

                      {role === 'ADMIN' && ['DELIVERED', 'CANCELLED'].includes(order.status) && (
                        <Button size="sm" variant="ghost" onClick={() => deleteOrder(order.id)} className="text-xs text-red-400">
                          <Trash2 size={12} className="mr-1" /> Eliminar
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-400">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">synkdata.online</a>)
        </p>
      </footer>
    </div>
  )
}
