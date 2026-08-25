# RTS ERP — Field Mobile (Flutter)

Same Laravel API as the office web app. Mobile mirrors the web **TRANSACTIONS** menu only (not Setup or Reports).

## Prerequisites

- Flutter SDK on PATH (`flutter doctor` clean)
- Android Studio + emulator (or USB device)
- Laravel API running (`php artisan serve --host=0.0.0.0 --port=8000`)

## API base URL

Edit `lib/config/api_config.dart`:

| Where you run the app | Base URL |
|-----------------------|----------|
| Android emulator | `http://10.0.2.2:8000/api` |
| Physical phone (same Wi‑Fi) | `http://YOUR-PC-LAN-IP:8000/api` |
| iOS simulator | `http://127.0.0.1:8000/api` |

Cleartext HTTP is allowed for debug in `android/app/src/main/AndroidManifest.xml`.

## Flutter SDK

Use the SDK under your Windows user (not another profile):

`C:\Users\DELL\develop\flutter`

That path is on your user PATH. Open a **new** terminal after install so `flutter` resolves there.

## Run

```powershell
# Terminal 1 — API (reachable from emulator)
cd C:\erp-system\backend
C:\wamp64\bin\php\php8.3.28\php.exe artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 — mobile
cd C:\erp-system\mobile
.\scripts\bootstrap.ps1   # repairs Android scaffold + pub get (once)
flutter run
```

Login with a `setup_users` account (e.g. **admin** / **p@ssw0rd**).

## Phase 8 screens

### M1
- Login / logout (Bearer token)
- Home (counts from API)
- Receiving (list, detail, confirm → inventory IN)
- Delivery receipts (list, detail, out for delivery / delivered)
- Accomplishments (list, create, camera/gallery upload, delete photos)

### M2
- Filters on receiving / deliveries
- Offline read of last lists when API is down
- Clearer API unreachable messages
- Photo upload auto-retry + Retry action

### M3
- Outslips tab (approve pending → dispatch approved / inventory OUT)
- Home count for outslips needing action

### M4 — Transactions (same as web sidebar)
Matches web **TRANSACTIONS** section with the same workflow actions:

| Step | Mobile actions |
|------|----------------|
| Quotation | **New**, approve, cancel, convert to PO |
| Purchase order | Receive items → creates receiving |
| Receiving | Confirm → **Create outslip** |
| Outslip | **New**, approve, dispatch → **Create DR** |
| Delivery receipt | Out for delivery, delivered → **Create billing** |
| Billing | Record payment |
| SOA | Generate by customer |
| Accomplishments | **New**, approve, photos, PDF |

Full chain: **Quotation → PO → Receiving → Outslip → DR → Billing → Payment** (same as web).

**Action buttons hide after use** (same as web): e.g. **Receive items** disappears when an open receiving exists for that PO; **Convert to PO** hides after a PO is created; **Create outslip / DR / billing** hide once the next document exists; **Record payment** hides when paid.

**Print / PDF** (detail screens or SOA): Quotation, Purchase order, Delivery receipt, SOA — same official A4 layout as web (letterhead, tables, signatures). Tap **Print / PDF** to share. Accomplishments use the **PDF** icon on the detail screen.

**Not on mobile:** Setup and Reports (inventory ledger, etc.) — office web only.

- **Home** + **drawer (☰)** list all transaction modules
- Bottom tabs: Receiving, Outslips, Deliveries, Accomplishments

### PDF export
- **Accomplishments:** detail screen → **PDF** icon (top right)
- **Transactions:** open a quotation, PO, delivery receipt detail → **Print / PDF** (matches web A4 format)
- **SOA:** generate statement → **Print SOA PDF**
- Android opens the share sheet — save to Files, email, WhatsApp, etc.
- Layout uses the same letterhead and line-item table style as the office printouts
