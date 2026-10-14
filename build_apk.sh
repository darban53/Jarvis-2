#!/usr/bin/env bash
set -e

echo "=== [1/7] Initializing Android Build Pipeline ==="
ANDROID_JAR="/opt/android-sdk/platforms/android-33/android.jar"
FRAMEWORK_RES="/usr/share/android-framework-res/framework-res.apk"
BASE_DIR="$(pwd)"
APP_DIR="$BASE_DIR/android/app/src/main"
BUILD_TMP="$BASE_DIR/android/build_tmp"
OUTPUT_DIR="$BASE_DIR/build-outputs"

rm -rf "$BUILD_TMP" "$OUTPUT_DIR"
mkdir -p "$BUILD_TMP/gen" "$BUILD_TMP/bin" "$BUILD_TMP/classes" "$OUTPUT_DIR"

echo "=== [2/7] Compiling Android Resources with AAPT ==="
aapt package -f -m \
    -J "$BUILD_TMP/gen" \
    -M "$APP_DIR/AndroidManifest.xml" \
    -S "$APP_DIR/res" \
    -I "$ANDROID_JAR"

echo "=== [3/7] Compiling Java Source Files with javac ==="
javac -target 1.8 -source 1.8 \
    -bootclasspath "$ANDROID_JAR" \
    -cp "$BUILD_TMP/gen" \
    -d "$BUILD_TMP/classes" \
    "$APP_DIR/java/com/stark/jarvis/MainActivity.java" \
    "$BUILD_TMP/gen/com/stark/jarvis/R.java"

echo "=== [4/7] Generating classes.dex with dx ==="
dx --dex --output="$BUILD_TMP/bin/classes.dex" "$BUILD_TMP/classes"

echo "=== [5/7] Packaging APK Container with AAPT ==="
aapt package -f \
    -M "$APP_DIR/AndroidManifest.xml" \
    -S "$APP_DIR/res" \
    -A "$APP_DIR/assets" \
    -I "$ANDROID_JAR" \
    -F "$BUILD_TMP/bin/app-unsigned.apk"

cd "$BUILD_TMP/bin"
zip -uj app-unsigned.apk classes.dex
cd "$BASE_DIR"

echo "=== [6/7] Aligning APK with zipalign ==="
zipalign -f -v 4 "$BUILD_TMP/bin/app-unsigned.apk" "$BUILD_TMP/bin/app-aligned.apk"

echo "=== [7/7] Signing APK with apksigner ==="
KEYSTORE="$BUILD_TMP/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkeypair -v \
        -keystore "$KEYSTORE" \
        -alias androiddebugkey \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass android \
        -keypass android \
        -dname "CN=Android Debug,O=Stark Industries,C=US"
fi

apksigner sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:android \
    --ks-key-alias androiddebugkey \
    --key-pass pass:android \
    --out "$OUTPUT_DIR/app-debug.apk" \
    "$BUILD_TMP/bin/app-aligned.apk"

echo "=== Verification ==="
apksigner verify --verbose "$OUTPUT_DIR/app-debug.apk"

ls -lh "$OUTPUT_DIR/app-debug.apk"
echo ">>> SUCCESS: Installable APK created at: build-outputs/app-debug.apk"
