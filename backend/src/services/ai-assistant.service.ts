import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/database.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define tools for Claude to use
const tools: Anthropic.Tool[] = [
  {
    name: 'create_employees',
    description: 'Create one or multiple employees/team members in the system. Use this when user wants to add employees, team members, or staff.',
    input_schema: {
      type: 'object' as const,
      properties: {
        employees: {
          type: 'array',
          description: 'Array of employees to create',
          items: {
            type: 'object',
            properties: {
              email: { type: 'string', description: 'Employee email address' },
              firstName: { type: 'string', description: 'First name' },
              lastName: { type: 'string', description: 'Last name' },
              role: {
                type: 'string',
                enum: ['ADMIN', 'PROJECT_MANAGER', 'OPERATIONAL_MANAGER', 'BIDDER', 'DEVELOPER', 'DESIGNER', 'QC'],
                description: 'Employee role'
              },
              userType: {
                type: 'string',
                enum: ['INHOUSE', 'FREELANCER'],
                description: 'Type of employee'
              },
              monthlySalary: { type: 'number', description: 'Monthly salary in PKR' },
              phone: { type: 'string', description: 'Phone number (optional)' },
            },
            required: ['email', 'firstName', 'lastName', 'role'],
          },
        },
      },
      required: ['employees'],
    },
  },
  {
    name: 'create_clients',
    description: 'Create one or multiple clients in the system.',
    input_schema: {
      type: 'object' as const,
      properties: {
        clients: {
          type: 'array',
          description: 'Array of clients to create',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Client name' },
              email: { type: 'string', description: 'Client email' },
              phone: { type: 'string', description: 'Phone number' },
              company: { type: 'string', description: 'Company name' },
              clientType: {
                type: 'string',
                enum: ['UPWORK', 'DIRECT', 'FREELANCER'],
                description: 'Type of client'
              },
              upworkProfile: { type: 'string', description: 'Upwork profile URL (if applicable)' },
              website: { type: 'string', description: 'Website URL' },
              notes: { type: 'string', description: 'Additional notes' },
            },
            required: ['name', 'clientType'],
          },
        },
      },
      required: ['clients'],
    },
  },
  {
    name: 'create_projects',
    description: 'Create one or multiple projects in the system.',
    input_schema: {
      type: 'object' as const,
      properties: {
        projects: {
          type: 'array',
          description: 'Array of projects to create',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Project name' },
              description: { type: 'string', description: 'Project description' },
              clientName: { type: 'string', description: 'Client name (will be matched or created)' },
              status: {
                type: 'string',
                enum: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
                description: 'Project status'
              },
              budget: { type: 'number', description: 'Project budget' },
              currency: { type: 'string', description: 'Currency (USD, PKR, etc.)' },
              startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
              endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
            },
            required: ['name', 'clientName'],
          },
        },
      },
      required: ['projects'],
    },
  },
  {
    name: 'create_tasks',
    description: 'Create one or multiple tasks in the system.',
    input_schema: {
      type: 'object' as const,
      properties: {
        tasks: {
          type: 'array',
          description: 'Array of tasks to create',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Task title' },
              description: { type: 'string', description: 'Task description' },
              projectName: { type: 'string', description: 'Project name to assign task to' },
              assigneeName: { type: 'string', description: 'Name of person to assign (optional)' },
              status: {
                type: 'string',
                enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED'],
                description: 'Task status'
              },
              priority: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
                description: 'Task priority'
              },
              estimatedHours: { type: 'number', description: 'Estimated hours' },
              dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
            },
            required: ['title', 'projectName'],
          },
        },
      },
      required: ['tasks'],
    },
  },
  {
    name: 'get_summary',
    description: 'Get a summary of current data in the system (employees, clients, projects, tasks counts)',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'list_employees',
    description: 'List all employees in the system',
    input_schema: {
      type: 'object' as const,
      properties: {
        role: {
          type: 'string',
          enum: ['ADMIN', 'PROJECT_MANAGER', 'OPERATIONAL_MANAGER', 'BIDDER', 'DEVELOPER', 'DESIGNER', 'QC'],
          description: 'Filter by role (optional)'
        },
      },
      required: [],
    },
  },
  {
    name: 'list_projects',
    description: 'List all projects in the system',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          enum: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
          description: 'Filter by status (optional)'
        },
      },
      required: [],
    },
  },
  {
    name: 'list_clients',
    description: 'List all clients in the system',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

// Tool execution functions
async function executeCreateEmployees(input: { employees: any[] }) {
  const results = [];
  const bcrypt = await import('bcryptjs');

  for (const emp of input.employees) {
    try {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          email: emp.email,
          password: hashedPassword,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.role || 'DEVELOPER',
          userType: emp.userType || 'INHOUSE',
          monthlySalary: emp.monthlySalary || null,
          phone: emp.phone || null,
        },
      });
      results.push({ success: true, name: `${emp.firstName} ${emp.lastName}`, id: user.id });
    } catch (error: any) {
      results.push({ success: false, name: `${emp.firstName} ${emp.lastName}`, error: error.message });
    }
  }
  return { created: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, details: results };
}

async function executeCreateClients(input: { clients: any[] }) {
  const results = [];

  for (const client of input.clients) {
    try {
      const created = await prisma.client.create({
        data: {
          name: client.name,
          email: client.email || null,
          phone: client.phone || null,
          company: client.company || null,
          clientType: client.clientType || 'DIRECT',
          upworkProfile: client.upworkProfile || null,
          website: client.website || null,
          notes: client.notes || null,
        },
      });
      results.push({ success: true, name: client.name, id: created.id });
    } catch (error: any) {
      results.push({ success: false, name: client.name, error: error.message });
    }
  }
  return { created: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, details: results };
}

