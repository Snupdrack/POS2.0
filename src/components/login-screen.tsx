'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FOOTER = `© 2026 Nito's Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, México. Diseño y Software por SynkData`

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales incorrectas')
        setLoading(false)
        return
      }

      // Fetch session to get role
      const res = await fetch('/api/auth/session')
      const session = await res.json()

      if (session?.user) {
        const role = (session.user as any).role
        if (role === 'ADMIN') router.push('/admin')
        else if (role === 'CAJA') router.push('/pos')
        else if (role === 'KITCHEN') router.push('/kitchen')
        else router.push('/pos')
      }
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-nunito">
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#E31E24] flex items-center justify-center shadow-lg mb-4">
              <span className="text-4xl">🍕</span>
            </div>
            <h1 className="font-bebas text-4xl text-[#111111]">NITO&apos;S PIZZA</h1>
            <p className="text-[#E31E24] font-bebas text-lg tracking-wider">SISTEMA POS 2.0</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="font-bebas text-2xl text-center mb-6">INICIAR SESIÓN</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E31E24] hover:bg-[#c4191f] text-white font-bold py-3 rounded-xl"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </form>

            {/* Quick access hints */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">Credenciales de prueba:</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>🔑 Admin: admin@nitopos.com / admin123</p>
                <p>🔑 Caja: caja@nitopos.com / caja123</p>
                <p>🔑 Cocina: cocina@nitopos.com / cocina123</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="py-4 px-6 text-center border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">synkdata.online</a>)
        </p>
      </footer>
    </div>
  )
}
