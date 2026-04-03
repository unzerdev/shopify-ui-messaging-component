import { html, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import tableStylesContent from './styles/table.css?inline';
import type { TableConfig, DataSourceRequest, PaginationInfo, SortOptions, TableColumn } from './table-types.js';
import { logger } from '../../../../logging/logger.js';

@customElement('unzer-table')
export class UnzerTable<T = unknown> extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(tableStylesContent)
    ];
  }

  @property({ type: Object })
  config!: TableConfig<T>;

  @state()
  private data: T[] = [];

  @state()
  private pagination: PaginationInfo = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  @state()
  private loading = false;

  @state()
  private searchTerm = '';

  @state()
  private sortOptions: SortOptions = {};

  @state()
  private error: string | null = null;

  async connectedCallback() {
    super.connectedCallback();
    if (this.config) {
      this.pagination.pageSize = this.config.pageSize || 10;
      await this.loadData();
    }
    
    // Listen for configuration changes to auto-refresh
    document.addEventListener('configuration-deleted', this.handleConfigurationChange.bind(this));
    document.addEventListener('configuration-saved', this.handleConfigurationChange.bind(this));
    document.addEventListener('configuration-imported', this.handleConfigurationChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('configuration-deleted', this.handleConfigurationChange.bind(this));
    document.removeEventListener('configuration-saved', this.handleConfigurationChange.bind(this));
    document.removeEventListener('configuration-imported', this.handleConfigurationChange.bind(this));
  }

  private async handleConfigurationChange(event: Event) {
    logger.info('Unzer-table received configuration change event', 'UnzerTable', { eventType: event.type });
    await this.loadData();
  }

  async loadData() {
    logger.info('Unzer-table loadData() called', 'UnzerTable');
    if (!this.config?.dataSource) return;

    this.loading = true;
    this.error = null;

    try {
      const request: DataSourceRequest = {
        pagination: {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        },
        search: this.searchTerm
          ? {
              term: this.searchTerm,
            }
          : undefined,
        sort: this.sortOptions.field ? this.sortOptions : undefined,
      };

      logger.info('Making DataSource.load request', 'UnzerTable', { request });
      const response = await this.config.dataSource.load(request);
      logger.info('DataSource.load response', 'UnzerTable', { response });
      
      this.data = response.data;
      this.pagination = response.pagination;
      this.error = null;
      
      logger.info('Table data updated', 'UnzerTable', { dataLength: this.data.length });
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load data';
      this.data = [];
      logger.error('Error loading table data', 'UnzerTable', { error: err });
    } finally {
      this.loading = false;
    }
  }

  private async handleSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.pagination.page = 1;
    await this.loadData();
  }

  private async handleSort(field: string) {
    if (!this.config.sortable) return;

    if (this.sortOptions.field === field) {
      // Toggle direction
      this.sortOptions.direction = this.sortOptions.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // New field
      this.sortOptions = { field, direction: 'asc' };
    }

    this.pagination.page = 1;
    await this.loadData();
  }

  private async handlePageChange(page: number) {
    this.pagination.page = page;
    await this.loadData();
  }

  private async handlePageSizeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.pagination.pageSize = parseInt(select.value);
    this.pagination.page = 1;
    await this.loadData();
  }

  private renderCell(column: TableColumn<T>, row: T) {
    const value = (row as Record<string, unknown>)[column.key];

    if (column.formatter) {
      return column.formatter(value, row);
    }

    return String(value || '');
  }

  private renderActions(row: T) {
    if (!this.config.actions?.length) return '';

    return html`
      <div class="table-actions">
        ${this.config.actions.map(
          action => html`
            <button
              class="action-btn ${action.variant === 'danger' ? 'danger' : ''}"
              @click=${() => {
                // Check if handler expects row parameter or is parameterless
                if (action.handler.length === 0) {
                  (action.handler as () => void)();
                } else {
                  (action.handler as (item: T) => void)(row);
                }
              }}
            >
              ${action.label}
            </button>
          `
        )}
      </div>
    `;
  }

  private renderPagination() {
    if (this.pagination.totalPages <= 1) return '';

    const { page, pageSize, total, totalPages } = this.pagination;
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    // Generate page numbers (show max 7 pages)
    const maxPages = 7;
    let startPage = Math.max(1, page - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return html`
      <div class="pagination">
        <div class="pagination-info">${this.t('shared.table.showing')} ${start}-${end} ${this.t('shared.table.of')} ${total} ${this.t('shared.table.entries')}</div>

        <div class="pagination-controls">
          <button
            class="page-btn"
            ?disabled=${page === 1}
            @click=${() => this.handlePageChange(page - 1)}
          >
            ${this.t('shared.table.previous')}
          </button>

          ${startPage > 1
            ? html`
                <button class="page-btn" @click=${() => this.handlePageChange(1)}>1</button>
                ${startPage > 2 ? html`<span>...</span>` : ''}
              `
            : ''}
          ${pages.map(
            p => html`
              <button
                class="page-btn ${p === page ? 'active' : ''}"
                @click=${() => this.handlePageChange(p)}
              >
                ${p}
              </button>
            `
          )}
          ${endPage < totalPages
            ? html`
                ${endPage < totalPages - 1 ? html`<span>...</span>` : ''}
                <button class="page-btn" @click=${() => this.handlePageChange(totalPages)}>
                  ${totalPages}
                </button>
              `
            : ''}

          <button
            class="page-btn"
            ?disabled=${page === totalPages}
            @click=${() => this.handlePageChange(page + 1)}
          >
            ${this.t('shared.table.next')}
          </button>

          <div class="page-size-selector">
            <span>${this.t('shared.table.show')}</span>
            <select
              class="page-size-select"
              .value=${pageSize.toString()}
              @change=${this.handlePageSizeChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  async refresh() {
    await this.loadData();
  }

  render() {
    if (!this.config) {
      return html`<div class="empty">${this.t('shared.table.noConfig')}</div>`;
    }

    return html`
      <div class="table-container">
        ${this.config.searchable
          ? html`
              <div class="search-container">
                <input
                  type="text"
                  class="search-input"
                  placeholder="${this.config.searchPlaceholder || this.t('shared.table.search')}"
                  .value=${this.searchTerm}
                  @input=${this.handleSearch}
                />
              </div>
            `
          : ''}

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                ${this.config.columns.map(
                  column => html`
                    <th
                      class="${column.sortable && this.config.sortable ? 'sortable' : ''}"
                      style=${column.width ? `width: ${column.width}` : ''}
                      @click=${column.sortable && this.config.sortable
                        ? () => this.handleSort(column.key)
                        : undefined}
                    >
                      ${column.label}
                      ${column.sortable &&
                      this.config.sortable &&
                      this.sortOptions.field === column.key
                        ? html`
                            <span class="sort-indicator">
                              ${this.sortOptions.direction === 'desc' ? '↓' : '↑'}
                            </span>
                          `
                        : ''}
                    </th>
                  `
                )}
                ${this.config.actions?.length
                  ? html`<th class="actions-cell actions-header">Actions</th>`
                  : ''}
              </tr>
            </thead>
            <tbody>
              ${this.loading
                ? html`
                    <tr>
                      <td
                        colspan=${this.config.columns.length +
                        (this.config.actions?.length ? 1 : 0)}
                        class="loading"
                      >
                        <div class="loading-spinner"></div>
                        ${this.config.loadingMessage || this.t('shared.table.loading')}
                      </td>
                    </tr>
                  `
                : this.data.length > 0
                  ? this.data.map(
                      row => html`
                        <tr>
                          ${this.config.columns.map(
                            column => html` <td>${this.renderCell(column, row)}</td> `
                          )}
                          ${this.config.actions?.length
                            ? html` <td class="actions-cell">${this.renderActions(row)}</td> `
                            : ''}
                        </tr>
                      `
                    )
                  : html`
                      <tr>
                        <td
                          colspan=${this.config.columns.length +
                          (this.config.actions?.length ? 1 : 0)}
                          class="empty"
                        >
                          ${this.error || this.config.emptyMessage || this.t('shared.table.noData')}
                        </td>
                      </tr>
                    `}
            </tbody>
          </table>
        </div>

        ${this.renderPagination()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-table': UnzerTable;
  }
}
