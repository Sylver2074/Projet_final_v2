# Projet final DevSecOps

Ce dépôt reprend le squelette fourni et le restructure selon le sujet :

- `frontend/` : SPA statique HTML/CSS/JS déployable sur GitHub Pages.
- `backend/` : API Node.js/Express, tests Jest/Supertest, Dockerfile multi-stage et configuration Vercel.
- `.github/workflows/ci-cd.yml` : pipeline CI/CD avec tests, Gitleaks, CodeQL, scan Docker/Trivy, GHCR, GitHub Pages et Vercel.
- `.github/actions/trivy-scan/` : action composite locale pour scanner un SBOM CycloneDX.
- `scripts/pre-commit` : hook local `actionlint` + `gitleaks` + blocage des fichiers sensibles.

## Commandes locales

Depuis WSL Ubuntu, à la racine du dépôt :

```bash
cd "/mnt/c/Users/Cyril/Documents/Mastère/DevSecOps/DevSecOps_Projet_final/Projet_final_v2"
cd backend
npm ci
npm test
```

Installer le hook pre-commit après `git init` :

```bash
./scripts/install-hooks.sh
```

## Branches Git attendues

- `staging` : branche d'intégration. La CI complète s'exécute à chaque push et Pull Request.
- `main` : branche de production. Les push directs doivent être interdits dans GitHub.

Dans GitHub, configurer les Branch protection rules :

- protéger `main` et `staging`;
- interdire les push directs sur `main`;
- exiger les Pull Requests;
- exiger les jobs `Tests backend`, `Scan secrets Gitleaks`, `Analyse CodeQL` et `Build, scan et publication Docker` avant merge vers `main`;
- activer GitHub Pages avec la source `GitHub Actions`.

## Secrets SOPS/Age

Le fichier `.github/secrets-prod.yaml` garde les clés YAML lisibles et chiffre uniquement les valeurs. Les placeholders `ENC[...]` doivent être remplacés par un vrai chiffrement SOPS :

```bash
age-keygen -o ops.txt
# Copier le recipient public dans .sops.yaml et .github/secrets-prod.yaml
sops --encrypt --in-place .github/secrets-prod.yaml
gh secret set SOPS_AGE_KEY < ops.txt
```

`ops.txt` est ignoré par Git et ne doit jamais être commité.

## Variables chiffrées attendues

- `DATABASE_URL`
- `JWT_SECRET`
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID`

Le job Vercel déchiffre ces valeurs en mémoire via `SOPS_AGE_KEY`, puis les injecte dans `vercel deploy` sans écrire de fichier de secrets en clair sur le runner.
