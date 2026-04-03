/**
 * Interface for widgets to provide their own table configurations
 */
import type { TableConfig } from '../../infrastructure/ui/components/shared/table/table-types.js';

export interface TableCallbacks<T = unknown> {
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onExport?: (item: T) => void;
  onImport?: () => void;
}

/**
 * Interface for widgets to provide table functionality
 */
export interface IWidgetTableProvider<T = unknown> {
  /**
   * Get table configuration with optional callbacks
   * Returns properly typed TableConfig for use with shared unzer-table component
   */
  getTableConfig(callbacks?: TableCallbacks<T>): TableConfig<T>;
}