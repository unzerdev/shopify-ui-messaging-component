/**
 * Configuration-specific Validation Schemas
 */
import { ValidationSchema, CommonRules } from '../validation-schema.js';

/**
 * Validation schema for creating configurations
 */
export const CreateConfigurationSchema: ValidationSchema = {
  name: {
    required: true,
    rules: [
      CommonRules.minLength(2),
      CommonRules.maxLength(100),
      {
        name: 'noSpecialChars',
        message: 'Name can only contain letters, numbers, spaces, hyphens, and underscores',
        validate: (value: unknown) => /^[a-zA-Z0-9\s\-_]+$/.test(value as string),
      },
    ],
  },
  description: {
    required: false,
    rules: [CommonRules.maxLength(500)],
  },
  config: {
    required: true,
    rules: [
      CommonRules.hasProperty('publicKey'),
      {
        name: 'validConfigObject',
        message: 'Configuration must be a valid object',
        validate: (value: unknown) => Boolean(value && typeof value === 'object' && !(value instanceof Array)),
      },
    ],
  },
};

/**
 * Validation schema for updating configurations
 */
export const UpdateConfigurationSchema: ValidationSchema = {
  id: {
    required: true,
    rules: [
      CommonRules.minLength(1),
      {
        name: 'validId',
        message: 'ID must be a valid identifier',
        validate: (value: unknown) => /^[a-zA-Z0-9\-_]+$/.test(value as string),
      },
    ],
  },
  name: {
    required: false,
    rules: [
      CommonRules.minLength(2),
      CommonRules.maxLength(100),
      {
        name: 'noSpecialChars',
        message: 'Name can only contain letters, numbers, spaces, hyphens, and underscores',
        validate: (value: unknown) => /^[a-zA-Z0-9\s\-_]+$/.test(value as string),
      },
    ],
  },
  description: {
    required: false,
    rules: [CommonRules.maxLength(500)],
  },
  config: {
    required: false,
    rules: [
      {
        name: 'validConfigObject',
        message: 'Configuration must be a valid object',
        validate: (value: unknown) => Boolean(value && typeof value === 'object' && !(value instanceof Array)),
      },
    ],
  },
};

/**
 * Validation schema for listing configurations
 */
export const ListConfigurationsSchema: ValidationSchema = {
  page: {
    required: false,
    rules: [CommonRules.positive(), CommonRules.integer(), CommonRules.min(1)],
  },
  pageSize: {
    required: false,
    rules: [
      CommonRules.positive(),
      CommonRules.integer(),
      CommonRules.min(1),
      CommonRules.max(100),
    ],
  },
  search: {
    required: false,
    rules: [CommonRules.maxLength(200)],
  },
  sortBy: {
    required: false,
    rules: [
      {
        name: 'validSortField',
        message: 'Sort field must be one of: name, createdAt, updatedAt',
        validate: (value: unknown) => ['name', 'createdAt', 'updatedAt'].includes(value as string),
      },
    ],
  },
  sortOrder: {
    required: false,
    rules: [
      {
        name: 'validSortOrder',
        message: 'Sort order must be asc or desc',
        validate: (value: unknown) => ['asc', 'desc'].includes(value as string),
      },
    ],
  },
};

/**
 * Validation schema for styler configuration object
 */
export const StylerConfigSchema: ValidationSchema = {
  publicKey: {
    required: true,
    rules: [CommonRules.publicKey()],
  },
  layout: {
    required: false,
    rules: [
      {
        name: 'validLayout',
        message: 'Layout must be one of: arrows, select, buttons',
        validate: (value: unknown) => ['arrows', 'select', 'buttons'].includes(value as string),
      },
    ],
  },
  theme: {
    required: false,
    rules: [
      {
        name: 'validTheme',
        message: 'Theme must be one of: light, dark',
        validate: (value: unknown) => ['light', 'dark'].includes(value as string),
      },
    ],
  },
  colors: {
    required: false,
    rules: [
      {
        name: 'validColorsObject',
        message: 'Colors must be a valid object',
        validate: (value: unknown) => !value || (typeof value === 'object' && !(value instanceof Array)),
      },
    ],
  },
  spacing: {
    required: false,
    rules: [
      {
        name: 'validSpacingObject',
        message: 'Spacing must be a valid object',
        validate: (value: unknown) => !value || (typeof value === 'object' && !(value instanceof Array)),
      },
    ],
  },
  typography: {
    required: false,
    rules: [
      {
        name: 'validTypographyObject',
        message: 'Typography must be a valid object',
        validate: (value: unknown) => !value || (typeof value === 'object' && !(value instanceof Array)),
      },
    ],
  },
};
