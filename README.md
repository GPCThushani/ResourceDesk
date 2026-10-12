# ResourceDesk 
### Resource Reservation Management System
**One Place. Every Resource. Zero Conflicts.**

ResourceDesk is a modern, full-stack web application designed to simplify the management and reservation of shared organizational resources. It provides a centralized platform where employees can explore available resources, make reservations, and manage their bookings, while administrators can manage resources and monitor reservations efficiently.

The system aims to eliminate scheduling conflicts, reduce manual coordination, and improve resource utilization through a reliable, secure, and user-friendly interface.

This project is being developed as part of the **Software Engineering Internship Technical Assessment at PrimeWave Lab (Pvt) Ltd**.

---

## Project Overview

Organizations often manage shared resources such as meeting rooms, training facilities, projectors, equipment, and workspaces through informal communication or manual records. This can lead to overlapping reservations, unclear availability, and inefficient resource coordination.

**ResourceDesk** addresses these challenges by providing a centralized digital reservation management solution with real-time availability checks, conflict prevention, and role-based resource management.

### Project Objectives

- Simplify organizational resource reservations.
- Prevent overlapping bookings and scheduling conflicts.
- Provide clear resource availability information.
- Enable employees to manage their reservations independently.
- Allow administrators to manage resources efficiently.
- Maintain accurate reservation records using persistent database storage.
- Deliver a responsive, secure, and maintainable full-stack application.

---

## Planned Features

### Employee Features

- **Secure Authentication:** Log in to the application securely.
- **Resource Directory:** Browse available organizational resources.
- **Search and Filtering:** Find resources based on category and other relevant information.
- **Resource Details:** View descriptions, locations, capacities, and resource status.
- **Availability Checking:** Check resource availability for selected dates and times.
- **Resource Reservation:** Create reservations by selecting a resource, date, time range, and purpose.
- **Conflict Prevention:** Prevent overlapping reservations for the same resource.
- **My Reservations:** View upcoming and previous reservations.
- **Reservation Cancellation:** Cancel eligible personal reservations.
- **Dashboard:** View reservation summaries and upcoming bookings.

### Administrator Features

- **Admin Dashboard:** View resource and reservation summaries.
- **Resource Management:** Add, edit, and disable organizational resources.
- **Reservation Monitoring:** View and monitor reservations across the organization.
- **Resource Status Management:** Control whether resources are active or inactive.
- **Role-Based Access Control:** Restrict administrative functionality to authorized users.

---

## Technology Stack

| Category | Technology |
|---|---|
| Full-Stack Framework | Next.js (App Router) |
| Programming Language | TypeScript |
| Frontend | React |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Authentication | Credentials-based authentication |
| Version Control | Git & GitHub |
| Deployment | Vercel (Planned) |

---

## System Architecture

ResourceDesk follows a modular full-stack architecture using Next.js.

**Presentation Layer**
- Next.js App Router
- React Components
- Tailwind CSS
- Responsive User Interface

**Application Layer**
- Server-side business logic
- Authentication and authorization
- Resource management
- Reservation processing
- Input validation
- Scheduling conflict prevention

**Data Layer**
- Prisma ORM
- PostgreSQL Database
- Persistent resource and reservation records

---

## Database Design

The system is designed around three primary entities:

| Entity | Description |
|---|---|
| User | Stores employee and administrator account information. |
| Resource | Stores information about shared organizational resources. |
| Reservation | Stores booking information and connects users with resources. |

### Relationships

- One user can create multiple reservations.
- One resource can have multiple reservations across different time periods.
- Each reservation belongs to one user and one resource.

The database design will enforce data integrity and prevent overlapping active reservations.

The completed ER diagram will be added to the project documentation.

---

## UI/UX Design

ResourceDesk follows a **Modern SaaS design approach** focused on simplicity, clarity, accessibility, and responsive layouts.

### Color Palette – Indigo & Slate

| Purpose | Color | Hex Code |
|---|---|---|
| Primary | Deep Indigo | `#4F46E5` |
| Secondary | Soft Lavender | `#EDE9FE` |
| Main Background | Off-White | `#F8FAFC` |
| Card Background | White | `#FFFFFF` |
| Primary Text | Slate | `#1E293B` |
| Secondary Text | Muted Slate | `#64748B` |

### Design Principles

- Clean and intuitive navigation
- Consistent components and visual hierarchy
- Responsive desktop and mobile layouts
- Clear reservation status indicators
- Accessible forms and feedback messages
- Minimal steps to complete a reservation

---

## Business Rules

ResourceDesk will follow these core reservation rules:

1. Reservation start time must be earlier than the end time.
2. New reservations must start in the future.
3. Overlapping active reservations for the same resource are not permitted.
4. Only active resources can receive new reservations.
5. Employees can manage only their own reservations.
6. Administrators can manage organizational resources.
7. Cancelled reservations remain in booking history but no longer block availability.
8. Reservation validation must be enforced on the server and database, not only in the frontend.

---

## Project Structure

The planned project structure is:

```text
resourcedesk/
├── docs/
│   ├── ResourceDesk_Project_Concept_and_Software_Requirements.pdf
│   └── ER_Diagram.png
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── services/
│   └── types/
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

The structure may be refined during development.

---

## Getting Started

**Development Status:** Planning and initial setup.

Local installation and execution instructions will be added after the initial application setup.

The completed application will support local development with Next.js and PostgreSQL.

---

## Project Documentation

Detailed project documentation is maintained in the `docs/` directory.

- **Project Concept & Software Requirements**: To be added.
- **Entity Relationship Diagram:** To be added.
- **Application Screenshots:** To be added after implementation.

---

## Testing Strategy

The application will be tested for:

- Authentication and role-based authorization
- Resource creation and management
- Reservation creation and cancellation
- Invalid date and time ranges
- Overlapping reservation prevention
- Concurrent booking requests
- Database integrity
- Responsive layouts
- Error handling and validation

Special attention will be given to ensuring that conflicting reservations cannot be created, including when multiple users attempt to book the same resource simultaneously.

---

## Deployment

**Planned Hosting:** Vercel

**Planned Database Hosting:** Managed PostgreSQL

The completed application is intended to be deployed online while remaining fully executable in a local development environment.

**Live Application:** Coming soon.

---

## Development Roadmap

- [x] Project idea and problem identification
- [x] Initial requirements analysis
- [x] Technology stack selection
- [x] UI/UX color palette selection
- [x] Project concept documentation
- [ ] ER diagram and database schema
- [ ] Next.js project setup
- [ ] Authentication and authorization
- [ ] Resource management
- [ ] Reservation management
- [ ] Scheduling conflict prevention
- [ ] Dashboard implementation
- [ ] Testing and validation
- [ ] Vercel deployment
- [ ] Final documentation and demonstration

---

## Expected Outcome

ResourceDesk aims to deliver a practical and maintainable resource reservation management solution that improves organizational efficiency through centralized resource visibility, reliable booking workflows, and effective scheduling conflict prevention.

The project emphasizes thoughtful software engineering decisions, database integrity, usability, and clean application architecture.

---

## Project Information

**Project:** ResourceDesk - Resource Reservation Management System

**Assessment:** Software Engineering Internship Technical Assessment

**Organization:** PrimeWave Lab (Pvt) Ltd

**Development Type:** Full-Stack Web Application

**Status:** In Development

---

**ResourceDesk – One Place. Every Resource. Zero Conflicts.**
