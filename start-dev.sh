#!/bin/bash
# Start SimpleCRM development servers
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$DIR"
npm run dev
