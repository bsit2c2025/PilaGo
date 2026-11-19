# PilaGo (Tricycle Queue & Fare Management System)

PilaGo is a digital tricycle queue management system designed to make the traditional *pila* system in the Philippines organized, transparent, and fair. Built with Django (Backend) and React + Tailwind CSS (Frontend), it eliminates fare overcharging, prevents terminal queue-jumping, and provides transparent digital trip ticketing.

---

## 📖 System Specifications & Documentation

All architectural and domain specifications are documented under `docs/specs/`:
- [docs/specs/01_SYSTEM_ARCHITECTURE.md](docs/specs/01_SYSTEM_ARCHITECTURE.md) – Django models, JWT authentication, REST endpoints, and WebSocket channels architecture.
- [docs/specs/02_FARE_MATRIX_AND_CALCULATION.md](docs/specs/02_FARE_MATRIX_AND_CALCULATION.md) – Official municipal fare calculation formulas, statutory discounts, and digital trip ticket QR schema.
- [docs/specs/03_QUEUE_AND_DISPATCH_LIFECYCLE.md](docs/specs/03_QUEUE_AND_DISPATCH_LIFECYCLE.md) – Passenger and driver state machines, 4-passenger batching, driver manual departure override, and FIFO ordering.
- [docs/specs/04_FRONTEND_AND_DESIGN_SYSTEM.md](docs/specs/04_FRONTEND_AND_DESIGN_SYSTEM.md) – Implementation mapping of [PilaGo Design System](docs/PilaGo_Design_System.md) across Passenger, Driver, Admin, and TV display views.
- [docs/specs/IMPLEMENTATION_PLAN.md](docs/specs/IMPLEMENTATION_PLAN.md) – Execution roadmap and milestone verification criteria.

---

## 💰 Official Fare Pricing Matrix

| Trip Type | Base Fare (First 2.0 km / City Proper) | Succeeding Distance Rate | Discounted Base Fare (20% Off) | Discounted Extra Rate (20% Off) |
|---|---|---|---|---|
| **Regular Trip (Shared)** | **₱20.00** per passenger | **+₱5.00** per km | **₱16.00** per passenger | **+₱4.00** per km |
| **Special Trip ("Extra" / Solo)** | **₱60.00** total | **+₱15.00** per km | **₱48.00** total | **+₱12.00** per km |

*Statutory 20% discounts are legally enforced for verified Students, Senior Citizens, and PWDs.*

---

## 🚀 Quickstart & Running Locally

### 1. Backend (Django + Channels)
```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py seed_data    # Seeds terminals, destinations, and demo users
python manage.py runserver 8000
```

### 2. Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Demo Test Accounts

| Role | Username | Password | Details |
|---|---|---|---|
| **Passenger (Student)** | `student_carlos` | `pass123` | Verified 20% Student Discount |
| **Passenger (Senior)** | `senior_lola` | `pass123` | Verified 20% Senior Citizen Discount |
| **Passenger (Regular)** | `passenger_maria` | `pass123` | Regular standard passenger |
| **Tricycle Driver** | `driver_pedro` | `driver123` | Tricycle Body #042 (Bayan Central Terminal) |
| **Terminal Admin** | `admin` | `admin123` | Superuser / Dispatch supervisor |

---

## 📺 Public Terminal Board Display
Open [http://localhost:5173/board/bayan-central](http://localhost:5173/board/bayan-central) on a full-screen monitor or TV in the terminal waiting shed for real-time queue calling and audio chimes.

---

## 🤝 Contributing & Team Collaboration
If you are collaborating on this project, please read [CONTRIBUTING.md](CONTRIBUTING.md) for environment setup steps, spec-driven development guidelines, branching conventions, and testing requirements before opening a pull request.

