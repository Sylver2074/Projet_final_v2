#!/usr/bin/env bash
set -euo pipefail

if [ ! -d .git ]; then
  echo "Ce script doit être exécuté depuis un dépôt Git initialisé." >&2
  exit 1
fi

cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "Hook pre-commit installé dans .git/hooks/pre-commit"
