import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed para testes E2E - Task T3.005
 * Cria dados de teste no banco para validação
 */

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de testes...');

  // Limpar dados existentes
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Criar empresa de teste
  const testCompany = await prisma.company.create({
    data: {
      id: 'test-company-001',
      name: 'Empresa Teste E2E',
      cnpj: '12.345.678/0001-00',
      contactEmail: 'contato@teste.com',
    },
  });

  console.log('✅ Empresa criada:', testCompany.name);

  // Hash de senha padrão para testes
  const defaultPassword = await bcrypt.hash('senha123', 10);

  // Criar usuários de teste
  const clientUser = await prisma.user.create({
    data: {
      id: 'test-client-001',
      email: 'cliente@teste.com',
      passwordHash: defaultPassword,
      name: 'Cliente Teste',
      role: 'user',
      companyId: testCompany.id,
    },
  });

  const agentUser = await prisma.user.create({
    data: {
      id: 'test-agent-001',
      email: 'atendente@teste.com',
      passwordHash: defaultPassword,
      name: 'Atendente Teste',
      role: 'agent',
      companyId: testCompany.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      id: 'test-manager-001',
      email: 'gerente@teste.com',
      passwordHash: defaultPassword,
      name: 'Gerente Teste',
      role: 'manager',
      companyId: testCompany.id,
    },
  });

  console.log('✅ Usuários criados:');
  console.log('  - Cliente:', clientUser.email);
  console.log('  - Atendente:', agentUser.email);
  console.log('  - Gerente:', managerUser.email);

  // Criar algumas conversas de teste
  const openConversation = await prisma.conversation.create({
    data: {
      id: 'test-conv-001',
      companyId: testCompany.id,
      clientUserId: clientUser.id,
      status: 'waiting',
      queuePosition: 1,
      metadata: {
        source: 'web',
        userAgent: 'Playwright Test',
      },
    },
  });

  const assignedConversation = await prisma.conversation.create({
    data: {
      id: 'test-conv-002',
      companyId: testCompany.id,
      clientUserId: clientUser.id,
      agentUserId: agentUser.id,
      status: 'assigned',
      queuePosition: null,
      metadata: {
        source: 'web',
        assignedAt: new Date().toISOString(),
      },
    },
  });

  console.log('✅ Conversas criadas:');
  console.log('  - Em espera:', openConversation.id);
  console.log('  - Atribuída:', assignedConversation.id);

  // Criar algumas mensagens de teste
  await prisma.message.createMany({
    data: [
      {
        conversationId: assignedConversation.id,
        senderId: clientUser.id,
        senderType: 'client',
        contentText: 'Olá, preciso de ajuda com meu pedido',
        contentJson: {
          type: 'text',
          text: 'Olá, preciso de ajuda com meu pedido',
        },
      },
      {
        conversationId: assignedConversation.id,
        senderId: agentUser.id,
        senderType: 'agent',
        contentText: 'Olá! Claro, posso ajudá-lo. Qual o número do seu pedido?',
        contentJson: {
          type: 'text',
          text: 'Olá! Claro, posso ajudá-lo. Qual o número do seu pedido?',
        },
      },
      {
        conversationId: assignedConversation.id,
        senderId: clientUser.id,
        senderType: 'client',
        contentText: 'É o pedido #12345',
        contentJson: {
          type: 'text',
          text: 'É o pedido #12345',
        },
      },
    ],
  });

  console.log('✅ Mensagens de teste criadas');
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais de teste:');
  console.log('  Cliente: cliente@teste.com / senha123');
  console.log('  Atendente: atendente@teste.com / senha123');
  console.log('  Gerente: gerente@teste.com / senha123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
