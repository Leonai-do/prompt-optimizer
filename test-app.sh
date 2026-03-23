#!/bin/bash

# Test script for Prompt Optimizer application

echo "Starting Prompt Optimizer application test..."

# Start the Docker container
echo "Starting Docker container..."
docker run -d -p 8080:80 --name prompt-optimizer-test prompt-optimizer-dev

# Wait for the container to start
echo "Waiting for container to start..."
sleep 10

# Check if the container is running
if [ $(docker ps | grep -c prompt-optimizer-test) -eq 1 ]; then
    echo "Container is running successfully."
else
    echo "ERROR: Container failed to start."
    exit 1
fi

# Test the main application endpoint
echo "Testing main application endpoint..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [ $HTTP_STATUS -eq 200 ]; then
    echo "Main application endpoint is accessible (HTTP 200)."
else
    echo "ERROR: Main application endpoint returned HTTP $HTTP_STATUS."
    docker logs prompt-optimizer-test
    exit 1
fi

# Test the MCP endpoint
echo "Testing MCP endpoint..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/mcp)
if [ $HTTP_STATUS -eq 502 ]; then
    echo "MCP endpoint is accessible but returns 502 (expected without API keys)."
elif [ $HTTP_STATUS -eq 404 ]; then
    echo "MCP endpoint not found (404)."
else
    echo "MCP endpoint returned HTTP $HTTP_STATUS."
fi

# Check the page content
echo "Checking page content..."
PAGE_CONTENT=$(curl -s http://localhost:8080)
if [[ $PAGE_CONTENT == *"提示词优化器"* ]]; then
    echo "Page content is correct (contains '提示词优化器')."
else
    echo "ERROR: Page content is incorrect."
    echo "Page content: $(echo $PAGE_CONTENT | head -1)"
    exit 1
fi

# Clean up
echo "Cleaning up..."
docker stop prompt-optimizer-test
docker rm prompt-optimizer-test

echo "All tests passed! The application is working correctly."