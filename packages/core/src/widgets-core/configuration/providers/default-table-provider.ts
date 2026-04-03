/**
 * Default Table Provider for Configuration CRUD
 * Reusable across all widgets that need standard configuration table
 */
import { html } from 'lit';
import type { ConfigurationDto } from '../dto/index.js';
import type {
  TableConfig,
  TableColumn,
  TableAction,
} from '../../../infrastructure/ui/components/shared/table/table-types.js';
import { ConfigurationControllerDataSource } from '../datasources/configuration-controller-datasource.js';
import type { IWidgetTableProvider, TableCallbacks } from '../../interfaces/index.js';
import { _di } from '../../../infrastructure/index.js';
import type { ConfigurationController } from '../controllers/configuration-controller.js';
import type { InterfaceConstructor } from '../../../infrastructure/index.js';

export class DefaultTableProvider implements IWidgetTableProvider<ConfigurationDto> {
  constructor(private controllerToken: InterfaceConstructor<ConfigurationController>) {}

  getTableConfig(callbacks?: TableCallbacks<ConfigurationDto>): TableConfig<ConfigurationDto> {
    // Get Controller from DI
    const controller = _di(this.controllerToken);

    // Create clean DataSource
    const dataSource = new ConfigurationControllerDataSource(controller);

    // Define columns
    const columns: TableColumn<ConfigurationDto>[] = [
      {
        key: 'name',
        label: 'Configuration Name',
        width: '1fr',
        sortable: true,
        formatter: (value: unknown) => {
          const name = (value as string)?.trim() || 'Unnamed Configuration';
          return html`<strong style="color: #32325d">${name}</strong>`;
        },
      },
      {
        key: 'description',
        label: 'Description',
        width: '2fr',
        formatter: (value: unknown) => {
          const desc = (value as string)?.trim() || 'No description';
          return html`<span style="color: #8898aa; font-size: 13px">${desc}</span>`;
        },
      },
      {
        key: 'createdAt',
        label: 'Created',
        width: '120px',
        sortable: true,
        formatter: (value: unknown) => {
          if (!value) return 'Unknown';

          const date = new Date(value as string);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

          let displayText = '';
          let color = '#8898aa';

          if (diffDays === 0) {
            displayText = 'Today';
            color = '#10b981';
          } else if (diffDays === 1) {
            displayText = 'Yesterday';
            color = '#10b981';
          } else if (diffDays < 7) {
            displayText = `${diffDays}d ago`;
            color = '#10b981';
          } else {
            displayText = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
          }

          const fullDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return html`<span style="color: ${color}; font-size: 12px" title="${fullDate}">${displayText}</span>`;
        },
      },
    ];

    // Define actions - all use DataSource methods
    const actions: TableAction<ConfigurationDto>[] = [];

    if (callbacks?.onImport) {
      actions.push({
        label: 'Import',
        handler: () => callbacks.onImport!(),
        variant: 'secondary',
      });
    }

    if (callbacks?.onEdit) {
      actions.push({
        label: 'Edit',
        handler: callbacks.onEdit,
        variant: 'primary',
      });
    }

    if (callbacks?.onExport) {
      actions.push({
        label: 'Export',
        handler: callbacks.onExport,
        variant: 'secondary',
      });
    }

    if (callbacks?.onDelete) {
      actions.push({
        label: 'Delete',
        handler: callbacks.onDelete,
        variant: 'danger',
      });
    }

    return {
      columns,
      actions: actions.length > 0 ? actions : undefined,
      dataSource,
      pageSize: 10,
      searchable: true,
      sortable: true,
      searchPlaceholder: 'Search configurations by name or description...',
      emptyMessage: 'No configurations found',
      loadingMessage: 'Loading configurations...',
    };
  }
}
