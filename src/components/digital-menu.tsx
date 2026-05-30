'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { formatMXN } from '@/lib/utils'
import { X, Plus, Minus, ShoppingCart, Phone, MapPin, Clock, ChevronUp, MessageCircle } from 'lucide-react'
import { categories as localCategories, products as localProducts } from '@/lib/menu-data'

const FOOTER = `© 2026 Nito's Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, México. Diseño y Software por SynkData`
const WHATSAPP = '+5219514618850'
const PHONE = '(951) 725-0827'

interface Variant { id: string; name: string; extraPrice: number }
interface Product { id: string; name: string; description: string; price: number; image: string; featured: boolean; popular: boolean; isAvailable: boolean; variants: Variant[]; categoryId: string; category?: { name: string; icon: string } }
interface Category { id: string; name: string; icon: string; products: Product[] }
interface CartItem { product: Product; quantity: number; selectedVariants: Variant[]; notes: string }

export default function DigitalMenu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([])
  const [productNotes, setProductNotes] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeNav, setActiveNav] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      if (data && data.length > 0) {
        setCategories(data)
        setActiveCategory(data[0].id)
        setLoading(false)
        return
      }
    } catch (err) {
      console.error('Error fetching categories from API, using local data:', err)
    }
    
    // Fallback: usar datos locales
    const transformedCategories: Category[] = localCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.emoji,
      products: localProducts
        .filter(p => p.category === cat.id)
        .map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          image: p.emoji,
          featured: p.featured || false,
          popular: p.popular || false,
          isAvailable: true,
          variants: [],
          categoryId: cat.id,
          category: { name: cat.name, icon: cat.emoji }
        }))
    }))
    
    setCategories(transformedCategories)
    if (transformedCategories.length > 0) {
      setActiveCategory(transformedCategories[0].id)
    }
    setLoading(false)
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => {
    const variantExtra = item.selectedVariants.reduce((s, v) => s + v.extraPrice, 0)
    return sum + (item.product.price + variantExtra) * item.quantity
  }, 0)

  const addToCart = (product: Product, variants: Variant[] = [], notes: string = '') => {
    setCart(prev => {
      const key = `${product.id}-${variants.map(v => v.name).join('-')}`
      const existing = prev.findIndex(item =>
        item.product.id === product.id &&
        item.selectedVariants.map(v => v.id).join(',') === variants.map(v => v.id).join(',')
      )
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 }
        return updated
      }
      return [...prev, { product, quantity: 1, selectedVariants: variants, notes }]
    })
  }

  const updateCartQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], quantity: updated[index].quantity + delta }
      if (updated[index].quantity <= 0) updated.splice(index, 1)
      return updated
    })
  }

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setSelectedVariants([])
    setProductNotes('')
    setProductModalOpen(true)
  }

  const handleAddFromModal = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, selectedVariants, productNotes)
      setProductModalOpen(false)
    }
  }

  const sendWhatsAppOrder = () => {
    let message = '🍕 *Pedido Nito\'s Pizza*\n\n'
    cart.forEach(item => {
      const variantExtra = item.selectedVariants.reduce((s, v) => s + v.extraPrice, 0)
      const itemTotal = (item.product.price + variantExtra) * item.quantity
      message += `• ${item.quantity}x ${item.product.name}`
      if (item.selectedVariants.length > 0) {
        message += ` (${item.selectedVariants.map(v => v.name).join(', ')})`
      }
      message += ` - ${formatMXN(itemTotal)}\n`
    })
    message += `\n💰 *Total: ${formatMXN(cartTotal)}*`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${WHATSAPP}?text=${encoded}`, '_blank')
  }

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const featuredProducts = categories.flatMap(c => c.products).filter(p => p.featured)
  const popularProducts = categories.flatMap(c => c.products).filter(p => p.popular)

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-nunito">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111111] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E31E24] flex items-center justify-center">
              <span className="text-lg">🍕</span>
            </div>
            <span className="font-bebas text-2xl tracking-wider">NITO&apos;S PIZZA</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={scrollToMenu} className="text-sm hover:text-[#F5A623] transition-colors">Menú</button>
            <a href="#contacto" className="text-sm hover:text-[#F5A623] transition-colors">Contacto</a>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${PHONE.replace(/[() ]/g, '')}`} className="hidden sm:flex items-center gap-1 text-sm text-[#F5A623]">
              <Phone size={14} /> Llamar
            </a>
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-[#E31E24] text-white text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="font-bebas text-2xl">TU PEDIDO</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex-1 overflow-y-auto max-h-[60vh] scrollbar-thin">
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">Tu carrito está vacío</p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item, idx) => {
                        const variantExtra = item.selectedVariants.reduce((s, v) => s + v.extraPrice, 0)
                        const itemTotal = (item.product.price + variantExtra) * item.quantity
                        return (
                          <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-2xl shrink-0">
                              {item.product.image}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{item.product.name}</p>
                              {item.selectedVariants.length > 0 && (
                                <p className="text-xs text-gray-500">{item.selectedVariants.map(v => v.name).join(', ')}</p>
                              )}
                              <p className="text-sm font-bold text-[#E31E24]">{formatMXN(itemTotal)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => updateCartQuantity(idx, -1)}>
                                <Minus size={12} />
                              </Button>
                              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => updateCartQuantity(idx, 1)}>
                                <Plus size={12} />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400" onClick={() => removeFromCart(idx)}>
                                <X size={14} />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-4">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-[#E31E24] text-lg">{formatMXN(cartTotal)}</span>
                    </div>
                    <Button onClick={sendWhatsAppOrder} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">
                      <MessageCircle className="mr-2" size={18} /> Ordenar por WhatsApp
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-[80vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24]/5 via-transparent to-[#F5A623]/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#E31E24]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#F5A623]/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-bebas text-6xl md:text-8xl text-[#111111] mb-4">
              LA PIZZA QUE<br/>
              <span className="text-[#E31E24]">CONQUISTÓ OAXACA</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Pizza artesanal con ingredientes frescos y el sazón oaxaqueño que nos distingue. ¡Pide y disfruta!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={scrollToMenu} size="lg" className="bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold py-4 px-8 rounded-xl text-lg">
                🍕 Ver Menú
              </Button>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-[#E31E24] text-[#E31E24] hover:bg-[#E31E24] hover:text-white font-bold py-4 px-8 rounded-xl text-lg">
                  <MessageCircle className="mr-2" /> Pedir por WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promo Marquee */}
      <div className="bg-[#E31E24] text-white py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="mx-8 font-bebas text-lg tracking-wider">
              🔥 2x1 MARTES Y JUEVES 🔥 &nbsp;&nbsp; 🍕 PIZZA ARTESANAL 🍕 &nbsp;&nbsp; 📍 TLACOLULA, OAXACA 📍 &nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Featured / Especialidades */}
      {featuredProducts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-bebas text-4xl md:text-5xl text-center mb-2 text-[#111111]">⭐ ESPECIALIDADES</h2>
            <p className="text-center text-gray-500 mb-10">Las favoritas de nuestros clientes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 6).map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100 cursor-pointer"
                  onClick={() => openProductModal(product)}
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF8F0] flex items-center justify-center text-3xl mb-4">
                    {product.image}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#E31E24] font-bold text-lg">{formatMXN(product.price)}</span>
                    <Button size="sm" className="bg-[#E31E24] hover:bg-[#c4191f] text-white rounded-full px-4">
                      <Plus size={14} className="mr-1" /> Agregar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full Menu Section */}
      <section id="menu-section" className="py-16 px-4 bg-white" ref={menuRef}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bebas text-4xl md:text-5xl text-center mb-2 text-[#111111]">NUESTRO MENÚ</h2>
          <p className="text-center text-gray-500 mb-8">Elige tus favoritos</p>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#E31E24] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {categories.find(c => c.id === activeCategory)?.products.map(product => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -2 }}
                    className="bg-[#FFF8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                    onClick={() => openProductModal(product)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
                        {product.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold truncate">{product.name}</h3>
                          {product.popular && <Badge variant="secondary" className="text-xs bg-[#F5A623] text-white">Popular</Badge>}
                        </div>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[#E31E24] font-bold">{formatMXN(product.price)}</span>
                          <Button size="sm" className="bg-[#E31E24] hover:bg-[#c4191f] text-white rounded-full h-7 w-7 p-0">
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Popular Items */}
      {popularProducts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-bebas text-4xl md:text-5xl text-center mb-2 text-[#111111]">🔥 MÁS PEDIDOS</h2>
            <p className="text-center text-gray-500 mb-10">Los favoritos del público</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularProducts.slice(0, 8).map(product => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer text-center border border-gray-100"
                  onClick={() => openProductModal(product)}
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#FFF8F0] flex items-center justify-center text-2xl mb-3">
                    {product.image}
                  </div>
                  <h3 className="font-bold text-sm mb-1 truncate">{product.name}</h3>
                  <p className="text-[#E31E24] font-bold text-sm">{formatMXN(product.price)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contacto" className="py-16 px-4 bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bebas text-4xl md:text-5xl mb-8">CONTÁCTANOS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-2xl p-6">
              <Phone size={28} className="mx-auto mb-3 text-[#F5A623]" />
              <h3 className="font-bold mb-1">Teléfono</h3>
              <a href={`tel:${PHONE.replace(/[() ]/g, '')}`} className="text-[#F5A623] hover:underline">{PHONE}</a>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <MessageCircle size={28} className="mx-auto mb-3 text-green-400" />
              <h3 className="font-bold mb-1">WhatsApp</h3>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                +52 1 951 461 8850
              </a>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <MapPin size={28} className="mx-auto mb-3 text-[#E31E24]" />
              <h3 className="font-bold mb-1">Dirección</h3>
              <p className="text-gray-400 text-sm">Carretera Cristóbal Colón km 30.1, Tlacolula de Matamoros, Oaxaca</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <Clock size={28} className="mx-auto mb-3 text-blue-400" />
              <h3 className="font-bold mb-1">Horario</h3>
              <p className="text-gray-400 text-sm">Lunes – Domingo<br/>12:00 PM – 10:00 PM</p>
            </div>
          </div>
          <div className="mt-6">
            <a href="https://www.facebook.com/profile.php?id=100086304049257" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:underline text-sm">
              📘 Síguenos en Facebook
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 px-6 text-center bg-[#0a0a0a] text-gray-500">
        <p className="text-xs">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">synkdata.online</a>)
        </p>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg animate-float transition-colors"
      >
        <MessageCircle size={28} className="text-white" />
      </a>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 w-10 h-10 bg-[#E31E24] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#c4191f] transition-colors"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Product Detail Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bebas text-2xl">
              {selectedProduct?.image} {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">{selectedProduct.description}</p>

              {/* Variants */}
              {selectedProduct.variants.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Elige una opción:</Label>
                  <div className="space-y-2">
                    {selectedProduct.variants.map(variant => {
                      const isSelected = selectedVariants.some(v => v.id === variant.id)
                      const price = selectedProduct.price + variant.extraPrice
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariants([variant])}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-[#E31E24] bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-medium text-sm">{variant.name}</span>
                          <span className="font-bold text-sm">{formatMXN(price)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Notas especiales:</Label>
                <Input
                  value={productNotes}
                  onChange={(e) => setProductNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, extra queso..."
                />
              </div>

              <Separator />

              {/* Total & Add */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Precio</p>
                  <p className="text-xl font-bold text-[#E31E24]">
                    {formatMXN(selectedProduct.price + (selectedVariants[0]?.extraPrice || 0))}
                  </p>
                </div>
                <Button onClick={handleAddFromModal} className="bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold px-6 rounded-xl">
                  <Plus size={16} className="mr-1" /> Agregar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
