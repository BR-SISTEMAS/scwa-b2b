import React from "react"
import Layout_T2_003 from "@/components/Layout_T2.003"

export default function DemoPage() {
  return (
    <Layout_T2_003 showHeader={true} showFooter={true}>
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Demonstração do Layout Global</h2>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-xl font-semibold mb-2">Card Exemplo</h3>
            <p className="text-muted-foreground">
              Este é um exemplo de card utilizando as variáveis de tema.
            </p>
          </div>
          
          <div className="rounded-lg border border-border bg-secondary p-6">
            <h3 className="text-xl font-semibold mb-2 text-secondary-foreground">
              Tema Secundário
            </h3>
            <p className="text-secondary-foreground/80">
              Demonstração de cores secundárias do tema.
            </p>
          </div>
          
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-6">
            <h3 className="text-xl font-semibold mb-2 text-primary">
              Destaque Primário
            </h3>
            <p className="text-foreground/80">
              Card com bordas e fundo em cores primárias.
            </p>
          </div>
        </div>
        
        <div className="mt-12 space-y-4">
          <h3 className="text-2xl font-semibold">Sistema de Tema White-label</h3>
          <p className="text-muted-foreground max-w-2xl">
            O sistema permite customização completa através de CSS variables, 
            facilitando a aplicação de temas personalizados para diferentes empresas.
            Suporta modo claro/escuro e pode ser alterado dinamicamente.
          </p>
          
          <div className="flex gap-4 mt-6">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
              Botão Primário
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90">
              Botão Secundário
            </button>
            <button className="px-4 py-2 border border-input rounded-md hover:bg-muted">
              Botão Outline
            </button>
          </div>
        </div>
      </div>
    </Layout_T2_003>
  )
}
