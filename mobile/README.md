# RTS ERP — Field Mobile (Flutter)

Same Laravel API as the office web app. Mobile covers the web **TRANSACTIONS** workflow only (not Setup or Reports).

## Prerequisites

- Flutter SDK on PATH (`flutter doctor` clean)
- Android Studio + emulator (or USB device)
- Laravel API reachable from the device/emulator

## API base URL

Default is in `lib/config/api_config.dart`:

| Where you run the app | Base URL |
|-----------------------|----------|
| Android emulator | `http://10.0.2.2:8000/api` |
| Physical phone (same Wi‑Fi) | `http://YOUR-PC-LAN-IP:8000/api` |
| iOS simulator | `http://127.0.0.1:8000/api` |

Override at run time without editing code:

```powershell
flutter run --dart-define=API_BASE_URL=http://192.168.0.106:8000/api
```

Cleartext HTTP is allowed for debug in `android/app/src/main/AndroidManifest.xml`.

## Run

```powershell
# Terminal 1 — API (must bind 0.0.0.0 for emulator/phone)
cd C:\erp-system\backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 — mobile
cd C:\erp-system\mobile
flutter pub get
flutter run
```

Login with a `setup_users` account (e.g. **admin** / **p@ssw0rd**).

**Refresh while running:** `r` = hot reload, `R` = hot restart (use restart after navigation or theme changes).

## Navigation

- **Dashboard** — greeting, open-task summary, 8-module icon grid, “Needs attention” chips
- Tap any module icon to open its list
- **Detail screens** — back button (left) and dashboard shortcut (right)
- **Profile** — avatar menu on dashboard (sign out)
- No side drawer or bottom tabs

## Modules & workflow

Full chain (same as web):

**Quotation → PO → Receiving → Outslip → DR → Billing → Payment**

| Module | Mobile actions |
|--------|----------------|
| Quotations | New, approve, cancel, edit (date/status), convert to PO |
| Purchase orders | Receive items → creates receiving |
| Receiving | Confirm → create outslip |
| Outslips | New, approve, dispatch → create DR |
| Delivery receipts | Out for delivery, delivered → create billing |
| Billing | Record payment |
| SOA | Generate by customer + optional date range, print PDF |
| Accomplishments | New, edit, approve, photos, PDF |

**Action buttons hide when not allowed** (enforced in UI and before API calls): e.g. convert to PO hides after a PO exists; receive hides when an open receiving exists; create outslip/DR/billing hide once the next document exists; record payment hides when paid.

Rules live in `lib/services/transaction_actions.dart`; mutations go through `lib/widgets/transaction_workflows.dart`.

## Print / PDF

| Document | Where |
|----------|--------|
| Quotation, PO, DR | Detail → Print PDF |
| Receiving, Outslip, Billing | Detail → Print PDF |
| SOA | After generate → Print SOA PDF |
| Accomplishment | Detail → PDF |

Android opens the share sheet (save, email, WhatsApp, etc.). Layout matches office A4 letterhead where implemented.

## Offline

When the API is unreachable, list screens show the last cached data with a stale-data banner. Mutations are disabled until back online.

## Not on mobile

Setup (customers, suppliers, items, users) and inventory ledger reports — office web only.

## Regression checklist (manual)

Run on emulator or phone with API up:

1. Login / logout
2. Dashboard counts and pull-to-refresh
3. **QTN** — create → approve → convert to PO
4. **PO** — receive items
5. **Receiving** — confirm → create outslip
6. **Outslip** — approve → dispatch → create DR
7. **DR** — out for delivery → delivered → create billing
8. **Billing** — record payment
9. **SOA** — pick customer, optional dates, generate + PDF
10. **Accomplishment** — create, edit, approve, PDF
11. Confirm invalid actions are hidden or blocked (e.g. convert after PO exists)

## Project layout

```
lib/
  config/api_config.dart      # API base URL
  navigation/                 # Dashboard shell, detail host, modules
  screens/                    # Per-module list/detail pages
  services/
    transaction_actions.dart  # When buttons show/hide
    transaction_lists.dart    # Cross-module lookups for rules
  widgets/
    transaction_workflows.dart  # Dialogs + API mutations
```

`flutter analyze lib/` should report no issues before release builds.
