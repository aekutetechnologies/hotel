# API Client Documentation

## Overview

This folder contains API client utilities that standardize how API requests are made throughout the application. The main benefit is consistent error handling, especially for authentication errors.

## Features

- Automatic token handling
- Standardized error responses
- Automatic invalid token detection and logout
- Toast notifications for errors
- TypeScript support

## Usage

### Basic Usage

```typescript
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api/apiClient';

// GET request
const data = await apiGet<YourResponseType>('endpoint/path');

// POST request
const result = await apiPost<YourResponseType>('endpoint/path', { 
  key1: 'value1',
  key2: 'value2'
});

// PUT request
await apiPut('endpoint/path', updatedData);

// PATCH request
await apiPatch('endpoint/path', partialData);

// DELETE request
await apiDelete('endpoint/path');
```

### Error Handling

The API client automatically handles common errors:

1. **Authentication Errors**: If a 401/403 status or token-related error is detected, the user is automatically logged out (localStorage cleared) and redirected to the homepage.

2. **Other Errors**: All other errors are shown as toast notifications and the error is thrown for optional additional handling.

```typescript
try {
  const data = await apiGet('some/endpoint');
  // Process data
} catch (error) {
  // Additional error handling if needed
  // Note: Basic error toast is already shown by apiClient
}
```

### Converting Existing API Functions

When updating existing API functions to use the new client:

```typescript
// Before
export async function someApiFunction(params) {
  const response = await fetch(`${API_URL}endpoint/path`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error message');
  }

  return await response.json();
}

// After
import { apiPost } from './apiClient';

export async function someApiFunction(params) {
  try {
    return await apiPost('endpoint/path', params);
  } catch (error) {
    // Error handling is already done in apiClient
    throw error;
  }
}
```

## Advanced Options

The `apiClient` function accepts additional options:

```typescript
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  includeAuth?: boolean;  // Set to false to skip adding auth token
  throwOnError?: boolean; // Set to false to return errors instead of throwing
}
```

Example with custom options:

```typescript
const result = await apiClient('custom/endpoint', {
  method: 'POST',
  body: { data: 'value' },
  headers: { 'Custom-Header': 'value' },
  includeAuth: false,
  throwOnError: false
});
``` 