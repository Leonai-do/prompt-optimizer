# Prompt Optimizer User Manual

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Using the Application](#using-the-application)
6. [Testing with Playwright](#testing-with-playwright)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)

## Overview

Prompt Optimizer is a powerful AI prompt optimization tool that helps write better AI prompts and improve AI output quality. It supports multiple deployment modes including Web application, Desktop application, Chrome extension, and Docker deployment.

## Prerequisites

Before running the application, ensure you have the following installed:
- Docker (version 18.09 or higher)
- Node.js (version 18, 20, or 22)
- pnpm (version 8 or higher)
- Git

## Installation

### Option 1: Docker Installation (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd prompt-optimizer
```

2. Build the Docker image:
```bash
docker build -t prompt-optimizer .
```

### Option 2: Local Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prompt-optimizer
```

2. Install dependencies:
```bash
pnpm install
```

## Running the Application

### Using Docker (Recommended)

1. Start the application:
```bash
docker run -d -p 8080:80 --name prompt-optimizer prompt-optimizer
```

2. Access the application in your browser at `http://localhost:8080`

3. To stop the application:
```bash
docker stop prompt-optimizer
docker rm prompt-optimizer
```

### Using Local Development Server

1. Start the development server:
```bash
pnpm dev
```

2. Access the application in your browser at `http://localhost:5173`

3. To build for production:
```bash
pnpm build
```

## Using the Application

1. Open your web browser and navigate to `http://localhost:8080` (Docker) or `http://localhost:5173` (local development)

2. The main interface will display:
   - Prompt input area where you can enter your prompts
   - Optimization settings panel
   - History of previous optimizations
   - Export/import functionality

3. To optimize a prompt:
   - Enter your prompt in the input area
   - Adjust optimization settings as needed
   - Click the "Optimize" button
   - View the optimized prompt in the results area

4. To use different AI models:
   - Navigate to the settings panel
   - Select your preferred AI model from the dropdown
   - Configure API keys in the environment variables

## Testing with Playwright

### Setting up Playwright

1. Navigate to the test directory:
```bash
cd test
```

2. Install Playwright dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

### Running Playwright Tests

1. Ensure the application is running (either through Docker or local development server)

2. Run all tests:
```bash
npm run test
```

3. Run tests in UI mode (for visual debugging):
```bash
npm run test:ui
```

4. Run specific test files:
```bash
npx playwright test tests/main-page.spec.ts
```

### Live Testing with Playwright

To see Playwright testing the application in real-time:

1. Start the application:
```bash
docker run -d -p 8080:80 --name prompt-optimizer prompt-optimizer
```

2. Run Playwright tests in UI mode:
```bash
cd test
npm run test:ui
```

3. The Playwright UI will open, showing:
   - Available test files
   - Test execution in real-time
   - Video recording of test runs
   - Detailed test results

4. Click on any test to see it execute in a browser window in real-time

5. After testing, stop the application:
```bash
docker stop prompt-optimizer
docker rm prompt-optimizer
```

### Writing Custom Playwright Tests

1. Create a new test file in the `test/tests` directory:
```typescript
import { test, expect } from '@playwright/test';

test('should display the main page', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads successfully
  await expect(page).toHaveTitle(/Prompt/);
  
  // Check for some expected content on the page
  await expect(page.getByText('Prompt Optimizer')).toBeVisible();
});
```

2. Run your custom test:
```bash
npx playwright test tests/your-test-file.spec.ts
```

## Configuration

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# LLM API Keys (configure as needed)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key

# Custom API configuration
VITE_CUSTOM_API_KEY=your_custom_api_key
VITE_CUSTOM_API_BASE_URL=your_custom_api_base_url
VITE_CUSTOM_API_MODEL=your_custom_model

# Access control (for Docker deployment)
ACCESS_USERNAME=admin
ACCESS_PASSWORD=your_password
```

### Docker Configuration

When running with Docker, you can pass environment variables:

```bash
docker run -d -p 8080:80 \
  -e VITE_OPENAI_API_KEY=your_openai_api_key \
  -e ACCESS_USERNAME=admin \
  -e ACCESS_PASSWORD=your_password \
  --name prompt-optimizer prompt-optimizer
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Change the port mapping: `docker run -d -p 8081:80 ...`

2. **Application not accessible**:
   - Check if the container is running: `docker ps`
   - Check container logs: `docker logs prompt-optimizer`

3. **Playwright browser dependencies missing**:
   - Install system dependencies:
   ```bash
   sudo apt-get update
   sudo apt-get install -y libgtk-4-1 libevent-2.1-7 libgstcodecparsers-1.0-0 libflite1
   ```

4. **Node.js version incompatible**:
   - Use nvm to install a compatible version:
   ```bash
   nvm install 18
   nvm use 18
   ```

5. **pnpm installation issues**:
   - Install pnpm globally:
   ```bash
   npm install -g pnpm
   ```

### Logs and Debugging

1. View Docker container logs:
```bash
docker logs prompt-optimizer
```

2. View application logs in the browser:
   - Open Developer Tools (F12)
   - Check the Console and Network tabs

3. Enable debug mode:
   - Set environment variable: `DEBUG=true`

### Support

For additional support, please check:
- Project documentation in the `docs/` directory
- GitHub issues for known problems and solutions
- Contact the development team through the project's communication channels