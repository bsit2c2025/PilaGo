# Contributing to PilaGo

Welcome to **PilaGo**! We are glad you're here to help build and improve the digital tricycle queue and fare management system for Philippine commuter terminals.

This guide outlines our **Spec-Driven Development (SDD)** workflow, coding guidelines, local setup steps, and collaboration standards to ensure that everyone on the team can contribute smoothly.

---

## 🧭 Spec-Driven Development (SDD)

Before writing code or proposing architectural changes, **always consult the specifications in `docs/specs/`**:
- [01_SYSTEM_ARCHITECTURE.md](docs/specs/01_SYSTEM_ARCHITECTURE.md) – Data models, REST API endpoints, and WebSocket channels architecture.
- [02_FARE_MATRIX_AND_CALCULATION.md](docs/specs/02_FARE_MATRIX_AND_CALCULATION.md) – Official municipal fare calculation rules, 20% statutory discounts, and ticket token schemas.
- [03_QUEUE_AND_DISPATCH_LIFECYCLE.md](docs/specs/03_QUEUE_AND_DISPATCH_LIFECYCLE.md) – Driver FIFO queue order, passenger batching (4 passengers), and driver manual dispatch overrides.
- [04_FRONTEND_AND_DESIGN_SYSTEM.md](docs/specs/04_FRONTEND_AND_DESIGN_SYSTEM.md) – UI components and tokens matching [PilaGo Design System](docs/PilaGo_Design_System.md).

> [!IMPORTANT]
> If a feature or pull request alters backend business logic or frontend designs, update the corresponding specification document in `docs/specs/` as part of your pull request.

---

## 📁 Repository Structure

```
PilaGo/
├── backend/                   # Django REST Framework + Channels Backend
│   ├── manage.py
│   ├── pilago_core/           # Project settings, ASGI/WSGI, routing
│   ├── accounts/              # User model, JWT authentication, discount validation
│   ├── terminals/             # Terminal & destination zone fare matrix
│   ├── drivers/               # Driver profile roster & FIFO queue
│   └── trips/                 # Passenger queue entries, fare engine, and dispatches
├── frontend/                  # React (Vite) + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/               # Axios client with JWT interceptors
│   │   ├── context/           # AuthContext (user session, roles, tokens)
│   │   ├── components/        # Shared UI components (badges, cards, modals)
│   │   ├── pages/             # Passenger, Driver, Admin, and TV Board views
│   │   ├── App.jsx            # Router and layout
│   │   └── index.css          # Tailwind CSS and Nunito Sans font styling
│   └── tailwind.config.js     # PilaGo design system color tokens
├── docs/                      # Specs, Design System, and Style Guide assets
└── CONTRIBUTING.md            # Developer onboarding & collaboration guide
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Python 3.10+** (tested up to Python 3.14)
- **Node.js 18+** & **npm 9+**
- **Git**

### 1. Clone & Branch
```bash
git clone https://github.com/bsit2c2025/PilaGo.git
cd PilaGo
git checkout -b feature/your-feature-name
```

### 2. Backend Setup (Django)
```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed sample terminals, routes, and test accounts
python manage.py seed_data

# Start backend server
python manage.py runserver 8000
```
Backend runs at: `http://localhost:8000` (API endpoints: `http://localhost:8000/api/`)

### 3. Frontend Setup (React + Vite)
In a separate terminal:
```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 👥 Default Test Accounts

Use these accounts seeded by `python manage.py seed_data` to test the system:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Passenger (Regular)** | `passenger_maria` | `pass123` | Tests standard shared/solo booking |
| **Passenger (Student)** | `student_carlos` | `pass123` | Tests verified 20% Student Discount |
| **Passenger (Senior)** | `senior_lola` | `pass123` | Tests verified 20% Senior Citizen Discount |
| **Tricycle Driver** | `driver_pedro` | `driver123` | Tricycle Body #042 at Bayan Central Terminal |
| **Terminal Admin** | `admin` | `admin123` | Full administrative rights & discount approvals |

*You can also use the one-click demo login buttons directly on the `/login` page.*

---

## 🎨 UI & Design System Guidelines

When building or updating frontend components:
1. **Font**: Always use `Nunito Sans` with tabular numerals (`tabular-nums` class) for queue numbers, distances, and prices.
2. **Color Tokens**: Use centralized tokens defined in `tailwind.config.js`:
   - `brand-900` (`#12345A`), `brand-600` (`#2876B8`), `brand-50` (`#F4F8FC`)
   - `gold-500` (`#E5A928`), `gold-100` (`#FFF4D8`)
   - `semantic-success` (`#24734A`), `semantic-destructive` (`#B83232`)
3. **Contrast & Sizing**:
   - Maintain minimum 44px touch targets on mobile viewports.
   - Large queue numbers should use `text-5xl` or `text-6xl font-extrabold`.
   - Never encode queue status by color alone; always pair colors with explicit text labels and icons.

---

## 🧪 Testing & Code Quality

Before opening a pull request, ensure all tests pass:

### Backend Tests
```bash
cd backend
venv/bin/python manage.py test
```
*Current test suite checks:*
- Mathematical precision of fare formulas down to the centavo (`test_fare_calculator.py`).
- Strict FIFO ordering and manual departure overrides (`test_queue.py`).
- Full end-to-end booking to cash drop-off lifecycle (`test_e2e_flow.py`).

### Frontend Build Check
```bash
cd frontend
npm run build
```
Verify that Vite builds without any missing dependencies or syntax errors.

---

## 🌿 Git & Pull Request Workflow

1. **Branch Naming**:
   - `feature/<short-description>` (e.g., `feature/sms-notifications`)
   - `bugfix/<issue-name>` (e.g., `bugfix/driver-queue-timestamp`)
   - `docs/<topic>` (e.g., `docs/update-fare-matrix-spec`)

2. **Commit Messages**: Follow standard conventional commits:
   - `feat: add sound toggle to TV queue monitor`
   - `fix: resolve date filtering on daily queue numbering`
   - `docs: update system architecture spec with new models`
   - `test: add unit tests for terminal zone fare overrides`

3. **Submitting a Pull Request (PR)**:
   - Provide a concise summary of what was changed and why.
   - Mention the relevant spec section in `docs/specs/` that was updated or fulfilled.
   - Confirm that `python manage.py test` and `npm run build` pass.

---

## 🤝 Code of Conduct & Support

- Treat all team members with respect, patience, and encouragement.
- Ask questions early in team chats if you run into environment or domain calculation ambiguities.
- Have fun modernizing local Philippine transportation! 🛺🇵🇭
