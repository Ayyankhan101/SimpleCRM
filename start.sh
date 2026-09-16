#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Data Analysis App — One-Command Startup
# Usage:
#   ./start.sh          Local dev (Flask + Vite)
#   ./start.sh --docker Production (docker-compose)
#   ./start.sh --test   Run all tests
# =============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
    echo ""
    echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}${BOLD}║       Data Analysis App                  ║${NC}"
    echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════╝${NC}"
    echo ""
}

# ── Prerequisite checks ──────────────────────────────────────────────────────

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo -e "${RED}✗ $1 not found. Please install it first.${NC}"
        exit 1
    fi
}

check_prereqs_local() {
    check_cmd node
    check_cmd python3
    check_cmd npm
}

check_prereqs_docker() {
    check_cmd docker
    if ! docker compose version &>/dev/null && ! command -v docker-compose &>/dev/null; then
        echo -e "${RED}✗ docker-compose not found.${NC}"
        exit 1
    fi
}

# ── Local dev mode ───────────────────────────────────────────────────────────

setup_backend() {
    echo -e "${YELLOW}▸ Setting up backend...${NC}"
    cd "$DIR/backend"

    if [ ! -d "venv" ]; then
        echo "  Creating Python virtual environment..."
        python3 -m venv venv
    fi

    source venv/bin/activate

    # Install deps only if requirements changed or venv is fresh
    if [ ! -f "venv/.deps_installed" ] || [ "requirements.txt" -nt "venv/.deps_installed" ]; then
        echo "  Installing Python dependencies..."
        pip install -q -r requirements.txt
        touch venv/.deps_installed
    else
        echo "  Python deps up to date."
    fi

    # Ensure .env exists
    if [ ! -f ".env" ]; then
        echo "  Creating .env from template..."
        cat > .env <<'EOF'
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production
DATABASE_URL=sqlite:///data_analytics.db
FLASK_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
    fi

    cd "$DIR"
}

setup_frontend() {
    echo -e "${YELLOW}▸ Setting up frontend...${NC}"
    cd "$DIR/frontend"

    if [ ! -d "node_modules" ]; then
        echo "  Installing frontend dependencies..."
        npm install --silent
    else
        echo "  Frontend deps up to date."
    fi

    cd "$DIR"
}

setup_root() {
    echo -e "${YELLOW}▸ Setting up root...${NC}"
    if [ ! -d "node_modules" ]; then
        echo "  Installing root dependencies (concurrently)..."
        npm install --silent
    fi
}

seed_data() {
    echo -e "${YELLOW}▸ Checking demo data...${NC}"
    cd "$DIR/backend"
    source venv/bin/activate
    python3 -c "
import os, sys
os.environ.setdefault('SECRET_KEY', 'dev-secret-key-change-in-production')
os.environ.setdefault('JWT_SECRET_KEY', 'dev-jwt-secret-key-change-in-production')
from app import create_app
from app.models import db, User
app = create_app()
with app.app_context():
    if User.query.count() == 0:
        print('  Seeding demo data...')
        from seed import seed_data
        seed_data()
        print('  ✓ Demo data seeded')
    else:
        print(f'  ✓ {User.query.count()} user(s) exist, skipping seed')
" 2>/dev/null || echo -e "  ${YELLOW}⚠ Seed skipped (will run on first request)${NC}"
    cd "$DIR"
}

start_dev() {
    banner
    echo -e "${GREEN}${BOLD}Starting in development mode...${NC}"
    echo ""

    check_prereqs_local
    setup_backend
    setup_frontend
    setup_root
    seed_data

    echo ""
    echo -e "${GREEN}${BOLD}━━━ Starting servers ━━━${NC}"
    echo -e "  Backend:   ${CYAN}http://localhost:5000${NC}"
    echo -e "  Frontend:  ${CYAN}http://localhost:5173${NC}"
    echo ""
    echo -e "  ${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""

    cd "$DIR"
    npm run dev
}

