"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Head from "next/head"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/")
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.replace("/")
    }
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        body::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0 2px, transparent 2px 4px);
          mix-blend-mode: overlay;
        }
        @keyframes flicker {
          0%,19%,22%,25%,53%,57%,100% { opacity: 1; }
          20%,24%,55% { opacity: 0.4; }
        }
        .flicker { animation: flicker 4s infinite linear; }
        .retro-font { font-family: 'VT323', monospace !important; }
      `}</style>
      <div className="min-h-screen flex items-center justify-center bg-[#000] retro-font">
        <div className="relative w-full max-w-sm p-8 border border-[#ccc] rounded shadow-lg" style={{ boxShadow: "none" }}>
          <h1 className="text-[#eee] text-2xl mb-6 text-center tracking-wider">
            Iniciar sesión
          </h1>
          <form className="space-y-4 tracking-widest" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="block text-[#eee] mb-1 text-sm">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent border border-[#ccc] px-3 py-2 text-[#eee] placeholder-[#aaa] focus:outline-none focus:ring-0 retro-font"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-[#eee] mb-1 text-sm">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border border-[#ccc] px-3 py-2 text-[#eee] placeholder-[#aaa] focus:outline-none focus:ring-0 retro-font"
                autoComplete="current-password"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center font-bold retro-font">{error}</div>}
            <Button
              type="submit"
              className="w-full py-2 border border-[#ccc] text-[#eee] font-bold transition-colors duration-150 bg-transparent hover:bg-[#eee] hover:text-[#091013] retro-font"
              style={{ letterSpacing: 2 }}
              disabled={loading}
            >
              {loading ? "ENTRANDO..." : "LOGIN"}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
} 