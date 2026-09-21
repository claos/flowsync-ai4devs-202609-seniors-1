# Setup y arranque local de FlowSync (backend + frontend).
# Requiere make, node y npm. Funciona igual en macOS, Linux y Windows vía WSL
# (en Windows, ejecutar `make` desde dentro de WSL, no desde cmd/PowerShell).

.PHONY: setup start

BACKEND := backend
FRONTEND := frontend

setup:
	cd $(BACKEND) && npm install
	test -f $(BACKEND)/.env || cp $(BACKEND)/.env.example $(BACKEND)/.env
	grep -Eq '^APP_KEY=[[:graph:]]' $(BACKEND)/.env || (cd $(BACKEND) && node ace generate:key)
	cd $(BACKEND) && node ace migration:run
	cd $(FRONTEND) && npm install
	test -f $(FRONTEND)/.env || cp $(FRONTEND)/.env.example $(FRONTEND)/.env

start:
	@node scripts/dev.cjs
