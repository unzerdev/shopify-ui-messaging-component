/**
 * Simple Performance Monitor
 * Tracks operation timing and basic metrics
 */
import { logger } from '../logging/logger.js';

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: string;
  context?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Performance Monitor
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private activeTimers: Map<string, number> = new Map();
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 100;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  start(operation: string, context?: string): void {
    const key = context ? `${context}:${operation}` : operation;
    this.activeTimers.set(key, Date.now());
    logger.debug(`Started timing: ${operation}`, context);
  }

  /**
   * End timing an operation
   */
  end(operation: string, context?: string, metadata?: Record<string, unknown>): number {
    const key = context ? `${context}:${operation}` : operation;
    const startTime = this.activeTimers.get(key);

    if (!startTime) {
      logger.warn(`No start time found for operation: ${operation}`, context);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.activeTimers.delete(key);

    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      context,
      metadata,
    };

    this.recordMetric(metric);
    logger.debug(`Operation completed: ${operation} (${duration}ms)`, context, metadata);

    return duration;
  }

  /**
   * Time an async operation
   */
  async time<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: string,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(operation, context);
    try {
      const result = await fn();
      this.end(operation, context, metadata);
      return result;
    } catch (error) {
      this.end(operation, context, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get recent metrics
   */
  getMetrics(operation?: string, limit: number = 10): PerformanceMetric[] {
    let filteredMetrics = this.metrics;

    if (operation) {
      filteredMetrics = this.metrics.filter(m => m.operation === operation);
    }

    return filteredMetrics.slice(-limit);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(operation: string, context?: string): number {
    const relevantMetrics = this.metrics.filter(
      m => m.operation === operation && (!context || m.context === context)
    );

    if (relevantMetrics.length === 0) {
      return 0;
    }

    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.activeTimers.clear();
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (metric.duration > 2000) {
      logger.warn(
        `Slow operation detected: ${metric.operation} (${metric.duration}ms)`,
        metric.context
      );
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();
