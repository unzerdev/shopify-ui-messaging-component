/**
 * Simple Application Logger
 * Provides structured logging for the application
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

/**
 * Simple Logger Implementation
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private enableConsoleLogging: boolean;

  private constructor() {
    // Determine console logging based on environment
    this.enableConsoleLogging = this.shouldEnableConsoleLogging();
  }
  
  /**
   * Determine if console logging should be enabled based on environment
   */
  private shouldEnableConsoleLogging(): boolean {
    // Check Node environment variable
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
      return false;
    }
    
    // Check if running in development mode (Vite sets this)
    if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'production') {
      return false;
    }
    
    // Default to true for development
    return true;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setConsoleLogging(enabled: boolean): void {
    this.enableConsoleLogging = enabled;
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, error?: Error | unknown): void {
    this.log('error', message, context, undefined, error instanceof Error ? error : undefined);
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
    };

    if (this.enableConsoleLogging) {
      this.logToConsole(entry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private logToConsole(entry: LogEntry): void {
    const contextStr = entry.context ? `[${entry.context}] ` : '';
    const logMessage = `${entry.timestamp} ${entry.level.toUpperCase()} ${contextStr}${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(logMessage, entry.data);
        break;
      case 'info':
        console.info(logMessage, entry.data);
        break;
      case 'warn':
        console.warn(logMessage, entry.data);
        break;
      case 'error':
        console.error(logMessage, entry.error || entry.data);
        break;
    }
  }
}

// Global logger instance
export const logger = Logger.getInstance();

// Make logger available globally for debugging
if (typeof window !== 'undefined') {
  const win = window as unknown as Record<string, unknown>;
  win.unzerLogger = logger;
  win.enableLogging = (enabled: boolean) => {
    logger.setConsoleLogging(enabled);
    console.log(`Unzer logging ${enabled ? 'enabled' : 'disabled'}`);
  };
  win.setLogLevel = (level: LogLevel) => {
    logger.setLogLevel(level);
    console.log(`Unzer log level set to: ${level}`);
  };
  
  // Log initial state
  console.log('Unzer Logger initialized. Console logging:', logger['enableConsoleLogging']);
  console.log('To control logging: enableLogging(true/false) or setLogLevel("debug"|"info"|"warn"|"error")');
}
