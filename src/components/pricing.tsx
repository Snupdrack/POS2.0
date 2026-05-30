'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  Star,
} from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$299',
    period: '/mes',
    description: 'Perfecto para comenzar',
    icon: Zap,
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Menú digital ilimitado', included: true },
      { text: 'Pedidos ilimitados', included: true },
      { text: 'Dominio propio', included: true },
      { text: 'Sin comisiones por orden', included: true },
      { text: 'WhatsApp Bot básico', included: true },
      { text: 'Hasta 50 productos', included: true },
      { text: '1 sucursal', included: true },
      { text: 'POS básico', included: false },
      { text: 'Dashboard analítico', included: false },
      { text: 'Programa de lealtad', included: false },
      { text: 'IA integrada', included: false },
    ],
    cta: 'Comenzar Gratis',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$599',
    period: '/mes',
    description: 'El más popular para restaurantes',
    icon: Sparkles,
    color: 'from-[#FE4F04] to-[#FF6B35]',
    features: [
      { text: 'Menú digital ilimitado', included: true },
      { text: 'Pedidos ilimitados', included: true },
      { text: 'Dominio propio', included: true },
      { text: 'Sin comisiones por orden', included: true },
      { text: 'WhatsApp Bot avanzado', included: true },
      { text: 'Productos ilimitados', included: true },
      { text: 'Hasta 3 sucursales', included: true },
      { text: 'POS completo', included: true },
      { text: 'Dashboard analítico', included: true },
      { text: 'Programa de lealtad', included: true },
      { text: 'IA integrada', included: false },
    ],
    cta: 'Prueba Gratis 14 días',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$999',
    period: '/mes',
    description: 'Para cadenas y franquicias',
    icon: Building2,
    color: 'from-purple-600 to-purple-800',
    features: [
      { text: 'Menú digital ilimitado', included: true },
      { text: 'Pedidos ilimitados', included: true },
      { text: 'Dominio propio', included: true },
      { text: 'Sin comisiones por orden', included: true },
      { text: 'WhatsApp Bot premium', included: true },
      { text: 'Productos ilimitados', included: true },
      { text: 'Sucursales ilimitadas', included: true },
      { text: 'POS completo', included: true },
      { text: 'Dashboard avanzado', included: true },
      { text: 'Programa de lealtad', included: true },
      { text: 'IA integrada', included: true },
    ],
    cta: 'Contactar Ventas',
    popular: false,
  },
];

const olaclickComparison = [
  { feature: 'Comisión por orden', nito: '0%', olaclick: '3-8%' },
  { feature: 'Límite de pedidos', nito: 'Ilimitados', olaclick: 'Limitados' },
  { feature: 'Dominio propio', nito: '✓', olaclick: '✗' },
  { feature: 'POS incluido', nito: '✓', olaclick: '✗' },
  { feature: 'Dashboard', nito: 'Completo', olaclick: 'Básico' },
  { feature: 'WhatsApp Bot', nito: '✓', olaclick: '✗' },
  { feature: 'IA', nito: '✓', olaclick: '✗' },
  { feature: 'Precio desde', nito: '$299/mes', olaclick: '$499/mes' },
];

export default function PricingSection() {
  const { setActiveSection } = useStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FE4F04] via-[#FF6B35] to-[#FF8C42] py-20">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4">
            <Star className="w-3 h-3 mr-1 fill-yellow-300 text-yellow-300" />
            70% más económico que OlaClick
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Precios Simples, Sin Sorpresas
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Sin comisiones por orden. Sin límites de pedidos. Sin letra chica.
            Solo planes que hacen sentido para tu restaurante.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? 'ring-2 ring-[#FE4F04] scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#FE4F04] text-white border-0 px-4 py-1 text-sm font-bold">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Más Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-center gap-2">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? '' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full font-bold rounded-xl py-6 ${
                    plan.popular
                      ? 'bg-[#FE4F04] hover:bg-[#C73D00] text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  onClick={() => setActiveSection('menu')}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* OlaClick Comparison */}
      <section className="bg-[#FFF6ED] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              ¿Por qué pagar más por menos?
            </h2>
            <p className="text-muted-foreground text-lg">
              Comparación directa: NitoPOS vs OlaClick
            </p>
          </div>

          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="grid grid-cols-3 bg-gray-900 text-white">
              <div className="p-4 font-semibold">Característica</div>
              <div className="p-4 font-bold text-center text-[#FE4F04]">NitoPOS</div>
              <div className="p-4 font-bold text-center text-gray-400">OlaClick</div>
            </div>
            {olaclickComparison.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 border-t ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="p-4 text-sm font-medium">{row.feature}</div>
                <div className="p-4 text-center font-bold text-[#FE4F04]">{row.nito}</div>
                <div className="p-4 text-center text-gray-500">{row.olaclick}</div>
              </div>
            ))}
          </Card>

          <div className="mt-8 bg-white rounded-2xl p-6 border-0 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="text-5xl">💰</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Ahorra hasta $2,400 al año</h3>
                <p className="text-muted-foreground text-sm">
                  Con NitoPOS no pagas comisiones por orden. Si procesas 500 órdenes/mes con ticket promedio de $200,
                  ahorras más de $2,400 mensuales en comisiones que OlaClick te cobraría.
                </p>
              </div>
              <Button
                className="bg-[#FE4F04] hover:bg-[#C73D00] text-white font-bold rounded-xl px-6"
                onClick={() => setActiveSection('landing')}
              >
                Comenzar Ahora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Trust */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Preguntas Frecuentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              { q: '¿Realmente no hay comisiones?', a: 'Correcto. Cobramos una suscripción fija mensual. No cobramos porcentaje por cada orden que recibes.' },
              { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, sin penalización. Puedes cancelar tu suscripción cuando quieras.' },
              { q: '¿Cuánto tiempo toma configurar?', a: 'Menos de 30 minutos. Sube tu menú, personaliza tu página y estás listo para vender.' },
              { q: '¿Incluye soporte técnico?', a: 'Sí, todos los planes incluyen soporte. Enterprise incluye soporte prioritario 24/7.' },
            ].map((faq) => (
              <Card key={faq.q} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
