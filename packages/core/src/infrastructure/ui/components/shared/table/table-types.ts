export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  formatter?: (value: unknown, row: T) => unknown;
}

export interface TableAction<T = unknown> {
  label: string;
  handler: ((item: T) => void) | (() => void);
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SearchOptions {
  term?: string;
  fields?: string[];
}

export interface SortOptions {
  field?: string;
  direction?: 'asc' | 'desc';
}

export interface DataSourceRequest {
  pagination: { page: number; pageSize: number };
  search?: SearchOptions;
  sort?: SortOptions;
}

export interface DataSourceResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface DataSource<T = unknown> {
  load(request: DataSourceRequest): Promise<DataSourceResponse<T>>;
  loadById?(id: string): Promise<T>;
  import?(fileContent: string, fileName: string): Promise<T>;
  delete?(id: string): Promise<boolean>;
  save?(item: T): Promise<T>;
}

export interface TableConfig<T = unknown> {
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  dataSource: DataSource<T>;
  pageSize?: number;
  searchable?: boolean;
  sortable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}
