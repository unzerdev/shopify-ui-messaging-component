/**
 * TableAdapter - Helper class for connecting widgets with unzer-table component
 * Provides clean interface between configuration UI and table functionality
 */
import type { TableConfig, DataSource } from './table-types.js';

export class TableAdapter<T = unknown> {

  constructor(
    public readonly config: TableConfig<T>,
    public readonly dataSource: DataSource<T>
  ) {}

  /**
   * Get current table configuration
   */
  getConfig(): TableConfig<T> {
    return this.config;
  }

  /**
   * Get data source for direct access if needed
   */
  getDataSource(): DataSource<T> {
    return this.dataSource;
  }

  /**
   * Emit refresh event to trigger table reload
   */
  async refresh(): Promise<void> {
    // Event-driven refresh system
    const refreshEvent = new CustomEvent('table-refresh-request', {
      bubbles: true,
      detail: { adapterInstance: this }
    });
    document.dispatchEvent(refreshEvent);
  }
}