async function executeCreateProjects(input: { projects: any[] }, userId: string) {
  const results = [];

  for (const proj of input.projects) {
    try {
      // Find or create client
      let client = await prisma.client.findFirst({ where: { name: { contains: proj.clientName, mode: 'insensitive' } } });
      if (!client) {
        client = await prisma.client.create({
          data: { name: proj.clientName, clientType: 'DIRECT' },
        });
      }

      const project = await prisma.project.create({
        data: {
          name: proj.name,
          description: proj.description || null,
          clientId: client.id,
          status: proj.status || 'PLANNING',
          budget: proj.budget || null,
          currency: proj.currency || 'USD',
          startDate: proj.startDate ? new Date(proj.startDate) : null,
          endDate: proj.endDate ? new Date(proj.endDate) : null,
        },
      });
      results.push({ success: true, name: proj.name, id: project.id });
    } catch (error: any) {
      results.push({ success: false, name: proj.name, error: error.message });
    }
  }
  return { created: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, details: results };
}

async function executeCreateTasks(input: { tasks: any[] }, userId: string) {
  const results = [];

  for (const task of input.tasks) {
    try {
      // Find project
      const project = await prisma.project.findFirst({
        where: { name: { contains: task.projectName, mode: 'insensitive' } }
      });
      if (!project) {
        results.push({ success: false, title: task.title, error: `Project "${task.projectName}" not found` });
        continue;
      }

      // Find assignee if specified
      let assigneeId = null;
      if (task.assigneeName) {
        const assignee = await prisma.user.findFirst({
          where: {
            OR: [
              { firstName: { contains: task.assigneeName, mode: 'insensitive' } },
              { lastName: { contains: task.assigneeName, mode: 'insensitive' } },
            ],
          },
        });
        if (assignee) assigneeId = assignee.id;
      }

      const created = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description || null,
          projectId: project.id,
          assigneeId,
          createdById: userId,
          status: task.status || 'TODO',
          priority: task.priority || 'MEDIUM',
          estimatedHours: task.estimatedHours || null,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        },
      });
      results.push({ success: true, title: task.title, id: created.id });
    } catch (error: any) {
      results.push({ success: false, title: task.title, error: error.message });
    }
  }
  return { created: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, details: results };
}

async function executeGetSummary() {
  const [employees, clients, projects, tasks] = await Promise.all([
    prisma.user.count(),
    prisma.client.count(),
    prisma.project.count(),
    prisma.task.count(),
  ]);
  return { employees, clients, projects, tasks };
}

async function executeListEmployees(input: { role?: string }) {
  const where: any = {};
  if (input.role) where.role = input.role;

  const employees = await prisma.user.findMany({
    where,
    select: { id: true, firstName: true, lastName: true, email: true, role: true, monthlySalary: true },
  });
  return { count: employees.length, employees };
}

async function executeListProjects(input: { status?: string }) {
  const where: any = { isActive: true };
  if (input.status) where.status = input.status;

  const projects = await prisma.project.findMany({
    where,
    include: { client: { select: { name: true } } },
  });
  return { count: projects.length, projects: projects.map(p => ({ id: p.id, name: p.name, client: p.client.name, status: p.status })) };
}

async function executeListClients() {
  const clients = await prisma.client.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, clientType: true, company: true },
  });
  return { count: clients.length, clients };
}

// Process tool calls
async function processToolCall(toolName: string, toolInput: any, userId: string): Promise<string> {
  switch (toolName) {
    case 'create_employees':
      return JSON.stringify(await executeCreateEmployees(toolInput));
    case 'create_clients':
      return JSON.stringify(await executeCreateClients(toolInput));
    case 'create_projects':
      return JSON.stringify(await executeCreateProjects(toolInput, userId));
    case 'create_tasks':
      return JSON.stringify(await executeCreateTasks(toolInput, userId));
    case 'get_summary':
      return JSON.stringify(await executeGetSummary());
    case 'list_employees':
      return JSON.stringify(await executeListEmployees(toolInput));
    case 'list_projects':
      return JSON.stringify(await executeListProjects(toolInput));
    case 'list_clients':
      return JSON.stringify(await executeListClients());
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

// Main chat function
export async function chat(message: string, userId: string, conversationHistory: any[] = [], context?: { page?: string }) {
  const pageContext = context?.page ? ` Current page: ${context.page}.` : '';
  const systemPrompt = `You help manage employees, clients, projects, tasks. Parse data and use tools to create/list items. Default employee password: password123.${pageContext}`;

  // Only keep last 2 exchanges to reduce tokens
  const recentHistory = conversationHistory.slice(-4);

  const messages: Anthropic.MessageParam[] = [
    ...recentHistory,
    { role: 'user', content: message },
  ];

  let response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    system: systemPrompt,
    tools,
    messages,
  });

  // Process tool calls in a loop
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      const result = await processToolCall(toolUse.name, toolUse.input, userId);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result,
      });
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });

    response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      system: systemPrompt,
      tools,
      messages,
    });
  }

  // Extract text response
  const textContent = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  return {
    response: textContent?.text || 'Action completed.',
    conversationHistory: messages,
  };
}

export const aiAssistantService = { chat };
