import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

// Parse employee data from various formats
function parseEmployeeData(input: string): any[] {
  const employees: any[] = [];
  const lines = input.split('\n').filter(l => l.trim());

  const roleMap: Record<string, string> = {
    'dev': 'DEVELOPER', 'developer': 'DEVELOPER',
    'designer': 'DESIGNER', 'design': 'DESIGNER',
    'qc': 'QC', 'qa': 'QC', 'tester': 'QC',
    'pm': 'PROJECT_MANAGER', 'project manager': 'PROJECT_MANAGER',
    'manager': 'OPERATIONAL_MANAGER', 'om': 'OPERATIONAL_MANAGER',
    'bidder': 'BIDDER', 'sales': 'BIDDER',
    'admin': 'ADMIN',
  };

  for (const line of lines) {
    // Try CSV format: name, email, role, salary
    const csvMatch = line.match(/^([^,]+),\s*([^,]+),\s*([^,]+),?\s*(\d+)?/);
    if (csvMatch) {
      const [, name, email, role, salary] = csvMatch;
      const [firstName, ...lastParts] = name.trim().split(' ');
      const lastName = lastParts.join(' ') || 'User';
      employees.push({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        role: roleMap[role.trim().toLowerCase()] || 'DEVELOPER',
        monthlySalary: salary ? parseInt(salary) : null,
      });
      continue;
    }

    // Try simple format: name role salary (e.g., "Ahmed developer 50000")
    const simpleMatch = line.match(/^(\w+)\s+(\w+)?\s*(\d+)?$/i);
    if (simpleMatch) {
      const [, name, role, salary] = simpleMatch;
      employees.push({
        firstName: name.trim(),
        lastName: 'User',
        email: `${name.trim().toLowerCase()}@redstone.dev`,
        role: role ? (roleMap[role.toLowerCase()] || 'DEVELOPER') : 'DEVELOPER',
        monthlySalary: salary ? parseInt(salary) : null,
      });
      continue;
    }

    // Try name only
    const nameOnly = line.trim().match(/^(\w+)\s*(\w+)?$/);
    if (nameOnly) {
      const [, firstName, lastName] = nameOnly;
      employees.push({
        firstName: firstName,
        lastName: lastName || 'User',
        email: `${firstName.toLowerCase()}@redstone.dev`,
        role: 'DEVELOPER',
        monthlySalary: null,
      });
    }
  }

  return employees;
}

// Parse client data
function parseClientData(input: string): any[] {
  const clients: any[] = [];
  const lines = input.split('\n').filter(l => l.trim());

  const typeMap: Record<string, string> = {
    'upwork': 'UPWORK', 'up': 'UPWORK',
    'direct': 'DIRECT', 'local': 'DIRECT',
    'freelancer': 'FREELANCER', 'fl': 'FREELANCER',
  };

  for (const line of lines) {
    // CSV: name, type, email
    const csvMatch = line.match(/^([^,]+),\s*([^,]+)?,?\s*([^,]+)?/);
    if (csvMatch) {
      const [, name, type, email] = csvMatch;
      clients.push({
        name: name.trim(),
        clientType: type ? (typeMap[type.trim().toLowerCase()] || 'DIRECT') : 'DIRECT',
        email: email?.trim() || null,
      });
      continue;
    }

    // Simple: just name
    if (line.trim()) {
      clients.push({
        name: line.trim(),
        clientType: 'DIRECT',
        email: null,
      });
    }
  }

  return clients;
}

// Parse project data
function parseProjectData(input: string): any[] {
  const projects: any[] = [];
  const lines = input.split('\n').filter(l => l.trim());

  for (const line of lines) {
    // CSV: name, client, budget
    const csvMatch = line.match(/^([^,]+),\s*([^,]+)?,?\s*(\d+)?/);
    if (csvMatch) {
      const [, name, client, budget] = csvMatch;
      projects.push({
        name: name.trim(),
        clientName: client?.trim() || 'Default Client',
        budget: budget ? parseInt(budget) : null,
      });
      continue;
    }

    // Simple: just name
    if (line.trim()) {
      projects.push({
        name: line.trim(),
        clientName: 'Default Client',
        budget: null,
      });
    }
  }

  return projects;
}

// Parse task data
function parseTaskData(input: string): any[] {
  const tasks: any[] = [];
  const lines = input.split('\n').filter(l => l.trim());

  const priorityMap: Record<string, string> = {
    'low': 'LOW', 'l': 'LOW',
    'medium': 'MEDIUM', 'med': 'MEDIUM', 'm': 'MEDIUM',
    'high': 'HIGH', 'h': 'HIGH',
    'urgent': 'URGENT', 'u': 'URGENT',
  };

  for (const line of lines) {
    // CSV: title, project, priority
    const csvMatch = line.match(/^([^,]+),\s*([^,]+)?,?\s*(\w+)?/);
    if (csvMatch) {
      const [, title, project, priority] = csvMatch;
      tasks.push({
        title: title.trim(),
        projectName: project?.trim(),
        priority: priority ? (priorityMap[priority.toLowerCase()] || 'MEDIUM') : 'MEDIUM',
      });
      continue;
    }

    // Simple: just title
    if (line.trim()) {
      tasks.push({
        title: line.trim(),
        projectName: null,
        priority: 'MEDIUM',
      });
    }
  }

  return tasks;
}

