# Waitlist Pilot Control Center (`waitlist-pilot`)

A production-ready, administrative management app built to oversee, monitor, and scale registration waitlists. This app handles real-time subscriber metrics, automated state transitions, transactional refresh-token authentications, and direct targeted newsletter communications.

---

## 🚀 System Architecture & Capabilities

- **Secure, Layered Administration**: Built-in credential checks restricting interface operational capabilities specifically to `ADMIN` and `SUPER_ADMIN` system roles.
- **Atomic Database Operations**: Leverages Prisma `$transaction` pipelines across telemetry checkpoints and paginated indices to guarantee strict sequence reads and state isolation.
- **Dynamic Metrics Computations**: Evaluates delta rollups across 24h, 7d, and 30d historic windows alongside rolling real-time execution percentages.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime Engine**: Node.js (v18+ recommended)
- **Framework & Routing**: Express.js with async execution layers
- **Database Engine & ORM**: PostgreSQL paired with Prisma Client ORM
- **Validation Engine**: Zod schemas for runtime parameter interception
- **Cryptographic Foundations**: Bcrypt for admin verification, JSON Web Tokens (JWT) for stateless sessions
