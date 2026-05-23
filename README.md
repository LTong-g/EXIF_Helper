# EXIF Helper

EXIF Helper is a local-only Android tool for cloning selected EXIF metadata from one source photo to one or more target photo copies.

The app is intended for photos whose metadata was lost or changed after editing, exporting, or sharing.

## Features

- Pick one source photo.
- Pick any number of target photos.
- Open metadata cloning from the app home screen instead of placing the clone workflow directly on launch.
- Provide a More entry for version, privacy, and permission information.
- Provide More pages for software introduction, usage help, privacy policy, version history, project homepage, and update checks.
- Pick photos from the system gallery/photos UI or the document/file picker.
- Open a clone-options screen before writing.
- Select individual metadata tags with checkbox-style switches.
- Write jpg, jpeg, and png target copies.
- Warn before cloning PNG targets and let the user keep PNG output or save PNG targets as JPEG copies for better metadata visibility.
- Clone capture time, timezone, GPS, camera, lens, and exposure metadata.
- Save copies to `Pictures/EXIF助手`.
- Name exported copies from the target photo name with an `_exifhelper_yyyyMMdd_HHmmss` suffix.
- Do not overwrite original photos.
- Re-read metadata after writing and report per-file failures or partially verified tags.
- Request Android photo location metadata access when reading source-photo GPS.
- Check GitHub releases only when the user taps the update entry, then download, install, or delete a newer APK when one is available.

## Stack

- Expo SDK 53
- React Native 0.79
- TypeScript
- Android Kotlin native module
- AndroidX ExifInterface
- React Native New Architecture is disabled for the first version to keep Expo Dev Client startup stable on SDK 53.

Expo SDK 53 is used because this machine has Android SDK Platform 35 installed. The Android build uses compileSdk 35 and targetSdk 35, avoiding a requirement for Android SDK Platform 36.

## Development

```bash
npm install
npm run typecheck
npm run prebuild:android
npm run run:android
```

Build a development APK:

```powershell
cd android
.\gradlew.bat assembleDebug
```

The debug APK is a development build and connects to Metro. Keep Metro running in another terminal:

```powershell
npm start
```

Install and start the debug build on an emulator:

```powershell
adb install -r .\android\app\build\outputs\apk\debug\app-debug.apk
adb reverse tcp:8081 tcp:8081
adb shell am start -n com.local.exifhelper.debug/com.local.exifhelper.MainActivity -a android.intent.action.VIEW -d "exp+exif-helper://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081"
```

On first debug launch, Expo Dev Menu may show a one-time prompt. Tap `Continue` to close it and use the app.

For manual offline app testing, use the release APK.

Debug builds keep the Android `INTERNET` permission so Expo Dev Client can connect to Metro during development.
Debug and release builds both remove the Android `CAMERA` permission because the app does not take photos directly.
Debug builds use the `com.local.exifhelper.debug` application ID and the launcher name `EXIF助手 Debug`, so they can be installed beside release builds signed with the release key.

Build a directly installable APK:

Release builds require a local release signing config. The real keystore and `android/keystore.properties` are ignored by Git. Keep them backed up outside the repo; losing the release key prevents normal updates over previously installed release builds.

Expected local signing files:

```text
android/keystore.properties
android/app/release.keystore
```

Use `android/keystore.properties.example` as the non-secret template.

```powershell
cd android
.\gradlew.bat assembleRelease
```

Release APK output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Install to a connected emulator or device:

```powershell
adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```

Release builds keep the Android `INTERNET` permission only for user-initiated update checks against GitHub releases. The app still does not provide account login, cloud sync, ads, analytics, or background uploads.
Release builds declare `REQUEST_INSTALL_PACKAGES` so the user can install a downloaded release APK after explicitly choosing to update. Android may still require the user to allow installing unknown apps for this app in system settings.

When preparing a release or distribution package, copy only the Release APK to `dist/` and rename it with this format:

```text
EXIF助手-v<semantic-version>-android-<yyyyMMdd>.apk
```

Use the software version as the semantic version. The current software version is `1.1.0`.

Do not overwrite an existing archived APK with the same name.

## Privacy

- No account.
- No upload.
- No default network activity; update checks only run after the user taps the update entry.
- No camera permission.
- Metadata processing runs locally on the device.

## Current Limits

- Android only.
- No iOS support.
- No original-file overwrite by default.
- The document/file picker cannot be customized with app-defined buttons; EXIF Helper provides picker choices before opening the system UI.
- The More page opens separate app pages for software introduction, usage help, privacy policy, and version history.
- Update checks use GitHub releases and require network access only when the user taps `检查更新`.
- Downloaded update APKs are kept in the app-specific update directory, validated against the current application package and semantic version, and can be deleted from the More page.
- Some EXIF values may be normalized or refused by AndroidX ExifInterface after writing. The app keeps the saved copy and reports those tags as partially verified instead of treating the whole photo as failed.
- Android may hide source-photo GPS metadata unless photo location metadata access is granted. Re-select the source photo after granting that permission.
- No HEIC, RAW, or MakerNote writing.
- PNG EXIF recognition depends on AndroidX ExifInterface and viewer compatibility. When PNG targets are selected, the app can instead save those targets as JPEG copies to improve visibility in Android gallery and EXIF tools.
