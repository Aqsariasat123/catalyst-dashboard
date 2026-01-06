import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔴 Seeding Redstone database...\n');

  // Clear existing data
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // ========================================
  // USERS - Redstone Team
  // ========================================
  const adminPassword = await bcrypt.hash('admin123', 12);
  const devPassword = await bcrypt.hash('dev123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@redstone.dev',
      password: adminPassword,
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'ADMIN',
      userType: 'INHOUSE',
    },
  });
  console.log('✓ Created Admin:', admin.email);

  const pm = await prisma.user.create({
    data: {
      email: 'sarah@redstone.dev',
      password: devPassword,
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'PROJECT_MANAGER',
      userType: 'INHOUSE',
    },
  });
  console.log('✓ Created PM:', pm.email);

  const john = await prisma.user.create({
    data: {
      email: 'john@redstone.dev',
      password: devPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'DEVELOPER',
      userType: 'INHOUSE',
      monthlySalary: 150000, // PKR 150,000/month = ~PKR 852/hr
    },
  });
  console.log('✓ Created Developer:', john.email);

  const emma = await prisma.user.create({
    data: {
      email: 'emma@redstone.dev',
      password: devPassword,
      firstName: 'Emma',
      lastName: 'Wilson',
      role: 'DEVELOPER',
      userType: 'INHOUSE',
      monthlySalary: 120000, // PKR 120,000/month = ~PKR 682/hr
    },
  });
  console.log('✓ Created Developer:', emma.email);

  const mike = await prisma.user.create({
    data: {
      email: 'mike@redstone.dev',
      password: devPassword,
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'DEVELOPER',
      userType: 'FREELANCER',
      monthlySalary: 180000, // PKR 180,000/month = ~PKR 1,023/hr
    },
  });
  console.log('✓ Created Freelancer:', mike.email);

  // ========================================
  // CLIENTS
  // ========================================
  console.log('\n📋 Creating clients...');

  const techVentures = await prisma.client.create({
    data: {
      name: 'TechVentures Inc',
      email: 'projects@techventures.io',
      company: 'TechVentures Inc',
      phone: '+1 (555) 123-4567',
      clientType: 'DIRECT',
      website: 'https://techventures.io',
      notes: 'Enterprise client - Fintech startup, Series B funded. Primary contact: David Kim (CTO)',
    },
  });
  console.log('✓ Created client:', techVentures.name);

  const globalRetail = await prisma.client.create({
    data: {
      name: 'Global Retail Solutions',
      email: 'tech@globalretail.com',
      company: 'Global Retail Solutions Ltd',
      phone: '+1 (555) 234-5678',
      clientType: 'DIRECT',
      website: 'https://globalretail.com',
      notes: 'Large enterprise - Retail chain with 500+ stores. Long-term maintenance contract.',
    },
  });
  console.log('✓ Created client:', globalRetail.name);

  const upworkStartup = await prisma.client.create({
    data: {
      name: 'HealthTrack Pro',
      email: 'founder@healthtrackpro.com',
      clientType: 'UPWORK',
      upworkProfile: 'https://upwork.com/clients/healthtrack',
      notes: 'Upwork client - Healthcare startup. Building MVP for fitness tracking app.',
    },
  });
  console.log('✓ Created client:', upworkStartup.name);

  const creativeAgency = await prisma.client.create({
    data: {
      name: 'Pixel Perfect Agency',
      email: 'hello@pixelperfect.design',
      company: 'Pixel Perfect Creative LLC',
      phone: '+1 (555) 345-6789',
      clientType: 'DIRECT',
      website: 'https://pixelperfect.design',
      notes: 'Design agency partner - Refers web development projects to us.',
    },
  });
  console.log('✓ Created client:', creativeAgency.name);

  const upworkEnterprise = await prisma.client.create({
    data: {
      name: 'DataSync Enterprise',
      email: 'procurement@datasync.io',
      clientType: 'UPWORK',
      upworkProfile: 'https://upwork.com/clients/datasync',
      notes: 'Upwork Enterprise client - Data integration platform.',
    },
  });
  console.log('✓ Created client:', upworkEnterprise.name);

  // ========================================
  // PROJECTS
  // ========================================
  console.log('\n🚀 Creating projects...');

  // TechVentures Projects
  const fintechDashboard = await prisma.project.create({
    data: {
      name: 'Fintech Analytics Dashboard',
      description: 'Real-time financial analytics dashboard with AI-powered insights, portfolio tracking, and automated reporting.',
      clientId: techVentures.id,
      status: 'IN_PROGRESS',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2025-03-31'),
      budget: 85000,
    },
  });
  console.log('✓ Created project:', fintechDashboard.name);

  const tradingAPI = await prisma.project.create({
    data: {
      name: 'Trading API Integration',
      description: 'RESTful API for connecting to multiple trading platforms with real-time data streaming.',
      clientId: techVentures.id,
      status: 'IN_PROGRESS',
      startDate: new Date('2024-11-15'),
      budget: 45000,
    },
  });
  console.log('✓ Created project:', tradingAPI.name);

  // Global Retail Projects
  const inventorySystem = await prisma.project.create({
    data: {
      name: 'Inventory Management System',
      description: 'Cloud-based inventory management with barcode scanning, automated reordering, and multi-warehouse support.',
      clientId: globalRetail.id,
      status: 'IN_PROGRESS',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-02-28'),
      budget: 120000,
    },
  });
  console.log('✓ Created project:', inventorySystem.name);

  const posIntegration = await prisma.project.create({
    data: {
      name: 'POS System Upgrade',
      description: 'Modernize point-of-sale system with mobile payments, loyalty program, and real-time sync.',
      clientId: globalRetail.id,
      status: 'PLANNING',
      startDate: new Date('2025-01-15'),
      budget: 75000,
    },
  });
  console.log('✓ Created project:', posIntegration.name);

  // HealthTrack Pro (Upwork)
  const healthApp = await prisma.project.create({
    data: {
      name: 'HealthTrack Mobile App',
      description: 'React Native fitness tracking app with workout plans, nutrition logging, and Apple Health integration.',
      clientId: upworkStartup.id,
      status: 'IN_PROGRESS',
      startDate: new Date('2024-12-01'),
      budget: 28000,
    },
  });
  console.log('✓ Created project:', healthApp.name);

  // Pixel Perfect Projects
  const portfolioSite = await prisma.project.create({
    data: {
      name: 'Agency Portfolio Website',
      description: 'Modern portfolio website with CMS, case studies showcase, and contact forms.',
      clientId: creativeAgency.id,
      status: 'COMPLETED',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-11-30'),
      budget: 18000,
    },
  });
  console.log('✓ Created project:', portfolioSite.name);

  const ecommerceSite = await prisma.project.create({
    data: {
      name: 'Boutique E-commerce Store',
      description: 'Shopify custom theme development with advanced filtering and AR product preview.',
      clientId: creativeAgency.id,
      status: 'IN_PROGRESS',
      startDate: new Date('2024-11-01'),
      budget: 22000,
    },
  });
  console.log('✓ Created project:', ecommerceSite.name);

  // DataSync Enterprise (Upwork)
  const dataConnector = await prisma.project.create({
    data: {
      name: 'Data Connector Suite',
      description: 'Custom data connectors for Salesforce, HubSpot, and Slack with real-time sync.',
      clientId: upworkEnterprise.id,
      status: 'IN_PROGRESS',
      startDate: new Date('2024-10-15'),
      budget: 55000,
    },
  });
  console.log('✓ Created project:', dataConnector.name);

  // ========================================
  // PROJECT MEMBERS
  // ========================================
  console.log('\n👥 Assigning team members...');

  // Fintech Dashboard team
  await prisma.projectMember.createMany({
    data: [
      { projectId: fintechDashboard.id, userId: john.id, role: 'Lead Developer' },
      { projectId: fintechDashboard.id, userId: emma.id, role: 'Frontend Developer' },
      { projectId: fintechDashboard.id, userId: pm.id, role: 'Project Manager' },
    ],
  });

  // Trading API team
  await prisma.projectMember.createMany({
    data: [
      { projectId: tradingAPI.id, userId: john.id, role: 'Backend Developer' },
      { projectId: tradingAPI.id, userId: mike.id, role: 'API Specialist' },
    ],
  });

  // Inventory System team
  await prisma.projectMember.createMany({
    data: [
      { projectId: inventorySystem.id, userId: emma.id, role: 'Lead Developer' },
      { projectId: inventorySystem.id, userId: john.id, role: 'Backend Developer' },
      { projectId: inventorySystem.id, userId: pm.id, role: 'Project Manager' },
    ],
  });

  // HealthTrack App team
  await prisma.projectMember.createMany({
    data: [
      { projectId: healthApp.id, userId: mike.id, role: 'Mobile Developer' },
      { projectId: healthApp.id, userId: emma.id, role: 'UI Developer' },
    ],
  });

  // E-commerce Site team
  await prisma.projectMember.createMany({
    data: [
      { projectId: ecommerceSite.id, userId: emma.id, role: 'Frontend Developer' },
    ],
  });

  // Data Connector team
  await prisma.projectMember.createMany({
    data: [
      { projectId: dataConnector.id, userId: john.id, role: 'Lead Developer' },
      { projectId: dataConnector.id, userId: mike.id, role: 'Integration Specialist' },
    ],
  });

  console.log('✓ Team members assigned');

  // ========================================
  // TASKS
  // ========================================
  console.log('\n📝 Creating tasks...');

  // Fintech Dashboard Tasks
  const fintechTasks = await prisma.task.createMany({
    data: [
      {
        title: 'Setup project architecture',
        description: 'Initialize Next.js 14 with TypeScript, Tailwind CSS, and Prisma. Set up CI/CD pipeline.',
        projectId: fintechDashboard.id,
        assigneeId: john.id,
        createdById: pm.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 8,
      },
      {
        title: 'Design system implementation',
        description: 'Create reusable component library with Storybook documentation.',
        projectId: fintechDashboard.id,
        assigneeId: emma.id,
        createdById: pm.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 16,
      },
      {
        title: 'User authentication system',
        description: 'Implement OAuth 2.0 with Google and Microsoft, plus magic link authentication.',
        projectId: fintechDashboard.id,
        assigneeId: john.id,
        createdById: pm.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 12,
      },
      {
        title: 'Portfolio overview dashboard',
        description: 'Build main dashboard with portfolio value, asset allocation charts, and performance metrics.',
        projectId: fintechDashboard.id,
        assigneeId: emma.id,
        createdById: pm.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 24,
      },
      {
        title: 'Real-time data streaming',
        description: 'Implement WebSocket connections for live price updates and notifications.',
        projectId: fintechDashboard.id,
        assigneeId: john.id,
        createdById: pm.id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        estimatedHours: 20,
      },
      {
        title: 'AI-powered insights module',
        description: 'Integrate OpenAI API for portfolio analysis and investment recommendations.',
        projectId: fintechDashboard.id,
        assigneeId: john.id,
        createdById: pm.id,
        status: 'TODO',
        priority: 'MEDIUM',
        estimatedHours: 32,
      },
      {
        title: 'Export & reporting system',
        description: 'PDF report generation with customizable templates and scheduled email delivery.',
        projectId: fintechDashboard.id,
        assigneeId: emma.id,
        createdById: pm.id,
        status: 'TODO',
        priority: 'LOW',
        estimatedHours: 16,
      },
    ],
  });

  // Inventory System Tasks
  const inventoryTasks = await prisma.task.createMany({
    data: [
      {
        title: 'Database schema design',
        description: 'Design PostgreSQL schema for products, warehouses, stock levels, and transactions.',
        projectId: inventorySystem.id,
        assigneeId: emma.id,
        createdById: pm.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 8,
      },
      {
        title: 'Barcode scanning API',
        description: 'Build REST API for barcode scanning with product lookup and stock updates.',
        projectId: inventorySystem.id,
        assigneeId: john.id,
        createdById: pm.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 12,
      },
      {
        title: 'Multi-warehouse dashboard',
        description: 'Create dashboard showing stock levels across all warehouse locations.',
        projectId: inventorySystem.id,
        assigneeId: emma.id,
        createdById: pm.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 20,
      },
      {
        title: 'Automated reorder system',
        description: 'Implement intelligent reorder points with supplier integration.',
        projectId: inventorySystem.id,
        assigneeId: john.id,
        createdById: pm.id,
        status: 'IN_REVIEW',
        priority: 'MEDIUM',
        estimatedHours: 24,
      },
      {
        title: 'Stock transfer workflow',
        description: 'Build warehouse-to-warehouse transfer system with approval workflow.',
        projectId: inventorySystem.id,
        assigneeId: emma.id,
        createdById: pm.id,
        status: 'TODO',
        priority: 'MEDIUM',
        estimatedHours: 16,
      },
    ],
  });

  // HealthTrack App Tasks
  const healthTasks = await prisma.task.createMany({
    data: [
      {
        title: 'React Native setup',
        description: 'Initialize Expo project with navigation, state management, and theming.',
        projectId: healthApp.id,
        assigneeId: mike.id,
        createdById: admin.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 6,
      },
      {
        title: 'Workout tracking screen',
        description: 'Build workout logging UI with exercise library and custom workout builder.',
        projectId: healthApp.id,
        assigneeId: mike.id,
        createdById: admin.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 20,
      },
      {
        title: 'Apple Health integration',
        description: 'Sync steps, heart rate, and calories with Apple Health.',
        projectId: healthApp.id,
        assigneeId: mike.id,
        createdById: admin.id,
        status: 'TODO',
        priority: 'HIGH',
        estimatedHours: 12,
      },
      {
        title: 'Nutrition logging',
        description: 'Food diary with barcode scanning and nutritional database.',
        projectId: healthApp.id,
        assigneeId: emma.id,
        createdById: admin.id,
        status: 'TODO',
        priority: 'MEDIUM',
        estimatedHours: 18,
      },
    ],
  });

  // Trading API Tasks
  const tradingTasks = await prisma.task.createMany({
    data: [
      {
        title: 'API gateway setup',
        description: 'Configure Kong API gateway with rate limiting and authentication.',
        projectId: tradingAPI.id,
        assigneeId: john.id,
        createdById: admin.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 8,
      },
      {
        title: 'Binance connector',
        description: 'Build connector for Binance API with WebSocket streaming.',
        projectId: tradingAPI.id,
        assigneeId: mike.id,
        createdById: admin.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 16,
      },
      {
        title: 'Coinbase Pro connector',
        description: 'Implement Coinbase Pro trading and market data integration.',
        projectId: tradingAPI.id,
        assigneeId: mike.id,
        createdById: admin.id,
        status: 'TODO',
        priority: 'MEDIUM',
        estimatedHours: 14,
      },
    ],
  });

  // E-commerce Tasks
  const ecommerceTasks = await prisma.task.createMany({
    data: [
      {
        title: 'Custom Shopify theme',
        description: 'Develop custom Liquid theme with mobile-first design.',
        projectId: ecommerceSite.id,
        assigneeId: emma.id,
        createdById: admin.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 32,
      },
      {
        title: 'Advanced product filtering',
        description: 'Build faceted search with size, color, and price filters.',
        projectId: ecommerceSite.id,
        assigneeId: emma.id,
        createdById: admin.id,
        status: 'TODO',
        priority: 'MEDIUM',
        estimatedHours: 12,
      },
    ],
  });

  // Data Connector Tasks
  const dataConnectorTasks = await prisma.task.createMany({
    data: [
      {
        title: 'Salesforce connector',
        description: 'OAuth 2.0 authentication and bidirectional sync for contacts and deals.',
        projectId: dataConnector.id,
        assigneeId: john.id,
        createdById: admin.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        estimatedHours: 20,
      },
      {
        title: 'HubSpot connector',
        description: 'Connect HubSpot CRM with contact and deal synchronization.',
        projectId: dataConnector.id,
        assigneeId: john.id,
        createdById: admin.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedHours: 18,
      },
      {
        title: 'Slack notifications',
        description: 'Real-time Slack notifications for sync events and errors.',
        projectId: dataConnector.id,
        assigneeId: mike.id,
        createdById: admin.id,
        status: 'TODO',
        priority: 'LOW',
        estimatedHours: 8,
      },
    ],
  });

  console.log('✓ Tasks created');

  // ========================================
  // TIME ENTRIES
  // ========================================
  console.log('\n⏱️  Creating time entries...');

  // Get all tasks for time entries
  const allTasks = await prisma.task.findMany();
  const completedTasks = allTasks.filter(t => t.status === 'COMPLETED');
  const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS');

  const today = new Date();
  const timeEntries = [];

  // Generate time entries for the past 14 days
  for (let daysAgo = 0; daysAgo < 14; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // John's entries
    if (daysAgo < 7) {
      const task = inProgressTasks.find(t => t.assigneeId === john.id) || completedTasks.find(t => t.assigneeId === john.id);
      if (task) {
        const startHour = 9 + Math.floor(Math.random() * 2);
        const duration = 3 + Math.random() * 2;
        timeEntries.push({
          taskId: task.id,
          userId: john.id,
          startTime: new Date(date.setHours(startHour, 0, 0)),
          endTime: new Date(date.setHours(startHour + duration, 0, 0)),
          duration: Math.round(duration * 3600),
          notes: getRandomNote(task.title),
        });

        // Afternoon session
        const afternoonStart = 14 + Math.floor(Math.random() * 2);
        const afternoonDuration = 2 + Math.random() * 2;
        timeEntries.push({
          taskId: task.id,
          userId: john.id,
          startTime: new Date(date.setHours(afternoonStart, 0, 0)),
          endTime: new Date(date.setHours(afternoonStart + afternoonDuration, 0, 0)),
          duration: Math.round(afternoonDuration * 3600),
          notes: getRandomNote(task.title),
        });
      }
    }

    // Emma's entries
    const emmaTask = inProgressTasks.find(t => t.assigneeId === emma.id) || completedTasks.find(t => t.assigneeId === emma.id);
    if (emmaTask) {
      const startHour = 9 + Math.floor(Math.random() * 2);
      const duration = 4 + Math.random() * 3;
      timeEntries.push({
        taskId: emmaTask.id,
        userId: emma.id,
        startTime: new Date(date.setHours(startHour, 0, 0)),
        endTime: new Date(date.setHours(startHour + duration, 0, 0)),
        duration: Math.round(duration * 3600),
        notes: getRandomNote(emmaTask.title),
      });
    }

    // Mike's entries (fewer, as freelancer)
    if (daysAgo % 2 === 0) {
      const mikeTask = inProgressTasks.find(t => t.assigneeId === mike.id) || completedTasks.find(t => t.assigneeId === mike.id);
      if (mikeTask) {
        const startHour = 10 + Math.floor(Math.random() * 3);
        const duration = 3 + Math.random() * 4;
        timeEntries.push({
          taskId: mikeTask.id,
          userId: mike.id,
          startTime: new Date(date.setHours(startHour, 0, 0)),
          endTime: new Date(date.setHours(startHour + duration, 0, 0)),
          duration: Math.round(duration * 3600),
          notes: getRandomNote(mikeTask.title),
        });
      }
    }
  }

  // Add some specific detailed entries for today and yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Today's active work
  const portfolioTask = allTasks.find(t => t.title.includes('Portfolio overview'));
  if (portfolioTask) {
    timeEntries.push({
      taskId: portfolioTask.id,
      userId: emma.id,
      startTime: new Date(today.setHours(9, 15, 0)),
      endTime: new Date(today.setHours(12, 45, 0)),
      duration: Math.round(3.5 * 3600),
      notes: 'Implemented chart components using Recharts. Added responsive design for mobile views.',
    });
  }

  const streamingTask = allTasks.find(t => t.title.includes('Real-time data'));
  if (streamingTask) {
    timeEntries.push({
      taskId: streamingTask.id,
      userId: john.id,
      startTime: new Date(today.setHours(9, 0, 0)),
      endTime: new Date(today.setHours(11, 30, 0)),
      duration: Math.round(2.5 * 3600),
      notes: 'Set up WebSocket server with Socket.io. Implemented reconnection logic.',
    });
    timeEntries.push({
      taskId: streamingTask.id,
      userId: john.id,
      startTime: new Date(today.setHours(13, 30, 0)),
      endTime: new Date(today.setHours(17, 0, 0)),
      duration: Math.round(3.5 * 3600),
      notes: 'Added price subscription channels and broadcast optimization.',
    });
  }

  // Create all time entries
  for (const entry of timeEntries) {
    await prisma.timeEntry.create({ data: entry });
  }

  console.log(`✓ Created ${timeEntries.length} time entries`);

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '═'.repeat(50));
  console.log('🔴 REDSTONE DATABASE SEEDED SUCCESSFULLY');
  console.log('═'.repeat(50));

  console.log('\n📊 Summary:');
  console.log(`   • ${await prisma.user.count()} users`);
  console.log(`   • ${await prisma.client.count()} clients`);
  console.log(`   • ${await prisma.project.count()} projects`);
  console.log(`   • ${await prisma.task.count()} tasks`);
  console.log(`   • ${await prisma.timeEntry.count()} time entries`);

  console.log('\n🔑 Demo Credentials:');
  console.log('   ┌─────────────────────────────────────────┐');
  console.log('   │ Admin:     admin@redstone.dev / admin123│');
  console.log('   │ Developer: john@redstone.dev / dev123   │');
  console.log('   │ Developer: emma@redstone.dev / dev123   │');
  console.log('   │ Freelancer: mike@redstone.dev / dev123  │');
  console.log('   └─────────────────────────────────────────┘');
  console.log('');
}

function getRandomNote(taskTitle: string): string {
  const notes = [
    `Working on ${taskTitle.toLowerCase()}`,
    'Code review and bug fixes',
    'Implementing new features',
    'Testing and documentation',
    'Refactoring and optimization',
    'Team sync and planning',
    'Research and prototyping',
    'API integration work',
    'UI/UX improvements',
    'Performance optimization',
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