// Execute commands
async function executeAddEmployees(data: any[]): Promise<CommandResult> {
  const results = [];

  for (const emp of data) {
    try {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          email: emp.email,
          password: hashedPassword,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.role || 'DEVELOPER',
          userType: 'INHOUSE',
          monthlySalary: emp.monthlySalary,
        },
      });
      results.push({ success: true, name: `${emp.firstName} ${emp.lastName}` });
    } catch (error: any) {
      if (error.code === 'P2002') {
        results.push({ success: false, name: `${emp.firstName}`, error: 'Email already exists' });
      } else {
        results.push({ success: false, name: `${emp.firstName}`, error: error.message });
      }
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return {
    success: successCount > 0,
    message: `Created ${successCount} employee(s)${failedCount > 0 ? `, ${failedCount} failed` : ''}. Default password: password123`,
    data: results,
  };
}

async function executeAddClients(data: any[]): Promise<CommandResult> {
  const results = [];

  for (const client of data) {
    try {
      const created = await prisma.client.create({
        data: {
          name: client.name,
          email: client.email,
          clientType: client.clientType || 'DIRECT',
        },
      });
      results.push({ success: true, name: client.name });
    } catch (error: any) {
      results.push({ success: false, name: client.name, error: error.message });
    }
  }

  const successCount = results.filter(r => r.success).length;
  return {
    success: successCount > 0,
    message: `Created ${successCount} client(s)`,
    data: results,
  };
}

async function executeAddProjects(data: any[], userId: string): Promise<CommandResult> {
  const results = [];

  for (const proj of data) {
    try {
      // Find or create client
      let client = await prisma.client.findFirst({
        where: { name: { contains: proj.clientName, mode: 'insensitive' } }
      });
      if (!client) {
        client = await prisma.client.create({
          data: { name: proj.clientName, clientType: 'DIRECT' }
        });
      }

      const project = await prisma.project.create({
        data: {
          name: proj.name,
          clientId: client.id,
          budget: proj.budget,
          status: 'PLANNING',
        },
      });
      results.push({ success: true, name: proj.name });
    } catch (error: any) {
      results.push({ success: false, name: proj.name, error: error.message });
    }
  }

  const successCount = results.filter(r => r.success).length;
  return {
    success: successCount > 0,
    message: `Created ${successCount} project(s)`,
    data: results,
  };
}

async function executeAddTasks(data: any[], userId: string, projectId?: string): Promise<CommandResult> {
  const results = [];

  for (const task of data) {
    try {
      let targetProjectId = projectId;

      if (!targetProjectId && task.projectName) {
        const project = await prisma.project.findFirst({
          where: { name: { contains: task.projectName, mode: 'insensitive' } }
        });
        if (project) targetProjectId = project.id;
      }

      if (!targetProjectId) {
        results.push({ success: false, title: task.title, error: 'No project specified' });
        continue;
      }

      const created = await prisma.task.create({
        data: {
          title: task.title,
          projectId: targetProjectId,
          createdById: userId,
          priority: task.priority || 'MEDIUM',
          status: 'TODO',
        },
      });
      results.push({ success: true, title: task.title });
    } catch (error: any) {
      results.push({ success: false, title: task.title, error: error.message });
    }
  }

  const successCount = results.filter(r => r.success).length;
  return {
    success: successCount > 0,
    message: `Created ${successCount} task(s)`,
    data: results,
  };
}

