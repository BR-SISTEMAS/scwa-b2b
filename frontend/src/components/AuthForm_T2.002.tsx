"use client"

import React, { useState } from "react"

type AuthFormProps = {
  role: "client" | "agent"
}

export default function AuthForm_T2_002({ role }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Se NEXT_PUBLIC_API_BASE_URL estiver definido, usamos /auth/login diretamente nesse host.
  // Caso contrário, usamos o proxy local do Next em /api/auth/login (configurado em next.config.ts).
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const loginUrl = apiBase ? `${apiBase}/auth/login` : "/api/auth/login"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
        credentials: "include",
      })
      if (!res.ok) {
        const msg = await safeText(res)
        throw new Error(msg || `Falha no login: ${res.status}`)
      }
      // Redireciona conforme role
      if (role === "agent") {
        window.location.href = "/agent/queue"
      } else {
        window.location.href = "/chat"
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-semibold">
        {role === "agent" ? "Login do Atendente" : "Login do Cliente"}
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">E-mail</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400"
            placeholder="seu@email.com"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Senha</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-3 text-xs text-gray-500">Destino da API: {apiBase ? `${apiBase}/auth` : "proxy local /api → backend"}</p>
    </div>
  )
}

async function safeText(res: Response) {
  try { return await res.text() } catch { return "" }
}

