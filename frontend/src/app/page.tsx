"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Users, BarChart3, Shield, Zap, HeadphonesIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">SCWA</h1>
                <p className="text-xs text-slate-600">Support Chat Web Assistant</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost">Recursos</Button>
              <Button variant="ghost">Planos</Button>
              <Button variant="ghost">Sobre</Button>
              <Button variant="default">Entrar</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            <Zap className="h-3 w-3 mr-1" />
            Beta - Sprint S2
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Chat de Suporte B2B
            <span className="text-blue-600"> Multi-tenant</span>
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Sistema completo de atendimento ao cliente com filas inteligentes,
            transferências entre agentes, histórico exportável e conformidade LGPD.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <MessageCircle className="h-5 w-5" />
              Começar Agora
            </Button>
            <Button size="lg" variant="outline">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Recursos Principais</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Multi-tenant</CardTitle>
              <CardDescription>
                Gerencie múltiplas empresas com isolamento completo de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Login segregado por empresa</li>
                <li>• Dashboards personalizados</li>
                <li>• Gestão independente</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <HeadphonesIcon className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Fila Inteligente</CardTitle>
              <CardDescription>
                Sistema de filas com distribuição automática e priorização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Atribuição automática</li>
                <li>• Transferência entre agentes</li>
                <li>• Priorização por SLA</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Métricas em Tempo Real</CardTitle>
              <CardDescription>
                Dashboard gerencial com métricas e KPIs de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Tempo médio de resposta</li>
                <li>• Taxa de resolução</li>
                <li>• Satisfação do cliente</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>Conformidade LGPD</CardTitle>
              <CardDescription>
                Total conformidade com a legislação brasileira de proteção de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Auditoria completa</li>
                <li>• Retenção configurável</li>
                <li>• Direito ao esquecimento</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Chat em Tempo Real</CardTitle>
              <CardDescription>
                Comunicação instantânea com WebSocket e notificações push
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Mensagens instantâneas</li>
                <li>• Indicador de digitação</li>
                <li>• Status online/offline</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-600 mb-2" />
              <CardTitle>Exportação de Dados</CardTitle>
              <CardDescription>
                Exporte conversas em múltiplos formatos para integração
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Exportação PDF</li>
                <li>• Integração XML/ERP</li>
                <li>• API REST completa</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Status Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Status do Desenvolvimento</CardTitle>
              <CardDescription className="text-center">
                Acompanhe o progresso do projeto SCWA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-green-100 text-green-700">S0</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Sprint 0 - Infrastructure</p>
                      <p className="text-sm text-slate-600">Repository init & CI/CD</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Completo</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-green-100 text-green-700">S1</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Sprint 1 - Backend</p>
                      <p className="text-sm text-slate-600">NestJS, Auth, CRUD, Audit</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Completo</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-700">S2</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Sprint 2 - Frontend</p>
                      <p className="text-sm text-slate-600">Next.js, shadcn/ui, Auth UI</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Em Progresso</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-slate-100 text-slate-700">S3</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Sprint 3 - Chat Core</p>
                      <p className="text-sm text-slate-600">WebSocket, Queue, Messages</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Pendente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 BR SISTEMAS - SCWA Project</p>
          <p className="text-xs text-slate-400 mt-2">Task T2.001 - Frontend Foundation with shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}
