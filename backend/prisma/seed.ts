import { PrismaClient, UserRole, UserType, ClientType, ProjectStatus, TaskStatus, TaskPriority, MilestoneStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@taskdashboard.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      userType: UserType.INHOUSE,
      monthlySalary: 150000,
    },
  });
  console.log('Created admin user:', admin.email);

  const projectManager = await prisma.user.create({
    data: {
      email: 'pm@taskdashboard.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.PROJECT_MANAGER,
      userType: UserType.INHOUSE,
      monthlySalary: 120000,
    },
  });
  console.log('Created project manager:', projectManager.email);

  const operationalManager = await prisma.user.create({
    data: {
      email: 'operations@taskdashboard.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Chen',
      role: UserRole.OPERATIONAL_MANAGER,
      userType: UserType.INHOUSE,
      monthlySalary: 110000,
    },
  });
  console.log('Created operational manager:', operationalManager.email);

  const bidder = await prisma.user.create({
    data: {
      email: 'bidder@taskdashboard.com',
      password: hashedPassword,
      firstName: 'Emily',
      lastName: 'Davis',
      role: UserRole.BIDDER,
      userType: UserType.INHOUSE,
      monthlySalary: 90000,
    },
  });
  console.log('Created bidder:', bidder.email);

  const webDeveloper = await prisma.user.create({
    data: {
      email: 'webdev@taskdashboard.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.WEB_DEVELOPER,
      userType: UserType.INHOUSE,
      monthlySalary: 100000,
    },
  });
  console.log('Created web developer:', webDeveloper.email);

  const appDeveloper = await prisma.user.create({
    data: {
      email: 'appdev@taskdashboard.com',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Wilson',
      role: UserRole.APP_DEVELOPER,
      userType: UserType.INHOUSE,
      monthlySalary: 100000,
    },
  });
  console.log('Created app developer:', appDeveloper.email);

  const designer = await prisma.user.create({
    data: {
      email: 'designer@taskdashboard.com',
      password: hashedPassword,
      firstName: 'Lisa',
      lastName: 'Brown',
      role: UserRole.DESIGNER,
      userType: UserType.FREELANCER,
      monthlySalary: 80000,
    },
  });
  console.log('Created designer:', designer.email);

  const qc = await prisma.user.create({
    data: {
      email: 'qc@taskdashboard.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Lee',
      role: UserRole.QC,
      userType: UserType.INHOUSE,
      monthlySalary: 70000,
    },
  });
  console.log('Created QC:', qc.email);

  // Create Clients
  const upworkClient = await prisma.client.create({
    data: {
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      company: 'TechCorp Inc.',
      clientType: ClientType.UPWORK,
      upworkProfile: 'https://upwork.com/clients/techcorp',
      notes: 'Long-term client, prefers agile methodology',
    },
  });
  console.log('Created client:', upworkClient.name);

  const directClient = await prisma.client.create({
    data: {
      name: 'StartupXYZ',
      email: 'hello@startupxyz.com',
      phone: '+1-555-0123',
      company: 'StartupXYZ LLC',
      clientType: ClientType.DIRECT,
      website: 'https://startupxyz.com',
      notes: 'Fast-growing startup, needs quick turnaround',
    },
  });
  console.log('Created client:', directClient.name);

  const freelancerClient = await prisma.client.create({
    data: {
      name: 'Digital Agency Pro',
      email: 'projects@digitalagency.com',
      company: 'Digital Agency Pro',
      clientType: ClientType.FREELANCER,
      notes: 'Design-focused projects',
    },
  });
  console.log('Created client:', freelancerClient.name);

  // Create Projects
  const ecommerceProject = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      description: 'Full-stack e-commerce platform with payment integration',
      clientId: upworkClient.id,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      budget: 25000,
      currency: 'USD',
      platformFeePercent: 10,
      workingBudget: 22500,
      exchangeRate: 280,
    },
  });
  console.log('Created project:', ecommerceProject.name);

  const mobileAppProject = await prisma.project.create({
    data: {
      name: 'Mobile Banking App',
      description: 'iOS and Android banking application',
      clientId: directClient.id,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-31'),
      budget: 50000,
      currency: 'USD',
      platformFeePercent: 0,
      workingBudget: 50000,
      exchangeRate: 280,
    },
  });
  console.log('Created project:', mobileAppProject.name);

  const designProject = await prisma.project.create({
    data: {
      name: 'Brand Identity Redesign',
      description: 'Complete brand identity and design system',
      clientId: freelancerClient.id,
      status: ProjectStatus.PLANNING,
      startDate: new Date('2024-03-01'),
      budget: 8000,
      currency: 'USD',
      platformFeePercent: 5,
      workingBudget: 7600,
    },
  });
  console.log('Created project:', designProject.name);

  // Add Project Members
  await prisma.projectMember.createMany({
    data: [
      { projectId: ecommerceProject.id, userId: projectManager.id, role: 'project_manager' },
      { projectId: ecommerceProject.id, userId: webDeveloper.id, role: 'developer' },
      { projectId: ecommerceProject.id, userId: designer.id, role: 'designer' },
      { projectId: ecommerceProject.id, userId: qc.id, role: 'qc' },
      { projectId: mobileAppProject.id, userId: projectManager.id, role: 'project_manager' },
      { projectId: mobileAppProject.id, userId: appDeveloper.id, role: 'developer' },
      { projectId: mobileAppProject.id, userId: qc.id, role: 'qc' },
      { projectId: designProject.id, userId: designer.id, role: 'designer' },
    ],
  });
  console.log('Added project members');

  // Create Milestones for E-Commerce Project
  const milestone1 = await prisma.milestone.create({
    data: {
      projectId: ecommerceProject.id,
      title: 'Phase 1: Core Setup',
      description: 'Project setup, authentication, and basic structure',
      amount: 5000,
      status: MilestoneStatus.COMPLETED,
      dueDate: new Date('2024-02-15'),
      releasedAt: new Date('2024-02-10'),
    },
  });

  const milestone2 = await prisma.milestone.create({
    data: {
      projectId: ecommerceProject.id,
      title: 'Phase 2: Product Catalog',
      description: 'Product management, categories, and search',
      amount: 8000,
      status: MilestoneStatus.IN_PROGRESS,
      dueDate: new Date('2024-04-01'),
    },
  });

  const milestone3 = await prisma.milestone.create({
    data: {
      projectId: ecommerceProject.id,
      title: 'Phase 3: Checkout & Payment',
      description: 'Shopping cart, checkout flow, and payment integration',
      amount: 12000,
      status: MilestoneStatus.NOT_STARTED,
      dueDate: new Date('2024-06-30'),
    },
  });
  console.log('Created milestones for E-Commerce project');

  // Create Milestones for Mobile App Project
  const mobileMilestone1 = await prisma.milestone.create({
    data: {
      projectId: mobileAppProject.id,
      title: 'Sprint 1: Authentication',
      description: 'User registration, login, and biometric auth',
      amount: 10000,
      status: MilestoneStatus.COMPLETED,
      dueDate: new Date('2024-03-01'),
      releasedAt: new Date('2024-02-28'),
    },
  });

  const mobileMilestone2 = await prisma.milestone.create({
    data: {
      projectId: mobileAppProject.id,
      title: 'Sprint 2: Account Dashboard',
      description: 'Account overview, transactions, and balance',
      amount: 15000,
      status: MilestoneStatus.IN_PROGRESS,
      dueDate: new Date('2024-05-01'),
    },
  });
  console.log('Created milestones for Mobile App project');

  // Create Tasks for E-Commerce Project
  const tasks = await prisma.task.createMany({
    data: [
      // Phase 1 tasks (completed)
      {
        title: 'Project Setup & Configuration',
        description: 'Initialize project with React, Node.js, and database setup',
        projectId: ecommerceProject.id,
        milestoneId: milestone1.id,
        assigneeId: webDeveloper.id,
        createdById: projectManager.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        estimatedHours: 8,
        completedAt: new Date('2024-01-20'),
      },
      {
        title: 'User Authentication System',
        description: 'Implement JWT-based authentication with social login',
        projectId: ecommerceProject.id,
        milestoneId: milestone1.id,
        assigneeId: webDeveloper.id,
        createdById: projectManager.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        estimatedHours: 16,
        completedAt: new Date('2024-02-05'),
      },
      // Phase 2 tasks (in progress)
      {
        title: 'Product Listing Page',
        description: 'Create responsive product grid with filtering and sorting',
        projectId: ecommerceProject.id,
        milestoneId: milestone2.id,
        assigneeId: webDeveloper.id,
        createdById: projectManager.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        estimatedHours: 20,
      },
      {
        title: 'Product Detail Page Design',
        description: 'Design product detail page with image gallery',
        projectId: ecommerceProject.id,
        milestoneId: milestone2.id,
        assigneeId: designer.id,
        createdById: projectManager.id,
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.MEDIUM,
        estimatedHours: 12,
      },
      {
        title: 'Category Management API',
        description: 'Build REST API for product categories',
        projectId: ecommerceProject.id,
        milestoneId: milestone2.id,
        assigneeId: webDeveloper.id,
        createdById: projectManager.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        estimatedHours: 10,
      },
      // Phase 3 tasks (not started)
      {
        title: 'Shopping Cart Implementation',
        description: 'Implement persistent shopping cart with quantity management',
        projectId: ecommerceProject.id,
        milestoneId: milestone3.id,
        createdById: projectManager.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        estimatedHours: 24,
      },
      {
        title: 'Stripe Payment Integration',
        description: 'Integrate Stripe for secure payments',
        projectId: ecommerceProject.id,
        milestoneId: milestone3.id,
        createdById: projectManager.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        estimatedHours: 20,
      },
    ],
  });
  console.log('Created tasks for E-Commerce project');

  // Create Tasks for Mobile App Project
  await prisma.task.createMany({
    data: [
      {
        title: 'Biometric Authentication',
        description: 'Implement fingerprint and Face ID authentication',
        projectId: mobileAppProject.id,
        milestoneId: mobileMilestone1.id,
        assigneeId: appDeveloper.id,
        createdById: projectManager.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        estimatedHours: 16,
        completedAt: new Date('2024-02-25'),
      },
      {
        title: 'Account Dashboard UI',
        description: 'Build main dashboard with account summary',
        projectId: mobileAppProject.id,
        milestoneId: mobileMilestone2.id,
        assigneeId: appDeveloper.id,
        createdById: projectManager.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        estimatedHours: 20,
      },
      {
        title: 'Transaction History',
        description: 'Display transaction list with filtering',
        projectId: mobileAppProject.id,
        milestoneId: mobileMilestone2.id,
        assigneeId: appDeveloper.id,
        createdById: projectManager.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        estimatedHours: 14,
      },
    ],
  });
  console.log('Created tasks for Mobile App project');

  // Create some time entries
  const completedTask = await prisma.task.findFirst({
    where: { title: 'Project Setup & Configuration' },
  });

  if (completedTask) {
    await prisma.timeEntry.create({
      data: {
        taskId: completedTask.id,
        userId: webDeveloper.id,
        startTime: new Date('2024-01-18T09:00:00'),
        endTime: new Date('2024-01-18T17:00:00'),
        duration: 8 * 3600, // 8 hours in seconds
        notes: 'Initial project setup and configuration',
        isBillable: true,
      },
    });
  }

  const inProgressTask = await prisma.task.findFirst({
    where: { title: 'Product Listing Page' },
  });

  if (inProgressTask) {
    await prisma.timeEntry.create({
      data: {
        taskId: inProgressTask.id,
        userId: webDeveloper.id,
        startTime: new Date('2024-03-01T09:00:00'),
        endTime: new Date('2024-03-01T13:00:00'),
        duration: 4 * 3600,
        notes: 'Working on product grid layout',
        isBillable: true,
      },
    });
  }
  console.log('Created time entries');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest Accounts (password: password123):');
  console.log('- Admin: admin@taskdashboard.com');
  console.log('- Project Manager: pm@taskdashboard.com');
  console.log('- Operational Manager: operations@taskdashboard.com');
  console.log('- Bidder: bidder@taskdashboard.com');
  console.log('- Web Developer: webdev@taskdashboard.com');
  console.log('- App Developer: appdev@taskdashboard.com');
  console.log('- Designer: designer@taskdashboard.com');
  console.log('- QC: qc@taskdashboard.com');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
