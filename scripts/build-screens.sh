#!/usr/bin/env bash
# Builds the real app and the two fixture sets into .screens/builds/ for screenshots.
set -euo pipefail
cd "$(dirname "$0")/.."
out=.screens/builds
rm -rf "$out" && mkdir -p "$out"
npx vite build --logLevel error --outDir "$out/real"
TEASERS_DIR=tests/fixtures/screens npx vite build --logLevel error --outDir "$out/screens"
TEASERS_DIR=tests/fixtures/all-solved npx vite build --logLevel error --outDir "$out/all-solved"
