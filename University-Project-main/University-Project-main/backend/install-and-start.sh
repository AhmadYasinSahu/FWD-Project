#!/bin/bash

echo "Installing backend dependencies..."
npm install

echo ""
echo "Creating .env file from template..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Please edit the .env file with your configuration before starting the server."
    echo ""
    read -p "Press Enter to continue..."
fi

echo ""
echo "Starting the backend server..."
npm run dev
