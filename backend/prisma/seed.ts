import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
      cnpj: '12.345.678/0001-90',
      contactEmail: 'contact@test.com'
    }
  });

  console.log(`✅ Created company: ${company.name}`);

  // Create test client user
  const hashedClientPassword = await bcrypt.hash('client123', 10);
  const clientUser = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'client@test.com',
      name: 'João Silva',
      passwordHash: hashedClientPassword,
      role: 'user',
      profilePhotoUrl: null
    }
  });

  console.log(`✅ Created client user: ${clientUser.email} (password: client123)`);

  // Create test agent user
  const hashedAgentPassword = await bcrypt.hash('agent123', 10);
  const agentUser = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'agent@test.com',
      name: 'Maria Santos',
      passwordHash: hashedAgentPassword,
      role: 'agent',
      profilePhotoUrl: null
    }
  });

  console.log(`✅ Created agent user: ${agentUser.email} (password: agent123)`);

  // Create test conversation
  const conversation = await prisma.conversation.create({
    data: {
      companyId: company.id,
      clientUserId: clientUser.id,
      agentUserId: agentUser.id,
      status: 'assigned',
      queuePosition: null,
      metadata: {
        source: 'website',
        page: '/contact'
      }
    }
  });

  console.log(`✅ Created test conversation: ${conversation.id}`);

  // Create test messages
  const messages = await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        contentJson: {
          type: 'text',
          text: 'Olá, preciso de ajuda com meu pedido'
        },
        contentText: 'Olá, preciso de ajuda com meu pedido',
        senderType: 'client',
        senderId: clientUser.id
      },
      {
        conversationId: conversation.id,
        contentJson: {
          type: 'text',
          text: 'Olá João! Claro, posso ajudar. Qual é o número do seu pedido?'
        },
        contentText: 'Olá João! Claro, posso ajudar. Qual é o número do seu pedido?',
        senderType: 'agent',
        senderId: agentUser.id
      },
      {
        conversationId: conversation.id,
        contentJson: {
          type: 'text',
          text: 'É o pedido #12345'
        },
        contentText: 'É o pedido #12345',
        senderType: 'client',
        senderId: clientUser.id
      }
    ]
  });

  console.log(`✅ Created ${messages.count} test messages`);

  console.log('\n📝 Test Credentials:');
  console.log('==================');
  console.log('Client Login:');
  console.log('  Email: client@test.com');
  console.log('  Password: client123');
  console.log('');
  console.log('Agent Login:');
  console.log('  Email: agent@test.com');
  console.log('  Password: agent123');
  console.log('==================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
