# Protection des branches

GitHub ne versionne pas directement les Branch protection rules dans le dépôt. La configuration suivante doit être appliquée dans l'interface GitHub après publication du dépôt.

## Branche `staging`

- Exiger une Pull Request avant fusion.
- Exiger les statuts de CI :
  - `Tests backend`
  - `Scan secrets Gitleaks`
  - `Analyse CodeQL`
- Conserver l'historique linéaire si la politique d'équipe le demande.

## Branche `main`

- Interdire les push directs.
- Exiger une Pull Request venant de `staging`.
- Exiger les statuts de CI :
  - `Tests backend`
  - `Scan secrets Gitleaks`
  - `Analyse CodeQL`
  - `Build, scan et publication Docker`
- Exiger la résolution des conversations de review.
- Lier les déploiements à l'environnement GitHub `production`.

Le workflow `.github/workflows/ci-cd.yml` rend cette stratégie visible avec des conditions `github.ref == 'refs/heads/main'`, des `needs` explicites et un environnement `production` pour le backend.
