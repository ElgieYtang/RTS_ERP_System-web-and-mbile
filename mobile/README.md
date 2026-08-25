# RTS ERP — Field Mobile (Flutter)

Same Laravel API as the office web app. Field-first scope for Phase 8 v1.

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

### PDF export
- On an accomplishment detail screen, tap the **PDF** icon (top right)
- Android opens the share sheet — save to Files, email, WhatsApp, etc.
- Layout matches the office print format (letterhead, info table, photos, signatures)
