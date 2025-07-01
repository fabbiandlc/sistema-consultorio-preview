"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Head from "next/head"
import ThemeToggle from "@/components/theme-toggle"

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
      <div className="min-h-screen flex items-center justify-center bg-background retro-font">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="relative w-full max-w-xs sm:max-w-sm p-4 sm:p-6 md:p-8 border border-border rounded shadow-lg retro-font" style={{ boxShadow: "none" }}>
          <h1 className="text-2xl mb-6 text-center tracking-wider retro-font text-foreground">
            Iniciar sesión
          </h1>
          <form className="space-y-4 tracking-widest retro-font" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="block mb-1 text-sm retro-font text-foreground">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent border border-border px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 retro-font"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block mb-1 text-sm retro-font text-foreground">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border border-border px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 retro-font"
                autoComplete="current-password"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center font-bold retro-font">{error}</div>}
            <Button
              type="submit"
              className="w-full py-2 border border-border text-foreground font-bold transition-colors duration-150 bg-transparent hover:bg-muted hover:text-primary retro-font"
              style={{ letterSpacing: 2 }}
              disabled={loading}
            >
              {loading ? "ENTRANDO..." : "LOGIN"}
            </Button>
          </form>
          <div className="mt-4 text-xs text-center text-muted-foreground retro-font">
            Las credenciales de ejemplo son:<br />
            <span className="font-bold">correo@hotmail.com</span> / <span className="font-bold">correo</span>
          </div>
        </div>
      </div>
    </>
  )
} 