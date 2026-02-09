#!/bin/bash

# SabjiRate - Dev Server Reset Script
# This script fixes turbopack cache issues and restarts the dev server

echo "🔧 SabjiRate Dev Server Reset Script"
echo "=========================================="

# Stop all running dev servers
echo "🛑 Stopping running dev servers..."
pkill -f "next dev"
pkill -f "bun.*dev"
pkill -f "node.*next"
sleep 3

# Clear all cache
echo "🗑️  Clearing Next.js cache..."
rm -rf /home/z/my-project/.next
rm -rf /home/z/my-project/node_modules/.cache

# Recreate essential directories
echo "📁 Recreating cache directories..."
mkdir -p /home/z/my-project/.next/cache

echo "✅ Reset complete!"
echo ""
echo "To start the dev server, run:"
echo "  bun run dev"
echo ""
echo "To view the app, check the Preview Panel on the right."
