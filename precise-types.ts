/**
 * PRECISE TYPES FOR INSTALLMENT WIDGET
 */

// Valid component names
export type ComponentName = 'logo' | 'header' | 'timeline' | 'plans' | 'footer';

// Theme options  
export type Theme = 'light' | 'dark';

// Layout options
export type Layout = 'vertical' | 'horizontal';

// Configuration state
export interface ConfigState {
  components: ComponentName[];
  display: {
    theme: Theme;
    layout: Layout;
  };
  behavior: {
    animation: boolean;
    autoExpand: boolean;
  };
}

// Dependencies mapping
export interface Dependencies {
  timeline: ['header'];
  plans: ['timeline'];  
  footer: ['plans'];
}

// Widget schema
export interface WidgetSchema {
  availableComponents: ComponentName[];
  dependencies: Dependencies;
  defaults: ConfigState;
}

// User input (can be partial)
export interface UserConfig {
  components?: ComponentName[];
  display?: Partial<ConfigState['display']>;
  behavior?: Partial<ConfigState['behavior']>;
}