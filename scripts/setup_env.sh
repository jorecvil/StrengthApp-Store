#!/usr/bin/env bash
# Instala JDK + Android SDK + Node 22 en espacio de usuario (sin sudo).
# Uso: bash scripts/setup_env.sh
set -euo pipefail

ARCH=$(uname -m)
case "$ARCH" in
  aarch64|arm64) JARCH=aarch64;;
  x86_64) JARCH=x64;;
  *) echo "Arquitectura no soportada: $ARCH"; exit 1;;
esac

mkdir -p ~/.local/share

if [ ! -d ~/.local/share/jdk-17* ]; then
  echo ">> Descargando JDK 17 ($JARCH)..."
  curl -sL --retry 3 -o /tmp/jdk17.tar.gz "https://api.adoptium.net/v3/binary/latest/17/ga/linux/$JARCH/jdk/hotspot/normal/eclipse"
  tar -xzf /tmp/jdk17.tar.gz -C ~/.local/share
  echo "   OK"
else
  echo ">> JDK 17 ya instalado"
fi

if [ ! -d ~/.local/share/jdk-21* ]; then
  echo ">> Descargando JDK 21 ($JARCH)..."
  curl -sL --retry 3 -o /tmp/jdk21.tar.gz "https://api.adoptium.net/v3/binary/latest/21/ga/linux/$JARCH/jdk/hotspot/normal/eclipse"
  tar -xzf /tmp/jdk21.tar.gz -C ~/.local/share
  echo "   OK"
else
  echo ">> JDK 21 ya instalado"
fi

if [ ! -d ~/.local/share/node-22 ]; then
  echo ">> Descargando Node 22 ($JARCH)..."
  curl -sL --retry 3 -o /tmp/node22.tar.xz "https://nodejs.org/dist/v22.23.2/node-v22.23.2-linux-${JARCH/aarch64/arm64}.tar.xz"
  tar -xJf /tmp/node22.tar.xz -C ~/.local/share
  mv ~/.local/share/node-v22.23.2-linux-${JARCH/aarch64/arm64} ~/.local/share/node-22
  echo "   OK"
else
  echo ">> Node 22 ya instalado"
fi

if [ ! -d ~/android-sdk/cmdline-tools ]; then
  echo ">> Instalando Android SDK cmdline-tools..."
  mkdir -p ~/android-sdk/cmdline-tools
  cd ~/android-sdk/cmdline-tools
  curl -sL --retry 3 -o cmdtools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
  python3 -c "import zipfile; zipfile.ZipFile('cmdtools.zip').extractall('.')"
  mv cmdline-tools latest
  chmod +x latest/bin/*
  echo "   OK"
else
  echo ">> Android SDK cmdline-tools ya instalado"
fi

export JAVA_HOME=$(ls -d ~/.local/share/jdk-21*)
export ANDROID_HOME=$HOME/android-sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo ">> Aceptando licencias..."
yes | sdkmanager --sdk_root=$ANDROID_HOME --licenses >/dev/null 2>&1 || true

echo ">> Instalando platform-tools, platform android-36, build-tools..."
sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;36.0.0" >/dev/null 2>&1 || true

echo
echo "Entorno listo. Añade al ~/.bashrc:"
echo "  export JAVA_HOME=$(ls -d ~/.local/share/jdk-21*)"
echo "  export ANDROID_HOME=$HOME/android-sdk"
echo "  export PATH=\$JAVA_HOME/bin:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/cmdline-tools/latest/bin:\$HOME/.local/share/node-22/bin:\$PATH"
