/**
 * API Service for DASH-Wiz Natural-SQL Integration
 * 
 * This service provides methods to communicate with the Natural-SQL backend
 * for generating SQL queries from natural language questions.
 */

// Get environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;
const API_DEBUG = import.meta.env.VITE_API_DEBUG === 'true';

/**
 * Log API requests and responses if debug mode is enabled
 */
const debugLog = (message, data) => {
  if (API_DEBUG) {
    console.log(`[API Debug] ${message}`, data);
  }
};

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make a fetch request with timeout
 */
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, { originalError: error });
    }
    throw error;
  }
};

/**
 * Check the health of the backend service
 * @returns {Promise<Object>} Health status object
 */
export const checkHealth = async () => {
  debugLog('Checking backend health...', { url: `${API_BASE_URL}/health` });

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new APIError(
        'Health check failed',
        response.status,
        await response.json().catch(() => ({}))
      );
    }

    const data = await response.json();
    debugLog('Health check successful', data);
    return data;
  } catch (error) {
    debugLog('Health check error', error);
    throw error;
  }
};

/**
 * Get backend service information
 * @returns {Promise<Object>} Service information
 */
export const getServiceInfo = async () => {
  debugLog('Fetching service info...', { url: `${API_BASE_URL}/` });

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/`);
    
    if (!response.ok) {
      throw new APIError(
        'Failed to fetch service info',
        response.status,
        await response.json().catch(() => ({}))
      );
    }

    const data = await response.json();
    debugLog('Service info received', data);
    return data;
  } catch (error) {
    debugLog('Service info error', error);
    throw error;
  }
};

/**
 * Generate SQL query from natural language question
 * 
 * @param {string} dbSchema - Database schema description
 * @param {string} question - Natural language question
 * @returns {Promise<Object>} Query response with SQL and results
 */
export const generateSQL = async (dbSchema, question) => {
  debugLog('Generating SQL...', { dbSchema: dbSchema.substring(0, 100), question });

  if (!dbSchema || !question) {
    throw new APIError('Missing required parameters', 400, {
      message: 'Both dbSchema and question are required',
    });
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/generate-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        db_schema: dbSchema,
        question: question,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        'Failed to generate SQL',
        response.status,
        errorData
      );
    }

    const data = await response.json();
    
    // Check if the response contains an error
    if (data.error) {
      throw new APIError(
        data.error,
        200,
        data
      );
    }

    debugLog('SQL generated successfully', {
      sql: data.sql_query?.substring(0, 100),
      rowCount: data.rowCount,
    });

    return data;
  } catch (error) {
    debugLog('SQL generation error', error);
    throw error;
  }
};

/**
 * Check if the backend is reachable
 * @returns {Promise<boolean>} True if backend is reachable
 */
export const isBackendReachable = async () => {
  try {
    await checkHealth();
    return true;
  } catch (error) {
    return false;
  }
};

// Export configuration for use in other modules
export const config = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  debug: API_DEBUG,
};