async function listItems(type: string, filters?: any): Promise<CommandResult> {
  try {
    switch (type) {
      case 'employees':
        const employees = await prisma.user.findMany({
          where: filters?.role ? { role: filters.role } : {},
          select: { id: true, firstName: true, lastName: true, email: true, role: true, monthlySalary: true },
          take: 20,
        });
        return {
          success: true,
          message: `Found ${employees.length} employee(s)`,
          data: employees.map(e => `${e.firstName} ${e.lastName} (${e.role}) - ${e.email}`),
        };

      case 'clients':
        const clients = await prisma.client.findMany({
          where: { isActive: true },
          select: { id: true, name: true, clientType: true, email: true },
          take: 20,
        });
        return {
          success: true,
          message: `Found ${clients.length} client(s)`,
          data: clients.map(c => `${c.name} (${c.clientType})`),
        };

      case 'projects':
        const projects = await prisma.project.findMany({
          where: { isActive: true },
          include: { client: { select: { name: true } } },
          take: 20,
        });
        return {
          success: true,
          message: `Found ${projects.length} project(s)`,
          data: projects.map(p => `${p.name} - ${p.client.name} (${p.status})`),
        };

      case 'tasks':
        const tasks = await prisma.task.findMany({
          where: filters?.projectId ? { projectId: filters.projectId } : {},
          include: { project: { select: { name: true } } },
          take: 20,
        });
        return {
          success: true,
          message: `Found ${tasks.length} task(s)`,
          data: tasks.map(t => `${t.title} - ${t.project.name} (${t.status})`),
        };

      default:
        return { success: false, message: 'Unknown list type' };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Main command processor
export async function processCommand(
  message: string,
  userId: string,
  context?: { page?: string; projectId?: string; clientId?: string }
): Promise<CommandResult> {
  const input = message.trim().toLowerCase();

  // Help command
  if (input === 'help' || input === '?') {
    return {
      success: true,
      message: `**Available Commands:**

**Add Data (paste list or CSV):**
• \`add employees\` then paste names/data
• \`add clients\` then paste names
• \`add projects\` then paste names
• \`add tasks\` then paste titles

**List Data:**
• \`list employees\` or \`show team\`
• \`list clients\`
• \`list projects\`
• \`list tasks\`

**Formats Supported:**
• One per line: Ahmed
• With role: Ahmed, developer, 50000
• CSV: Ahmed Khan, ahmed@email.com, developer, 50000`,
    };
  }

  // List commands
  if (input.match(/^(list|show|get)\s+(employees?|team|staff|users?)/i)) {
    return listItems('employees');
  }
  if (input.match(/^(list|show|get)\s+clients?/i)) {
    return listItems('clients');
  }
  if (input.match(/^(list|show|get)\s+projects?/i)) {
    return listItems('projects');
  }
  if (input.match(/^(list|show|get)\s+tasks?/i)) {
    return listItems('tasks', { projectId: context?.projectId });
  }

  // Add employees
  if (input.startsWith('add employee') || input.startsWith('create employee') || input.match(/^add\s+\d+\s+employee/)) {
    // Extract data after the command
    const dataStart = message.indexOf('\n');
    if (dataStart === -1) {
      return { success: false, message: 'Please provide employee data on new lines after the command.\n\nExample:\nadd employees\nAhmed, ahmed@email.com, developer, 50000\nSara, sara@email.com, designer, 45000' };
    }
    const data = message.substring(dataStart + 1);
    const employees = parseEmployeeData(data);
    if (employees.length === 0) {
      return { success: false, message: 'Could not parse employee data. Try format:\nName, email, role, salary' };
    }
    return executeAddEmployees(employees);
  }

  // Add clients
  if (input.startsWith('add client') || input.startsWith('create client')) {
    const dataStart = message.indexOf('\n');
    if (dataStart === -1) {
      return { success: false, message: 'Please provide client data on new lines.\n\nExample:\nadd clients\nABC Corp, direct, abc@corp.com\nXYZ Ltd, upwork' };
    }
    const data = message.substring(dataStart + 1);
    const clients = parseClientData(data);
    if (clients.length === 0) {
      return { success: false, message: 'Could not parse client data.' };
    }
    return executeAddClients(clients);
  }

  // Add projects
  if (input.startsWith('add project') || input.startsWith('create project')) {
    const dataStart = message.indexOf('\n');
    if (dataStart === -1) {
      return { success: false, message: 'Please provide project data on new lines.\n\nExample:\nadd projects\nE-commerce App, ABC Corp, 5000\nMobile App, XYZ Ltd' };
    }
    const data = message.substring(dataStart + 1);
    const projects = parseProjectData(data);
    if (projects.length === 0) {
      return { success: false, message: 'Could not parse project data.' };
    }
    return executeAddProjects(projects, userId);
  }

  // Add tasks
  if (input.startsWith('add task') || input.startsWith('create task')) {
    const dataStart = message.indexOf('\n');
    if (dataStart === -1) {
      return { success: false, message: 'Please provide task data on new lines.\n\nExample:\nadd tasks\nSetup Database, E-commerce App, high\nBuild API, E-commerce App\nCreate UI' };
    }
    const data = message.substring(dataStart + 1);
    const tasks = parseTaskData(data);
    if (tasks.length === 0) {
      return { success: false, message: 'Could not parse task data.' };
    }
    return executeAddTasks(tasks, userId, context?.projectId);
  }

  // Quick add - detect data format automatically
  const lines = message.split('\n').filter(l => l.trim());
  if (lines.length > 1) {
    // Check if it looks like employee data (has email patterns or role keywords)
    const hasEmails = lines.some(l => l.includes('@'));
    const hasRoles = lines.some(l => /(developer|designer|qc|manager|bidder|admin)/i.test(l));

    if (hasEmails || hasRoles) {
      const employees = parseEmployeeData(message);
      if (employees.length > 0) {
        return executeAddEmployees(employees);
      }
    }
  }

  // Unknown command
  return {
    success: false,
    message: `I didn't understand that command. Type **help** to see available commands.

Quick examples:
• \`list employees\`
• \`add employees\` (then paste data)
• \`list projects\``,
  };
}

export const commandAssistantService = { processCommand };
