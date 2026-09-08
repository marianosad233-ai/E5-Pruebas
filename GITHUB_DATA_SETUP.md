# Setting Up the Pokemon Data Repository

This guide explains how to set up a separate GitHub repository to store the Pokemon data for your application.

## Why a Separate Repository?

Using a separate repository for your data offers several advantages:
- **Permission Management**: You can give different people access to modify data vs. modify code
- **Focused Changes**: People working on data don't need to understand the web application code
- **Independent Versioning**: Data changes can be tracked separately from code changes
- **Simplified Collaboration**: Content editors can focus solely on the data

## Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., `pkm-guide-data`)
4. Set the repository to Public (required for raw content access without authentication)
5. Initialize with a README
6. Click "Create repository"

## Step 2: Set Up the Repository Structure

The repository should mirror the current data structure in your application:

```
/
├── config-region.json
├── kanto/
│   ├── leader1/
│   │   ├── pokemon1.json
│   │   ├── pokemon2.json
│   │   └── ...
│   ├── leader2/
│   │   └── ...
│   └── ...
├── johto/
│   └── ...
├── hoenn/
│   └── ...
└── ...
```

## Step 3: Export Your Current Data

1. Copy all JSON files from your current `src/data` directory to your local clone of the new repository
2. Commit and push the files to GitHub

## Step 4: Configure Your Application

1. Update the GitHub configuration in `src/config/github.config.ts`:

```typescript
export const GITHUB_CONFIG = {
  owner: 'your-github-username', // Replace with your GitHub username
  repo: 'pkm-guide-data',        // Replace with your repository name
  branch: 'main'                 // Or the branch you're using
};
```

## Step 5: Testing

1. Run your application to verify it can fetch data from GitHub
2. Check the browser console for any errors
3. Test all functionality to ensure data is loading correctly

## Managing Permissions

To allow others to edit only the data repository:
1. Go to your data repository on GitHub
2. Click "Settings" > "Collaborators and teams"
3. Add collaborators with appropriate permissions:
   - **Write**: Can push changes to the data
   - **Read**: Can only view the data

## Best Practices

1. **Documentation**: Include a README in the data repository explaining the data structure
2. **Validation**: Consider adding GitHub Actions to validate JSON files on pull requests
3. **Versioning**: Use tags or releases for significant data updates
4. **Caching**: The application includes caching to minimize GitHub API requests

## Troubleshooting

- If data doesn't load, check browser console for CORS errors
- GitHub has rate limits for API requests - consider implementing additional caching for production
- For private repositories, you'll need to implement authentication

## Local Development

For local development without relying on GitHub:
1. Clone both repositories
2. Set up a local server for the data repository
3. Update the GitHub configuration to point to your local server
