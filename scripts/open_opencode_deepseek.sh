#!/usr/bin/env bash
# Abre opencode en el directorio actual usando DeepSeek como modelo por defecto
set -euo pipefail

# Modelo a usar
MODEL="opencode/deepseek-v4-flash-free"

# Ejecutar opencode en modo puro (sin plugins externos) y forzar el modelo
opencode --pure -m "$MODEL" "$@"
