--
-- PostgreSQL database dump
--

\restrict AAtEqMZronCz3Vw9W0dz7eYMGlzxleL2hZAo9KwUuqBGTtX7ruwxuJczhSHhan7

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: aqsariasat
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO aqsariasat;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: aqsariasat
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ApplicationStage; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."ApplicationStage" AS ENUM (
    'APPLIED',
    'SCREENING',
    'INTERVIEW',
    'TECHNICAL',
    'HR_ROUND',
    'OFFER',
    'HIRED',
    'REJECTED',
    'WITHDRAWN'
);


ALTER TYPE public."ApplicationStage" OWNER TO aqsariasat;

--
-- Name: AttendanceSource; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."AttendanceSource" AS ENUM (
    'MANUAL',
    'AUTO',
    'TIMER'
);


ALTER TYPE public."AttendanceSource" OWNER TO aqsariasat;

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'HALF_DAY',
    'WORK_FROM_HOME',
    'ON_LEAVE'
);


ALTER TYPE public."AttendanceStatus" OWNER TO aqsariasat;

--
-- Name: CandidateStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."CandidateStatus" AS ENUM (
    'NEW',
    'SCREENING',
    'INTERVIEW',
    'TECHNICAL',
    'HR_ROUND',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'ON_HOLD'
);


ALTER TYPE public."CandidateStatus" OWNER TO aqsariasat;

--
-- Name: ClientType; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."ClientType" AS ENUM (
    'UPWORK',
    'DIRECT',
    'FREELANCER'
);


ALTER TYPE public."ClientType" OWNER TO aqsariasat;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."DocumentType" AS ENUM (
    'CONTRACT',
    'ID_CARD',
    'DEGREE',
    'CERTIFICATE',
    'OTHER'
);


ALTER TYPE public."DocumentType" OWNER TO aqsariasat;

--
-- Name: InterviewType; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."InterviewType" AS ENUM (
    'PHONE',
    'VIDEO',
    'ONSITE',
    'TECHNICAL_TEST',
    'HR'
);


ALTER TYPE public."InterviewType" OWNER TO aqsariasat;

--
-- Name: JobPostStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."JobPostStatus" AS ENUM (
    'DRAFT',
    'OPEN',
    'ON_HOLD',
    'CLOSED',
    'CANCELLED'
);


ALTER TYPE public."JobPostStatus" OWNER TO aqsariasat;

--
-- Name: LeaveStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."LeaveStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public."LeaveStatus" OWNER TO aqsariasat;

--
-- Name: LeaveType; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."LeaveType" AS ENUM (
    'PAID',
    'UNPAID',
    'SICK',
    'CASUAL',
    'ANNUAL',
    'EMERGENCY'
);


ALTER TYPE public."LeaveType" OWNER TO aqsariasat;

--
-- Name: LoanStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."LoanStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PAID',
    'PARTIALLY_PAID'
);


ALTER TYPE public."LoanStatus" OWNER TO aqsariasat;

--
-- Name: MilestoneStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."MilestoneStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."MilestoneStatus" OWNER TO aqsariasat;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'RELEASED',
    'DELAYED',
    'CANCELLED'
);


ALTER TYPE public."PaymentStatus" OWNER TO aqsariasat;

--
-- Name: PayrollStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."PayrollStatus" AS ENUM (
    'DRAFT',
    'PROCESSED',
    'PAID'
);


ALTER TYPE public."PayrollStatus" OWNER TO aqsariasat;

--
-- Name: Platform; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."Platform" AS ENUM (
    'FREELANCER',
    'UPWORK',
    'DIRECT'
);


ALTER TYPE public."Platform" OWNER TO aqsariasat;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'PLANNING',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ProjectStatus" OWNER TO aqsariasat;

--
-- Name: ReviewCycle; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."ReviewCycle" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'HALF_YEARLY',
    'ANNUAL'
);


ALTER TYPE public."ReviewCycle" OWNER TO aqsariasat;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NEEDS_CHANGES'
);


ALTER TYPE public."ReviewStatus" OWNER TO aqsariasat;

--
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."TaskPriority" OWNER TO aqsariasat;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'COMPLETED',
    'BLOCKED'
);


ALTER TYPE public."TaskStatus" OWNER TO aqsariasat;

--
-- Name: TechStack; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."TechStack" AS ENUM (
    'REACT',
    'ANGULAR',
    'VUE',
    'NEXTJS',
    'NODE',
    'EXPRESS',
    'NESTJS',
    'PYTHON',
    'DJANGO',
    'FASTAPI',
    'JAVA',
    'SPRING',
    'DOTNET',
    'PHP',
    'LARAVEL',
    'RUBY',
    'RAILS',
    'GO',
    'RUST',
    'FLUTTER',
    'REACT_NATIVE',
    'ANDROID',
    'IOS',
    'SWIFT',
    'KOTLIN',
    'DEVOPS',
    'AWS',
    'AZURE',
    'GCP',
    'DOCKER',
    'KUBERNETES',
    'QA',
    'AUTOMATION',
    'MANUAL_TESTING',
    'UI_UX',
    'GRAPHIC_DESIGN',
    'FIGMA',
    'PHOTOSHOP',
    'AI_ML',
    'DATA_SCIENCE',
    'BLOCKCHAIN',
    'OTHER'
);


ALTER TYPE public."TechStack" OWNER TO aqsariasat;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."TransactionType" AS ENUM (
    'MILESTONE_PAYMENT',
    'PROJECT_FEE',
    'PREFERRED_FEE',
    'HOURLY_FEE',
    'WITHDRAWAL',
    'CURRENCY_CONVERSION',
    'LOCK',
    'UNLOCK',
    'MEMBERSHIP',
    'EXAM',
    'REFUND',
    'ARBITRATION',
    'OTHER'
);


ALTER TYPE public."TransactionType" OWNER TO aqsariasat;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'PROJECT_MANAGER',
    'OPERATIONAL_MANAGER',
    'BIDDER',
    'DEVELOPER',
    'DESIGNER',
    'QC'
);


ALTER TYPE public."UserRole" OWNER TO aqsariasat;

--
-- Name: UserType; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."UserType" AS ENUM (
    'INHOUSE',
    'FREELANCER'
);


ALTER TYPE public."UserType" OWNER TO aqsariasat;

--
-- Name: WorkLocation; Type: TYPE; Schema: public; Owner: aqsariasat
--

CREATE TYPE public."WorkLocation" AS ENUM (
    'REMOTE',
    'ONSITE',
    'HYBRID'
);


