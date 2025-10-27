#!/bin/bash

# Database Initialization Script
# This script initializes the hotel management system database with seed data

echo "================================================"
echo "Hotel Management System - Database Initialization"
echo "================================================"
echo ""

# Check if virtual environment exists
if [ -d "../venv" ]; then
    echo "Activating virtual environment..."
    source ../venv/bin/activate
fi

# Check if Django settings module is configured
if [ -z "$DJANGO_SETTINGS_MODULE" ]; then
    export DJANGO_SETTINGS_MODULE=backend.settings
fi

# Run the Python initialization script
echo "Running database initialization..."
python initialize_data.py

echo ""
echo "Database initialization complete!"
echo "================================================"
