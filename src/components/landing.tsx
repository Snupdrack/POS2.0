'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Star,
  Flame,
  ChevronRight,
  CalendarCheck,
  Truck,
  UtensilsCrossed,
  Heart,
  Facebook,
} from 'lucide-react';
import { categories, products, formatPrice, featuredProducts } from '@/lib/menu-data';

const specialties = products.filter(p => p.featured && (p.category === 'especiales' || p.category === 'clasicas')).slice(0, 6);
const mostConsumed = products.filter(p => p.featured).slice(0, 8);
const promos = products.filter(p => p.category === 'promos');
const paquetes = products.filter(p => p.category === 'paquetes');

export default function LandingSection() {
  const { setActiveSection, addToCart } = useStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/pizza-hero.png"
            alt="Nito's Pizza - Pizza artesanal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="bg-[#FE4F04] hover:bg-[#C73D00] text-white font-semibold px-4 py-1.5 text-sm mb-6">
                <Flame className="w-4 h-4 mr-1" />
                Abierto ahora - Pide y recibe en tu puerta
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                Nito&apos;s
                <span className="block text-[#FE4F04]">Pizza</span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
                La pizza artesanal que conquist&oacute; Oaxaca. Ingredientes frescos, masa hecha al momento y el sabor que te hace volver.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-[#FE4F04] hover:bg-[#C73D00] text-white font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
                  onClick={() => setActiveSection('menu')}
                >
                  Ver Men&uacute; Completo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <a href="https://wa.me/5219514618850" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold text-lg px-8 py-6 rounded-full border border-white/30"
                  >
                    <CalendarCheck className="mr-2 w-5 h-5" />
                    Pedir por WhatsApp
                  </Button>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center lg:justify-start justify-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#FE4F04]" />
                  <span>Delivery r&aacute;pido</span>
                </div>
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[#FE4F04]" />
                  <span>Para llevar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FE4F04]" />
                  <span>Lun-Dom 12:00-22:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>4.9/5 (320+ rese&ntilde;as)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Promociones Destacadas */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 mb-3">
              <Flame className="w-3 h-3 mr-1" /> Ofertas por tiempo limitado
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Promociones <span className="text-[#FE4F04]">de la Semana</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              No te pierdas estas ofertas exclusivas solo disponibles esta semana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
              <Card
                key={promo.id}
                className="group overflow-hidden border-2 border-[#FE4F04]/20 hover:border-[#FE4F04] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50/30"
              >
                <div className="relative h-48 bg-gradient-to-br from-[#FE4F04] to-[#FF6B35] flex items-center justify-center">
                  <span className="text-7xl">{promo.emoji}</span>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-yellow-400 text-yellow-900 font-bold animate-pulse">
                      <Flame className="w-3 h-3 mr-1" /> PROMO
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-1">{promo.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{promo.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-[#FE4F04]">{formatPrice(promo.price)}</span>
                    <Button
                      size="sm"
                      className="bg-[#FE4F04] hover:bg-[#C73D00] text-white rounded-full"
                      onClick={() => {
                        addToCart(promo);
                        setActiveSection('menu');
                      }}
                    >
                      Pedir
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Especialidades de la Casa */}
      <section className="py-16 px-4 bg-[#FFF8F3]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-3">
              <Star className="w-3 h-3 mr-1" /> Lo mejor de Nito&apos;s
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Especialidades <span className="text-[#FE4F04]">de la Casa</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Nuestras creaciones insignia que nos hicieron famosos en Oaxaca
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FE4F04]/10 to-orange-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                      {product.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base truncate">{product.name}</h3>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-[10px] shrink-0">
                          Especial
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#FE4F04] text-lg">{formatPrice(product.price)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#FE4F04] text-[#FE4F04] hover:bg-[#FE4F04] hover:text-white rounded-full text-xs"
                          onClick={() => {
                            addToCart(product);
                            setActiveSection('menu');
                          }}
                        >
                          + Pedir
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              size="lg"
              className="bg-[#FE4F04] hover:bg-[#C73D00] text-white font-bold rounded-full px-8"
              onClick={() => setActiveSection('menu')}
            >
              Ver Men&uacute; Completo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Lo Más Consumido */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-3">
              <Heart className="w-3 h-3 mr-1" /> Favoritos de nuestros clientes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Lo M&aacute;s <span className="text-[#FE4F04]">Consumido</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Los platillos que nuestros clientes piden una y otra vez
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mostConsumed.map((product, index) => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm cursor-pointer"
                onClick={() => {
                  addToCart(product);
                  setActiveSection('menu');
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {product.emoji}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FE4F04] text-white text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-2 min-h-[2rem]">{product.description}</p>
                  <span className="font-extrabold text-[#FE4F04]">{formatPrice(product.price)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Paquetes */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#FE4F04] to-[#FF6B35]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-white/20 text-white hover:bg-white/20 mb-3">
              <Flame className="w-3 h-3 mr-1" /> Combos completos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              Paquetes para <span className="text-yellow-300">Todos</span>
            </h2>
            <p className="text-white/80 text-lg">
              Combos completos para disfrutar en familia, en pareja o solo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paquetes.map((paquete) => (
              <Card
                key={paquete.id}
                className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-6 text-center">
                  <span className="text-5xl block mb-3">{paquete.emoji}</span>
                  <h3 className="font-bold text-xl mb-2">{paquete.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{paquete.description}</p>
                  <div className="text-3xl font-extrabold text-[#FE4F04] mb-4">{formatPrice(paquete.price)}</div>
                  <Button
                    className="w-full bg-[#FE4F04] hover:bg-[#C73D00] text-white font-bold rounded-full"
                    onClick={() => {
                      addToCart(paquete);
                      setActiveSection('menu');
                    }}
                  >
                    Ordenar Paquete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías del Menú */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Explora Nuestro <span className="text-[#FE4F04]">Men&uacute;</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Desde pizzas artesanales hasta snacks irresistibles
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm cursor-pointer bg-gradient-to-br from-white to-orange-50/20"
                onClick={() => setActiveSection('menu')}
              >
                <CardContent className="p-5 text-center">
                  <span className="text-4xl block mb-2 group-hover:scale-125 transition-transform">
                    {cat.emoji}
                  </span>
                  <h3 className="font-bold text-xs md:text-sm leading-tight">{cat.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reservaciones CTA */}
      <section className="py-16 px-4 bg-[#FFF8F3]">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src="/restaurant-interior.png"
              alt="Interior de Nito's Pizza"
              className="w-full h-80 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Vis&iacute;tanos en <span className="text-[#FE4F04]">Nito&apos;s</span>
                </h2>
                <p className="text-white/90 text-lg mb-6 max-w-lg mx-auto">
                  Reserva tu mesa y disfruta de una experiencia &uacute;nica con la mejor pizza artesanal de Oaxaca
                </p>
                <Button
                  size="lg"
                  className="bg-[#FE4F04] hover:bg-[#C73D00] text-white font-bold text-lg px-8 py-6 rounded-full shadow-xl"
                  onClick={() => setActiveSection('menu')}
                >
                  <CalendarCheck className="mr-2 w-5 h-5" />
                  Pedir Ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info / Footer Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/nitos-logo.png" alt="Nito's Pizza" className="w-12 h-12 rounded-xl" />
                <div>
                  <h3 className="font-extrabold text-2xl text-[#FE4F04]">Nito&apos;s Pizza</h3>
                  <p className="text-gray-400 text-sm">Arte y sabor desde Oaxaca</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                La pizza artesanal que conquist&oacute; el coraz&oacute;n de Oaxaca. Masa hecha al momento, ingredientes frescos y el sabor que te hace volver.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://www.facebook.com/profile.php?id=100086304049257" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FE4F04] flex items-center justify-center transition-colors" title="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Horario</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <div className="flex justify-between">
                  <span>Lunes - Jueves</span>
                  <span className="text-white">12:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Viernes - S&aacute;bado</span>
                  <span className="text-white">12:00 - 23:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="text-white">12:00 - 21:00</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Contacto</h4>
              <div className="space-y-3 text-gray-400 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#FE4F04] shrink-0" />
                  <span>Crta. Crist&oacute;bal Col&oacute;n km 30.1, Tlacolula de Matamoros, Oaxaca</span>
                </div>
                <a href="tel:+529517250827" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 text-[#FE4F04] shrink-0" />
                  <span>(951) 725-0827</span>
                </a>
                <a href="https://wa.me/5219514618850" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors">
                  <span className="text-[#FE4F04]">📱</span>
                  <span>WhatsApp: (951) 461-8850</span>
                </a>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#FE4F04] shrink-0" />
                  <span>Delivery disponible hasta las 22:00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
            <p>&copy; 2026 Nito&apos;s Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, M&eacute;xico.</p>
            <p className="mt-1">Dise&ntilde;o y Software por <a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="text-[#FE4F04] hover:text-[#C73D00] font-semibold transition-colors">SynkData</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}