ALTER TYPE public."WorkLocation" OWNER TO aqsariasat;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    details jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO aqsariasat;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.attendance (
    id text NOT NULL,
    "userId" text NOT NULL,
    date date NOT NULL,
    status public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    "checkIn" timestamp(3) without time zone,
    "checkOut" timestamp(3) without time zone,
    "workHours" numeric(4,2),
    "breakMinutes" integer DEFAULT 0,
    source public."AttendanceSource" DEFAULT 'MANUAL'::public."AttendanceSource" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.attendance OWNER TO aqsariasat;

--
-- Name: candidate_applications; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.candidate_applications (
    id text NOT NULL,
    "candidateId" text NOT NULL,
    "jobPostId" text NOT NULL,
    stage public."ApplicationStage" DEFAULT 'APPLIED'::public."ApplicationStage" NOT NULL,
    "appliedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "stageUpdatedAt" timestamp(3) without time zone,
    "expectedSalary" numeric(12,2),
    "availableFrom" timestamp(3) without time zone,
    "coverLetter" text,
    "stageNotes" text,
    rating integer,
    "isShortlisted" boolean DEFAULT false NOT NULL,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.candidate_applications OWNER TO aqsariasat;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.candidates (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    "techStack" public."TechStack"[],
    experience integer,
    "currentCtc" numeric(12,2),
    "expectedCtc" numeric(12,2),
    "noticePeriod" integer,
    "cvUrl" text,
    "portfolioUrl" text,
    "linkedInUrl" text,
    status public."CandidateStatus" DEFAULT 'NEW'::public."CandidateStatus" NOT NULL,
    source text,
    notes text,
    rating integer,
    "interviewDate" timestamp(3) without time zone,
    "appliedFor" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cvFileName" text,
    "cvFilePath" text
);


ALTER TABLE public.candidates OWNER TO aqsariasat;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.clients (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    company text,
    "clientType" public."ClientType" NOT NULL,
    "upworkProfile" text,
    website text,
    address text,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clients OWNER TO aqsariasat;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.departments (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "managerId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO aqsariasat;

--
-- Name: employee_documents; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.employee_documents (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."DocumentType" NOT NULL,
    title text NOT NULL,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer,
    "mimeType" text,
    "uploadedById" text,
    notes text,
    "expiryDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employee_documents OWNER TO aqsariasat;

--
-- Name: employee_profiles; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.employee_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "departmentId" text,
    "employeeCode" text,
    designation text,
    "dateOfJoining" timestamp(3) without time zone,
    "dateOfLeaving" timestamp(3) without time zone,
    "reportingToId" text,
    "emergencyContact" text,
    "emergencyPhone" text,
    address text,
    "bankName" text,
    "bankAccount" text,
    "taxId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employee_profiles OWNER TO aqsariasat;

--
-- Name: interview_rounds; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.interview_rounds (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "roundNumber" integer DEFAULT 1 NOT NULL,
    type public."InterviewType" NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "interviewerName" text,
    "interviewerId" text,
    location text,
    duration integer,
    feedback text,
    rating integer,
    strengths text,
    weaknesses text,
    recommendation text,
    status text DEFAULT 'SCHEDULED'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.interview_rounds OWNER TO aqsariasat;

--
-- Name: job_posts; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.job_posts (
    id text NOT NULL,
    title text NOT NULL,
    department text,
    description text,
    requirements text,
    responsibilities text,
    positions integer DEFAULT 1 NOT NULL,
    "salaryMin" numeric(12,2),
    "salaryMax" numeric(12,2),
    currency text DEFAULT 'PKR'::text NOT NULL,
    location public."WorkLocation" DEFAULT 'ONSITE'::public."WorkLocation" NOT NULL,
    "techStack" public."TechStack"[],
    "experienceMin" integer,
    "experienceMax" integer,
    status public."JobPostStatus" DEFAULT 'DRAFT'::public."JobPostStatus" NOT NULL,
    deadline timestamp(3) without time zone,
    "postedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "createdById" text,
    notes text,
    "isUrgent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.job_posts OWNER TO aqsariasat;

--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.leave_balances (
    id text NOT NULL,
    "userId" text NOT NULL,
    year integer NOT NULL,
    "leaveType" public."LeaveType" NOT NULL,
    total integer DEFAULT 0 NOT NULL,
    used integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.leave_balances OWNER TO aqsariasat;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.leave_requests (
    id text NOT NULL,
    "userId" text NOT NULL,
    "leaveType" public."LeaveType" NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "totalDays" integer NOT NULL,
    reason text,
    status public."LeaveStatus" DEFAULT 'PENDING'::public."LeaveStatus" NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.leave_requests OWNER TO aqsariasat;

--
-- Name: loans; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.loans (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    reason text,
    status public."LoanStatus" DEFAULT 'PENDING'::public."LoanStatus" NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "paidAmount" numeric(12,2) DEFAULT 0,
    "paidAt" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.loans OWNER TO aqsariasat;

--
-- Name: milestones; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.milestones (
    id text NOT NULL,
    "projectId" text NOT NULL,
    title text NOT NULL,
    description text,
    amount numeric(12,2),
    currency text DEFAULT 'USD'::text NOT NULL,
    status public."MilestoneStatus" DEFAULT 'NOT_STARTED'::public."MilestoneStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "releasedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paymentStatus" public."PaymentStatus"
);


ALTER TABLE public.milestones OWNER TO aqsariasat;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    data jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO aqsariasat;

--
-- Name: payroll; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.payroll (
    id text NOT NULL,
    "userId" text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "baseSalary" numeric(12,2) NOT NULL,
    allowances numeric(12,2),
    deductions numeric(12,2),
    tax numeric(12,2),
    "netSalary" numeric(12,2) NOT NULL,
    currency text DEFAULT 'PKR'::text NOT NULL,
    "workingDays" integer,
    "presentDays" integer,
    "leaveDays" integer,
    status public."PayrollStatus" DEFAULT 'DRAFT'::public."PayrollStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payroll OWNER TO aqsariasat;

--
-- Name: performance_reviews; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.performance_reviews (
    id text NOT NULL,
    "userId" text NOT NULL,
    "reviewerId" text NOT NULL,
    cycle public."ReviewCycle" NOT NULL,
    "reviewPeriod" text NOT NULL,
    rating numeric(3,2),
    goals jsonb,
    strengths text,
    improvements text,
    feedback text,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "acknowledgedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.performance_reviews OWNER TO aqsariasat;

--
-- Name: project_members; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.project_members (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "userId" text NOT NULL,
    role text DEFAULT 'developer'::text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_members OWNER TO aqsariasat;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.projects (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "clientId" text NOT NULL,
    status public."ProjectStatus" DEFAULT 'PLANNING'::public."ProjectStatus" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    budget numeric(12,2),
    currency text DEFAULT 'USD'::text NOT NULL,
    "platformFeePercent" numeric(5,2),
    "workingBudget" numeric(12,2),
    "exchangeRate" numeric(10,4),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.projects OWNER TO aqsariasat;

--
-- Name: task_activities; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.task_activities (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    field text,
    "oldValue" text,
    "newValue" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_activities OWNER TO aqsariasat;

--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.task_comments (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.task_comments OWNER TO aqsariasat;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    "milestoneId" text,
    "assigneeId" text,
    "createdById" text NOT NULL,
    status public."TaskStatus" DEFAULT 'TODO'::public."TaskStatus" NOT NULL,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL,
    "estimatedHours" numeric(6,2),
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "reviewStatus" public."ReviewStatus",
    "reviewComment" text,
    "reviewedById" text,
    "reviewedAt" timestamp(3) without time zone,
    "hasBugs" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.tasks OWNER TO aqsariasat;

--
-- Name: time_entries; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.time_entries (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone,
    duration integer,
    notes text,
    "isBillable" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.time_entries OWNER TO aqsariasat;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text NOT NULL,
    gst numeric(12,2),
    platform public."Platform" DEFAULT 'FREELANCER'::public."Platform" NOT NULL,
    "projectName" text,
    "clientName" text,
    "projectId" text,
    "milestoneId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.transactions OWNER TO aqsariasat;

--
-- Name: users; Type: TABLE; Schema: public; Owner: aqsariasat
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role public."UserRole" DEFAULT 'DEVELOPER'::public."UserRole" NOT NULL,
    "userType" public."UserType" DEFAULT 'INHOUSE'::public."UserType" NOT NULL,
    avatar text,
    phone text,
    "hourlyRate" numeric(10,2),
    "monthlySalary" numeric(12,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO aqsariasat;

--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.activity_logs (id, "userId", action, "entityType", "entityId", details, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.attendance (id, "userId", date, status, "checkIn", "checkOut", "workHours", "breakMinutes", source, notes, "createdAt", "updatedAt") FROM stdin;
c763668c-a286-4928-87c3-85a81364055c	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-06	LATE	2026-01-07 14:42:23.954	2026-01-07 14:42:29.978	0.00	0	MANUAL	\N	2026-01-07 14:42:23.955	2026-01-07 14:42:29.979
a1cda717-b16b-4cd8-aa4c-5ce231cf4f2b	bb26ad9d-e0f9-4385-abbd-77c3af76358c	2026-01-06	LATE	2026-01-07 15:03:28.642	2026-01-07 15:03:32.533	0.00	0	MANUAL	Late by 543 minutes	2026-01-07 15:03:28.644	2026-01-07 15:03:32.534
2c31c341-4478-431b-9497-224a72dd31cf	bb26ad9d-e0f9-4385-abbd-77c3af76358c	2026-01-08	ON_LEAVE	\N	\N	\N	0	MANUAL	\N	2026-01-07 16:12:07.289	2026-01-07 16:12:07.289
56f74f46-a82d-4637-8091-1d955a5098e7	bb26ad9d-e0f9-4385-abbd-77c3af76358c	2026-01-07	PRESENT	2026-01-07 17:07:56.924	\N	\N	0	MANUAL	\N	2026-01-07 16:12:07.281	2026-01-07 17:07:56.925
\.


--
-- Data for Name: candidate_applications; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.candidate_applications (id, "candidateId", "jobPostId", stage, "appliedAt", "stageUpdatedAt", "expectedSalary", "availableFrom", "coverLetter", "stageNotes", rating, "isShortlisted", "rejectionReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.candidates (id, name, email, phone, "techStack", experience, "currentCtc", "expectedCtc", "noticePeriod", "cvUrl", "portfolioUrl", "linkedInUrl", status, source, notes, rating, "interviewDate", "appliedFor", "createdAt", "updatedAt", "cvFileName", "cvFilePath") FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.clients (id, name, email, phone, company, "clientType", "upworkProfile", website, address, notes, "isActive", "createdAt", "updatedAt") FROM stdin;
8cc5e017-1aeb-4784-a967-f9a00a7af025	 Daniele A.	Daniele@gmail.com		Redstone Catalyst	FREELANCER	\N	Open CV Java Android App	Itlay	Java Android Webcam Capture App	t	2026-01-06 18:22:56.026	2026-01-06 18:22:56.026
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.departments (id, name, code, description, "managerId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: employee_documents; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.employee_documents (id, "userId", type, title, "fileName", "filePath", "fileSize", "mimeType", "uploadedById", notes, "expiryDate", "isActive", "createdAt", "updatedAt") FROM stdin;
d1603cf2-c9f5-4aef-8cc9-ee3f0ff20095	d3466200-c6de-49a4-98f1-01e765e574c0	OTHER	Other - Admin	IMG_3318.png	uploads/documents/doc-1767811571518-756248203.png	445307	image/png	d3466200-c6de-49a4-98f1-01e765e574c0	\N	\N	t	2026-01-07 18:46:11.523	2026-01-07 18:46:11.523
6dd857ed-d263-43fe-a883-e1c3a602e5bc	d3466200-c6de-49a4-98f1-01e765e574c0	CONTRACT	Contract - Admin	Java_Android_App-SRS-Redstone (2).pdf	uploads/documents/doc-1767811571367-812307219.pdf	259901	application/pdf	d3466200-c6de-49a4-98f1-01e765e574c0	\N	\N	f	2026-01-07 18:46:11.373	2026-01-07 18:51:30.704
889cd7c7-a8a9-4c36-be20-ddbc8e83f206	d3466200-c6de-49a4-98f1-01e765e574c0	CONTRACT	Contract - Admin	_Client Expectations (1).pdf	uploads/documents/doc-1767810569769-105058127.pdf	71607	application/pdf	d3466200-c6de-49a4-98f1-01e765e574c0	\N	\N	f	2026-01-07 18:29:29.781	2026-01-07 18:57:29.484
814c3abc-fec2-4b27-92d2-709751588944	d3466200-c6de-49a4-98f1-01e765e574c0	ID_CARD	ID Card - Admin	_Client Expectations (1).pdf	uploads/documents/doc-1767811571405-697008072.pdf	71607	application/pdf	d3466200-c6de-49a4-98f1-01e765e574c0	\N	\N	f	2026-01-07 18:46:11.408	2026-01-07 19:02:43.665
8097f25b-81c3-40cb-9fd1-6aa08130c9a2	d3466200-c6de-49a4-98f1-01e765e574c0	ID_CARD	ID Card - Admin	_Client Expectations (1).pdf	uploads/documents/doc-1767810579668-2842000.pdf	71607	application/pdf	d3466200-c6de-49a4-98f1-01e765e574c0	\N	\N	f	2026-01-07 18:29:39.671	2026-01-07 19:02:45.969
a1ffdea5-c436-493a-8fb3-f305f1bda25d	d3466200-c6de-49a4-98f1-01e765e574c0	DEGREE	Degree - Admin	IMG_8934.png	uploads/documents/doc-1767811571428-428532608.png	3721464	image/png	d3466200-c6de-49a4-98f1-01e765e574c0	\N	\N	f	2026-01-07 18:46:11.457	2026-01-07 19:02:47.652
7da0207b-570b-46e1-b6a0-6c597dd4b345	d3466200-c6de-49a4-98f1-01e765e574c0	CERTIFICATE	Certificate - Admin	Dashboard-Approved-2.png	uploads/documents/doc-1767811571486-89369391.png	1793332	image/png	d3466200-c6de-49a4-98f1-01e765e574c0	\N	\N	f	2026-01-07 18:46:11.5	2026-01-08 05:01:29.26
\.


--
-- Data for Name: employee_profiles; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.employee_profiles (id, "userId", "departmentId", "employeeCode", designation, "dateOfJoining", "dateOfLeaving", "reportingToId", "emergencyContact", "emergencyPhone", address, "bankName", "bankAccount", "taxId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: interview_rounds; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.interview_rounds (id, "applicationId", "roundNumber", type, "scheduledAt", "completedAt", "interviewerName", "interviewerId", location, duration, feedback, rating, strengths, weaknesses, recommendation, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: job_posts; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.job_posts (id, title, department, description, requirements, responsibilities, positions, "salaryMin", "salaryMax", currency, location, "techStack", "experienceMin", "experienceMax", status, deadline, "postedAt", "closedAt", "createdById", notes, "isUrgent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.leave_balances (id, "userId", year, "leaveType", total, used, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.leave_requests (id, "userId", "leaveType", "startDate", "endDate", "totalDays", reason, status, "approvedById", "approvedAt", "rejectionReason", "createdAt", "updatedAt") FROM stdin;
d0b32ee8-ccf9-46c2-a50c-426125dcf79a	bb26ad9d-e0f9-4385-abbd-77c3af76358c	CASUAL	2026-01-08	2026-01-09	2		REJECTED	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-07 16:07:59.751	\N	2026-01-07 16:07:31.638	2026-01-07 16:07:59.752
6a744f61-df3f-46e1-a2d2-325ce939d1b6	bb26ad9d-e0f9-4385-abbd-77c3af76358c	CASUAL	2026-01-08	2026-01-09	2		APPROVED	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-07 16:12:07.291	\N	2026-01-07 16:09:06.766	2026-01-07 16:12:07.292
2a7c56c3-3420-4da1-b14b-ec0763b2b1d3	bb26ad9d-e0f9-4385-abbd-77c3af76358c	CASUAL	2026-01-08	2026-01-08	1		CANCELLED	\N	\N	\N	2026-01-07 16:11:59.619	2026-01-07 16:12:17.829
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.loans (id, "userId", amount, reason, status, "approvedById", "approvedAt", "rejectionReason", "paidAmount", "paidAt", "dueDate", notes, "createdAt", "updatedAt") FROM stdin;
d005f044-71f2-4ee0-a1e4-e12999a10c21	bb26ad9d-e0f9-4385-abbd-77c3af76358c	40000.00	family issues	PAID	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-07 16:25:06.387	\N	40000.00	2026-01-07 16:25:09.303	\N	\N	2026-01-07 16:24:52.739	2026-01-07 16:25:09.304
759f4582-9279-4794-8d40-d73ac5370674	bb26ad9d-e0f9-4385-abbd-77c3af76358c	76.00	family issues 	PAID	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-07 16:30:04.49	\N	76.00	2026-01-07 16:30:10.358	\N	\N	2026-01-07 16:29:53.691	2026-01-07 16:30:10.359
609d7223-636c-4994-bd67-a82c0828f8d1	bb26ad9d-e0f9-4385-abbd-77c3af76358c	8745.00	jfh	REJECTED	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-07 16:30:36.594	\N	0.00	\N	\N	\N	2026-01-07 16:30:22.832	2026-01-07 16:30:36.595
\.


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.milestones (id, "projectId", title, description, amount, currency, status, "dueDate", "releasedAt", "createdAt", "updatedAt", "paymentStatus") FROM stdin;
0effcac7-f186-4727-bab0-40cbce0b9cb5	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	USB UVC Camera Setup & Image Capture	Set up Android Studio project with Java for Android 12 tablet, implement USB permission handling, detect and connect USB UVC webcams, implement live preview and still image capture, and save images locally to device storage.	800.00	USD	IN_PROGRESS	2026-01-14 00:00:00	2026-01-07 10:12:04.412	2026-01-06 18:45:26.245	2026-01-07 10:12:04.414	RELEASED
34fa39eb-dd91-435c-a48f-d4047adcfdf7	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	Shape Detection & Offline Measurement	Implement circle and rectangle detection using OpenCV algorithms, add visual overlay of detected shapes on camera preview, calculate distances between shapes using calibration data, and implement shape counter/counting feature for offline measurement.	700.00	USD	NOT_STARTED	2026-01-28 00:00:00	2026-01-07 10:20:43.579	2026-01-06 18:45:32.048	2026-01-07 10:20:43.581	RELEASED
e19f07ad-773a-4bff-8c41-844d7a077971	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	OpenCV Integration & Camera Calibration	Integrate OpenCV Android SDK into the project, convert captured images to OpenCV Mat format for processing, implement camera calibration using OpenCV functions, store calibration parameters locally, and enable reuse of calibration data across sessions.	700.00	USD	NOT_STARTED	2026-01-21 00:00:00	2026-01-07 10:39:53.68	2026-01-06 18:45:28.377	2026-01-07 10:39:53.682	RELEASED
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.notifications (id, "userId", title, message, type, "isRead", data, "createdAt") FROM stdin;
cd153afd-4914-4673-adfd-52a476954c47	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Android Studio project setup	TASK_ASSIGNED	f	{"taskId": "5ce58496-0e06-4de2-9327-3d93a88c3fe6", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:46:39.584
513afd3b-265e-4eeb-b10c-b3a1db88fbac	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: USB permission handling	TASK_ASSIGNED	f	{"taskId": "91551e2d-6ec4-4e1e-a713-8dd0217c764a", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:46:42.95
88dc7705-d2f8-4c8b-a2cb-3c4c797de462	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Detect and connect USB UVC webcams	TASK_ASSIGNED	f	{"taskId": "4d912cbc-41bf-4ed7-8252-82cb50704a3c", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:46:47.136
0d823ae6-f717-42b9-af54-f84c16ddd5b3	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Implement live preview from UVC camera	TASK_ASSIGNED	f	{"taskId": "ddc9c83d-c0b2-48b0-b473-379f94c6180d", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:46:51.253
5c6aa1e0-caa8-4c88-8861-2e71c872889f	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Capture still images from UVC camera	TASK_ASSIGNED	f	{"taskId": "6ab60484-2fce-4cd6-82c1-88ee130bc1af", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:46:55.804
6b565a83-7388-4964-b7d9-092c4d9944b5	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Save images locally to device storage	TASK_ASSIGNED	f	{"taskId": "98145b77-2e3c-41c4-9e34-5bf5dda784c1", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:47:00.684
2a4bb883-bea8-459e-86dc-96b0ea9c985e	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Integrate OpenCV Android SDK	TASK_ASSIGNED	f	{"taskId": "53e3293f-b82f-4ade-9bc1-48a0acfce3ae", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:47:57.172
bdde115c-9742-4fc1-a24e-4db951ceff90	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Convert captured images to OpenCV Mat format	TASK_ASSIGNED	f	{"taskId": "8d5af59f-83f3-437f-a55c-77613fe664dc", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:48:02.278
f7815bc6-00c7-4336-b7f4-7380443797a2	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Implement OpenCV camera calibration	TASK_ASSIGNED	f	{"taskId": "3404459a-c9d6-4687-be93-1750e10d2f15", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:48:04.651
89a7a30a-d282-4c83-96fa-e8ef0abbada0	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Store calibration parameters locally	TASK_ASSIGNED	f	{"taskId": "b55aa5b8-71ce-495c-8294-ecae9c835624", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:48:07.993
d209b436-c006-42c7-83d3-2901d3f164d4	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Enable reuse of calibration data	TASK_ASSIGNED	f	{"taskId": "4cce6da8-dec0-4716-9284-adfcb7fb5a7b", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:48:10.937
6a19358b-5abf-4796-878d-32390bc2d1f8	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Implement circle detection	TASK_ASSIGNED	f	{"taskId": "b5482257-bd56-42cb-a295-2a7a8e87afc9", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:48:58.705
55d56dbe-500f-4de1-aac0-39d5132f7b63	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Implement rectangle detection	TASK_ASSIGNED	f	{"taskId": "4da21da8-a426-4198-bc34-0be199a6bb32", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:49:04.632
2a46da86-1d59-4183-9840-9e4beee88ac2	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Visual overlay of detected shapes	TASK_ASSIGNED	f	{"taskId": "7028a8f6-cd32-4734-8a10-56dfb5cd7baf", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:49:07.667
4b99d880-0ea0-427a-ae02-9b5e701c3bdf	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Calculate distances between shapes	TASK_ASSIGNED	f	{"taskId": "1e1e0ae4-ec3b-4b07-9db9-43be82c4bec5", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:49:11.157
c787b855-8e38-48fd-89a9-a22703ae3db8	c464f87d-dc2b-4a70-9886-436d8374bcd6	New Task Assigned	You have been assigned to task: Implement shape counter/counting feature	TASK_ASSIGNED	f	{"taskId": "8d792296-6720-4eff-a947-e38562852469", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-06 18:49:14.716
9659bd58-65e8-43bd-b5b0-62429f892e96	bb26ad9d-e0f9-4385-abbd-77c3af76358c	Task Assigned	You have been assigned to task: Save images locally to device storage	TASK_ASSIGNED	f	{"taskId": "98145b77-2e3c-41c4-9e34-5bf5dda784c1", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-07 07:36:27.794
17bdbed8-2c92-48f3-ac48-da548aaf70b6	bb26ad9d-e0f9-4385-abbd-77c3af76358c	Task Assigned	You have been assigned to task: Enable reuse of calibration data	TASK_ASSIGNED	f	{"taskId": "4cce6da8-dec0-4716-9284-adfcb7fb5a7b", "projectId": "a968813c-7d67-4f39-9b85-48a0ee9b4eaa"}	2026-01-07 09:15:12.589
\.


--
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.payroll (id, "userId", month, year, "baseSalary", allowances, deductions, tax, "netSalary", currency, "workingDays", "presentDays", "leaveDays", status, "paidAt", notes, "createdAt", "updatedAt") FROM stdin;
df38e37e-1351-4bf9-919b-53bc2411c4e0	4c3a6ece-9079-463b-adfe-cf784ee9851d	1	2026	37000.00	\N	37710.00	\N	-710.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:08:15.136	2026-01-08 05:29:33.065
71f35dab-c319-4d73-a007-c15387192142	c6af2787-266b-481a-a39e-230e2d53b2aa	1	2026	37000.00	\N	37710.00	\N	-710.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:08:15.14	2026-01-08 05:29:33.075
3994a5a3-ee64-4396-8f73-d7ade0b33835	22e192a3-db17-4589-bd2e-7803c2092caa	3	2026	37000.00	\N	37710.00	\N	-710.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:16:35.828	2026-01-08 05:27:43.419
0a7a7f43-52a4-4b9e-824f-375f22a65daf	bb26ad9d-e0f9-4385-abbd-77c3af76358c	3	2026	88000.00	\N	89688.00	\N	-1688.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:16:35.835	2026-01-08 05:27:43.431
d122f25c-13d7-4c5f-a0f3-b913fe289b0f	4c3a6ece-9079-463b-adfe-cf784ee9851d	3	2026	37000.00	\N	37710.00	\N	-710.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:16:35.839	2026-01-08 05:27:43.438
62911cb4-6d36-428b-8b3b-860743d22d69	c6af2787-266b-481a-a39e-230e2d53b2aa	3	2026	37000.00	\N	37710.00	\N	-710.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:16:35.844	2026-01-08 05:27:43.445
2d43d117-0c71-4dcc-88c3-9cc9e9be405b	4e01ab95-ddd8-43bc-9480-cfee0a57f541	3	2026	80000.00	\N	81534.00	\N	-1534.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:16:35.851	2026-01-08 05:27:43.478
02dd25ab-5f7e-47be-9958-96f11cf064aa	c757f61a-cab9-4cb9-bf7d-9cf9dc3f0f85	3	2026	75000.00	\N	76438.00	\N	-1438.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:16:35.855	2026-01-08 05:27:43.484
651f74f3-802f-4887-8d9b-109171a940c4	0ca2cd47-201d-4168-87d8-dfd1457b5fd3	3	2026	60000.00	\N	61151.00	\N	-1151.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:16:35.861	2026-01-08 05:27:43.49
ee57759d-fd04-4b90-bcc2-a760073345d2	22e192a3-db17-4589-bd2e-7803c2092caa	2	2026	37000.00	\N	34060.00	\N	2940.00	PKR	28	0	0	PAID	2026-01-08 05:02:38.311	\N	2026-01-08 05:02:16.17	2026-01-08 05:27:13.885
550b497b-e1b8-468a-974c-9862129e6ecf	bb26ad9d-e0f9-4385-abbd-77c3af76358c	2	2026	88000.00	\N	81008.00	\N	6992.00	PKR	28	0	0	DRAFT	\N	\N	2026-01-08 05:02:16.198	2026-01-08 05:27:13.89
daae8ed5-b430-4386-b41a-b8c2e1881fc8	4c3a6ece-9079-463b-adfe-cf784ee9851d	2	2026	37000.00	\N	34060.00	\N	2940.00	PKR	28	0	0	DRAFT	\N	\N	2026-01-08 05:02:16.204	2026-01-08 05:27:13.896
9222379a-0d1d-45ff-859b-79d31e0b3f31	c6af2787-266b-481a-a39e-230e2d53b2aa	2	2026	37000.00	\N	34060.00	\N	2940.00	PKR	28	0	0	DRAFT	\N	\N	2026-01-08 05:02:16.212	2026-01-08 05:27:13.901
40e20d5a-c82d-4d08-aec3-8c3083900d03	4e01ab95-ddd8-43bc-9480-cfee0a57f541	2	2026	80000.00	\N	73644.00	\N	6356.00	PKR	28	0	0	DRAFT	\N	\N	2026-01-08 05:02:16.216	2026-01-08 05:27:13.911
bfce4f68-3beb-48f9-8789-23fc3696be51	c757f61a-cab9-4cb9-bf7d-9cf9dc3f0f85	2	2026	75000.00	\N	69041.00	\N	5959.00	PKR	28	0	0	DRAFT	\N	\N	2026-01-08 05:02:16.222	2026-01-08 05:27:13.917
c4a9aabc-c74c-4430-9d4f-1f1147308d40	0ca2cd47-201d-4168-87d8-dfd1457b5fd3	2	2026	60000.00	\N	55233.00	\N	4767.00	PKR	28	0	0	DRAFT	\N	\N	2026-01-08 05:02:16.225	2026-01-08 05:27:13.925
d6dee61f-74bf-4d30-8207-6b764dd5f839	3ae2336f-5335-4f92-ac24-dae659fdc7e4	2	2026	37000.00	\N	34060.00	\N	2940.00	PKR	28	0	0	DRAFT	\N	\N	2026-01-08 05:02:16.229	2026-01-08 05:27:13.929
53ed7f80-153b-4df4-906b-2b83ba90c55d	3ae2336f-5335-4f92-ac24-dae659fdc7e4	3	2026	37000.00	\N	37710.00	\N	-710.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:16:35.865	2026-01-08 05:27:43.495
a1189a3f-5c52-459d-8904-4bf3cc6f1921	4e01ab95-ddd8-43bc-9480-cfee0a57f541	1	2026	80000.00	\N	81534.00	\N	-1534.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:08:15.146	2026-01-08 05:29:33.082
7f3262c6-82a9-4972-bde3-4021bb778477	c757f61a-cab9-4cb9-bf7d-9cf9dc3f0f85	1	2026	75000.00	\N	76438.00	\N	-1438.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:08:15.15	2026-01-08 05:29:33.089
4eac12eb-dcb7-4393-a5de-aeecd1386b1c	0ca2cd47-201d-4168-87d8-dfd1457b5fd3	1	2026	60000.00	\N	61151.00	\N	-1151.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:08:15.155	2026-01-08 05:29:33.093
7efeedb0-0837-41a5-97d6-44a3c7e0fc04	3ae2336f-5335-4f92-ac24-dae659fdc7e4	1	2026	37000.00	\N	37710.00	\N	-710.00	PKR	31	0	0	DRAFT	\N	\N	2026-01-08 05:08:15.159	2026-01-08 05:29:33.098
033fe99e-66ce-44b9-bdad-4fc51e9f1a4c	22e192a3-db17-4589-bd2e-7803c2092caa	4	2026	37000.00	\N	36493.00	\N	507.00	PKR	30	0	0	DRAFT	\N	\N	2026-01-08 05:27:39.524	2026-01-08 05:27:39.524
1bc3698b-5070-4752-b6a0-f8bae58910e6	bb26ad9d-e0f9-4385-abbd-77c3af76358c	4	2026	88000.00	\N	86795.00	\N	1205.00	PKR	30	0	0	DRAFT	\N	\N	2026-01-08 05:27:39.532	2026-01-08 05:27:39.532
cddbd065-a549-497c-8114-cecabdb22450	4c3a6ece-9079-463b-adfe-cf784ee9851d	4	2026	37000.00	\N	36493.00	\N	507.00	PKR	30	0	0	DRAFT	\N	\N	2026-01-08 05:27:39.538	2026-01-08 05:27:39.538
867fbab9-c029-48e4-b895-76d5635c90a0	c6af2787-266b-481a-a39e-230e2d53b2aa	4	2026	37000.00	\N	36493.00	\N	507.00	PKR	30	0	0	DRAFT	\N	\N	2026-01-08 05:27:39.545	2026-01-08 05:27:39.545
e95e45b3-b6d0-4382-a292-44562fdc6994	4e01ab95-ddd8-43bc-9480-cfee0a57f541	4	2026	80000.00	\N	78904.00	\N	1096.00	PKR	30	0	0	DRAFT	\N	\N	2026-01-08 05:27:39.549	2026-01-08 05:27:39.549
954f9628-9dfe-4912-ac47-1d3e22252029	c757f61a-cab9-4cb9-bf7d-9cf9dc3f0f85	4	2026	75000.00	\N	73973.00	\N	1027.00	PKR	30	0	0	DRAFT	\N	\N	2026-01-08 05:27:39.553	2026-01-08 05:27:39.553
1dd67a84-dfb8-47c0-acd1-9c3671cbcef4	0ca2cd47-201d-4168-87d8-dfd1457b5fd3	4	2026	60000.00	\N	59178.00	\N	822.00	PKR	30	0	0	DRAFT	\N	\N	2026-01-08 05:27:39.56	2026-01-08 05:27:39.56
38af5445-366b-43b3-a2f2-4c712265c03f	3ae2336f-5335-4f92-ac24-dae659fdc7e4	4	2026	37000.00	\N	36493.00	\N	507.00	PKR	30	0	0	DRAFT	\N	\N	2026-01-08 05:27:39.565	2026-01-08 05:27:39.565
244acbad-700f-4b6c-9a03-0f8bfd78dab7	22e192a3-db17-4589-bd2e-7803c2092caa	1	2026	37000.00	\N	37710.00	\N	-710.00	PKR	31	0	0	PAID	2026-01-08 05:08:19.491	\N	2026-01-08 05:08:15.12	2026-01-08 05:29:33.046
4791b0cb-2ec3-4bd6-afc9-3959009d3920	bb26ad9d-e0f9-4385-abbd-77c3af76358c	1	2026	88000.00	\N	81008.00	\N	6992.00	PKR	31	2	1	PAID	2026-01-08 05:09:36.614	\N	2026-01-08 05:08:15.131	2026-01-08 05:29:33.057
\.


--
-- Data for Name: performance_reviews; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.performance_reviews (id, "userId", "reviewerId", cycle, "reviewPeriod", rating, goals, strengths, improvements, feedback, status, "submittedAt", "acknowledgedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.project_members (id, "projectId", "userId", role, "joinedAt") FROM stdin;
2142b5ad-4f44-4331-b415-fbb7d82eeb5a	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	c464f87d-dc2b-4a70-9886-436d8374bcd6	Developer	2026-01-07 07:43:50.47
792e345a-9d6b-46fa-98cb-a2f95938b8e7	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	c757f61a-cab9-4cb9-bf7d-9cf9dc3f0f85	Project Lead	2026-01-07 08:54:40.471
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.projects (id, name, description, "clientId", status, "startDate", "endDate", budget, currency, "platformFeePercent", "workingBudget", "exchangeRate", "isActive", "createdAt", "updatedAt") FROM stdin;
a968813c-7d67-4f39-9b85-48a0ee9b4eaa	Open CV Android App	Java Android Webcam Capture App	8cc5e017-1aeb-4784-a967-f9a00a7af025	PLANNING	2026-01-08 00:00:00	2026-01-28 00:00:00	1800.00	USD	10.00	\N	\N	t	2026-01-06 18:25:09.923	2026-01-07 09:43:38.458
\.


--
-- Data for Name: task_activities; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.task_activities (id, "taskId", "userId", action, field, "oldValue", "newValue", metadata, "createdAt") FROM stdin;
716c42e0-bb1e-4325-82d8-d85d9ac827fd	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STARTED	\N	\N	\N	\N	2026-01-07 11:22:53.115
e4896111-b651-42c8-8e61-adfeaf384267	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STOPPED	\N	\N	\N	{"duration": 21}	2026-01-07 11:23:14.404
add48e0d-c2d5-4ee5-b22e-dcd58e1296e3	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	STATUS_CHANGED	status	IN_PROGRESS	IN_REVIEW	\N	2026-01-07 11:23:45.923
292f42e5-b387-4952-96c2-ad9d6674def3	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	STATUS_CHANGED	status	IN_REVIEW	COMPLETED	\N	2026-01-07 11:23:48.694
50305cb7-87f5-4be0-8b48-b24c578e5829	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	STATUS_CHANGED	status	COMPLETED	TODO	\N	2026-01-07 11:23:56.687
e4422fe7-76a6-4b5b-abc1-f93572f594ee	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STARTED	\N	\N	\N	\N	2026-01-07 11:24:00.982
53add983-f7c3-4d0a-b59e-598c2f2c10ea	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STOPPED	\N	\N	\N	{"duration": 9}	2026-01-07 11:24:10.539
2c770b42-9d0e-4815-8d95-20dc4e70c9a2	98145b77-2e3c-41c4-9e34-5bf5dda784c1	bb26ad9d-e0f9-4385-abbd-77c3af76358c	TIMER_STARTED	\N	\N	\N	\N	2026-01-07 11:24:22.356
440e1978-035d-49d6-a3b1-1ed3ec6a6ce6	98145b77-2e3c-41c4-9e34-5bf5dda784c1	bb26ad9d-e0f9-4385-abbd-77c3af76358c	TIMER_STOPPED	\N	\N	\N	{"duration": 5}	2026-01-07 11:24:27.366
fb2dac32-4309-47bd-8f6e-9ac509b529f1	98145b77-2e3c-41c4-9e34-5bf5dda784c1	bb26ad9d-e0f9-4385-abbd-77c3af76358c	TIMER_STARTED	\N	\N	\N	\N	2026-01-07 11:28:00.121
fa2f9034-c6db-452b-a60b-2fd97a8df32e	98145b77-2e3c-41c4-9e34-5bf5dda784c1	bb26ad9d-e0f9-4385-abbd-77c3af76358c	TIMER_STOPPED	\N	\N	\N	{"duration": 5}	2026-01-07 11:28:05.21
822640dc-531b-4bb4-b8e1-aa687056ba1a	53e3293f-b82f-4ade-9bc1-48a0acfce3ae	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STARTED	\N	\N	\N	\N	2026-01-07 11:29:28.474
049acdfa-e2a7-45a3-8279-6343c4618078	53e3293f-b82f-4ade-9bc1-48a0acfce3ae	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STOPPED	\N	\N	\N	{"duration": 15}	2026-01-07 11:29:44.076
3eda0518-a752-44cb-8154-dca4d1fc21fe	3404459a-c9d6-4687-be93-1750e10d2f15	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STARTED	\N	\N	\N	\N	2026-01-07 11:35:13.462
f5c55eef-046e-4014-baf3-92bb8cd6ae07	3404459a-c9d6-4687-be93-1750e10d2f15	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STOPPED	\N	\N	\N	{"duration": 11}	2026-01-07 11:35:25.091
e6205d37-cc88-46a0-8fd1-ebf8d5f9c8b7	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STARTED	\N	\N	\N	\N	2026-01-07 11:37:09.826
66806983-726a-42ec-bdae-cff1eab5b1a8	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	STATUS_CHANGED	status	IN_PROGRESS	COMPLETED	\N	2026-01-07 11:37:14.99
b80b6553-0a9a-4ad3-8053-5d48421f8eda	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	STATUS_CHANGED	status	COMPLETED	TODO	\N	2026-01-07 11:37:30.318
f68ca131-c1d1-4e52-b548-698ce29aa8b7	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	TIMER_STOPPED	\N	\N	\N	{"duration": 5580}	2026-01-07 13:10:10.707
777bb7d5-ab11-4f42-84c0-695fbebd97f2	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	STATUS_CHANGED	status	TODO	IN_PROGRESS	\N	2026-01-07 19:59:48.885
217c6f25-2527-42e2-bf17-d8c596dddf0c	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	STATUS_CHANGED	status	IN_PROGRESS	TODO	\N	2026-01-07 19:59:51.449
\.


--
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.task_comments (id, "taskId", "userId", content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.tasks (id, title, description, "projectId", "milestoneId", "assigneeId", "createdById", status, priority, "estimatedHours", "dueDate", "completedAt", "order", "createdAt", "updatedAt", "reviewStatus", "reviewComment", "reviewedById", "reviewedAt", "hasBugs") FROM stdin;
8d5af59f-83f3-437f-a55c-77613fe664dc	Convert captured images to OpenCV Mat format	Implement image conversion pipeline to transform captured camera frames (Bitmap/YUV) into OpenCV Mat format for image processing operations.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	e19f07ad-773a-4bff-8c41-844d7a077971	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	MEDIUM	\N	2026-01-17 23:59:59	\N	0	2026-01-06 18:48:02.274	2026-01-06 18:48:02.274	\N	\N	\N	\N	f
b55aa5b8-71ce-495c-8294-ecae9c835624	Store calibration parameters locally	Implement persistent storage for camera calibration data. Save camera matrix, distortion coefficients, and calibration metadata to SharedPreferences or local file storage.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	e19f07ad-773a-4bff-8c41-844d7a077971	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	MEDIUM	\N	2026-01-20 23:59:59	\N	0	2026-01-06 18:48:07.99	2026-01-06 18:48:07.99	\N	\N	\N	\N	f
b5482257-bd56-42cb-a295-2a7a8e87afc9	Implement circle detection	Implement circle detection using OpenCV HoughCircles algorithm. Configure parameters for optimal detection, handle edge cases, and return detected circle coordinates and radii.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	34fa39eb-dd91-435c-a48f-d4047adcfdf7	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	MEDIUM	\N	2026-01-23 23:59:59	\N	0	2026-01-06 18:48:58.697	2026-01-06 18:48:58.697	\N	\N	\N	\N	f
4da21da8-a426-4198-bc34-0be199a6bb32	Implement rectangle detection	Implement rectangle detection using OpenCV contour analysis and approxPolyDP. Filter quadrilateral shapes, handle rotated rectangles, and return corner points and dimensions.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	34fa39eb-dd91-435c-a48f-d4047adcfdf7	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	MEDIUM	\N	2026-01-24 23:59:59	\N	0	2026-01-06 18:49:04.628	2026-01-06 18:49:04.628	\N	\N	\N	\N	f
7028a8f6-cd32-4734-8a10-56dfb5cd7baf	Visual overlay of detected shapes	Draw visual overlays on camera preview for detected shapes. Render circles and rectangles with color-coded borders, display shape labels, and ensure smooth real-time rendering.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	34fa39eb-dd91-435c-a48f-d4047adcfdf7	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	MEDIUM	\N	2026-01-25 23:59:59	\N	0	2026-01-06 18:49:07.662	2026-01-06 18:49:07.662	\N	\N	\N	\N	f
1e1e0ae4-ec3b-4b07-9db9-43be82c4bec5	Calculate distances between shapes	Implement distance measurement between detected shapes using camera calibration data. Convert pixel distances to real-world units (mm/cm), display measurements on screen overlay.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	34fa39eb-dd91-435c-a48f-d4047adcfdf7	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	MEDIUM	\N	2026-01-27 23:59:59	\N	0	2026-01-06 18:49:11.153	2026-01-06 18:49:11.153	\N	\N	\N	\N	f
8d792296-6720-4eff-a947-e38562852469	Implement shape counter/counting feature	Add shape counting functionality to track and display the number of detected circles and rectangles. Show count summary in UI, support counting by shape type, and enable offline operation.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	34fa39eb-dd91-435c-a48f-d4047adcfdf7	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	MEDIUM	\N	2026-01-28 23:59:59	\N	0	2026-01-06 18:49:14.71	2026-01-06 18:49:14.71	\N	\N	\N	\N	f
ddc9c83d-c0b2-48b0-b473-379f94c6180d	Implement live preview from UVC camera	Create a live camera preview screen using SurfaceView or TextureView. Stream real-time video frames from the connected UVC webcam with proper aspect ratio handling.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	0effcac7-f186-4727-bab0-40cbce0b9cb5	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	HIGH	\N	2026-01-12 23:59:59	\N	0	2026-01-06 18:46:51.249	2026-01-06 21:06:11.027	\N	\N	\N	\N	f
4d912cbc-41bf-4ed7-8252-82cb50704a3c	Detect and connect USB UVC webcams	Implement USB device enumeration to detect connected UVC webcams. Handle device discovery, connection establishment, and disconnection events for USB Video Class devices.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	0effcac7-f186-4727-bab0-40cbce0b9cb5	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	HIGH	\N	2026-01-11 23:59:59	\N	0	2026-01-06 18:46:47.132	2026-01-06 21:06:12.772	\N	\N	\N	\N	f
91551e2d-6ec4-4e1e-a713-8dd0217c764a	USB permission handling	Implement USB permission request flow for Android. Handle runtime permissions, USB device attach/detach events, and permission dialogs for UVC webcam access.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	0effcac7-f186-4727-bab0-40cbce0b9cb5	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	HIGH	\N	2026-01-10 23:59:59	\N	0	2026-01-06 18:46:42.945	2026-01-06 21:06:14.299	\N	\N	\N	\N	f
5ce58496-0e06-4de2-9327-3d93a88c3fe6	Android Studio project setup	Set up a new Android Studio project using Java targeting Android 12 for tablet devices. Configure gradle, SDK versions, and project structure for UVC camera integration.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	0effcac7-f186-4727-bab0-40cbce0b9cb5	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	HIGH	\N	2026-01-09 23:59:59	\N	0	2026-01-06 18:46:39.576	2026-01-06 21:06:17.677	\N	\N	\N	\N	f
4cce6da8-dec0-4716-9284-adfcb7fb5a7b	Enable reuse of calibration data	Implement calibration data loading on app startup. Allow users to skip calibration if valid data exists, with option to recalibrate. Add calibration status indicator in UI.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	e19f07ad-773a-4bff-8c41-844d7a077971	bb26ad9d-e0f9-4385-abbd-77c3af76358c	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	MEDIUM	\N	2026-01-21 00:00:00	\N	0	2026-01-06 18:48:10.934	2026-01-07 09:15:12.573	\N	\N	\N	\N	f
6ab60484-2fce-4cd6-82c1-88ee130bc1af	Capture still images from UVC camera	Implement image capture functionality to take still photos from the UVC camera stream. Add capture button UI, handle image encoding (JPEG/PNG), and provide capture feedback.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	0effcac7-f186-4727-bab0-40cbce0b9cb5	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	HIGH	\N	2026-01-13 23:59:59	\N	0	2026-01-06 18:46:55.793	2026-01-06 21:06:09.118	\N	\N	\N	\N	f
53e3293f-b82f-4ade-9bc1-48a0acfce3ae	Integrate OpenCV Android SDK	Add OpenCV Android SDK to the project. Configure NDK settings, add required native libraries, and set up OpenCV manager or static initialization for the app.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	e19f07ad-773a-4bff-8c41-844d7a077971	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	IN_PROGRESS	MEDIUM	\N	2026-01-16 23:59:59	\N	0	2026-01-06 18:47:57.167	2026-01-07 11:29:28.471	\N	\N	\N	\N	f
3404459a-c9d6-4687-be93-1750e10d2f15	Implement OpenCV camera calibration	Create camera calibration workflow using OpenCV calibrateCamera function. Implement chessboard pattern detection, corner refinement, and intrinsic/extrinsic parameter calculation.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	e19f07ad-773a-4bff-8c41-844d7a077971	c464f87d-dc2b-4a70-9886-436d8374bcd6	d3466200-c6de-49a4-98f1-01e765e574c0	IN_PROGRESS	MEDIUM	\N	2026-01-19 23:59:59	\N	0	2026-01-06 18:48:04.647	2026-01-07 11:35:13.458	\N	\N	\N	\N	f
98145b77-2e3c-41c4-9e34-5bf5dda784c1	Save images locally to device storage	Implement local storage functionality to save captured images to device storage. Handle storage permissions, create app-specific directories, and implement image naming/organization.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	0effcac7-f186-4727-bab0-40cbce0b9cb5	bb26ad9d-e0f9-4385-abbd-77c3af76358c	d3466200-c6de-49a4-98f1-01e765e574c0	TODO	HIGH	\N	2026-01-14 00:00:00	\N	0	2026-01-06 18:47:00.676	2026-01-07 19:59:51.434	\N	\N	\N	\N	f
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.time_entries (id, "taskId", "userId", "startTime", "endTime", duration, notes, "isBillable", "createdAt", "updatedAt") FROM stdin;
a67c4967-baed-48f4-bcf4-c0aaabdef6d0	53e3293f-b82f-4ade-9bc1-48a0acfce3ae	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-07 11:29:28.464	2026-01-07 11:29:44.068	15	\N	t	2026-01-07 11:29:28.465	2026-01-07 11:29:44.069
a9fd0b5c-23bd-409b-a509-165b6685c25b	3404459a-c9d6-4687-be93-1750e10d2f15	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-07 11:35:13.45	2026-01-07 11:35:25.085	11	\N	t	2026-01-07 11:35:13.451	2026-01-07 11:35:25.086
475ee896-dc6c-46cb-846a-b182eb336de7	98145b77-2e3c-41c4-9e34-5bf5dda784c1	d3466200-c6de-49a4-98f1-01e765e574c0	2026-01-07 11:37:09.82	2026-01-07 13:10:10.691	5580	\N	t	2026-01-07 11:37:09.821	2026-01-07 13:10:10.693
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.transactions (id, date, description, type, amount, currency, gst, platform, "projectName", "clientName", "projectId", "milestoneId", notes, "createdAt", "updatedAt") FROM stdin;
afe8d772-363d-4e4e-9573-a506fa9cb1b7	2026-01-05 17:14:00	Preferred freelancer program project fee taken (Dual Platform LLM & Video App - 23/03/2025 10:24 EDT) (GBP)	PREFERRED_FEE	-37.50	GBP	\N	FREELANCER	Dual Platform LLM & Video App - 23/03/2025 10:24 EDT	\N	\N	\N	\N	2026-01-06 19:43:14.806	2026-01-06 19:43:14.806
cb00e8dd-1ec7-426c-bce8-bb05c5a54f8e	2026-01-05 17:14:00	Done milestone payment from Lucas L. for project Dual Platform LLM & Video App - 23/03/2025 10:24 EDT (Partial payment for project) (GBP)	MILESTONE_PAYMENT	250.00	GBP	\N	FREELANCER	Dual Platform LLM & Video App - 23/03/2025 10:24 EDT	Lucas L.	\N	\N	\N	2026-01-06 19:43:14.812	2026-01-06 19:43:14.812
4fa2e789-15d7-4406-bbd9-83a4292416a5	2026-01-03 12:13:00	Project fee taken (Aquaxchange phase 2) (GBP)	PROJECT_FEE	-11.00	GBP	\N	FREELANCER	Aquaxchange phase 2	\N	\N	\N	\N	2026-01-06 19:43:14.814	2026-01-06 19:43:14.814
12808da0-41c2-4f01-897e-e4cb6d926a6b	2026-01-03 12:13:00	Done milestone payment from Charlie T. for project Aquaxchange phase 2 (Partial payment for project) (GBP)	MILESTONE_PAYMENT	150.00	GBP	\N	FREELANCER	Aquaxchange phase 2	Charlie T.	\N	\N	\N	2026-01-06 19:43:14.816	2026-01-06 19:43:14.816
ccdbec72-90f7-49d6-b91f-9b58dc557a37	2026-01-02 05:29:00	Project fee taken (AI Chatbot Optimization & Repair -- 2) (USD)	PROJECT_FEE	-20.00	USD	\N	FREELANCER	AI Chatbot Optimization & Repair -- 2	\N	\N	\N	\N	2026-01-06 19:43:14.818	2026-01-06 19:43:14.818
b0fa6dcb-d759-4807-ad99-e11a8ec63969	2026-01-02 05:29:00	Done milestone payment from Amandas K. for project AI Chatbot Optimization & Repair -- 2 (Partial payment for project) (USD)	MILESTONE_PAYMENT	200.00	USD	\N	FREELANCER	AI Chatbot Optimization & Repair -- 2	Amandas K.	\N	\N	\N	2026-01-06 19:43:14.82	2026-01-06 19:43:14.82
8841af1a-4700-4a14-a22a-9a80f86daea2	2026-01-02 05:26:00	Done milestone payment from Amandas K. for project AI Chatbot Optimization & Repair -- 2 (Partial payment for project) (USD)	MILESTONE_PAYMENT	300.00	USD	\N	FREELANCER	AI Chatbot Optimization & Repair -- 2	Amandas K.	\N	\N	\N	2026-01-06 19:43:14.822	2026-01-06 19:43:14.822
c9bbfefc-9d07-4b38-9fb4-d5dfe2ab45fd	2026-01-01 05:35:00	Done milestone payment from Ahmed A. for project Customized Food Community Web Platform Development (Partial payment for project) (USD)	MILESTONE_PAYMENT	400.00	USD	\N	FREELANCER	Customized Food Community Web Platform Development	Ahmed A.	\N	\N	\N	2026-01-06 19:43:14.824	2026-01-06 19:43:14.824
1f2204a8-92de-412a-bc9d-cb273e00f672	2025-12-30 19:00:00	Preferred freelancer program project fee taken (Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites) (USD)	PREFERRED_FEE	-60.00	USD	\N	FREELANCER	Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites	\N	\N	\N	\N	2026-01-06 19:43:14.827	2026-01-06 19:43:14.827
27a3c996-00f9-43f3-9ecd-2af5b5037e1c	2025-12-30 19:00:00	Done milestone payment from Nada D. for project Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites (Partial payment for project) (USD)	MILESTONE_PAYMENT	400.00	USD	\N	FREELANCER	Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites	Nada D.	\N	\N	\N	2026-01-06 19:43:14.829	2026-01-06 19:43:14.829
f84e2a63-972b-4e9e-b4d4-93a1f1614f18	2025-12-29 01:15:00	Express withdrawal  (PKR)	WITHDRAWAL	-479779.82	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.831	2026-01-06 19:43:14.831
aecea46f-599e-4393-8ed3-60aa11a6d057	2025-12-27 11:51:00	Done milestone payment from Amandas K. for project AI Chatbot Optimization & Repair -- 2 (Partial payment for project) (USD)	MILESTONE_PAYMENT	300.00	USD	\N	FREELANCER	AI Chatbot Optimization & Repair -- 2	Amandas K.	\N	\N	\N	2026-01-06 19:43:14.833	2026-01-06 19:43:14.833
c0470a88-69db-4d19-9315-0188c665cee2	2025-12-24 15:37:00	Done milestone payment from Charlie T. for project Aquaxchange phase 2 (Partial payment for project) (GBP)	MILESTONE_PAYMENT	110.00	GBP	\N	FREELANCER	Aquaxchange phase 2	Charlie T.	\N	\N	\N	2026-01-06 19:43:14.834	2026-01-06 19:43:14.834
b61ac480-0061-4559-b8f0-ec1a0a4a63fa	2025-12-23 13:14:00	Preferred freelancer program project fee taken (iOS Object Recognition App for the Visually Impaired) (USD)	PREFERRED_FEE	-135.00	USD	\N	FREELANCER	iOS Object Recognition App for the Visually Impaired	\N	\N	\N	\N	2026-01-06 19:43:14.836	2026-01-06 19:43:14.836
566a3d44-ac99-4119-9c65-34fc3c910aef	2025-12-23 13:14:00	Done milestone payment from Saud A. for project iOS Object Recognition App for the Visually Impaired (Partial payment for project) (USD)	MILESTONE_PAYMENT	900.00	USD	\N	FREELANCER	iOS Object Recognition App for the Visually Impaired	Saud A.	\N	\N	\N	2026-01-06 19:43:14.838	2026-01-06 19:43:14.838
91993a28-813c-43f1-a9de-a4cbeafa81d4	2025-12-23 10:18:00	Project fee taken (Full UI Design Overhaul - Web App) (USD)	PROJECT_FEE	-25.00	USD	\N	FREELANCER	Full UI Design Overhaul - Web App	\N	\N	\N	\N	2026-01-06 19:43:14.84	2026-01-06 19:43:14.84
c369c2b0-99ff-4e6e-a6b7-1eb5474bf76a	2025-12-23 10:18:00	Done milestone payment from Yianni A. for project Full UI Design Overhaul - Web App (Partial payment for project) (USD)	MILESTONE_PAYMENT	250.00	USD	\N	FREELANCER	Full UI Design Overhaul - Web App	Yianni A.	\N	\N	\N	2026-01-06 19:43:14.842	2026-01-06 19:43:14.842
a70d0c14-c647-4fa5-b200-a4f7ce8e7d03	2025-12-21 05:02:00	Done milestone payment from Ahmed A. for project Customized Food Community Web Platform Development (Partial payment for project) (USD)	MILESTONE_PAYMENT	500.00	USD	\N	FREELANCER	Customized Food Community Web Platform Development	Ahmed A.	\N	\N	\N	2026-01-06 19:43:14.844	2026-01-06 19:43:14.844
1b610885-c45c-4bea-9a32-c938f2c3a215	2025-12-21 05:02:00	Project fee taken (Customized Food Community Web Platform Development) (USD)	PROJECT_FEE	-180.00	USD	\N	FREELANCER	Customized Food Community Web Platform Development	\N	\N	\N	\N	2026-01-06 19:43:14.845	2026-01-06 19:43:14.845
6854ad17-3e74-4c88-bf47-6a261a4197ab	2025-12-19 14:30:00	Project fee taken (Java Android Webcam Capture App) (EUR)	PROJECT_FEE	-50.00	EUR	\N	FREELANCER	Java Android Webcam Capture App	\N	\N	\N	\N	2026-01-06 19:43:14.847	2026-01-06 19:43:14.847
23351759-f3ee-44b4-854f-2f09d53dffc0	2025-12-19 07:49:00	Done milestone payment from Amandas K. for project AI Chatbot Optimization & Repair -- 2 (Partial payment for project) (USD)	MILESTONE_PAYMENT	400.00	USD	\N	FREELANCER	AI Chatbot Optimization & Repair -- 2	Amandas K.	\N	\N	\N	2026-01-06 19:43:14.848	2026-01-06 19:43:14.848
101225ac-a896-4b71-86dc-c8405eec9c3c	2025-12-18 21:00:00	Express withdrawal  (PKR)	WITHDRAWAL	-776400.18	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.85	2026-01-06 19:43:14.85
652e8232-807e-46ce-aae5-a1dc95579a07	2025-12-17 10:14:00	Preferred freelancer program project fee taken (Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites) (USD)	PREFERRED_FEE	-45.00	USD	\N	FREELANCER	Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites	\N	\N	\N	\N	2026-01-06 19:43:14.852	2026-01-06 19:43:14.852
4bfbf212-687c-4806-be00-c9fa15b7c537	2025-12-17 10:14:00	Done milestone payment from Nada D. for project Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites (Partial payment for project) (USD)	MILESTONE_PAYMENT	300.00	USD	\N	FREELANCER	Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites	Nada D.	\N	\N	\N	2026-01-06 19:43:14.855	2026-01-06 19:43:14.855
171b3d72-126c-4d2e-844b-896441da81a1	2025-12-17 07:54:00	Preferred freelancer program project fee taken (Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites) (USD)	PREFERRED_FEE	-30.00	USD	\N	FREELANCER	Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites	\N	\N	\N	\N	2026-01-06 19:43:14.856	2026-01-06 19:43:14.856
88a18825-8cf4-460f-95a8-44bf8ecd974f	2025-12-17 07:54:00	Done milestone payment from Nada D. for project Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites (Partial payment for project) (USD)	MILESTONE_PAYMENT	200.00	USD	\N	FREELANCER	Senior Developer Needed to Improve Existing Codebase and Rebuild 3 News Websites	Nada D.	\N	\N	\N	2026-01-06 19:43:14.858	2026-01-06 19:43:14.858
5cd7ea9a-176c-4890-8367-d0f7ac4c1890	2025-12-17 05:34:00	Done milestone payment from Yianni A. for project Full UI Design Overhaul - Web App (Partial payment for project) (USD)	MILESTONE_PAYMENT	250.00	USD	\N	FREELANCER	Full UI Design Overhaul - Web App	Yianni A.	\N	\N	\N	2026-01-06 19:43:14.861	2026-01-06 19:43:14.861
635b6c71-00b0-4480-bfea-c958dc3e986d	2025-12-15 18:09:00	Project fee taken (iPhone Notes Wallpaper App) (AUD)	PROJECT_FEE	-50.00	AUD	\N	FREELANCER	iPhone Notes Wallpaper App	\N	\N	\N	\N	2026-01-06 19:43:14.863	2026-01-06 19:43:14.863
bc8dcb7a-55a3-43b0-bc2f-ce5f44ea2136	2024-10-19 09:55:00	Project fee taken (Data Entry (one time)) (GBP)	PROJECT_FEE	-27.00	GBP	\N	FREELANCER	Data Entry (one time	\N	\N	\N	\N	2026-01-06 19:43:15.205	2026-01-06 19:43:15.205
6666d1f7-efdd-438e-a1fe-b5ccec338ef4	2025-12-15 18:09:00	Done milestone payment from Thuvarakan M. for project iPhone Notes Wallpaper App (Partial payment for project) (AUD)	MILESTONE_PAYMENT	500.00	AUD	\N	FREELANCER	iPhone Notes Wallpaper App	Thuvarakan M.	\N	\N	\N	2026-01-06 19:43:14.864	2026-01-06 19:43:14.864
d5130e77-ee58-46cf-85d8-f32ad4c798b3	2025-12-15 18:08:00	Project fee taken (iPhone Notes Wallpaper App) (AUD)	PROJECT_FEE	-50.00	AUD	\N	FREELANCER	iPhone Notes Wallpaper App	\N	\N	\N	\N	2026-01-06 19:43:14.867	2026-01-06 19:43:14.867
6708cd85-07a3-4f49-9c85-ff8101fa5dcc	2025-12-15 18:08:00	Done milestone payment from Thuvarakan M. for project iPhone Notes Wallpaper App (Partial payment for project) (AUD)	MILESTONE_PAYMENT	500.00	AUD	\N	FREELANCER	iPhone Notes Wallpaper App	Thuvarakan M.	\N	\N	\N	2026-01-06 19:43:14.868	2026-01-06 19:43:14.868
1c146c66-b10e-4422-a972-1afa4aefff9e	2025-12-15 16:15:00	Done milestone payment from Jack C. for project Magento 2-Shopify SEO Migration (Partial payment for project) (EUR)	MILESTONE_PAYMENT	360.00	EUR	\N	FREELANCER	Magento 2-Shopify SEO Migration	Jack C.	\N	\N	\N	2026-01-06 19:43:14.87	2026-01-06 19:43:14.87
03c12c25-a7ae-469e-a8da-9fe260d9e633	2025-12-15 16:15:00	Done milestone payment from Jack C. for project Magento 2-Shopify SEO Migration (Partial payment for project) (EUR)	MILESTONE_PAYMENT	90.00	EUR	\N	FREELANCER	Magento 2-Shopify SEO Migration	Jack C.	\N	\N	\N	2026-01-06 19:43:14.871	2026-01-06 19:43:14.871
4e6bf68b-9c44-4cae-9186-e5c18f79bd40	2025-12-15 10:47:00	Done milestone payment from Yianni A. for project Full UI Design Overhaul - Web App (Partial payment for project) (USD)	MILESTONE_PAYMENT	300.00	USD	\N	FREELANCER	Full UI Design Overhaul - Web App	Yianni A.	\N	\N	\N	2026-01-06 19:43:14.874	2026-01-06 19:43:14.874
8c73a904-2727-4a4a-a66e-91f9417743da	2025-12-15 10:27:00	Preferred freelancer program project fee taken (MyGo API Integration for WordPress Site) (USD)	PREFERRED_FEE	-37.50	USD	\N	FREELANCER	MyGo API Integration for WordPress Site	\N	\N	\N	\N	2026-01-06 19:43:14.876	2026-01-06 19:43:14.876
a4dbe149-faab-4c10-b1f1-acacb5e035c3	2025-12-15 10:27:00	Done milestone payment from Ahmed N. for project MyGo API Integration for WordPress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	250.00	USD	\N	FREELANCER	MyGo API Integration for WordPress Site	Ahmed N.	\N	\N	\N	2026-01-06 19:43:14.878	2026-01-06 19:43:14.878
fec153cd-7167-48e3-ac07-65b7725b6303	2025-12-15 08:35:00	Done milestone payment from Charlie T. for project Aquaxchange phase 2 (Partial payment for project) (GBP)	MILESTONE_PAYMENT	150.00	GBP	\N	FREELANCER	Aquaxchange phase 2	Charlie T.	\N	\N	\N	2026-01-06 19:43:14.879	2026-01-06 19:43:14.879
23a17ed2-aea5-4363-b03a-7e6114ed7dfc	2025-12-13 10:04:00	Project fee taken (AI Chatbot Optimization & Repair -- 2) (USD)	PROJECT_FEE	-100.00	USD	\N	FREELANCER	AI Chatbot Optimization & Repair -- 2	\N	\N	\N	\N	2026-01-06 19:43:14.881	2026-01-06 19:43:14.881
9fc9b6d4-fedc-4fa5-9008-9a6c30a9579c	2025-12-11 19:22:00	Project fee taken (iPhone Notes Wallpaper App) (AUD)	PROJECT_FEE	-30.00	AUD	\N	FREELANCER	iPhone Notes Wallpaper App	\N	\N	\N	\N	2026-01-06 19:43:14.883	2026-01-06 19:43:14.883
bc934367-13ed-4cdb-afc9-373b80caedd4	2025-12-11 19:22:00	Done milestone payment from Thuvarakan M. for project iPhone Notes Wallpaper App (Partial payment for project) (AUD)	MILESTONE_PAYMENT	800.00	AUD	\N	FREELANCER	iPhone Notes Wallpaper App	Thuvarakan M.	\N	\N	\N	2026-01-06 19:43:14.885	2026-01-06 19:43:14.885
5f3853ad-5665-4a79-b640-38581e410ed4	2025-12-10 09:51:00	Exam fee - PHP5 - Level 3 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.886	2026-01-06 19:43:14.886
bbcd2ea8-90da-4f83-9718-9e0ffadcc1d3	2025-12-10 09:27:00	Exam fee - Java - Level 3 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.888	2026-01-06 19:43:14.888
c5a033b4-f2e9-4979-bb29-7ff0ffd1abf0	2025-12-10 09:14:00	Exam fee - Cloud Computing - Level 3 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.89	2026-01-06 19:43:14.89
ae6dd558-f72c-4191-ab4a-3032a161c1a2	2025-12-10 09:00:00	Exam fee - HTML5 - Level 3 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.891	2026-01-06 19:43:14.891
aba76231-8fe5-44cb-b9ba-b36190710d42	2025-12-10 07:53:00	Project fee taken (iPhone Notes Wallpaper App) (AUD)	PROJECT_FEE	-50.00	AUD	\N	FREELANCER	iPhone Notes Wallpaper App	\N	\N	\N	\N	2026-01-06 19:43:14.892	2026-01-06 19:43:14.892
f6af66d8-0981-4497-909d-29b1a5937bff	2025-12-10 06:50:00	Exam fee - Android - Level 3 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.894	2026-01-06 19:43:14.894
80300bb5-df75-4e9a-b464-b1173d24e401	2025-12-08 05:09:00	Project fee taken (Aquaxchange phase 2) (GBP)	PROJECT_FEE	-30.00	GBP	\N	FREELANCER	Aquaxchange phase 2	\N	\N	\N	\N	2026-01-06 19:43:14.895	2026-01-06 19:43:14.895
898901e5-70d7-4449-909a-89271bd82a13	2025-12-02 12:59:00	Hourly project fee taken (Immediate Front-End Fixes via AnyDesk) (USD)	HOURLY_FEE	-0.60	USD	\N	FREELANCER	Immediate Front-End Fixes via AnyDesk	\N	\N	\N	\N	2026-01-06 19:43:14.897	2026-01-06 19:43:14.897
50ff01f5-a772-4d7b-95e5-f80fb2cd9a8d	2025-12-02 12:59:00	Done milestone payment from Mark R. for project Immediate Front-End Fixes via AnyDesk (Partial payment for project) (USD)	MILESTONE_PAYMENT	6.00	USD	\N	FREELANCER	Immediate Front-End Fixes via AnyDesk	Mark R.	\N	\N	\N	2026-01-06 19:43:14.9	2026-01-06 19:43:14.9
218fa23c-8867-4401-83cc-c9b003e1f7de	2025-12-02 12:57:00	Hourly project fee taken (Immediate Front-End Fixes via AnyDesk) (USD)	HOURLY_FEE	-6.90	USD	\N	FREELANCER	Immediate Front-End Fixes via AnyDesk	\N	\N	\N	\N	2026-01-06 19:43:14.901	2026-01-06 19:43:14.901
ec6399e1-7074-479e-97b5-db176443e924	2025-12-02 12:57:00	Done milestone payment from Mark R. for project Immediate Front-End Fixes via AnyDesk (Partial payment for project) (USD)	MILESTONE_PAYMENT	69.00	USD	\N	FREELANCER	Immediate Front-End Fixes via AnyDesk	Mark R.	\N	\N	\N	2026-01-06 19:43:14.903	2026-01-06 19:43:14.903
1cce7a6a-eb11-4f6d-9edd-20bb8a3f0164	2025-12-01 20:40:00	Express withdrawal  (PKR)	WITHDRAWAL	-245156.16	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.905	2026-01-06 19:43:14.905
671229be-1448-487c-9884-82b4d60245e8	2025-11-28 02:55:00	Hourly project fee taken (Project for RedstoneCatalyst) (USD)	HOURLY_FEE	-0.42	USD	\N	FREELANCER	Project for RedstoneCatalyst	\N	\N	\N	\N	2026-01-06 19:43:14.906	2026-01-06 19:43:14.906
53d76b9c-8c60-46fd-b771-dec940d840dc	2025-11-28 02:55:00	Done milestone payment from Mark R. for project Project for RedstoneCatalyst (Partial payment for project) (USD)	MILESTONE_PAYMENT	4.17	USD	\N	FREELANCER	Project for RedstoneCatalyst	Mark R.	\N	\N	\N	2026-01-06 19:43:14.908	2026-01-06 19:43:14.908
da525764-a512-48d8-a5f9-af0fc9190036	2025-11-26 18:39:00	Done milestone payment from Yianni A. for project Full UI Design Overhaul - Web App (Partial payment for project) (USD)	MILESTONE_PAYMENT	200.00	USD	\N	FREELANCER	Full UI Design Overhaul - Web App	Yianni A.	\N	\N	\N	2026-01-06 19:43:14.909	2026-01-06 19:43:14.909
513a402e-9de8-4b63-b9eb-b4f024565dcf	2025-11-24 15:26:00	Hourly project fee taken (Project for RedstoneCatalyst) (USD)	HOURLY_FEE	-12.08	USD	\N	FREELANCER	Project for RedstoneCatalyst	\N	\N	\N	\N	2026-01-06 19:43:14.912	2026-01-06 19:43:14.912
5620283a-c38e-43f5-929f-f2ce47aaff4f	2025-11-24 15:26:00	Done milestone payment from Mark R. for project Project for RedstoneCatalyst (Partial payment for project) (USD)	MILESTONE_PAYMENT	120.83	USD	\N	FREELANCER	Project for RedstoneCatalyst	Mark R.	\N	\N	\N	2026-01-06 19:43:14.914	2026-01-06 19:43:14.914
cd3cd67b-4b70-41cb-94a5-f94c35af990b	2025-11-23 02:30:00	Project fee taken (Full UI Design Overhaul - Web App) (USD)	PROJECT_FEE	-75.00	USD	\N	FREELANCER	Full UI Design Overhaul - Web App	\N	\N	\N	\N	2026-01-06 19:43:14.915	2026-01-06 19:43:14.915
e1ac7f10-2fd8-461b-949c-3cbf2e6c1c54	2025-11-22 19:22:00	Project fee taken (Magento 2-Shopify SEO Migration) (EUR)	PROJECT_FEE	-90.00	EUR	\N	FREELANCER	Magento 2-Shopify SEO Migration	\N	\N	\N	\N	2026-01-06 19:43:14.917	2026-01-06 19:43:14.917
6b1b045e-3d46-4db7-be72-d0e43fefc781	2025-11-18 14:29:00	Hourly project fee taken (Shopify Image Stabilization Pipeline WORK ON ANYDESK ) (USD)	HOURLY_FEE	-8.75	USD	\N	FREELANCER	Shopify Image Stabilization Pipeline WORK ON ANYDESK	\N	\N	\N	\N	2026-01-06 19:43:14.919	2026-01-06 19:43:14.919
57f65f5b-349f-4739-86fa-176e0cc81bf1	2025-11-18 14:29:00	Done milestone payment from Mark R. for project Shopify Image Stabilization Pipeline WORK ON ANYDESK  (Partial payment for project) (USD)	MILESTONE_PAYMENT	87.50	USD	\N	FREELANCER	Shopify Image Stabilization Pipeline WORK ON ANYDESK	Mark R.	\N	\N	\N	2026-01-06 19:43:14.921	2026-01-06 19:43:14.921
fbcb0b59-f649-47b0-8bc5-92f0b2c8142f	2025-11-18 14:29:00	Hourly project fee taken (Shopify Image Stabilization Pipeline WORK ON ANYDESK ) (USD)	HOURLY_FEE	-1.25	USD	\N	FREELANCER	Shopify Image Stabilization Pipeline WORK ON ANYDESK	\N	\N	\N	\N	2026-01-06 19:43:14.922	2026-01-06 19:43:14.922
38926bb1-2138-42b0-b472-1a4b29284a5c	2025-11-18 14:29:00	Done milestone payment from Mark R. for project Shopify Image Stabilization Pipeline WORK ON ANYDESK  (Partial payment for project) (USD)	MILESTONE_PAYMENT	12.50	USD	\N	FREELANCER	Shopify Image Stabilization Pipeline WORK ON ANYDESK	Mark R.	\N	\N	\N	2026-01-06 19:43:14.924	2026-01-06 19:43:14.924
8fee8325-8d8a-4cfa-8d6f-55295cbda28b	2025-11-16 20:45:00	Express withdrawal  (PKR)	WITHDRAWAL	-192000.06	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.925	2026-01-06 19:43:14.925
64997814-62b8-4dc6-97b0-dd093e7a0492	2025-11-16 10:42:00	Preferred freelancer program project fee taken (Social Media Platform Upgrade) (EUR)	PREFERRED_FEE	-105.00	EUR	\N	FREELANCER	Social Media Platform Upgrade	\N	\N	\N	\N	2026-01-06 19:43:14.926	2026-01-06 19:43:14.926
6649dfac-93c4-4711-a98d-63ce2a42a9a5	2025-11-16 10:42:00	Done milestone payment from Mareks V. for project Social Media Platform Upgrade (Partial payment for project) (EUR)	MILESTONE_PAYMENT	700.00	EUR	\N	FREELANCER	Social Media Platform Upgrade	Mareks V.	\N	\N	\N	2026-01-06 19:43:14.928	2026-01-06 19:43:14.928
af61741c-ad9a-4c00-8f84-8c2ea5035bbc	2025-11-14 02:38:00	Exam fee - Xcode4 - Level 3 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.93	2026-01-06 19:43:14.93
70ce0944-61d1-4b20-9055-3d4e1b67007e	2025-11-14 02:22:00	Exam fee - Android - Level 3 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.931	2026-01-06 19:43:14.931
a82d249b-1658-4246-8dff-f708ffb2ba6c	2025-11-14 02:11:00	Exam fee - AI Training - Freelancer Global Fleet - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.933	2026-01-06 19:43:14.933
c2ae43ff-5e5c-4f44-8ca8-f152005f670a	2025-11-14 01:55:00	Exam fee - WordPress - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.934	2026-01-06 19:43:14.934
4e99f9a5-12c0-452c-b4a9-e4c2773b686e	2025-11-14 01:51:00	Exam fee - HTML - Level 1 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.936	2026-01-06 19:43:14.936
73fdc20a-79b7-47c7-a8b9-2997b22ac5fb	2025-11-13 14:56:00	Project fee taken (Aquaxchange project ) (USD)	PROJECT_FEE	-20.00	USD	\N	FREELANCER	Aquaxchange project	\N	\N	\N	\N	2026-01-06 19:43:14.938	2026-01-06 19:43:14.938
8b4636ef-a552-4968-97a3-eeae46f572a5	2025-11-13 14:56:00	Done milestone payment from Charlie T. for project Aquaxchange project  (Partial payment for project) (USD)	MILESTONE_PAYMENT	200.00	USD	\N	FREELANCER	Aquaxchange project	Charlie T.	\N	\N	\N	2026-01-06 19:43:14.94	2026-01-06 19:43:14.94
fd508e6d-b886-4241-a9b8-85f958d875cc	2025-11-10 12:07:00	Done milestone payment from Maram A. for project Functional Bug Hunter Game Development (Partial payment for project) (USD)	MILESTONE_PAYMENT	75.00	USD	\N	FREELANCER	Functional Bug Hunter Game Development	Maram A.	\N	\N	\N	2026-01-06 19:43:14.942	2026-01-06 19:43:14.942
20cb69ad-4bf5-4768-af1a-de3b67c04c27	2025-11-10 12:02:00	Done milestone payment from Maram A. for project Functional Bug Hunter Game Development (Partial payment for project) (USD)	MILESTONE_PAYMENT	75.00	USD	\N	FREELANCER	Functional Bug Hunter Game Development	Maram A.	\N	\N	\N	2026-01-06 19:43:14.944	2026-01-06 19:43:14.944
772ed2cb-ea96-4508-91f6-530899f92c10	2025-11-08 08:40:00	Project fee taken (Functional Bug Hunter Game Development) (USD)	PROJECT_FEE	-15.00	USD	\N	FREELANCER	Functional Bug Hunter Game Development	\N	\N	\N	\N	2026-01-06 19:43:14.945	2026-01-06 19:43:14.945
ee94a41a-86eb-4dcc-83ed-467a8c9696b8	2025-11-08 05:23:00	Done milestone payment from Charlie T. for project Aquaxchange project  (Partial payment for project) (USD)	MILESTONE_PAYMENT	400.00	USD	\N	FREELANCER	Aquaxchange project	Charlie T.	\N	\N	\N	2026-01-06 19:43:14.947	2026-01-06 19:43:14.947
b7531e13-5911-48ec-b494-59ce870a6688	2025-10-20 05:10:00	Express withdrawal  (PKR)	WITHDRAWAL	-410047.85	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.949	2026-01-06 19:43:14.949
e1e45c6f-6078-4279-b2ee-8165b71d9183	2025-10-13 14:26:00	Project fee taken (Automotive ECU Tuning Portal Development) (USD)	PROJECT_FEE	-50.00	USD	\N	FREELANCER	Automotive ECU Tuning Portal Development	\N	\N	\N	\N	2026-01-06 19:43:14.95	2026-01-06 19:43:14.95
5976cfbc-8c7c-4c97-8d40-0549e7901d9c	2025-10-13 14:26:00	Done milestone payment from Hesham Ahmed H. for project Automotive ECU Tuning Portal Development (Partial payment for project) (USD)	MILESTONE_PAYMENT	500.00	USD	\N	FREELANCER	Automotive ECU Tuning Portal Development	\N	\N	\N	\N	2026-01-06 19:43:14.952	2026-01-06 19:43:14.952
c0d11fdf-8a9f-4ada-b514-2a44b5b44d49	2025-10-08 08:36:00	Membership (corporate) annual fee (from 2025-10-08 to 2026-10-08) (USD)	MEMBERSHIP	-166.80	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.953	2026-01-06 19:43:14.953
6d8a0985-305a-4c56-8aee-9dc290965027	2025-10-08 07:56:00	Membership (premier) annual fee (from 2025-10-08 to 2026-10-08) (USD)	MEMBERSHIP	-958.80	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.955	2026-01-06 19:43:14.955
618e35d3-7afa-4cdc-9a89-7dfa1156a172	2025-10-06 10:41:00	Done milestone payment from Charlie T. for project Aquaxchange project  (Partial payment for project) (USD)	MILESTONE_PAYMENT	400.00	USD	\N	FREELANCER	Aquaxchange project	Charlie T.	\N	\N	\N	2026-01-06 19:43:14.956	2026-01-06 19:43:14.956
1c5fccd3-7a8e-4f4e-bab3-ed7ca469a65d	2025-10-03 17:39:00	Hourly project fee taken (Fix Shopify Craft Theme Issues) (USD)	HOURLY_FEE	-7.50	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	\N	\N	\N	\N	2026-01-06 19:43:14.958	2026-01-06 19:43:14.958
ccc08827-5e35-43f7-9cff-4499140bbf63	2025-10-03 17:39:00	Done milestone payment from Mark R. for project Fix Shopify Craft Theme Issues (Partial payment for project) (USD)	MILESTONE_PAYMENT	75.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	Mark R.	\N	\N	\N	2026-01-06 19:43:14.96	2026-01-06 19:43:14.96
2a3e44c1-97f6-4bc7-a206-254d99526fb4	2025-10-02 13:44:00	Hourly project fee taken (Fix Shopify Craft Theme Issues) (USD)	HOURLY_FEE	-12.50	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	\N	\N	\N	\N	2026-01-06 19:43:14.961	2026-01-06 19:43:14.961
627c6bda-7432-441f-907f-9a92046f4a8b	2025-10-02 13:44:00	Done milestone payment from Mark R. for project Fix Shopify Craft Theme Issues (Partial payment for project) (USD)	MILESTONE_PAYMENT	125.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	Mark R.	\N	\N	\N	2026-01-06 19:43:14.962	2026-01-06 19:43:14.962
48ec2ba4-e04d-4e87-a160-d4f8c1e4628b	2025-10-01 21:03:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-225.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:14.964	2026-01-06 19:43:14.964
238366f2-6aba-4d3f-b259-6dbb1772f113	2025-10-01 21:03:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	1500.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:14.965	2026-01-06 19:43:14.965
76a9edb1-da8c-4162-8199-85ab12f14571	2025-10-01 15:01:00	Hourly project fee taken (Fix Shopify Craft Theme Issues) (USD)	HOURLY_FEE	-3.40	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	\N	\N	\N	\N	2026-01-06 19:43:14.967	2026-01-06 19:43:14.967
ccdf73c8-b0fc-4510-bd73-ac725bc8d7e8	2025-10-01 15:01:00	Done milestone payment from Mark R. for project Fix Shopify Craft Theme Issues (Partial payment for project) (USD)	MILESTONE_PAYMENT	34.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	Mark R.	\N	\N	\N	2026-01-06 19:43:14.968	2026-01-06 19:43:14.968
effba4ae-839e-4318-a783-d1c8b5a5281e	2025-10-01 14:56:00	Hourly project fee taken (Fix Shopify Craft Theme Issues) (USD)	HOURLY_FEE	-10.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	\N	\N	\N	\N	2026-01-06 19:43:14.969	2026-01-06 19:43:14.969
c5e1b16e-b193-4565-95cd-cd2af591ac13	2025-10-01 14:56:00	Done milestone payment from Mark R. for project Fix Shopify Craft Theme Issues (Partial payment for project) (USD)	MILESTONE_PAYMENT	100.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	Mark R.	\N	\N	\N	2026-01-06 19:43:14.97	2026-01-06 19:43:14.97
9219bc36-73b4-4467-8872-16a0f620ed6b	2025-10-01 05:11:00	Express withdrawal  (PKR)	WITHDRAWAL	-310411.42	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.972	2026-01-06 19:43:14.972
83e46582-d999-421a-8aa4-b8a43df86482	2025-09-30 14:29:00	Hourly project fee taken (Fix Shopify Craft Theme Issues) (USD)	HOURLY_FEE	-15.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	\N	\N	\N	\N	2026-01-06 19:43:14.973	2026-01-06 19:43:14.973
4dc6e1b5-432c-4a7e-87f5-e03b316dd39c	2025-09-30 14:29:00	Done milestone payment from Mark R. for project Fix Shopify Craft Theme Issues (Partial payment for project) (USD)	MILESTONE_PAYMENT	150.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	Mark R.	\N	\N	\N	2026-01-06 19:43:14.975	2026-01-06 19:43:14.975
c6789a61-7892-4c55-a651-789d584c384e	2025-09-29 18:35:00	Hourly project fee taken (Fix Shopify Craft Theme Issues) (USD)	HOURLY_FEE	-7.50	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	\N	\N	\N	\N	2026-01-06 19:43:14.976	2026-01-06 19:43:14.976
ec78a93f-d38e-4fb4-a19d-e794352c7428	2025-09-29 18:35:00	Done milestone payment from Mark R. for project Fix Shopify Craft Theme Issues (Partial payment for project) (USD)	MILESTONE_PAYMENT	75.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	Mark R.	\N	\N	\N	2026-01-06 19:43:14.977	2026-01-06 19:43:14.977
fb092cf5-d11e-41c3-91de-94e773005898	2025-09-29 18:35:00	Hourly project fee taken (Fix Shopify Craft Theme Issues) (USD)	HOURLY_FEE	-2.50	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	\N	\N	\N	\N	2026-01-06 19:43:14.978	2026-01-06 19:43:14.978
20ff126f-ee9e-4a7e-8725-b6e2956a5a90	2025-09-29 18:35:00	Done milestone payment from Mark R. for project Fix Shopify Craft Theme Issues (Partial payment for project) (USD)	MILESTONE_PAYMENT	25.00	USD	\N	FREELANCER	Fix Shopify Craft Theme Issues	Mark R.	\N	\N	\N	2026-01-06 19:43:14.98	2026-01-06 19:43:14.98
31c139fb-6f71-4daf-85c8-ae1b56bd05bb	2025-09-26 13:26:00	Preferred freelancer program project fee taken (MyGo API Integration for WordPress Site) (USD)	PREFERRED_FEE	-22.50	USD	\N	FREELANCER	MyGo API Integration for WordPress Site	\N	\N	\N	\N	2026-01-06 19:43:14.982	2026-01-06 19:43:14.982
b491cb5b-f325-42db-a9cb-8da08551a155	2025-09-26 13:26:00	Done milestone payment from Ahmed N. for project MyGo API Integration for WordPress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	150.00	USD	\N	FREELANCER	MyGo API Integration for WordPress Site	Ahmed N.	\N	\N	\N	2026-01-06 19:43:14.984	2026-01-06 19:43:14.984
f8f8134b-0e21-4dd8-a15b-2e061da329ed	2025-09-16 05:52:00	Project fee taken (Flutter or MERN Stack Developer to Convert Figma Files into a Functional App) (EUR)	PROJECT_FEE	-5.00	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	\N	\N	\N	\N	2026-01-06 19:43:14.986	2026-01-06 19:43:14.986
a56b6ac6-10bd-4ded-a230-4b18a5e94f3e	2025-09-16 05:52:00	Done milestone payment from Marc T. for project Flutter or MERN Stack Developer to Convert Figma Files into a Functional App (Partial payment for project) (EUR)	MILESTONE_PAYMENT	50.00	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	Marc T.	\N	\N	\N	2026-01-06 19:43:14.988	2026-01-06 19:43:14.988
5a34fd90-71cb-479c-bcd8-feed86a47061	2025-09-15 14:31:00	Done milestone payment from Hesham Ahmed H. for project Automotive ECU Tuning Portal Development (Partial payment for project) (USD)	MILESTONE_PAYMENT	500.00	USD	\N	FREELANCER	Automotive ECU Tuning Portal Development	\N	\N	\N	\N	2026-01-06 19:43:14.99	2026-01-06 19:43:14.99
76324cf2-9053-4c5e-9c46-f5d5f12a864f	2025-09-11 21:45:00	Express withdrawal  (PKR)	WITHDRAWAL	-447566.79	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.991	2026-01-06 19:43:14.991
58b320fa-cb6e-4fe4-92d1-4150ea849af7	2025-09-11 07:21:00	Project fee taken (Mobile App With Web Admin Portal) (CAD)	PROJECT_FEE	-75.00	CAD	\N	FREELANCER	Mobile App With Web Admin Portal	\N	\N	\N	\N	2026-01-06 19:43:14.993	2026-01-06 19:43:14.993
8dbfd865-9921-46c5-9249-87630156936c	2025-09-11 07:21:00	Offsite payment (custom) fee (Mobile App With Web Admin Portal) (CAD)	PROJECT_FEE	-225.00	CAD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:14.995	2026-01-06 19:43:14.995
b75f0985-44b2-41cd-abc6-372b0dcb5285	2025-09-10 13:32:00	Preferred freelancer program project fee taken (Social Media Platform Upgrade) (EUR)	PREFERRED_FEE	-105.00	EUR	\N	FREELANCER	Social Media Platform Upgrade	\N	\N	\N	\N	2026-01-06 19:43:14.997	2026-01-06 19:43:14.997
9ea39430-2e5f-4ba9-bdc9-ceb6949d86fd	2025-09-10 13:32:00	Done milestone payment from Mareks V. for project Social Media Platform Upgrade (Partial payment for project) (EUR)	MILESTONE_PAYMENT	700.00	EUR	\N	FREELANCER	Social Media Platform Upgrade	Mareks V.	\N	\N	\N	2026-01-06 19:43:14.998	2026-01-06 19:43:14.998
a84c74b2-331c-4c47-98dd-b01226e530a0	2025-09-10 07:22:00	Preferred freelancer program project fee taken (MyGo API Integration for WordPress Site) (USD)	PREFERRED_FEE	-52.50	USD	\N	FREELANCER	MyGo API Integration for WordPress Site	\N	\N	\N	\N	2026-01-06 19:43:15	2026-01-06 19:43:15
b451a3bb-f3ae-4c88-8363-df33404058c7	2025-09-10 07:22:00	Done milestone payment from Ahmed N. for project MyGo API Integration for WordPress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	350.00	USD	\N	FREELANCER	MyGo API Integration for WordPress Site	Ahmed N.	\N	\N	\N	2026-01-06 19:43:15.002	2026-01-06 19:43:15.002
1364ddcb-3e80-4b30-9c5d-41929bb457ee	2025-09-09 07:59:00	Project fee taken (Flutter or MERN Stack Developer to Convert Figma Files into a Functional App) (EUR)	PROJECT_FEE	-10.50	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	\N	\N	\N	\N	2026-01-06 19:43:15.004	2026-01-06 19:43:15.004
2558f667-dcc2-4882-9d23-7cb0e38cf426	2025-09-09 07:59:00	Done milestone payment from Marc T. for project Flutter or MERN Stack Developer to Convert Figma Files into a Functional App (Partial payment for project) (EUR)	MILESTONE_PAYMENT	215.00	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	Marc T.	\N	\N	\N	2026-01-06 19:43:15.005	2026-01-06 19:43:15.005
848ec25b-7627-41d5-89f1-07f4e86e82d8	2025-09-03 11:19:00	Done milestone payment from Charlie T. for project Aquaxchange project  (Partial payment for project) (USD)	MILESTONE_PAYMENT	400.00	USD	\N	FREELANCER	Aquaxchange project	Charlie T.	\N	\N	\N	2026-01-06 19:43:15.006	2026-01-06 19:43:15.006
eb59933d-9569-4264-8ef2-847967de8004	2025-08-27 13:51:00	Preferred freelancer program project fee taken (MyGo API Integration for WordPress Site) (USD)	PREFERRED_FEE	-60.00	USD	\N	FREELANCER	MyGo API Integration for WordPress Site	\N	\N	\N	\N	2026-01-06 19:43:15.007	2026-01-06 19:43:15.007
11b0757d-0247-42ff-a243-f7066a4309ef	2025-08-27 13:51:00	Done milestone payment from Ahmed N. for project MyGo API Integration for WordPress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	400.00	USD	\N	FREELANCER	MyGo API Integration for WordPress Site	Ahmed N.	\N	\N	\N	2026-01-06 19:43:15.008	2026-01-06 19:43:15.008
f6bf0ec3-bda3-4aed-b29a-fdaaca3526ae	2025-08-21 19:49:00	Done milestone payment from Hesham Ahmed H. for project Automotive ECU Tuning Portal Development (Partial payment for project) (USD)	MILESTONE_PAYMENT	500.00	USD	\N	FREELANCER	Automotive ECU Tuning Portal Development	\N	\N	\N	\N	2026-01-06 19:43:15.01	2026-01-06 19:43:15.01
603bbfdd-2791-4aab-9bb6-0c27f3f288a9	2025-08-18 12:44:00	Project fee taken (Aquaxchange project ) (USD)	PROJECT_FEE	-120.00	USD	\N	FREELANCER	Aquaxchange project	\N	\N	\N	\N	2026-01-06 19:43:15.011	2026-01-06 19:43:15.011
521cc2f6-0be8-4733-a5a4-2db6c3f0fcfb	2025-08-11 21:45:00	Express withdrawal  (PKR)	WITHDRAWAL	-931057.70	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.013	2026-01-06 19:43:15.013
819313f9-b5a0-4855-8e89-ea849ea7f659	2025-08-08 22:12:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-300.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.015	2026-01-06 19:43:15.015
f83bc602-633f-427d-8021-1466f8d097de	2025-08-08 22:12:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	2000.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.016	2026-01-06 19:43:15.016
363c8c8f-94e7-4ed1-b874-cb19e9035c2d	2025-08-06 12:14:00	Preferred freelancer program project fee taken (iOS Object Recognition App for the Visually Impaired) (USD)	PREFERRED_FEE	-30.00	USD	\N	FREELANCER	iOS Object Recognition App for the Visually Impaired	\N	\N	\N	\N	2026-01-06 19:43:15.017	2026-01-06 19:43:15.017
c1d17cff-8861-43eb-9a1c-81e803c05db0	2025-08-06 12:14:00	Done milestone payment from Saud A. for project iOS Object Recognition App for the Visually Impaired (Partial payment for project) (USD)	MILESTONE_PAYMENT	200.00	USD	\N	FREELANCER	iOS Object Recognition App for the Visually Impaired	Saud A.	\N	\N	\N	2026-01-06 19:43:15.018	2026-01-06 19:43:15.018
b2f9fdab-383a-45a9-acd2-26e9fbc1cc3e	2025-08-01 08:11:00	Done milestone payment from Marc T. for project Flutter or MERN Stack Developer to Convert Figma Files into a Functional App (Partial payment for project) (EUR)	MILESTONE_PAYMENT	180.00	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	Marc T.	\N	\N	\N	2026-01-06 19:43:15.019	2026-01-06 19:43:15.019
152e3cff-7af1-4e05-8e95-5c7c4e37f0a7	2025-07-31 14:29:00	Done milestone payment from Hesham Ahmed H. for project Automotive ECU Tuning Portal Development (Partial payment for project) (USD)	MILESTONE_PAYMENT	500.00	USD	\N	FREELANCER	Automotive ECU Tuning Portal Development	\N	\N	\N	\N	2026-01-06 19:43:15.021	2026-01-06 19:43:15.021
7b4eaaf8-9c81-41bc-942b-c7a0b36b44b5	2025-07-30 01:35:00	Express withdrawal  (PKR)	WITHDRAWAL	-867824.16	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.022	2026-01-06 19:43:15.022
51527007-4f6f-4364-bb3b-b604b2f407a1	2025-07-28 16:57:00	Preferred freelancer program project fee taken (Dual Platform LLM & Video App - 23/03/2025 10:24 EDT) (GBP)	PREFERRED_FEE	-112.50	GBP	\N	FREELANCER	Dual Platform LLM & Video App - 23/03/2025 10:24 EDT	\N	\N	\N	\N	2026-01-06 19:43:15.024	2026-01-06 19:43:15.024
54bd872d-81a4-48b5-a55d-ed955f52c0f4	2025-07-28 16:57:00	Done milestone payment from Lucas L. for project Dual Platform LLM & Video App - 23/03/2025 10:24 EDT (Partial payment for project) (GBP)	MILESTONE_PAYMENT	750.00	GBP	\N	FREELANCER	Dual Platform LLM & Video App - 23/03/2025 10:24 EDT	Lucas L.	\N	\N	\N	2026-01-06 19:43:15.026	2026-01-06 19:43:15.026
4aec3270-720f-4d72-94db-5b91442ad18c	2025-07-28 12:24:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-3.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.028	2026-01-06 19:43:15.028
70c548d3-6444-49d1-ae9b-34d4e21cfaa5	2025-07-28 12:24:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	20.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.029	2026-01-06 19:43:15.029
41927370-bac8-47c5-9028-d1d881f94c0e	2025-07-24 14:19:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-45.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.03	2026-01-06 19:43:15.03
89e7fa62-38b4-4600-91b0-204aae9c7c0a	2025-07-24 14:19:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	300.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.033	2026-01-06 19:43:15.033
2d2dd47d-fbfc-44a8-a383-9bcffd001438	2025-07-24 14:19:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-300.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.034	2026-01-06 19:43:15.034
a9c39c4c-c7f8-438e-9af5-b0c4007f13f3	2025-07-24 14:19:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	2000.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.035	2026-01-06 19:43:15.035
cb957f3a-ad64-4d1c-ba5a-7d01a9e2e0cf	2025-07-18 07:34:00	Project fee taken (Automotive ECU Tuning Portal Development) (USD)	PROJECT_FEE	-150.00	USD	\N	FREELANCER	Automotive ECU Tuning Portal Development	\N	\N	\N	\N	2026-01-06 19:43:15.036	2026-01-06 19:43:15.036
4c366875-3f03-4b99-86c4-de05b60802ce	2025-07-17 18:17:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-75.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.038	2026-01-06 19:43:15.038
1e51acdd-d16b-4332-98b3-94c8911688a5	2025-07-17 18:17:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	500.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.04	2026-01-06 19:43:15.04
d83f387f-50dc-4c9f-bf36-ee21294ee898	2025-07-16 21:20:00	Express withdrawal  (PKR)	WITHDRAWAL	-806432.99	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.041	2026-01-06 19:43:15.041
d5427d05-a8ca-4c8f-b25f-cf8910717d7d	2025-07-15 17:24:00	Preferred freelancer program project fee taken (Social Media Platform Upgrade) (EUR)	PREFERRED_FEE	-150.00	EUR	\N	FREELANCER	Social Media Platform Upgrade	\N	\N	\N	\N	2026-01-06 19:43:15.043	2026-01-06 19:43:15.043
511d929c-0917-4391-80ae-d318e788b574	2025-07-15 17:24:00	Done milestone payment from Mareks V. for project Social Media Platform Upgrade (Partial payment for project) (EUR)	MILESTONE_PAYMENT	1000.00	EUR	\N	FREELANCER	Social Media Platform Upgrade	Mareks V.	\N	\N	\N	2026-01-06 19:43:15.045	2026-01-06 19:43:15.045
dba8f25e-af9f-4033-9849-e397f7f62033	2025-07-09 15:40:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-225.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.046	2026-01-06 19:43:15.046
7edcb852-278a-4dc6-becf-28593af5606f	2025-07-09 15:40:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	1500.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.048	2026-01-06 19:43:15.048
2b126968-be6b-4848-96a5-19d97b8e7055	2025-07-08 08:33:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-37.50	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.049	2026-01-06 19:43:15.049
07e80145-1b8e-4a43-8195-170c65b63bbd	2025-07-08 08:33:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	250.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.051	2026-01-06 19:43:15.051
1bb09dd5-7e03-4a23-912a-5ab957fdb529	2025-07-08 07:59:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-45.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.052	2026-01-06 19:43:15.052
cafb4d8d-9794-4b56-ab5e-b3e013978e01	2025-07-08 07:59:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	300.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.053	2026-01-06 19:43:15.053
edd5e9e2-8f85-4789-b8ca-c01fa3711c7c	2025-07-01 08:49:00	Refund on [Arbitration fee for dispute #681036 (Modern Sourdough Bakery Logo) (USD) from 06/30/2025 at 8:54 CDT] (USD)	REFUND	5.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.055	2026-01-06 19:43:15.055
c24ce5a2-76e2-4ede-be72-33c27ff851ab	2025-07-01 08:49:00	Transfer from alyssaw33 for project Modern Sourdough Bakery Logo (Partial payment for project) (USD)	MILESTONE_PAYMENT	14.00	USD	\N	FREELANCER	Modern Sourdough Bakery Logo	\N	\N	\N	\N	2026-01-06 19:43:15.056	2026-01-06 19:43:15.056
0bdc372e-eb25-4429-a923-b1af4ef3c85b	2025-06-30 13:40:00	Done milestone payment from Marc T. for project Flutter or MERN Stack Developer to Convert Figma Files into a Functional App (Partial payment for project) (EUR)	MILESTONE_PAYMENT	140.00	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	Marc T.	\N	\N	\N	2026-01-06 19:43:15.057	2026-01-06 19:43:15.057
2c3883f3-0734-425b-9872-0ea42ffc2b02	2025-06-30 13:26:00	Done milestone payment from Marc T. for project Flutter or MERN Stack Developer to Convert Figma Files into a Functional App (Partial payment for project) (EUR)	MILESTONE_PAYMENT	180.00	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	Marc T.	\N	\N	\N	2026-01-06 19:43:15.059	2026-01-06 19:43:15.059
c260b584-8848-4d95-80c2-258c2236d3ad	2025-06-30 10:54:00	Arbitration fee for dispute #681036 (Modern Sourdough Bakery Logo) (USD)	ARBITRATION	-5.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.06	2026-01-06 19:43:15.06
8db022b6-3c84-4cc5-bd08-fdd2ced8fccd	2025-06-26 21:45:00	Express withdrawal  (PKR)	WITHDRAWAL	-608147.02	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.061	2026-01-06 19:43:15.061
5f9d878b-01f1-4483-8bf0-9d5a1d7fd8fa	2025-06-25 17:50:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-120.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.062	2026-01-06 19:43:15.062
0581acf4-7202-45a3-99c4-56446e6649ff	2025-06-25 17:50:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	800.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.063	2026-01-06 19:43:15.063
6968e73e-2019-439b-a725-b78307bca55b	2025-06-25 17:49:00	Preferred freelancer program project fee taken (Custom Image Uploader to Wordpress Site) (USD)	PREFERRED_FEE	-30.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	\N	\N	\N	\N	2026-01-06 19:43:15.064	2026-01-06 19:43:15.064
cdc69762-4b20-45ba-8c64-00c691a65aeb	2025-06-25 17:49:00	Done milestone payment from Chelle A. for project Custom Image Uploader to Wordpress Site (Partial payment for project) (USD)	MILESTONE_PAYMENT	200.00	USD	\N	FREELANCER	Custom Image Uploader to Wordpress Site	Chelle A.	\N	\N	\N	2026-01-06 19:43:15.066	2026-01-06 19:43:15.066
c7b019df-b4dd-482d-b2b6-8d7608970dfe	2025-06-23 16:21:00	Preferred freelancer program project fee taken (Social Media Platform Upgrade) (EUR)	PREFERRED_FEE	-52.80	EUR	\N	FREELANCER	Social Media Platform Upgrade	\N	\N	\N	\N	2026-01-06 19:43:15.067	2026-01-06 19:43:15.067
1fb82de6-5fab-40f8-aee8-0e63347a91ca	2025-06-23 16:21:00	Done milestone payment from Mareks V. for project Social Media Platform Upgrade (Partial payment for project) (EUR)	MILESTONE_PAYMENT	352.00	EUR	\N	FREELANCER	Social Media Platform Upgrade	Mareks V.	\N	\N	\N	2026-01-06 19:43:15.068	2026-01-06 19:43:15.068
80ab1512-586a-4fcc-b88c-f3ba35dc6197	2025-06-23 09:51:00	Exam fee - PHP - Level 1 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.069	2026-01-06 19:43:15.069
bd9b91bd-faff-4bd4-b96d-b2a733274308	2025-06-23 09:35:00	Exam fee - PHP - Level 1 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.071	2026-01-06 19:43:15.071
98eae476-8d7a-4dea-8764-9f839646a7c6	2025-06-23 09:19:00	Exam fee - PHP - Level 1 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.072	2026-01-06 19:43:15.072
16ba5a85-f1d1-4d78-91e7-0bbdf0c29c63	2025-06-23 09:10:00	Exam fee - AI Training - Freelancer Global Fleet - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.073	2026-01-06 19:43:15.073
49210127-9687-4670-acc6-5f5a5b44e680	2025-06-19 13:42:00	Preferred freelancer program project fee taken (Dual Platform LLM & Video App - 23/03/2025 10:24 EDT) (GBP)	PREFERRED_FEE	-150.00	GBP	\N	FREELANCER	Dual Platform LLM & Video App - 23/03/2025 10:24 EDT	\N	\N	\N	\N	2026-01-06 19:43:15.074	2026-01-06 19:43:15.074
6329f335-5579-4c3f-8b9b-e5ec41a57287	2025-06-19 13:42:00	Done milestone payment from Lucas L. for project Dual Platform LLM & Video App - 23/03/2025 10:24 EDT (Partial payment for project) (GBP)	MILESTONE_PAYMENT	1000.00	GBP	\N	FREELANCER	Dual Platform LLM & Video App - 23/03/2025 10:24 EDT	Lucas L.	\N	\N	\N	2026-01-06 19:43:15.075	2026-01-06 19:43:15.075
456a06a1-5c24-48c5-b190-0eca187a909a	2025-06-18 14:03:00	Project fee taken (Forgedrigs Instagram promotion) (GBP)	PROJECT_FEE	-13.50	GBP	\N	FREELANCER	Forgedrigs Instagram promotion	\N	\N	\N	\N	2026-01-06 19:43:15.076	2026-01-06 19:43:15.076
58b53ff2-f67f-4d6b-a914-0d7108c12cf9	2025-06-18 14:03:00	Done milestone payment from Alexandr M. for project Forgedrigs Instagram promotion (Partial payment for project) (GBP)	MILESTONE_PAYMENT	135.00	GBP	\N	FREELANCER	Forgedrigs Instagram promotion	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.077	2026-01-06 19:43:15.077
9a4c9a19-f8d7-41b0-9b99-d173aa6a9766	2025-06-15 14:08:00	Preferred freelancer program project fee taken (Dual Platform LLM & Video App - 23/03/2025 10:24 EDT) (GBP)	PREFERRED_FEE	-45.00	GBP	\N	FREELANCER	Dual Platform LLM & Video App - 23/03/2025 10:24 EDT	\N	\N	\N	\N	2026-01-06 19:43:15.078	2026-01-06 19:43:15.078
f4755ead-13fd-4550-8d40-9ba313094cbb	2025-06-15 14:08:00	Done milestone payment from Lucas L. for project Dual Platform LLM & Video App - 23/03/2025 10:24 EDT (Partial payment for project) (GBP)	MILESTONE_PAYMENT	300.00	GBP	\N	FREELANCER	Dual Platform LLM & Video App - 23/03/2025 10:24 EDT	Lucas L.	\N	\N	\N	2026-01-06 19:43:15.08	2026-01-06 19:43:15.08
59b58ff1-4d90-4401-a685-81873aedaf6b	2025-06-13 19:17:00	Done milestone payment from Alyssa W. for project Modern Sourdough Bakery Logo (Partial payment for project) (USD)	MILESTONE_PAYMENT	14.00	USD	\N	FREELANCER	Modern Sourdough Bakery Logo	Alyssa W.	\N	\N	\N	2026-01-06 19:43:15.081	2026-01-06 19:43:15.081
b61e6573-2068-4e53-bb88-cc7e94f489da	2025-06-11 16:05:00	Project fee taken (Modern Sourdough Bakery Logo) (USD)	PROJECT_FEE	-5.00	USD	\N	FREELANCER	Modern Sourdough Bakery Logo	\N	\N	\N	\N	2026-01-06 19:43:15.082	2026-01-06 19:43:15.082
812f1a8b-ce63-4429-9674-495df2f3e64d	2025-06-11 07:32:00	Done milestone payment from Marc T. for project Flutter or MERN Stack Developer to Convert Figma Files into a Functional App (Partial payment for project) (EUR)	MILESTONE_PAYMENT	140.00	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	Marc T.	\N	\N	\N	2026-01-06 19:43:15.083	2026-01-06 19:43:15.083
dbeea98d-111c-401f-bfc0-7ca661226200	2025-06-01 19:44:00	Refund on [Project fee taken (Back-end fix  C++ language) (HKD) from 05/27/2025 at 3:37 EDT] (HKD)	PROJECT_FEE	1200.00	HKD	\N	FREELANCER	Back-end fix  C++ language	\N	\N	\N	\N	2026-01-06 19:43:15.084	2026-01-06 19:43:15.084
fdc59238-9d2e-4267-b8c8-c0ef0741ed96	2025-05-27 12:05:00	Done milestone payment from Jose P. for project Automated Monitoring and Interaction on Service Website (Partial payment for project) (USD)	MILESTONE_PAYMENT	150.00	USD	\N	FREELANCER	Automated Monitoring and Interaction on Service Website	Jose P.	\N	\N	\N	2026-01-06 19:43:15.085	2026-01-06 19:43:15.085
f5d94b23-4781-4053-8259-e7a1f9443e15	2025-05-27 04:37:00	Project fee taken (Back-end fix  C++ language) (HKD)	PROJECT_FEE	-1200.00	HKD	\N	FREELANCER	Back-end fix  C++ language	\N	\N	\N	\N	2026-01-06 19:43:15.086	2026-01-06 19:43:15.086
f67c6cef-93f9-4f6d-a9ff-aa976c4e0202	2025-05-21 11:43:00	Project fee taken (Flutter or MERN Stack Developer to Convert Figma Files into a Functional App) (EUR)	PROJECT_FEE	-75.00	EUR	\N	FREELANCER	Flutter or MERN Stack Developer to Convert Figma Files into a Functional App	\N	\N	\N	\N	2026-01-06 19:43:15.087	2026-01-06 19:43:15.087
9347ec6e-34f2-47d0-a51d-d8319f6670b1	2025-05-11 22:55:00	Express withdrawal  (PKR)	WITHDRAWAL	-330589.98	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.089	2026-01-06 19:43:15.089
19fa41dd-3d0a-4ec5-bb48-b44bd283c7d8	2025-05-07 10:58:00	Preferred freelancer program project fee taken (Flutter Developer Needed for Parking App MVP) (USD)	PREFERRED_FEE	-105.00	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	\N	\N	\N	\N	2026-01-06 19:43:15.09	2026-01-06 19:43:15.09
63b2ce53-2e9b-4f33-a749-a576fe25ff46	2025-05-07 10:58:00	Done milestone payment from Jacob S. for project Flutter Developer Needed for Parking App MVP (Partial payment for project) (USD)	MILESTONE_PAYMENT	700.00	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	Jacob S.	\N	\N	\N	2026-01-06 19:43:15.091	2026-01-06 19:43:15.091
a76119a6-3679-43a3-8d24-54d76fb36c3e	2025-04-30 17:49:00	Preferred freelancer program project fee taken (Flutter Developer Needed for Parking App MVP) (USD)	PREFERRED_FEE	-112.50	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	\N	\N	\N	\N	2026-01-06 19:43:15.092	2026-01-06 19:43:15.092
fc30c4b5-64cf-4755-9f17-c49688ba33ab	2025-04-30 17:49:00	Done milestone payment from Jacob S. for project Flutter Developer Needed for Parking App MVP (Partial payment for project) (USD)	MILESTONE_PAYMENT	750.00	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	Jacob S.	\N	\N	\N	2026-01-06 19:43:15.094	2026-01-06 19:43:15.094
54c7dc6f-9fd4-49f2-9393-ec22c4b249c0	2025-04-24 11:18:00	Exam fee - Python - Level 2 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.095	2026-01-06 19:43:15.095
b7637e34-d33c-47b1-bcb0-b8ccc3372a53	2025-04-21 21:55:00	Express withdrawal  (PKR)	WITHDRAWAL	-255015.32	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.097	2026-01-06 19:43:15.097
743315ac-ffb6-4ba8-b69d-470feb7aba8f	2025-04-16 10:03:00	Preferred freelancer program project fee taken (Flutter Developer Needed for Parking App MVP) (USD)	PREFERRED_FEE	-168.75	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	\N	\N	\N	\N	2026-01-06 19:43:15.098	2026-01-06 19:43:15.098
84d8fdc2-f72c-4f15-b463-18d406757d8d	2025-04-16 10:03:00	Done milestone payment from Jacob S. for project Flutter Developer Needed for Parking App MVP (Partial payment for project) (USD)	MILESTONE_PAYMENT	1125.00	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	Jacob S.	\N	\N	\N	2026-01-06 19:43:15.099	2026-01-06 19:43:15.099
7e26de97-c02d-4f47-bae9-1211c5f585d1	2025-04-10 21:40:00	Express withdrawal  (PKR)	WITHDRAWAL	-66700.49	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.1	2026-01-06 19:43:15.1
1f83abb2-437f-427a-9513-cbb9ebfc6647	2024-10-19 09:55:00	Project fee taken (On-Page SEO (one time)) (GBP)	PROJECT_FEE	-20.00	GBP	\N	FREELANCER	On-Page SEO (one time	\N	\N	\N	\N	2026-01-06 19:43:15.206	2026-01-06 19:43:15.206
e44fa1e6-b87c-4e35-b599-a7c3bc17aea6	2025-04-03 05:58:00	Refund on [Project fee taken (Node.js Expert for Parsing Data) (USD) from 03/23/2025 at 10:08 EDT] (USD)	PROJECT_FEE	250.00	USD	\N	FREELANCER	Node.js Expert for Parsing Data	\N	\N	\N	\N	2026-01-06 19:43:15.103	2026-01-06 19:43:15.103
8d3c4a50-f29e-4909-a5dd-9dcde32cd496	2025-03-26 02:35:00	Express withdrawal  (PKR)	WITHDRAWAL	-188501.26	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.105	2026-01-06 19:43:15.105
ac7af3bc-d12e-4d2b-9b9b-b0326102d038	2025-03-23 11:08:00	Project fee taken (Node.js Expert for Parsing Data) (USD)	PROJECT_FEE	-250.00	USD	\N	FREELANCER	Node.js Expert for Parsing Data	\N	\N	\N	\N	2026-01-06 19:43:15.106	2026-01-06 19:43:15.106
1ecbd409-3b18-460d-a2e2-8b5142747d9e	2025-03-22 12:56:00	Preferred freelancer program project fee taken (Flutter Developer Needed for Parking App MVP) (USD)	PREFERRED_FEE	-168.75	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	\N	\N	\N	\N	2026-01-06 19:43:15.107	2026-01-06 19:43:15.107
de4a4d85-c572-4115-8415-2cbbe687ac0d	2025-03-22 12:56:00	Done milestone payment from Jacob S. for project Flutter Developer Needed for Parking App MVP (Partial payment for project) (USD)	MILESTONE_PAYMENT	1125.00	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	Jacob S.	\N	\N	\N	2026-01-06 19:43:15.109	2026-01-06 19:43:15.109
2cd5e5c8-c3c4-4dbb-9cd3-b8cc54d7377c	2025-03-11 20:30:00	Express withdrawal  (PKR)	WITHDRAWAL	-376699.60	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.112	2026-01-06 19:43:15.112
5564ac1e-7b46-4635-9d92-66db7814081f	2025-03-09 01:25:00	Preferred freelancer program project fee taken (Flutter Developer Needed for Parking App MVP) (USD)	PREFERRED_FEE	-225.00	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	\N	\N	\N	\N	2026-01-06 19:43:15.113	2026-01-06 19:43:15.113
344c967a-84c2-4ebf-974f-6edd75b72860	2025-03-09 01:25:00	Done milestone payment from Jacob S. for project Flutter Developer Needed for Parking App MVP (Partial payment for project) (USD)	MILESTONE_PAYMENT	1500.00	USD	\N	FREELANCER	Flutter Developer Needed for Parking App MVP	Jacob S.	\N	\N	\N	2026-01-06 19:43:15.114	2026-01-06 19:43:15.114
3481450c-cd33-4726-8144-84a74ca75aa1	2025-03-01 12:50:00	Done milestone payment from Alexandr M. for project Forgedrigs Instagram promotion (Partial payment for project) (GBP)	MILESTONE_PAYMENT	120.00	GBP	\N	FREELANCER	Forgedrigs Instagram promotion	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.116	2026-01-06 19:43:15.116
1841b6ff-c943-40cc-ac37-81f3b70435d6	2025-03-01 12:42:00	Project fee taken (Forgedrigs Instagram promotion) (GBP)	PROJECT_FEE	-12.00	GBP	\N	FREELANCER	Forgedrigs Instagram promotion	\N	\N	\N	\N	2026-01-06 19:43:15.117	2026-01-06 19:43:15.117
b26b6bc5-1287-4d3d-bd2a-e9d7c4892eb6	2025-02-16 20:38:00	Express withdrawal  (PKR)	WITHDRAWAL	-84378.87	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.118	2026-01-06 19:43:15.118
b00eeb93-fa81-464c-a165-7599e3674dd0	2025-02-12 20:27:00	Done milestone payment from Blake F. for project Web Assitance (Partial payment for project) (USD)	MILESTONE_PAYMENT	352.25	USD	\N	FREELANCER	Web Assitance	Blake F.	\N	\N	\N	2026-01-06 19:43:15.12	2026-01-06 19:43:15.12
4919f19c-9a08-47a0-a391-63de7497760d	2025-02-12 20:26:00	Project fee taken (Web Assitance) (USD)	PROJECT_FEE	-35.23	USD	\N	FREELANCER	Web Assitance	\N	\N	\N	\N	2026-01-06 19:43:15.121	2026-01-06 19:43:15.121
0f78ffa3-fed6-4916-a6cf-d12005f2971f	2025-02-02 20:32:00	Express withdrawal  (PKR)	WITHDRAWAL	-100820.02	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.123	2026-01-06 19:43:15.123
cbbfe571-ca1f-414c-a3c3-340974b2ba9f	2025-01-30 23:10:00	Done milestone payment from Blake F. for project Web Assistance -- 4 (Partial payment for project) (USD)	MILESTONE_PAYMENT	422.25	USD	\N	FREELANCER	Web Assistance -- 4	Blake F.	\N	\N	\N	2026-01-06 19:43:15.124	2026-01-06 19:43:15.124
dda730ec-64a6-4f3f-bf96-4a2e5fd33042	2025-01-30 23:10:00	Project fee taken (Web Assistance -- 4) (USD)	PROJECT_FEE	-42.23	USD	\N	FREELANCER	Web Assistance -- 4	\N	\N	\N	\N	2026-01-06 19:43:15.125	2026-01-06 19:43:15.125
f93ad14c-3dba-4bae-b09c-894535dde84e	2025-01-27 20:26:00	Express withdrawal  (PKR)	WITHDRAWAL	-89690.45	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.127	2026-01-06 19:43:15.127
834ec2a7-5612-4dfe-92f6-238225843288	2025-01-16 20:08:00	Done milestone payment from Blake F. for project Web Assistance -- 3 (Partial payment for project) (USD)	MILESTONE_PAYMENT	376.50	USD	\N	FREELANCER	Web Assistance -- 3	Blake F.	\N	\N	\N	2026-01-06 19:43:15.128	2026-01-06 19:43:15.128
dc964651-55fd-4397-992b-99c3037ddc02	2025-01-16 20:08:00	Project fee taken (Web Assistance -- 3) (USD)	PROJECT_FEE	-37.65	USD	\N	FREELANCER	Web Assistance -- 3	\N	\N	\N	\N	2026-01-06 19:43:15.13	2026-01-06 19:43:15.13
e40653b6-17c2-4cac-9a81-a0c8a2f3ea22	2025-01-09 20:39:00	Express withdrawal  (PKR)	WITHDRAWAL	-200694.97	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.131	2026-01-06 19:43:15.131
11eeadac-a5b7-4e3c-9100-acfbdaca3b3d	2025-01-08 09:35:00	Done milestone payment from Alexandr M. for project 180pounds difference from 740pounds 560 been released already -- 2 (Partial payment for project) (GBP)	MILESTONE_PAYMENT	180.00	GBP	\N	FREELANCER	180pounds difference from 740pounds 560 been released already -- 2	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.133	2026-01-06 19:43:15.133
095a9654-9b6e-4d38-ab29-5748de501195	2025-01-08 04:08:00	Express withdrawal  (PKR)	WITHDRAWAL	-85438.50	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.134	2026-01-06 19:43:15.134
7f6f6847-ff44-4382-8207-626439df4c65	2025-01-06 18:24:00	Done milestone payment from Blake F. for project Till 3rd January (Partial payment for project) (USD)	MILESTONE_PAYMENT	321.00	USD	\N	FREELANCER	Till 3rd January	Blake F.	\N	\N	\N	2026-01-06 19:43:15.136	2026-01-06 19:43:15.136
6b622ae1-c360-4f94-a6e5-ef60a7fb8106	2025-01-06 18:24:00	Project fee taken (Till 3rd January) (USD)	PROJECT_FEE	-32.10	USD	\N	FREELANCER	Till 3rd January	\N	\N	\N	\N	2026-01-06 19:43:15.137	2026-01-06 19:43:15.137
ce379498-1671-473b-894d-fa6ce94a2781	2025-01-06 10:51:00	Done milestone payment from Blake F. for project Assistance in WordPress and Zoho (Partial payment for project) (USD)	MILESTONE_PAYMENT	242.25	USD	\N	FREELANCER	Assistance in WordPress and Zoho	Blake F.	\N	\N	\N	2026-01-06 19:43:15.138	2026-01-06 19:43:15.138
caf5342a-21a7-4699-9ccb-817712782795	2025-01-06 10:51:00	Project fee taken (Assistance in WordPress and Zoho) (USD)	PROJECT_FEE	-24.23	USD	\N	FREELANCER	Assistance in WordPress and Zoho	\N	\N	\N	\N	2026-01-06 19:43:15.139	2026-01-06 19:43:15.139
1c09c57e-7fc8-4e71-a17c-04c21a2c43eb	2024-12-23 19:11:00	Done milestone payment from Blake F. for project Web Assistance -- 2 (Partial payment for project) (USD)	MILESTONE_PAYMENT	417.00	USD	\N	FREELANCER	Web Assistance -- 2	Blake F.	\N	\N	\N	2026-01-06 19:43:15.141	2026-01-06 19:43:15.141
9318494e-533b-47d5-9be9-b4968ab6ed6c	2024-12-23 19:10:00	Project fee taken (Web Assistance -- 2) (USD)	PROJECT_FEE	-41.70	USD	\N	FREELANCER	Web Assistance -- 2	\N	\N	\N	\N	2026-01-06 19:43:15.144	2026-01-06 19:43:15.144
ad0dd49b-6efa-4b69-8248-c724d1faa39e	2024-12-21 08:39:00	Project fee taken (Automated Monitoring and Interaction on Service Website) (USD)	PROJECT_FEE	-25.00	USD	\N	FREELANCER	Automated Monitoring and Interaction on Service Website	\N	\N	\N	\N	2026-01-06 19:43:15.147	2026-01-06 19:43:15.147
0186cdf2-b6a6-4c01-b4a3-81c855dcca9b	2024-12-19 20:18:00	Express withdrawal  (PKR)	WITHDRAWAL	-66530.55	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.148	2026-01-06 19:43:15.148
a0b9f199-a3d5-40b1-8c73-e939625b4f48	2024-12-18 08:46:00	Done milestone payment from Blake F. for project Web Assistance (Partial payment for project) (USD)	MILESTONE_PAYMENT	280.00	USD	\N	FREELANCER	Web Assistance	Blake F.	\N	\N	\N	2026-01-06 19:43:15.149	2026-01-06 19:43:15.149
590242bd-7837-4976-9c0a-d7b4cc18d445	2024-12-18 08:46:00	Project fee taken (Web Assistance) (USD)	PROJECT_FEE	-28.00	USD	\N	FREELANCER	Web Assistance	\N	\N	\N	\N	2026-01-06 19:43:15.151	2026-01-06 19:43:15.151
30ff9828-1cbb-4498-b84d-a8c3cf6b6223	2024-12-16 07:14:00	Exam fee - AI Training - Freelancer Global Fleet (USD)	EXAM	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.152	2026-01-06 19:43:15.152
7cddafb7-6eaa-4907-a06e-af26bc6bf5df	2024-12-16 06:56:00	Exam fee - Data Entry - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.154	2026-01-06 19:43:15.154
ade95e96-49a6-40ad-af0a-b4d6a1d95b8d	2024-12-16 06:43:00	Exam fee - AI Training - Freelancer Global Fleet - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.155	2026-01-06 19:43:15.155
bdbef890-b903-4080-8a51-b71afd1cbfd0	2024-12-16 05:46:00	Exam fee - Preferred Freelancer Program SLA Exam - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.156	2026-01-06 19:43:15.156
e3372463-3b11-4570-b53e-a955b8bec268	2024-12-15 20:44:00	Express withdrawal  (PKR)	WITHDRAWAL	-180357.71	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.157	2026-01-06 19:43:15.157
924ebc41-24a4-4810-b0a1-eaab634af028	2024-12-14 10:09:00	Project fee taken (180pounds difference from 740pounds 560 been released already -- 2) (GBP)	PROJECT_FEE	-18.00	GBP	\N	FREELANCER	180pounds difference from 740pounds 560 been released already -- 2	\N	\N	\N	\N	2026-01-06 19:43:15.158	2026-01-06 19:43:15.158
6088d2e5-013d-4a9c-b004-723a9d809701	2024-12-14 09:46:00	Exam fee - Python Level 1 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.159	2026-01-06 19:43:15.159
7b655d2a-c172-44fc-ac32-1b87b29c8f30	2024-12-14 09:27:00	Exam fee - Preferred Freelancer Program SLA Exam - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.16	2026-01-06 19:43:15.16
4dd1abaf-f0d2-4237-be9e-582992bb8f57	2024-12-12 15:29:00	Done milestone payment from Alexandr M. for project On-Page SEO (one time) -- 3 (Partial payment for project) (GBP)	MILESTONE_PAYMENT	200.00	GBP	\N	FREELANCER	On-Page SEO	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.161	2026-01-06 19:43:15.161
4e7637d2-b72e-4baa-8e30-9139a81af9d8	2024-12-12 15:28:00	Done milestone payment from Alexandr M. for project Off-Page SEO - MONTHLY (Partial payment for project) (GBP)	MILESTONE_PAYMENT	360.00	GBP	\N	FREELANCER	Off-Page SEO - MONTHLY	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.164	2026-01-06 19:43:15.164
42c0b7d5-3a58-4c4e-9985-dbdce55825be	2024-12-10 20:09:00	Express withdrawal  (PKR)	WITHDRAWAL	-261891.63	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.165	2026-01-06 19:43:15.165
0b170375-5485-496a-bfec-64178a10b970	2024-12-08 05:22:00	Project fee taken (Python to MATLAB Code Translation) (USD)	PROJECT_FEE	-46.00	USD	\N	FREELANCER	Python to MATLAB Code Translation	\N	\N	\N	\N	2026-01-06 19:43:15.166	2026-01-06 19:43:15.166
879d8708-5557-4d6c-9fc6-7d4bc1c23029	2024-12-08 05:22:00	Done milestone payment from Nam Jong K. for project Python to MATLAB Code Translation (Partial payment for project) (USD)	MILESTONE_PAYMENT	600.00	USD	\N	FREELANCER	Python to MATLAB Code Translation	\N	\N	\N	\N	2026-01-06 19:43:15.167	2026-01-06 19:43:15.167
d3955ba3-c43f-4b28-82e6-774cb09645e5	2024-12-07 11:24:00	Done milestone payment from Alexandr M. for project Start date 5/11/2024 Everyday Posters for FB and Instagram + 4blogs/week untill 6/12/2024 (Partial payment for project) (GBP)	MILESTONE_PAYMENT	340.00	GBP	\N	FREELANCER	Start date 5/11/2024 Everyday Posters for FB and Instagram + 4blogs/week untill 6/12/2024	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.169	2026-01-06 19:43:15.169
d96bf6bb-1a43-44d0-8dc0-d15d20fc6c73	2024-12-05 20:34:00	Express withdrawal  (PKR)	WITHDRAWAL	-123436.04	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.17	2026-01-06 19:43:15.17
c75268a8-fd2e-4199-93b2-dea2597361a1	2024-12-03 22:48:00	Done milestone payment from Blake F. for project WordPress Website and Zoho CRM -- 2 (Partial payment for project) (USD)	MILESTONE_PAYMENT	519.25	USD	\N	FREELANCER	WordPress Website and Zoho CRM -- 2	Blake F.	\N	\N	\N	2026-01-06 19:43:15.172	2026-01-06 19:43:15.172
be1a4863-d907-4620-a0c9-96082dec5352	2024-12-03 22:48:00	Project fee taken (WordPress Website and Zoho CRM -- 2) (USD)	PROJECT_FEE	-51.93	USD	\N	FREELANCER	WordPress Website and Zoho CRM -- 2	\N	\N	\N	\N	2026-01-06 19:43:15.174	2026-01-06 19:43:15.174
4638feb0-dd40-4fcd-bcdd-fbb2b7daf7d5	2024-11-26 21:18:00	Express withdrawal  (PKR)	WITHDRAWAL	-183599.74	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.175	2026-01-06 19:43:15.175
b17c4fe3-f876-44d9-ab7c-73f7b868a185	2024-11-24 20:28:00	Express withdrawal  (PKR)	WITHDRAWAL	-167385.62	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.176	2026-01-06 19:43:15.176
52f36ca8-1c9a-4f03-9a42-33ae1b096fd3	2024-11-24 14:03:00	Done milestone payment from Blake F. for project WordPress Website and Zoho CRM (Partial payment for project) (USD)	MILESTONE_PAYMENT	700.00	USD	\N	FREELANCER	WordPress Website and Zoho CRM	Blake F.	\N	\N	\N	2026-01-06 19:43:15.177	2026-01-06 19:43:15.177
280e00d0-6447-4e96-8bb8-09199571fa03	2024-11-24 14:02:00	Project fee taken (WordPress Website and Zoho CRM) (USD)	PROJECT_FEE	-70.00	USD	\N	FREELANCER	WordPress Website and Zoho CRM	\N	\N	\N	\N	2026-01-06 19:43:15.179	2026-01-06 19:43:15.179
d667bb2c-23db-452b-bf49-aa67400e3625	2024-11-21 20:58:00	Express withdrawal  (PKR)	WITHDRAWAL	-511468.43	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.18	2026-01-06 19:43:15.18
386d03bf-4366-4772-88db-8ffb9d35e1ca	2024-11-21 11:17:00	Project fee taken (Python to MATLAB Code Translation) (USD)	PROJECT_FEE	-14.00	USD	\N	FREELANCER	Python to MATLAB Code Translation	\N	\N	\N	\N	2026-01-06 19:43:15.181	2026-01-06 19:43:15.181
b89fabdd-039f-4f93-b84d-d0a34403f62e	2024-11-16 12:41:00	Done milestone payment from Blake F. for project WordPress Job Board Website Maintenance -- 2 (Partial payment for project) (USD)	MILESTONE_PAYMENT	343.00	USD	\N	FREELANCER	WordPress Job Board Website Maintenance -- 2	Blake F.	\N	\N	\N	2026-01-06 19:43:15.183	2026-01-06 19:43:15.183
5e487050-3d9b-40fc-a2bc-953ca4d172c3	2024-11-16 12:40:00	Project fee taken (WordPress Job Board Website Maintenance -- 2) (USD)	PROJECT_FEE	-34.30	USD	\N	FREELANCER	WordPress Job Board Website Maintenance -- 2	\N	\N	\N	\N	2026-01-06 19:43:15.184	2026-01-06 19:43:15.184
110f3e67-9129-4471-83ae-f2f860e298ed	2024-11-06 20:46:00	Done milestone payment from Blake F. for project WordPress Job Board Website Maintenance (Partial payment for project) (USD)	MILESTONE_PAYMENT	386.25	USD	\N	FREELANCER	WordPress Job Board Website Maintenance	Blake F.	\N	\N	\N	2026-01-06 19:43:15.185	2026-01-06 19:43:15.185
4a5cd76f-02d1-4393-8775-770f02b80e45	2024-11-06 20:46:00	Project fee taken (WordPress Job Board Website Maintenance) (USD)	PROJECT_FEE	-38.63	USD	\N	FREELANCER	WordPress Job Board Website Maintenance	\N	\N	\N	\N	2026-01-06 19:43:15.187	2026-01-06 19:43:15.187
c8852cc7-6e91-41df-90c1-252d6a8b9d0c	2024-11-05 15:24:00	Project fee taken (Start date 5/11/2024 Everyday Posters for FB and Instagram + 4blogs/week untill 6/12/2024) (GBP)	PROJECT_FEE	-34.00	GBP	\N	FREELANCER	Start date 5/11/2024 Everyday Posters for FB and Instagram + 4blogs/week untill 6/12/2024	\N	\N	\N	\N	2026-01-06 19:43:15.188	2026-01-06 19:43:15.188
95e5302a-ae62-4205-a44b-6b3e0c5d5710	2024-11-05 15:15:00	Done milestone payment from Alexandr M. for project 7 days posters flor facebook and instagram  (Partial payment for project) (GBP)	MILESTONE_PAYMENT	90.00	GBP	\N	FREELANCER	7 days posters flor facebook and instagram	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.189	2026-01-06 19:43:15.189
c9235b63-01a8-492b-9367-a0e9da1a9ffb	2024-11-05 15:15:00	Project fee taken (7 days posters flor facebook and instagram ) (GBP)	PROJECT_FEE	-9.00	GBP	\N	FREELANCER	7 days posters flor facebook and instagram	\N	\N	\N	\N	2026-01-06 19:43:15.19	2026-01-06 19:43:15.19
0aa5081e-bdd7-4dff-bdcc-cf4af9e3345d	2024-11-04 02:33:00	Done milestone payment from Mohamad Z. for project SSL Cert Renewal (Partial payment for project) (USD)	MILESTONE_PAYMENT	50.00	USD	\N	FREELANCER	SSL Cert Renewal	Mohamad Z.	\N	\N	\N	2026-01-06 19:43:15.191	2026-01-06 19:43:15.191
02fe7568-cfeb-4685-bf33-47d35b545ff1	2024-11-04 02:32:00	Project fee taken (SSL Cert Renewal) (USD)	PROJECT_FEE	-5.00	USD	\N	FREELANCER	SSL Cert Renewal	\N	\N	\N	\N	2026-01-06 19:43:15.194	2026-01-06 19:43:15.194
e3236947-a08f-4f13-9bf6-491686f37b98	2024-10-22 14:32:00	Done milestone payment from Alexandr M. for project Google Bot + Facebook Like + Instagram like (Partial payment for project) (GBP)	MILESTONE_PAYMENT	180.00	GBP	\N	FREELANCER	Google Bot + Facebook Like + Instagram like	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.196	2026-01-06 19:43:15.196
93417807-935d-404b-b4e3-8e057a61231b	2024-10-22 14:32:00	Done milestone payment from Alexandr M. for project Blogs Content + Human Optimized for SEO (4 blogs/week)  (Partial payment for project) (GBP)	MILESTONE_PAYMENT	160.00	GBP	\N	FREELANCER	Blogs Content + Human Optimized for SEO	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.197	2026-01-06 19:43:15.197
2a7f7605-75f4-489a-8f25-172032fa45a0	2024-10-22 14:31:00	Done milestone payment from Alexandr M. for project Stripe + Web site content (one time) (Partial payment for project) (USD)	MILESTONE_PAYMENT	140.00	USD	\N	FREELANCER	Stripe + Web site content	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.199	2026-01-06 19:43:15.199
37984283-f307-479a-9316-c7a84c8657aa	2024-10-22 14:30:00	Done milestone payment from Alexandr M. for project Data Entry (one time) (Partial payment for project) (GBP)	MILESTONE_PAYMENT	270.00	GBP	\N	FREELANCER	Data Entry	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.2	2026-01-06 19:43:15.2
6919eabd-23f1-48e5-ac44-155caf567315	2024-10-22 14:29:00	Project fee taken (Google Bot + Facebook Like + Instagram like) (GBP)	PROJECT_FEE	-18.00	GBP	\N	FREELANCER	Google Bot + Facebook Like + Instagram like	\N	\N	\N	\N	2026-01-06 19:43:15.201	2026-01-06 19:43:15.201
1e8199c8-7e26-465f-a7b0-8771596ae049	2024-10-19 09:56:00	Project fee taken (Off-Page SEO - MONTHLY) (GBP)	PROJECT_FEE	-36.00	GBP	\N	FREELANCER	Off-Page SEO - MONTHLY	\N	\N	\N	\N	2026-01-06 19:43:15.203	2026-01-06 19:43:15.203
cb893d39-24a9-4b92-909f-8433b85203f2	2024-10-19 09:55:00	Project fee taken (On-Page SEO (one time) -- 2) (USD)	PROJECT_FEE	-20.00	USD	\N	FREELANCER	On-Page SEO (one time	\N	\N	\N	\N	2026-01-06 19:43:15.208	2026-01-06 19:43:15.208
0c05e5f8-2471-4ba0-840e-90a820244bfe	2024-10-19 09:55:00	Project fee taken (On-Page SEO (one time) -- 3) (GBP)	PROJECT_FEE	-20.00	GBP	\N	FREELANCER	On-Page SEO (one time	\N	\N	\N	\N	2026-01-06 19:43:15.21	2026-01-06 19:43:15.21
7c69fdaf-c42f-4534-8dd8-e976c84a33dd	2024-10-19 09:54:00	Project fee taken (Stripe + Web site content (one time)) (USD)	PROJECT_FEE	-14.00	USD	\N	FREELANCER	Stripe + Web site content (one time	\N	\N	\N	\N	2026-01-06 19:43:15.212	2026-01-06 19:43:15.212
dc2a00c4-b47c-442b-be23-8186cad4ba0d	2024-10-19 09:54:00	Project fee taken (Blogs Content + Human Optimized for SEO (4 blogs/week) ) (GBP)	PROJECT_FEE	-16.00	GBP	\N	FREELANCER	Blogs Content + Human Optimized for SEO (4 blogs/week	\N	\N	\N	\N	2026-01-06 19:43:15.214	2026-01-06 19:43:15.214
9e591d65-7827-4a4f-b077-7930a31bd46f	2024-10-19 08:54:00	Done milestone payment from Alexandr M. for project Custom PC Builder Page Design (Partial payment for project) (GBP)	MILESTONE_PAYMENT	400.00	GBP	\N	FREELANCER	Custom PC Builder Page Design	Alexandr M.	\N	\N	\N	2026-01-06 19:43:15.215	2026-01-06 19:43:15.215
8ee44e20-0881-4e29-aecb-dc36c1b60cdb	2024-10-18 18:48:00	Done milestone payment from Blake F. for project WordPress Job Board Website (Partial payment for project) (USD)	MILESTONE_PAYMENT	55.00	USD	\N	FREELANCER	WordPress Job Board Website	Blake F.	\N	\N	\N	2026-01-06 19:43:15.217	2026-01-06 19:43:15.217
ff9eb271-7984-4a03-93f2-353f0c113a56	2024-10-18 18:48:00	Done milestone payment from Blake F. for project WordPress Job Board Website (Partial payment for project) (USD)	MILESTONE_PAYMENT	27.50	USD	\N	FREELANCER	WordPress Job Board Website	Blake F.	\N	\N	\N	2026-01-06 19:43:15.218	2026-01-06 19:43:15.218
eeac2da1-8de8-46f9-9cf6-54ac5ae4dcee	2024-10-18 18:48:00	Done milestone payment from Blake F. for project WordPress Job Board Website (Partial payment for project) (USD)	MILESTONE_PAYMENT	152.25	USD	\N	FREELANCER	WordPress Job Board Website	Blake F.	\N	\N	\N	2026-01-06 19:43:15.22	2026-01-06 19:43:15.22
3d9c2390-eb27-4034-b9c1-5d548ec9d02c	2024-10-18 18:47:00	Project fee taken (WordPress Job Board Website) (USD)	PROJECT_FEE	-23.48	USD	\N	FREELANCER	WordPress Job Board Website	\N	\N	\N	\N	2026-01-06 19:43:15.221	2026-01-06 19:43:15.221
f6dce8e1-2e23-4fc4-ad04-070bc2fc49b8	2024-10-18 18:45:00	Project fee taken (From 28- Sept to 04-October) (USD)	PROJECT_FEE	-18.95	USD	\N	FREELANCER	From 28- Sept to 04-October	\N	\N	\N	\N	2026-01-06 19:43:15.223	2026-01-06 19:43:15.223
827ab387-0f7a-4f13-905c-ee269a0b25aa	2024-10-18 18:45:00	Done milestone payment from Blake F. for project From 28- Sept to 04-October (Partial payment for project) (USD)	MILESTONE_PAYMENT	189.50	USD	\N	FREELANCER	From 28- Sept to 04-October	Blake F.	\N	\N	\N	2026-01-06 19:43:15.224	2026-01-06 19:43:15.224
75d4d7a8-b405-42c0-9b1e-d49b2366adb9	2024-10-16 13:47:00	Project fee taken (Custom PC Builder Page Design) (GBP)	PROJECT_FEE	-40.00	GBP	\N	FREELANCER	Custom PC Builder Page Design	\N	\N	\N	\N	2026-01-06 19:43:15.225	2026-01-06 19:43:15.225
7b010627-d404-4ff4-be05-4bc86f85c18e	2024-10-12 10:55:00	Verified by Freelancer application fee (USD)	OTHER	-99.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.226	2026-01-06 19:43:15.226
00f7f6fd-87ef-4e15-85b5-a18a9b2e223c	2024-10-08 09:59:00	Exam fee - US English - Level 1 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.228	2026-01-06 19:43:15.228
8f41c7f1-c60b-4237-a8d3-72a92b48c407	2024-10-08 09:43:00	Exam fee - Python Level 1 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.23	2026-01-06 19:43:15.23
33220b82-aec4-458d-bca0-ca5e429bfa61	2024-10-08 09:36:00	Exam fee - US English - Level 1 - Membership monthly free exam (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.232	2026-01-06 19:43:15.232
7220180b-3cc1-4196-91c9-f40982c4a3ef	2024-10-08 08:31:00	Membership (corporate) annual fee (from 2024-10-08 to 2025-10-08) (USD)	MEMBERSHIP	-133.44	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.234	2026-01-06 19:43:15.234
268f7691-2182-40fa-9281-e5ac665680c1	2024-10-08 07:56:00	Membership (premier) annual fee (from 2024-10-08 to 2025-10-08) (USD)	MEMBERSHIP	-767.04	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.235	2026-01-06 19:43:15.235
1ca89ff6-1b21-4cfb-93b2-bbe9db42692a	2024-10-07 10:54:00	Done milestone payment from Blake F. for project From 28- Sept to 04-October (Partial payment for project) (USD)	MILESTONE_PAYMENT	189.50	USD	\N	FREELANCER	From 28- Sept to 04-October	Blake F.	\N	\N	\N	2026-01-06 19:43:15.238	2026-01-06 19:43:15.238
be493b39-65fe-4580-82c1-375c43daa6a5	2024-10-07 10:54:00	Project fee taken (From 28- Sept to 04-October) (USD)	PROJECT_FEE	-18.95	USD	\N	FREELANCER	From 28- Sept to 04-October	\N	\N	\N	\N	2026-01-06 19:43:15.239	2026-01-06 19:43:15.239
8b4a63ca-a9ba-4580-b29a-c7fa73bc213a	2024-10-07 10:53:00	Done milestone payment from Blake F. for project September Invoice for Data Entry work (Partial payment for project) (USD)	MILESTONE_PAYMENT	1300.00	USD	\N	FREELANCER	September Invoice for Data Entry work	Blake F.	\N	\N	\N	2026-01-06 19:43:15.241	2026-01-06 19:43:15.241
ebb02060-ceda-471c-82b4-4bda55022847	2024-10-07 10:53:00	Project fee taken (September Invoice for Data Entry work) (USD)	PROJECT_FEE	-130.00	USD	\N	FREELANCER	September Invoice for Data Entry work	\N	\N	\N	\N	2026-01-06 19:43:15.242	2026-01-06 19:43:15.242
2cd2fdd0-5c85-456d-8fcf-6c8d216d9ede	2024-09-24 13:22:00	Credit card authentication (PKR)	OTHER	280.63	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.243	2026-01-06 19:43:15.243
e2780838-12d3-46e2-b041-61da1dbde751	2024-09-24 13:22:00	Processing fee.	OTHER	0.00	PKR	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.245	2026-01-06 19:43:15.245
2fdfb186-1d06-4fa4-8d01-8bc0de26737e	2024-09-24 13:20:00	[TRIAL] Membership (plus) monthly fee (from 2024-09-24 to 2024-10-24) (USD)	MEMBERSHIP	0.00	USD	\N	FREELANCER	\N	\N	\N	\N	\N	2026-01-06 19:43:15.247	2026-01-06 19:43:15.247
67b91350-3bf1-42fc-9c03-623daa3d0885	2026-01-06 20:38:54.444	Milestone payment: Shape Detection & Offline Measurement for Open CV Android App	MILESTONE_PAYMENT	0.00	USD	\N	FREELANCER	Open CV Android App	 Daniele A.	a968813c-7d67-4f39-9b85-48a0ee9b4eaa	34fa39eb-dd91-435c-a48f-d4047adcfdf7	\N	2026-01-06 20:38:54.445	2026-01-06 20:38:54.445
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: aqsariasat
--

COPY public.users (id, email, password, "firstName", "lastName", role, "userType", avatar, phone, "hourlyRate", "monthlySalary", "isActive", "createdAt", "updatedAt") FROM stdin;
d3466200-c6de-49a4-98f1-01e765e574c0	admin@redstone.dev	$2a$10$IPZnHFGSM8vE6PV0j0LH7Ox/PCk1Jq0GH4I6RyJKFrJNYqD1Mc5k2	Admin	User	ADMIN	INHOUSE	\N	\N	\N	\N	t	2026-01-06 18:07:10.515	2026-01-06 18:07:10.515
22e192a3-db17-4589-bd2e-7803c2092caa	muneebawaqar61@gmail.com	$2a$10$vs3gAEWmv/OFLMn4GK3FZul3pwWLp0WDxhCsIi0ySZa9XRSKs1baC	Muneeba	Waqar	BIDDER	INHOUSE	\N	03295831430	\N	37000.00	t	2026-01-06 18:09:24.505	2026-01-06 18:09:24.505
bb26ad9d-e0f9-4385-abbd-77c3af76358c	synet.senior.dev@gmail.com	$2a$10$2Hgg9MblxrH.YaF4zugXXe2olIiehJ5Q3kl3zjOZoLFpS.nCt3pZ2	Ahsan	Ayaz	DEVELOPER	INHOUSE	\N	03451300757	\N	88000.00	t	2026-01-06 18:09:24.749	2026-01-06 18:09:24.749
4c3a6ece-9079-463b-adfe-cf784ee9851d	Parisaumerkhalil@gmail.com	$2a$10$kCt1uI7t67kxOteFr5RXH.VnkHNswPv.1UNznnL5sHsMQYh7MGIfa	Soniya	Rabbani	QC	INHOUSE	\N	03353861375	\N	37000.00	t	2026-01-06 18:09:24.903	2026-01-06 18:09:24.903
c6af2787-266b-481a-a39e-230e2d53b2aa	quratulainmoin1612@gmail.com	$2a$10$kkeCl/86sWYrT.79e54phOzwlhSL8BIcVemeZkdbYsTtr8YTie4ba	Qurat	Ul Ain	BIDDER	INHOUSE	\N	03093255616	\N	37000.00	t	2026-01-06 18:09:25.013	2026-01-06 18:09:25.013
4e01ab95-ddd8-43bc-9480-cfee0a57f541	hammad1645988@gmail.com	$2a$10$z8CHrhJsqoAqHX8H6JdikOXqpQ9zD5xQpCM7fdI4Pu6FKYZqtxlLW	Arbaz	Khan	DEVELOPER	INHOUSE	\N	03102426676	\N	80000.00	t	2026-01-06 18:09:25.108	2026-01-06 18:09:25.108
c757f61a-cab9-4cb9-bf7d-9cf9dc3f0f85	hasnainraza9619@gmail.com	$2a$10$Egp2.PNivnBn7P9XlwHc3ugvLTsuk4JPypuCLt36Mm3YXeV9Oy0La	Syed Hasnain	Raza	OPERATIONAL_MANAGER	INHOUSE	\N	03350230024	\N	75000.00	t	2026-01-06 18:09:25.202	2026-01-06 18:09:25.202
0ca2cd47-201d-4168-87d8-dfd1457b5fd3	samadmohammadabdul71@gmail.com	$2a$10$gkvtUfeFFPSt5MdsduPFO.2L/9e7vyu4rULORN21L73ioNaYWBJny	Mohammad Abdul	Samad	DEVELOPER	INHOUSE	\N	03139873215	\N	60000.00	t	2026-01-06 18:09:25.299	2026-01-06 18:09:25.299
3ae2336f-5335-4f92-ac24-dae659fdc7e4	manahilfatima0003@gmail.com	$2a$10$K2lzZ/XeZ.jsJ6M8l4Kx2.KBI6fzYKcy3sMaOOVxtPByYh.Q27SZy	Manahil	Fatima	BIDDER	INHOUSE	\N	03080641639	\N	37000.00	t	2026-01-06 18:09:25.396	2026-01-06 18:09:25.396
c464f87d-dc2b-4a70-9886-436d8374bcd6	uzairali@gmail.com	$2a$12$JoRge8K6ixim2//v727NIuIIrqXmX5YObXQN7RYqdmDW1KenqCk.W	Uzair	Ali	DEVELOPER	FREELANCER	\N		\N	\N	t	2026-01-06 18:17:34.655	2026-01-06 18:17:34.655
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: candidate_applications candidate_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.candidate_applications
    ADD CONSTRAINT candidate_applications_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employee_documents employee_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_pkey PRIMARY KEY (id);


--
-- Name: employee_profiles employee_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT employee_profiles_pkey PRIMARY KEY (id);


--
-- Name: interview_rounds interview_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.interview_rounds
    ADD CONSTRAINT interview_rounds_pkey PRIMARY KEY (id);


--
-- Name: job_posts job_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.job_posts
    ADD CONSTRAINT job_posts_pkey PRIMARY KEY (id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payroll payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_pkey PRIMARY KEY (id);


--
-- Name: performance_reviews performance_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT performance_reviews_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: task_activities task_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.task_activities
    ADD CONSTRAINT task_activities_pkey PRIMARY KEY (id);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: attendance_date_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX attendance_date_idx ON public.attendance USING btree (date);


--
-- Name: attendance_userId_date_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX "attendance_userId_date_key" ON public.attendance USING btree ("userId", date);


--
-- Name: candidate_applications_candidateId_jobPostId_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX "candidate_applications_candidateId_jobPostId_key" ON public.candidate_applications USING btree ("candidateId", "jobPostId");


--
-- Name: candidate_applications_jobPostId_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX "candidate_applications_jobPostId_idx" ON public.candidate_applications USING btree ("jobPostId");


--
-- Name: candidate_applications_stage_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX candidate_applications_stage_idx ON public.candidate_applications USING btree (stage);


--
-- Name: candidates_email_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX candidates_email_idx ON public.candidates USING btree (email);


--
-- Name: candidates_status_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX candidates_status_idx ON public.candidates USING btree (status);


--
-- Name: departments_code_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX departments_code_key ON public.departments USING btree (code);


--
-- Name: departments_name_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name);


--
-- Name: employee_documents_userId_type_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX "employee_documents_userId_type_idx" ON public.employee_documents USING btree ("userId", type);


--
-- Name: employee_profiles_employeeCode_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX "employee_profiles_employeeCode_key" ON public.employee_profiles USING btree ("employeeCode");


--
-- Name: employee_profiles_userId_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX "employee_profiles_userId_key" ON public.employee_profiles USING btree ("userId");


--
-- Name: interview_rounds_applicationId_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX "interview_rounds_applicationId_idx" ON public.interview_rounds USING btree ("applicationId");


--
-- Name: job_posts_department_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX job_posts_department_idx ON public.job_posts USING btree (department);


--
-- Name: job_posts_status_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX job_posts_status_idx ON public.job_posts USING btree (status);


--
-- Name: leave_balances_userId_year_leaveType_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX "leave_balances_userId_year_leaveType_key" ON public.leave_balances USING btree ("userId", year, "leaveType");


--
-- Name: leave_requests_userId_status_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX "leave_requests_userId_status_idx" ON public.leave_requests USING btree ("userId", status);


--
-- Name: loans_userId_status_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX "loans_userId_status_idx" ON public.loans USING btree ("userId", status);


--
-- Name: payroll_month_year_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX payroll_month_year_idx ON public.payroll USING btree (month, year);


--
-- Name: payroll_userId_month_year_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX "payroll_userId_month_year_key" ON public.payroll USING btree ("userId", month, year);


--
-- Name: performance_reviews_userId_cycle_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX "performance_reviews_userId_cycle_idx" ON public.performance_reviews USING btree ("userId", cycle);


--
-- Name: project_members_projectId_userId_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX "project_members_projectId_userId_key" ON public.project_members USING btree ("projectId", "userId");


--
-- Name: task_activities_taskId_createdAt_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX "task_activities_taskId_createdAt_idx" ON public.task_activities USING btree ("taskId", "createdAt");


--
-- Name: transactions_date_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX transactions_date_idx ON public.transactions USING btree (date);


--
-- Name: transactions_projectName_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX "transactions_projectName_idx" ON public.transactions USING btree ("projectName");


--
-- Name: transactions_type_idx; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE INDEX transactions_type_idx ON public.transactions USING btree (type);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: aqsariasat
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: activity_logs activity_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_applications candidate_applications_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.candidate_applications
    ADD CONSTRAINT "candidate_applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidate_applications candidate_applications_jobPostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.candidate_applications
    ADD CONSTRAINT "candidate_applications_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES public.job_posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: departments departments_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_documents employee_documents_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT "employee_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employee_profiles employee_profiles_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT "employee_profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_profiles employee_profiles_reportingToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT "employee_profiles_reportingToId_fkey" FOREIGN KEY ("reportingToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employee_profiles employee_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.employee_profiles
    ADD CONSTRAINT "employee_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: interview_rounds interview_rounds_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.interview_rounds
    ADD CONSTRAINT "interview_rounds_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.candidate_applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT "leave_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "leave_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT "leave_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: loans loans_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT "loans_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: loans loans_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: milestones milestones_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payroll payroll_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT "payroll_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: performance_reviews performance_reviews_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT "performance_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: performance_reviews performance_reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT "performance_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_members project_members_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_members project_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_activities task_activities_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.task_activities
    ADD CONSTRAINT "task_activities_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_activities task_activities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.task_activities
    ADD CONSTRAINT "task_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_comments task_comments_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_milestoneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES public.milestones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: time_entries time_entries_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: time_entries time_entries_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aqsariasat
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: aqsariasat
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict AAtEqMZronCz3Vw9W0dz7eYMGlzxleL2hZAo9KwUuqBGTtX7ruwxuJczhSHhan7

