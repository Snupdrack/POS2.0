'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMXN, getStatusLabel, getStatusColor, getOrderTypeLabel, getTimeElapsed, getTableStatusColor } from '@/lib/utils'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
  LayoutDashboard, ShoppingCart, Package, FolderOpen, CalendarDays, Grid3X3,
  Users, Settings, LogOut, Plus, Edit2, Trash2, ChefHat, Clock, Check,
  X, Ban, AlertCircle, ExternalLink, DollarSign, TrendingUp, Eye
} from 'lucide-react'

const FOOTER = `© 2026 Nito's Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, México. Diseño y Software por SynkData`
const COLORS = ['#E31E24', '#F5A623', '#4CAF50', '#2196F3', '#9C27B0']

// Type definitions
interface Variant { id?: string; name: string; extraPrice: number }
interface Product { id: string; name: string; description: string; price: number; image: string; imageUrl?: string; categoryId: string; active: boolean; featured: boolean; popular: boolean; isAvailable: boolean; variants: Variant[]; category?: { name: string; icon: string } }
interface Category { id: string; name: string; icon: string; sortOrder: number; active: boolean; products: any[] }
interface OrderItem { id: string; product: { name: string; image: string }; quantity: number; price: number; variants: string | null; notes: string | null }
interface Order { id: string; orderNumber: number; type: string; status: string; customerName: string | null; customerPhone: string | null; address: string | null; notes: string | null; total: number; discount: number; tax: number; tip: number; deliveryFee: number; paymentMethod: string | null; paymentStatus: string | null; createdAt: string; items: OrderItem[]; user: { name: string } }
interface TableInfo { id: string; number: number; capacity: number; status: string; area: string }
interface UserInfo { id: string; email: string; name: string; role: string; active: boolean; createdAt: string }
interface Reservation { id: string; customerName: string; customerPhone: string; customerEmail: string | null; date: string; time: string; guests: number; tableId: string | null; table: { number: number } | null; status: string; notes: string | null; createdAt: string }
interface DeliveryZone { id: string; name: string; fee: number; estimatedMinutes: number; active: boolean }
interface BusinessInfo { id: string; name: string; phone: string; whatsapp: string; address: string; facebook: string | null; hours: string; promo: string | null; deliveryFee: number | null; minOrder: number | null; taxRate: number; logoUrl: string | null }
interface DashboardData { todayRevenue: number; todayOrderCount: number; pendingOrders: number; cancelRequested: number; todayReservations: number; yesterdayRevenue: number; avgTicket: number; totalOrders: number; last7Days: { date: string; day: string; revenue: number; orders: number }[]; orderTypes: { LOCAL: number; DELIVERY: number; TAKEOUT: number }; topProducts: { name: string; quantity: number; avgPrice: number }[] }

type TabId = 'dashboard' | 'orders' | 'products' | 'categories' | 'reservations' | 'tables' | 'users' | 'settings'

