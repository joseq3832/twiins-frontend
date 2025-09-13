#!/bin/bash

# Copy .env.example to .env if .env does not exist
if [ ! -f .env ]; then
  cp .env.example .env
fi

# Install dependencies with bun
bun install

# Start the application with bun
bun start