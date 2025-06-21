# CI/CD Setup for NightVibe

This document explains the Continuous Integration and Continuous Deployment (CI/CD) setup for the NightVibe application.

## Overview

We use GitHub Actions for CI/CD. The workflow is defined in `.github/workflows/ci-cd.yml`.

## What the CI/CD Pipeline Does

1. **Continuous Integration**:
   - Runs on every push to the `main` or `master` branch and on every pull request
   - Installs dependencies
   - Generates Prisma Client
   - Lints the code
   - Builds the application
   - (In the future, it will run tests when they are added)

2. **Continuous Deployment**:
   - Only runs on pushes to the `main` or `master` branch
   - Currently a placeholder that needs to be configured based on your hosting provider

## Setup Requirements

To make the CI/CD pipeline work, you need to add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `NEXTAUTH_SECRET`: The secret used by NextAuth.js
   - `NEXTAUTH_URL`: The URL of your deployed application

## Deployment Options

There are several options for deploying your Next.js application:

### 1. Vercel (Recommended)

Vercel is the company behind Next.js and offers the best deployment experience:

- Visit [vercel.com](https://vercel.com)
- Sign up with your GitHub account
- Import your repository
- Configure your environment variables
- Deploy

### 2. Netlify

Another popular option with good Next.js support:

- Visit [netlify.com](https://netlify.com)
- Sign up and connect your GitHub account
- Import your repository
- Set up build commands (`npm run build`)
- Configure environment variables

### 3. AWS Amplify

For more control with AWS infrastructure:

- Sign in to the AWS Management Console
- Go to AWS Amplify
- Create a new app and connect to your GitHub repository
- Configure build settings

### 4. Custom Server

For complete control, you can deploy to your own server:

1. Add a deployment step to the CI/CD workflow that uses SSH to connect to your server
2. Pull the latest code
3. Build the application
4. Restart the service

## Adding Tests

When you're ready to add tests to your project:

1. Install a testing framework like Jest and React Testing Library:
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
   ```

2. Create a `jest.config.js` file
3. Add test files with the `.test.js` or `.test.tsx` extension
4. Update the CI/CD workflow to run the tests

## Monitoring and Improving the Pipeline

Over time, you may want to:

1. Add performance testing
2. Implement code coverage reports
3. Add security scanning
4. Set up staging environments

For more information on GitHub Actions, see the [official documentation](https://docs.github.com/en/actions).
