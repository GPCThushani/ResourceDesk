# ResourceDesk

### Resource Reservation Management System

**One Place. Every Resource. Zero Conflicts.**

ResourceDesk is a full-stack web application designed to simplify the management and reservation of shared organizational resources. It provides a centralized platform where employees can discover resources, submit reservations, and manage bookings, while department heads handle approval requests and administrators manage resources and employee accounts.

The system reduces manual coordination, improves resource visibility, and prevents overlapping confirmed bookings through server-side validation and database-level conflict protection.

Developed as part of the **Software Engineering Internship Technical Assessment at PrimeWave Lab (Pvt) Ltd**.

## Live Application & Project Links

| Resource | Link |
|---|---|
| Live Application | [ResourceDesk - Vercel](https://resource-desk-zeta.vercel.app/) |
| GitHub Repository | [ResourceDesk - GitHub](https://github.com/GPCThushani/ResourceDesk) |
| Project Demonstration Video | [Watch Video](https://drive.google.com/file/d/10OUp4h9HF_hVXCIsZYF1CoMGa-G0K1r5/view?usp=sharing) |
| Entity Relationship Diagram | [View ER Diagram](https://drive.google.com/file/d/1Mv2OkKsv5UwXf_euxZEkGc3sEXPXE3nc/view?usp=sharing) |
| Project Documentation | Available in the `documentation/` folder |

## 1. Project Overview

Organizations frequently share meeting rooms, training spaces, projectors, equipment, and other facilities. Managing these resources through emails, spreadsheets, or informal communication can result in double bookings, unclear availability, and inefficient coordination.

ResourceDesk addresses these challenges through a centralized reservation system with role-based access, departmental approval workflows, resource management, and reliable scheduling conflict prevention.

### Project Objectives

- Simplify resource discovery and reservation.
- Prevent overlapping confirmed reservations.
- Improve visibility into resource availability and status.
- Enable employees to manage their bookings independently.
- Provide department heads with structured approval workflows.
- Enable administrators to manage organizational resources and employee accounts.
- Support secure authentication and invitation-based employee onboarding.
- Maintain consistent and reliable reservation records.

## 2. Key Features

### Employee Features

- Secure login using registered credentials.
- Dashboard with reservation summaries and upcoming bookings.
- Resource directory with search and filtering.
- Resource details, including category, location, capacity, department, and status.
- Organization-wide and department-specific resource visibility.
- Quick Reservation workflow with date, time, and purpose selection.
- Reservation status tracking: Pending, Confirmed, Rejected, and Cancelled.
- My Reservations page for reviewing booking history.
- Cancellation of eligible personal reservations.

### Department Head Features

- Department-specific reservation approval workflow.
- Review pending reservation requests.
- Approve or reject requests.
- Review reservation details before making decisions.
- Manage approvals according to departmental access permissions.

### Administrator Features

- Administrative dashboard and organizational overview.
- Create, view, and update organizational resources.
- Assign resources to departments.
- Configure resource visibility and availability settings.
- Manage resource statuses: Active, Maintenance, and Inactive.
- Monitor reservations and approval workflows.
- View employee accounts and assigned roles.
- Invite new employees through email.
- Manage employee account information and statuses.

### Employee Invitation and Activation

ResourceDesk includes an invitation-based onboarding workflow.

1. An administrator creates an employee invitation.
2. The employee account is registered with `INVITED` status.
3. An activation token is generated.
4. The system attempts to send an invitation email.
5. The employee uses the activation link to set a password.
6. The account becomes active after successful activation.

Activation tokens are designed to be single-use and expire after 24 hours. Email delivery requires a valid Resend configuration and authorized sender address.

## 3. User Roles and Permissions

| Feature | Employee | Department Head | Administrator |
|---|---|---|---|
| Access dashboard | Yes | Yes | Yes |
| Browse permitted resources | Yes | Yes | Yes |
| Create reservations | Yes | Yes | Yes |
| View personal reservations | Yes | Yes | Yes |
| Cancel eligible personal reservations | Yes | Yes | Yes |
| Review department approvals | No | Yes | Yes |
| Manage organizational resources | No | No | Yes |
| Manage employee accounts | No | No | Yes |
| Invite employees | No | No | Yes |

Access permissions are enforced through authentication and server-side authorization.

## 4. Demo Accounts

The application includes demonstration accounts for evaluating different user roles and department-specific workflows.

| Role | Department | Email |
|---|---|---|
| Employee | Engineering | `employee@resourcedesk.local` |
| Department Head | Engineering | `manager@resourcedesk.local` |
| Department Head | Operations | `operations.head@resourcedesk.local` |
| Administrator | Organization-wide | `admin@resourcedesk.local` |

**Demo Password:** password123

These accounts are intended for assessment and demonstration purposes only. Credentials should not be reused for real organizational accounts.

## 5. Technology Stack

| Category | Technology |
|---|---|
| Full-Stack Framework | Next.js 16 - App Router |
| Frontend | React 19 |
| Programming Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Database Hosting | Neon |
| ORM | Prisma |
| Authentication | Auth.js - Credentials Provider |
| Password Security | bcrypt |
| Email Service | Resend |
| Version Control | Git and GitHub |
| Deployment | Vercel |

## 6. System Architecture

ResourceDesk follows a modular full-stack architecture using Next.js.

### Presentation Layer

- Next.js App Router
- React components
- Tailwind CSS
- Responsive dashboards, forms, and resource interfaces

### Application Layer

- Authentication and authorization
- Role-based access control
- Resource management
- Reservation creation and cancellation
- Approval workflows
- Employee invitation and activation
- Input validation and conflict handling

### Data Layer

- Prisma ORM
- Neon PostgreSQL
- Relational data integrity
- Database-level protection against overlapping confirmed reservations

## 7. Database Design

The database includes five main entities.

| Entity | Description |
|---|---|
| Department | Stores organizational department information. |
| User | Stores employee accounts, roles, departments, and account statuses. |
| Resource | Stores organizational resource details and configuration. |
| Reservation | Stores booking details, reservation status, and approval information. |
| AccountActivationToken | Stores activation-token information for employee onboarding. |

### Main Relationships

- One department can have multiple users.
- One department can be associated with multiple resources.
- One user can create multiple reservations.
- One resource can have multiple reservations across different time periods.
- Each reservation belongs to one user and one resource.
- A user can have associated account activation tokens.

**ER Diagram:** [View the complete Entity Relationship Diagram](https://drive.google.com/file/d/1Mv2OkKsv5UwXf_euxZEkGc3sEXPXE3nc/view?usp=sharing)

## 8. Core Business Rules

1. Reservation start time must be earlier than the end time.
2. New reservations must be scheduled for a future time.
3. Only eligible and active resources can receive new reservations.
4. Overlapping confirmed reservations for the same resource are prohibited.
5. Reservations requiring approval initially receive `PENDING` status.
6. Approved reservations become `CONFIRMED`.
7. Rejected requests become `REJECTED`.
8. Cancelled reservations no longer block resource availability.
9. Employees can manage only their permitted reservations.
10. Department heads can review requests within their authorized scope.
11. Administrative operations require the appropriate role.
12. Employee activation links are time-limited and single-use.

Reservation conflicts are validated by application logic and protected by a PostgreSQL exclusion constraint, including scenarios involving concurrent booking requests.

## 9. User Interface and Experience

ResourceDesk uses a modern SaaS-inspired interface with consistent navigation, clear status indicators, and responsive layouts.

### Design Principles

- Clean and intuitive navigation
- Consistent visual hierarchy
- Accessible forms and feedback messages
- Responsive layouts
- Clearly differentiated reservation statuses
- Minimal steps for completing a booking
- Role-specific navigation and dashboards

### Main Screens

- Login
- Dashboard
- Resource Directory
- Resource Details
- Quick Reservation
- My Reservations
- Reservation Approvals
- Admin Resource Management
- Employee Management
- Employee Account Activation

## 10. Local Setup and Installation

### Prerequisites

- Node.js and npm
- PostgreSQL database, locally or through Neon
- Git
- Required environment variables

### Clone the Repository

```bash
git clone https://github.com/GPCThushani/ResourceDesk.git
cd ResourceDesk
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root.

```dotenv
DATABASE_URL="your_postgresql_connection_string"
DIRECT_URL="your_direct_postgresql_connection_string"

AUTH_SECRET="your_secure_random_secret"
AUTH_TRUST_HOST="true"

RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="ResourceDesk <your_verified_sender@example.com>"
APP_URL="http://localhost:3000"
```

Use actual database credentials and authorized email settings. Never commit the `.env` file to GitHub.

### Generate Prisma Client

```bash
npx prisma generate
```

### Apply Database Migrations

```bash
npx prisma migrate deploy
```

### Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application requires a configured database and existing user accounts to test authenticated workflows.

## 11. Project Structure

```text
ResourceDesk/
├── documentation/
│   ├── Project documentation PDF
│   ├── ER diagram
│   └── Demonstration video
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The structure above summarizes the main project areas. Refer to the repository for the complete source-code organization and exact documentation filenames.

## 12. Testing and Validation

The application was developed with attention to the following scenarios:

| Test Area | Validation Focus |
|---|---|
| Authentication | Valid and invalid login attempts |
| Authorization | Role-restricted page and action access |
| Resource Management | Resource information and status handling |
| Resource Visibility | Organization and department access rules |
| Reservation Creation | Required fields and valid time ranges |
| Approval Workflow | Pending, approved, and rejected requests |
| Conflict Prevention | Overlapping confirmed bookings |
| Reservation Cancellation | Eligible booking cancellation |
| Employee Onboarding | Invitation creation and token activation |
| Database Integrity | Relationships and reservation constraints |
| Responsive Interface | Usability across screen sizes |

The system includes server-side and database-level safeguards against conflicting confirmed bookings.

## 13. Deployment

ResourceDesk is deployed using **Vercel**, with **Neon PostgreSQL** as its managed database.

**Live Application:** https://resource-desk-zeta.vercel.app/

Production configuration includes database connection variables, authentication settings, and optional email-delivery configuration.

The Prisma Client must be generated during the deployment build process.

## 14. Project Documentation and Demonstration

The repository includes a dedicated `documentation/` folder containing the project documentation, ER diagram, and demonstration video.

Additional externally hosted resources:

- [Project Demonstration Video - Google Drive](https://drive.google.com/file/d/10OUp4h9HF_hVXCIsZYF1CoMGa-G0K1r5/view?usp=sharing)
- [ER Diagram - Google Drive](https://drive.google.com/file/d/1Mv2OkKsv5UwXf_euxZEkGc3sEXPXE3nc/view?usp=sharing)

The demonstration covers the main Employee, Department Head, and Administrator workflows.

## 15. Project Outcome

ResourceDesk delivers a centralized solution for organizational resource discovery, reservations, approval workflows, and administrative management.

The project demonstrates full-stack application development, relational database design, authentication and authorization, workflow implementation, conflict prevention, responsive interface design, and cloud deployment.

## 16. Project Information

| Item | Details |
|---|---|
| Project Name | ResourceDesk |
| Project Type | Full-Stack Web Application |
| Assessment | Software Engineering Internship Technical Assessment |
| Organization | PrimeWave Lab (Pvt) Ltd |
| Repository | [GPCThushani/ResourceDesk](https://github.com/GPCThushani/ResourceDesk) |
| Deployment | Vercel |
| Database | Neon PostgreSQL |
| Project Status | Implemented and Deployed |

---

**ResourceDesk - One Place. Every Resource. Zero Conflicts.**
