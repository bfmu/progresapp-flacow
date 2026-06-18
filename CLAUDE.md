## GitFlow — flujo obligatorio

### Ramas
- `main` → producción. Deploy automático al mergear.
- `develop` → integración continua.
- `feature/<nombre>` → trabajo de desarrollo.
- `release/<version>` → rama de release (desde develop → main).

### Reglas — sin excepciones
- **NUNCA** push directo a `main` ni `develop` — ni Claude ni el usuario
- **SIEMPRE** partir desde `develop` con una feature branch antes de tocar código
- Todo cambio va por PR → CI verde → merge
- No mergear con CI rojo
- **NO EXISTE el hotfix directo a main** — ningún cambio, por urgente que sea, se pushea directo. Siempre feature branch → PR → develop → release. Saltarse este flujo desincroniza develop de main y genera conflictos.

### Flujo completo

```
# 1. Desarrollo (incluyendo fixes urgentes — sin excepciones)
git checkout develop && git pull origin develop
git checkout -b feature/nombre-descriptivo   # o fix/nombre si es un bug
# ... cambios ...
git commit -m "tipo: descripción"
git push origin feature/nombre-descriptivo
gh pr create --base develop --head feature/nombre-descriptivo

# 2. Release a prod (usar el script — siempre)
./scripts/release.sh 0.5.0 "descripción"
```

### Release automático — `scripts/release.sh`
```bash
./scripts/release.sh <version> <descripción>
# Hace todo: crea release/x.x.x, PR a main, espera CI, mergea y espera deploy
```

> **Nota para Claude**: Verificá siempre en qué rama estás con `git branch`. Si estás en `main` o `develop`, creá una feature branch primero. Aplicá el release script para ir a prod. Esto aplica también para fixes de Dockerfile, CI, infra, docs — todo va por el mismo flujo. No hay excepciones.

---

## CI/CD

### Jobs que corren en cada PR (`feature/*` → `develop`, `release/*` → `main`)

| Job | Steps |
|-----|-------|
| `Backend (NestJS)` | `npm ci` → `npm run lint` → `npm run test` → `npm run build` |
| `Shared package` | `npm ci` (workspaces) → `npm test` (jest.config.ts) |
| `Frontend (Astro)` | `npm ci` (workspaces) → `tsc --noEmit` → `npm run build` |

### Deploy (push a `main`)
Solo se activa si hay cambios en `backend/**`, `frontend/**`, `packages/**`, `docker-compose.yml`, `nginx.conf`.
Script: `cd ~/docker/github/progresapp-flacow && git pull origin main && docker compose up -d --build && docker image prune -f`

### Secrets requeridos en GitHub
| Secret | Descripción |
|--------|-------------|
| `DEPLOY_HOST` | IP o hostname del servidor de prod |
| `DEPLOY_USER` | Usuario SSH |
| `DEPLOY_SSH_KEY` | Clave SSH privada |

### Runner
`ubuntu-latest` (GitHub-hosted). El repo en el servidor está en `/home/bryan/docker/github/progresapp-flacow` y el remote es `redflox/progresapp-flacow`.
