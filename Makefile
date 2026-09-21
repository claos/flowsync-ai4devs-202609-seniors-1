# Setup y arranque local de FlowSync (backend + frontend).
# Requiere make, node y npm. Funciona igual en macOS, Linux y Windows vía WSL
# (en Windows, ejecutar `make` desde dentro de WSL, no desde cmd/PowerShell).

.PHONY: setup start

BACKEND := backend
FRONTEND := frontend

setup:
	cd $(BACKEND) && npm install
	test -f $(BACKEND)/.env || cp $(BACKEND)/.env.example $(BACKEND)/.env
	grep -q '^APP_KEY=.' $(BACKEND)/.env || (cd $(BACKEND) && node ace generate:key)
	cd $(BACKEND) && node ace migration:run
	cd $(FRONTEND) && npm install
	test -f $(FRONTEND)/.env || cp $(FRONTEND)/.env.example $(FRONTEND)/.env

start:
	@echo "Backend:  http://localhost:3333"
	@echo "Frontend: http://localhost:5173"
	@trap 'kill 0' EXIT INT TERM; \
	(cd $(BACKEND) && npm run dev) & \
	(cd $(FRONTEND) && npm run dev) & \
	wait