const NAV_ITEMS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'orders', label: 'Pedidos', icon: <ShoppingCart size={18} /> },
  { id: 'products', label: 'Productos', icon: <Package size={18} /> },
  { id: 'categories', label: 'Categorías', icon: <FolderOpen size={18} /> },
  { id: 'reservations', label: 'Reservas', icon: <CalendarDays size={18} /> },
  { id: 'tables', label: 'Mesas', icon: <Grid3X3 size={18} /> },
  { id: 'users', label: 'Usuarios', icon: <Users size={18} /> },
  { id: 'settings', label: 'Configuración', icon: <Settings size={18} /> },
]

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = (session?.user as any)?.role

  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<TableInfo[]>([])
  const [users, setUsers] = useState<UserInfo[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')

  // Dialogs
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<TableInfo | null>(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null)
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false)

  // Product form
  const [pName, setPName] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pImage, setPImage] = useState('🍕')
  const [pCategory, setPCategory] = useState('')
  const [pFeatured, setPFeatured] = useState(false)
  const [pPopular, setPPopular] = useState(false)
  const [pAvailable, setPAvailable] = useState(true)
  const [pActive, setPActive] = useState(true)
  const [pVariants, setPVariants] = useState<{ name: string; extraPrice: string }[]>([])

  // Category form
  const [cName, setCName] = useState('')
  const [cIcon, setCIcon] = useState('🍕')
  const [cSortOrder, setCSortOrder] = useState('0')

  // Table form
  const [tNumber, setTNumber] = useState('')
  const [tCapacity, setTCapacity] = useState('4')
  const [tArea, setTArea] = useState('INDOOR')
  const [tStatus, setTStatus] = useState('AVAILABLE')

  // User form
  const [uName, setUName] = useState('')
  const [uEmail, setUEmail] = useState('')
  const [uPassword, setUPassword] = useState('')
  const [uRole, setURole] = useState('CAJA')
  const [uActive, setUActive] = useState(true)

  // Reservation form
  const [rName, setRName] = useState('')
  const [rPhone, setRPhone] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rDate, setRDate] = useState('')
  const [rTime, setRTime] = useState('')
  const [rGuests, setRGuests] = useState('2')
  const [rTable, setRTable] = useState('')
  const [rNotes, setRNotes] = useState('')

  const loadAllData = useCallback(async () => {
    try {
      const [dashRes, prodRes, catRes, orderRes, tableRes, userRes, resRes, zoneRes, bizRes] = await Promise.all([
        fetch('/api/dashboard'), fetch('/api/products'), fetch('/api/categories'),
        fetch('/api/orders'), fetch('/api/tables'), fetch('/api/users'),
        fetch('/api/reservations'), fetch('/api/delivery-zones'), fetch('/api/business')
      ])
      setDashboardData(await dashRes.json())
      setProducts(await prodRes.json())
      setCategories(await catRes.json())
      setOrders(await orderRes.json())
      setTables(await tableRes.json())
      setUsers(await userRes.json())
      setReservations(await resRes.json())
      setDeliveryZones(await zoneRes.json())
      setBusinessInfo(await bizRes.json())
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session && role !== 'ADMIN') router.push('/pos')
  }, [status, session, role, router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (session && role === 'ADMIN') void loadAllData()
  }, [session, role, loadAllData])

  const refreshData = async (endpoint: string) => {
    try {
      const res = await fetch(`/api/${endpoint}`)
      const data = await res.json()
      switch (endpoint) {
        case 'dashboard': setDashboardData(data); break
        case 'products': setProducts(data); break
        case 'categories': setCategories(data); break
        case 'orders': setOrders(data); break
        case 'tables': setTables(data); break
        case 'users': setUsers(data); break
        case 'reservations': setReservations(data); break
        case 'delivery-zones': setDeliveryZones(data); break
        case 'business': setBusinessInfo(data); break
      }
    } catch {}
  }

  // Product CRUD
  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setPName(product.name); setPDesc(product.description); setPPrice(product.price.toString())
      setPImage(product.image); setPCategory(product.categoryId)
      setPFeatured(product.featured); setPPopular(product.popular)
      setPAvailable(product.isAvailable); setPActive(product.active)
      setPVariants(product.variants.map(v => ({ name: v.name, extraPrice: v.extraPrice.toString() })))
    } else {
      setEditingProduct(null)
      setPName(''); setPDesc(''); setPPrice(''); setPImage('🍕')
      setPCategory(categories[0]?.id || ''); setPFeatured(false); setPPopular(false)
      setPAvailable(true); setPActive(true); setPVariants([])
    }
    setProductDialogOpen(true)
  }

  const saveProduct = async () => {
    const variants = pVariants.filter(v => v.name.trim()).map(v => ({ name: v.name, extraPrice: parseFloat(v.extraPrice) || 0 }))
    const payload = { name: pName, description: pDesc, price: parseFloat(pPrice), image: pImage, categoryId: pCategory, featured: pFeatured, popular: pPopular, isAvailable: pAvailable, active: pActive, variants }

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) toast.success('Producto actualizado')
        else toast.error('Error al actualizar')
      } else {
        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) toast.success('Producto creado')
        else toast.error('Error al crear')
      }
      setProductDialogOpen(false)
      refreshData('products')
    } catch { toast.error('Error de conexión') }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      toast.success('Producto eliminado')
      refreshData('products')
    } catch { toast.error('Error al eliminar') }
  }

  // Category CRUD
  const openCategoryDialog = (cat?: Category) => {
    if (cat) { setEditingCategory(cat); setCName(cat.name); setCIcon(cat.icon); setCSortOrder(cat.sortOrder.toString()) }
    else { setEditingCategory(null); setCName(''); setCIcon('🍕'); setCSortOrder('0') }
    setCategoryDialogOpen(true)
  }

  const saveCategory = async () => {
    try {
      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: cName, icon: cIcon, sortOrder: parseInt(cSortOrder) }) })
        toast.success('Categoría actualizada')
      } else {
        await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: cName, icon: cIcon, sortOrder: parseInt(cSortOrder) }) })
        toast.success('Categoría creada')
      }
      setCategoryDialogOpen(false)
      refreshData('categories')
    } catch { toast.error('Error') }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      toast.success('Categoría eliminada')
      refreshData('categories')
    } catch { toast.error('Error') }
  }

  // Order actions
  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      toast.success(`Estado: ${getStatusLabel(status)}`)
      refreshData('orders')
      refreshData('dashboard')
    } catch { toast.error('Error') }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('¿Eliminar esta orden?')) return
    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      toast.success('Orden eliminada')
      refreshData('orders')
      refreshData('dashboard')
    } catch { toast.error('Error') }
  }

  // Table CRUD
  const openTableDialog = (t?: TableInfo) => {
    if (t) { setEditingTable(t); setTNumber(t.number.toString()); setTCapacity(t.capacity.toString()); setTArea(t.area); setTStatus(t.status) }
    else { setEditingTable(null); setTNumber(''); setTCapacity('4'); setTArea('INDOOR'); setTStatus('AVAILABLE') }
    setTableDialogOpen(true)
  }

  const saveTable = async () => {
    try {
      if (editingTable) {
        await fetch(`/api/tables/${editingTable.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: parseInt(tNumber), capacity: parseInt(tCapacity), area: tArea, status: tStatus }) })
        toast.success('Mesa actualizada')
      } else {
        await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: parseInt(tNumber), capacity: parseInt(tCapacity), area: tArea }) })
        toast.success('Mesa creada')
      }
      setTableDialogOpen(false)
      refreshData('tables')
    } catch { toast.error('Error') }
  }

  // User CRUD
  const openUserDialog = (u?: UserInfo) => {
    if (u) { setEditingUser(u); setUName(u.name); setUEmail(u.email); setUPassword(''); setURole(u.role); setUActive(u.active) }
    else { setEditingUser(null); setUName(''); setUEmail(''); setUPassword(''); setURole('CAJA'); setUActive(true) }
    setUserDialogOpen(true)
  }

  const saveUser = async () => {
    try {
      const payload: any = { name: uName, email: uEmail, role: uRole, active: uActive }
      if (uPassword) payload.password = uPassword
      if (editingUser) {
        await fetch(`/api/users/${editingUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        toast.success('Usuario actualizado')
      } else {
        if (!uPassword) { toast.error('Contraseña requerida'); return }
        payload.password = uPassword
        await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        toast.success('Usuario creado')
      }
      setUserDialogOpen(false)
      refreshData('users')
    } catch { toast.error('Error') }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Usuario eliminado'); refreshData('users') }
      else { const err = await res.json(); toast.error(err.error || 'Error') }
    } catch { toast.error('Error') }
  }

  // Reservation actions
  const saveReservation = async () => {
    try {
      await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName: rName, customerPhone: rPhone, customerEmail: rEmail, date: rDate, time: rTime, guests: parseInt(rGuests), tableId: rTable || null, notes: rNotes }) })
      toast.success('Reservación creada')
      setReservationDialogOpen(false)
      refreshData('reservations')
    } catch { toast.error('Error') }
  }

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      toast.success('Reservación actualizada')
      refreshData('reservations')
    } catch { toast.error('Error') }
  }

  // Business settings
  const saveBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!businessInfo) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const data = Object.fromEntries(fd.entries())
    try {
      await fetch('/api/business', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      toast.success('Configuración guardada')
      refreshData('business')
    } catch { toast.error('Error') }
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>
  if (!session || role !== 'ADMIN') return null

  const filteredOrders = orderStatusFilter === 'ALL' ? orders : orders.filter(o => o.status === orderStatusFilter)

  return (
    <div className="min-h-screen flex bg-gray-50 font-nunito">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-white shrink-0">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#E31E24] flex items-center justify-center"><span className="text-lg">🍕</span></div>
            <div>
              <p className="font-bebas text-lg leading-none">NITO&apos;S ADMIN</p>
              <p className="text-xs text-gray-400">{session.user?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === item.id ? 'bg-[#E31E24] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-2 space-y-1 border-t border-gray-800">
          <button onClick={() => router.push('/pos')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white">
            <ExternalLink size={18} /> Ir al POS
          </button>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-red-400">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed left-0 top-0 bottom-0 w-64 bg-[#111111] text-white z-50 md:hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <span className="font-bebas text-lg">NITO&apos;S ADMIN</span>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-white"><X size={18} /></Button>
              </div>
              <nav className="p-2 space-y-1">
                {NAV_ITEMS.map(item => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                      activeTab === item.id ? 'bg-[#E31E24] text-white' : 'text-gray-400 hover:bg-white/5'
                    }`}>
                    {item.icon} {item.label}
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 h-14 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Grid3X3 size={18} />
            </Button>
            <h1 className="font-bebas text-xl">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* ═══ DASHBOARD TAB ═══ */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Ventas Hoy', value: formatMXN(dashboardData.todayRevenue), icon: <DollarSign size={18} />, color: 'bg-green-50 text-green-700' },
                  { label: 'Órdenes Hoy', value: dashboardData.todayOrderCount.toString(), icon: <ShoppingCart size={18} />, color: 'bg-blue-50 text-blue-700' },
                  { label: 'Pendientes', value: dashboardData.pendingOrders.toString(), icon: <Clock size={18} />, color: 'bg-yellow-50 text-yellow-700' },
                  { label: 'Cancel. Solicitada', value: dashboardData.cancelRequested.toString(), icon: <AlertCircle size={18} />, color: 'bg-orange-50 text-orange-700' },
                  { label: 'Reservas Hoy', value: dashboardData.todayReservations.toString(), icon: <CalendarDays size={18} />, color: 'bg-purple-50 text-purple-700' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                    <p className="font-bold text-xl">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bebas text-lg mb-4">Ventas Últimos 7 Días</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dashboardData.last7Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => formatMXN(value)} />
                      <Bar dataKey="revenue" fill="#E31E24" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bebas text-lg mb-4">Tipos de Orden Hoy</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={[
                        { name: 'Local', value: dashboardData.orderTypes.LOCAL },
                        { name: 'Domicilio', value: dashboardData.orderTypes.DELIVERY },
                        { name: 'Llevar', value: dashboardData.orderTypes.TAKEOUT },
                      ].filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Products + Extra Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bebas text-lg mb-4">Top Productos Hoy</h3>
                  {dashboardData.topProducts.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Sin datos</p>
                  ) : (
                    <Table><TableBody>
                      {dashboardData.topProducts.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{i + 1}. {p.name}</TableCell>
                          <TableCell className="text-right">{p.quantity} vendidos</TableCell>
                          <TableCell className="text-right text-[#E31E24] font-bold">{formatMXN(p.avgPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody></Table>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bebas text-lg mb-4">Más Estadísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-500">Ticket Promedio</span><span className="font-bold">{formatMXN(dashboardData.avgTicket)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Ventas Ayer</span><span className="font-bold">{formatMXN(dashboardData.yesterdayRevenue)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Total Órdenes</span><span className="font-bold">{dashboardData.totalOrders}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-gray-500">Crecimiento</span>
                      <span className={`font-bold ${dashboardData.todayRevenue > dashboardData.yesterdayRevenue ? 'text-green-600' : 'text-red-600'}`}>
                        {dashboardData.yesterdayRevenue > 0 ? `${((dashboardData.todayRevenue - dashboardData.yesterdayRevenue) / dashboardData.yesterdayRevenue * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ORDERS TAB ═══ */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCEL_REQUESTED', 'CANCELLED'].map(s => (
                  <button key={s} onClick={() => setOrderStatusFilter(s)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      orderStatusFilter === s ? 'bg-[#E31E24] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}>
                    {s === 'ALL' ? 'Todas' : getStatusLabel(s)}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400"><ShoppingCart size={48} className="mx-auto mb-4 opacity-50" /><p>No hay órdenes</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bebas text-lg">#{order.orderNumber}</span>
                          <Badge className={`${getStatusColor(order.status)} text-xs border`}>{getStatusLabel(order.status)}</Badge>
                        </div>
                        <span className="text-xs text-gray-400">{getTimeElapsed(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <Badge variant="outline" className="text-xs">{order.type === 'LOCAL' ? '🍽️ Local' : order.type === 'DELIVERY' ? '🚚 Domicilio' : '📦 Llevar'}</Badge>
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
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'PENDING' && <Button size="sm" onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs"><Check size={12} className="mr-1" />Confirmar</Button>}
                        {order.status === 'CONFIRMED' && <Button size="sm" onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="bg-[#E31E24] hover:bg-[#c4191f] text-white text-xs"><ChefHat size={12} className="mr-1" />Preparar</Button>}
                        {order.status === 'PREPARING' && <Button size="sm" onClick={() => updateOrderStatus(order.id, 'READY')} className="bg-green-600 hover:bg-green-700 text-white text-xs"><Clock size={12} className="mr-1" />Listo</Button>}
                        {order.status === 'READY' && <Button size="sm" onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="bg-green-600 hover:bg-green-700 text-white text-xs"><Check size={12} className="mr-1" />Entregado</Button>}
                        {order.status === 'CANCEL_REQUESTED' && (
                          <>
                            <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="text-xs"><Ban size={12} className="mr-1" />Aprobar Cancel.</Button>
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs"><X size={12} className="mr-1" />Rechazar Cancel.</Button>
                          </>
                        )}
                        {!['DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'].includes(order.status) && (
                          <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="text-xs"><X size={12} className="mr-1" />Cancelar</Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteOrder(order.id)} className="text-xs text-red-400"><Trash2 size={12} /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ PRODUCTS TAB ═══ */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bebas text-lg">Productos ({products.length})</h3>
                <Button onClick={() => openProductDialog()} className="bg-[#E31E24] hover:bg-[#c4191f] text-white"><Plus size={16} className="mr-1" /> Nuevo Producto</Button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id}>
                        <TableCell><span className="text-2xl">{p.image}</span></TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{p.category?.name || '-'}</TableCell>
                        <TableCell className="font-bold text-[#E31E24]">{formatMXN(p.price)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {p.featured && <Badge className="bg-[#F5A623] text-white text-xs">Destacado</Badge>}
                            {p.popular && <Badge className="bg-green-600 text-white text-xs">Popular</Badge>}
                            {!p.isAvailable && <Badge variant="destructive" className="text-xs">No disp.</Badge>}
                            {!p.active && <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => openProductDialog(p)}><Edit2 size={14} /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteProduct(p.id)} className="text-red-500"><Trash2 size={14} /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ═══ CATEGORIES TAB ═══ */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bebas text-lg">Categorías ({categories.length})</h3>
                <Button onClick={() => openCategoryDialog()} className="bg-[#E31E24] hover:bg-[#c4191f] text-white"><Plus size={16} className="mr-1" /> Nueva Categoría</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{cat.icon}</span>
                        <div>
                          <p className="font-bold">{cat.name}</p>
                          <p className="text-xs text-gray-400">{cat.products.length} productos</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openCategoryDialog(cat)}><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCategory(cat.id)} className="text-red-500"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ RESERVATIONS TAB ═══ */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bebas text-lg">Reservaciones ({reservations.length})</h3>
                <Button onClick={() => { setRName(''); setRPhone(''); setREmail(''); setRDate(''); setRTime(''); setRGuests('2'); setRTable(''); setRNotes(''); setReservationDialogOpen(true) }} className="bg-[#E31E24] hover:bg-[#c4191f] text-white"><Plus size={16} className="mr-1" /> Nueva Reserva</Button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Cliente</TableHead><TableHead>Fecha</TableHead><TableHead>Hora</TableHead>
                    <TableHead>Personas</TableHead><TableHead>Mesa</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {reservations.map(r => (
                      <TableRow key={r.id}>
                        <TableCell><div><p className="font-semibold">{r.customerName}</p><p className="text-xs text-gray-400">{r.customerPhone}</p></div></TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.time}</TableCell>
                        <TableCell>{r.guests}</TableCell>
                        <TableCell>{r.table?.number || '-'}</TableCell>
                        <TableCell><Badge className={`${getStatusColor(r.status)} text-xs border`}>{getStatusLabel(r.status)}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {r.status === 'PENDING' && <Button size="sm" onClick={() => updateReservationStatus(r.id, 'CONFIRMED')} className="bg-green-600 hover:bg-green-700 text-white text-xs"><Check size={12} /></Button>}
                            {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && <Button size="sm" variant="ghost" onClick={() => updateReservationStatus(r.id, 'CANCELLED')} className="text-red-500 text-xs"><X size={12} /></Button>}
                            {r.status === 'CONFIRMED' && <Button size="sm" onClick={() => updateReservationStatus(r.id, 'COMPLETED')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs"><Check size={12} /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ═══ TABLES TAB ═══ */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bebas text-lg">Mesas ({tables.length})</h3>
                <Button onClick={() => openTableDialog()} className="bg-[#E31E24] hover:bg-[#c4191f] text-white"><Plus size={16} className="mr-1" /> Nueva Mesa</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map(t => (
                  <div key={t.id} className={`rounded-xl p-4 shadow-sm border-2 cursor-pointer hover:shadow-md transition-all ${getTableStatusColor(t.status)}`}
                    onClick={() => openTableDialog(t)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bebas text-2xl">{t.number}</span>
                      <Badge variant="outline" className="text-xs bg-white/50">{t.area}</Badge>
                    </div>
                    <p className="text-sm"><span className="font-semibold">Capacidad:</span> {t.capacity} personas</p>
                    <p className="text-xs mt-1">{getStatusLabel(t.status)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ USERS TAB ═══ */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bebas text-lg">Usuarios ({users.length})</h3>
                <Button onClick={() => openUserDialog()} className="bg-[#E31E24] hover:bg-[#c4191f] text-white"><Plus size={16} className="mr-1" /> Nuevo Usuario</Button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead>Rol</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-semibold">{u.name}</TableCell>
                        <TableCell className="text-gray-500">{u.email}</TableCell>
                        <TableCell><Badge className={`${u.role === 'ADMIN' ? 'bg-purple-600' : u.role === 'KITCHEN' ? 'bg-orange-600' : 'bg-blue-600'} text-white text-xs`}>{u.role}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={u.active} onCheckedChange={async (checked) => {
                              await fetch(`/api/users/${u.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: checked }) })
                              refreshData('users')
                            }} />
                            <span className="text-xs">{u.active ? 'Activo' : 'Inactivo'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => openUserDialog(u)}><Edit2 size={14} /></Button>
                            {u.id !== (session.user as any)?.id && (
                              <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id)} className="text-red-500"><Trash2 size={14} /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS TAB ═══ */}
          {activeTab === 'settings' && businessInfo && (
            <div className="space-y-6 max-w-3xl">
              {/* Business Info Form */}
              <form onSubmit={saveBusiness} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bebas text-xl">Información del Negocio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-sm font-semibold">Nombre</Label><Input name="name" defaultValue={businessInfo.name} className="mt-1" /></div>
                  <div><Label className="text-sm font-semibold">Teléfono</Label><Input name="phone" defaultValue={businessInfo.phone} className="mt-1" /></div>
                  <div><Label className="text-sm font-semibold">WhatsApp</Label><Input name="whatsapp" defaultValue={businessInfo.whatsapp} className="mt-1" /></div>
                  <div><Label className="text-sm font-semibold">Facebook</Label><Input name="facebook" defaultValue={businessInfo.facebook || ''} className="mt-1" /></div>
                  <div className="sm:col-span-2"><Label className="text-sm font-semibold">Dirección</Label><Input name="address" defaultValue={businessInfo.address} className="mt-1" /></div>
                  <div><Label className="text-sm font-semibold">Horario</Label><Input name="hours" defaultValue={businessInfo.hours} className="mt-1" /></div>
                  <div><Label className="text-sm font-semibold">Promoción</Label><Input name="promo" defaultValue={businessInfo.promo || ''} className="mt-1" /></div>
                  <div><Label className="text-sm font-semibold">Tasa IVA</Label><Input name="taxRate" type="number" step="0.01" defaultValue={businessInfo.taxRate} className="mt-1" /></div>
                  <div><Label className="text-sm font-semibold">Envío mínimo</Label><Input name="minOrder" type="number" step="0.01" defaultValue={businessInfo.minOrder || ''} className="mt-1" /></div>
                </div>
                <Button type="submit" className="bg-[#E31E24] hover:bg-[#c4191f] text-white">Guardar Configuración</Button>
              </form>

              {/* Delivery Zones */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bebas text-xl mb-4">Zonas de Entrega</h3>
                <div className="space-y-3">
                  {deliveryZones.map(z => (
                    <div key={z.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-sm">{z.name}</p>
                        <p className="text-xs text-gray-400">{z.estimatedMinutes} min estimados</p>
                      </div>
                      <span className="font-bold text-[#E31E24]">{formatMXN(z.fee)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-3 px-6 text-center border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-400">
            {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">synkdata.online</a>)
          </p>
        </footer>
      </div>

      {/* ═══ PRODUCT DIALOG ═══ */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-bebas text-xl">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Nombre</Label><Input value={pName} onChange={e => setPName(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-sm font-semibold">Precio</Label><Input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label className="text-sm font-semibold">Descripción</Label><Textarea value={pDesc} onChange={e => setPDesc(e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Emoji/Imagen</Label><Input value={pImage} onChange={e => setPImage(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-sm font-semibold">Categoría</Label>
                <Select value={pCategory} onValueChange={setPCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Variantes</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setPVariants([...pVariants, { name: '', extraPrice: '0' }])}><Plus size={14} className="mr-1" /> Agregar</Button>
              </div>
              {pVariants.map((v, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="Nombre" value={v.name} onChange={e => { const updated = [...pVariants]; updated[i] = { ...updated[i], name: e.target.value }; setPVariants(updated) }} className="flex-1" />
                  <Input placeholder="Precio extra" type="number" value={v.extraPrice} onChange={e => { const updated = [...pVariants]; updated[i] = { ...updated[i], extraPrice: e.target.value }; setPVariants(updated) }} className="w-28" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPVariants(pVariants.filter((_, j) => j !== i))} className="text-red-500"><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2"><Switch checked={pFeatured} onCheckedChange={setPFeatured} /><Label className="text-sm">Destacado</Label></div>
              <div className="flex items-center gap-2"><Switch checked={pPopular} onCheckedChange={setPPopular} /><Label className="text-sm">Popular</Label></div>
              <div className="flex items-center gap-2"><Switch checked={pAvailable} onCheckedChange={setPAvailable} /><Label className="text-sm">Disponible</Label></div>
              <div className="flex items-center gap-2"><Switch checked={pActive} onCheckedChange={setPActive} /><Label className="text-sm">Activo</Label></div>
            </div>
            <Button onClick={saveProduct} className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold">Guardar Producto</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ CATEGORY DIALOG ═══ */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-bebas text-xl">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm font-semibold">Nombre</Label><Input value={cName} onChange={e => setCName(e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Icono (emoji)</Label><Input value={cIcon} onChange={e => setCIcon(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-sm font-semibold">Orden</Label><Input type="number" value={cSortOrder} onChange={e => setCSortOrder(e.target.value)} className="mt-1" /></div>
            </div>
            <Button onClick={saveCategory} className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold">Guardar Categoría</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ TABLE DIALOG ═══ */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-bebas text-xl">{editingTable ? 'Editar Mesa' : 'Nueva Mesa'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Número</Label><Input type="number" value={tNumber} onChange={e => setTNumber(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-sm font-semibold">Capacidad</Label><Input type="number" value={tCapacity} onChange={e => setTCapacity(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Área</Label>
                <Select value={tArea} onValueChange={setTArea}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDOOR">Interior</SelectItem>
                    <SelectItem value="OUTDOOR">Exterior</SelectItem>
                    <SelectItem value="TERRACE">Terraza</SelectItem>
                    <SelectItem value="BAR">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-sm font-semibold">Estado</Label>
                <Select value={tStatus} onValueChange={setTStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Disponible</SelectItem>
                    <SelectItem value="OCCUPIED">Ocupada</SelectItem>
                    <SelectItem value="RESERVED">Reservada</SelectItem>
                    <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={saveTable} className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold">Guardar Mesa</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ USER DIALOG ═══ */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-bebas text-xl">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm font-semibold">Nombre</Label><Input value={uName} onChange={e => setUName(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-sm font-semibold">Email</Label><Input type="email" value={uEmail} onChange={e => setUEmail(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-sm font-semibold">Contraseña {editingUser && '(dejar vacío para no cambiar)'}</Label><Input type="password" value={uPassword} onChange={e => setUPassword(e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Rol</Label>
                <Select value={uRole} onValueChange={setURole}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="CAJA">Caja</SelectItem>
                    <SelectItem value="KITCHEN">Cocina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={uActive} onCheckedChange={setUActive} /><Label className="text-sm">Activo</Label></div>
            </div>
            <Button onClick={saveUser} className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold">Guardar Usuario</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ RESERVATION DIALOG ═══ */}
      <Dialog open={reservationDialogOpen} onOpenChange={setReservationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-bebas text-xl">Nueva Reservación</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Nombre</Label><Input value={rName} onChange={e => setRName(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-sm font-semibold">Teléfono</Label><Input value={rPhone} onChange={e => setRPhone(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Fecha</Label><Input type="date" value={rDate} onChange={e => setRDate(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-sm font-semibold">Hora</Label><Input type="time" value={rTime} onChange={e => setRTime(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-semibold">Personas</Label><Input type="number" value={rGuests} onChange={e => setRGuests(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-sm font-semibold">Mesa</Label>
                <Select value={rTable} onValueChange={setRTable}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{tables.map(t => <SelectItem key={t.id} value={t.id}>Mesa {t.number} ({t.area})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm font-semibold">Notas</Label><Textarea value={rNotes} onChange={e => setRNotes(e.target.value)} className="mt-1" /></div>
            <Button onClick={saveReservation} className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold">Crear Reservación</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