# ── Docker mode ──────────────────────────────────────────────────────────────

start_docker() {
    banner
    echo -e "${GREEN}${BOLD}Starting in Docker (production) mode...${NC}"
    echo ""

    check_prereqs_docker

    # Create root .env if missing
    if [ ! -f "$DIR/.env" ]; then
        echo -e "${YELLOW}Creating .env from template...${NC}"
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32)
        JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32)

        cat > "$DIR/.env" <<EOF
SECRET_KEY=${SECRET_KEY}
JWT_SECRET_KEY=${JWT_SECRET_KEY}
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=dataanalytics
EOF
        echo -e "  ${GREEN}✓ .env created with random secrets${NC}"
    fi

    echo -e "${GREEN}${BOLD}━━━ Starting Docker containers ━━━${NC}"
    echo -e "  App:       ${CYAN}http://localhost${NC}"
    echo -e "  Backend:   ${CYAN}http://localhost:5000${NC}"
    echo -e "  PostgreSQL: ${CYAN}localhost:5432${NC}"
    echo -e "  Redis:     ${CYAN}localhost:6379${NC}"
    echo ""
    echo -e "  ${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""

    cd "$DIR"
    if docker compose version &>/dev/null; then
        docker compose up --build
    else
        docker-compose up --build
    fi
}

# ── Test mode ────────────────────────────────────────────────────────────────

run_tests() {
    banner
    echo -e "${GREEN}${BOLD}Running all tests...${NC}"
    echo ""

    local pass=0
    local fail=0

    # Backend tests
    echo -e "${CYAN}━━━ Backend Unit Tests ━━━${NC}"
    cd "$DIR/backend"
    if [ -d "venv" ]; then source venv/bin/activate; fi
    if python3 -m pytest tests/ -q --tb=short 2>&1; then
        echo -e "${GREEN}✓ Backend tests passed${NC}"
        ((pass++))
    else
        echo -e "${RED}✗ Backend tests failed${NC}"
        ((fail++))
    fi
    echo ""

    # Frontend tests
    echo -e "${CYAN}━━━ Frontend Unit Tests ━━━${NC}"
    cd "$DIR/frontend"
    if npx vitest run 2>&1 | tail -3; then
        echo -e "${GREEN}✓ Frontend tests passed${NC}"
        ((pass++))
    else
        echo -e "${RED}✗ Frontend tests failed${NC}"
        ((fail++))
    fi
    echo ""

    # E2E tests
    echo -e "${CYAN}━━━ E2E API Tests ━━━${NC}"
    cd "$DIR/backend"
    if python3 -m pytest e2e_test.py -q --tb=short 2>&1 | tail -5; then
        echo -e "${GREEN}✓ E2E tests passed${NC}"
        ((pass++))
    else
        echo -e "${RED}✗ E2E tests failed${NC}"
        ((fail++))
    fi
    echo ""

    # Summary
    echo -e "${CYAN}${BOLD}━━━ Summary ━━━${NC}"
    echo -e "  ${GREEN}Passed: ${pass}${NC}"
    if [ "$fail" -gt 0 ]; then
        echo -e "  ${RED}Failed: ${fail}${NC}"
        exit 1
    else
        echo -e "  ${GREEN}${BOLD}All test suites passed!${NC}"
    fi
}

# ── Main ─────────────────────────────────────────────────────────────────────

case "${1:-}" in
    --docker|-d)
        start_docker
        ;;
    --test|-t)
        run_tests
        ;;
    --help|-h)
        banner
        echo "Usage: ./start.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  (no args)    Start in development mode (Flask + Vite)"
        echo "  --docker, -d Start with Docker Compose (full stack)"
        echo "  --test, -t   Run all test suites"
        echo "  --help, -h   Show this help"
        ;;
    *)
        start_dev
        ;;
esac
