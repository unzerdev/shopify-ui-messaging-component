/**
 * Invoice Widget Configuration Schema
 */
import { ConfigurationSchema } from '@unzer/messaging-core';
import { LOCALE_OPTIONS } from '@unzer/messaging-core';

export const INVOICE_CONFIG_SCHEMA: ConfigurationSchema = {
  version: '1.0.0',
  widget: 'invoice',
  tabs: [
    {
      id: 'components',
      labelKey: 'invoice.schema.tab.components',
      icon: 'settings',
      sections: [
        {
          id: 'components',
          titleKey: 'invoice.schema.section.components',
          fields: []
        },
        {
          id: 'display',
          titleKey: 'invoice.schema.section.displayOptions',
          fields: [
            {
              key: 'infoButtonLayout',
              type: 'drag-option',
              labelKey: 'invoice.schema.field.infoTrigger',
              descriptionKey: 'invoice.schema.field.infoTriggerDesc',
              defaultValue: 'icon',
              options: [
                { value: 'icon', labelKey: 'invoice.schema.option.button', icon: 'info' },
                { value: 'link', labelKey: 'invoice.schema.option.textLink', icon: 'link' }
              ],
              metadata: {
                multiple: false
              }
            },
            {
              key: 'unzerLogoDisplay',
              type: 'drag-option',
              labelKey: 'invoice.schema.field.logoVariant',
              descriptionKey: 'invoice.schema.field.logoVariantDesc',
              defaultValue: 'icon',
              options: [
                { value: 'unzer-logo', labelKey: 'invoice.schema.option.unzerLogo', icon: 'palette' },
                { value: 'icon', labelKey: 'invoice.schema.option.icon', icon: 'image' },
                { value: 'pm-logo', labelKey: 'invoice.schema.option.pmLogo', icon: 'credit-card' }
              ],
              metadata: {
                multiple: false
              }
            },
            {
              key: 'unzerLogoPosition',
              type: 'drag-option',
              labelKey: 'invoice.schema.field.logoPosition',
              descriptionKey: 'invoice.schema.field.logoPositionDesc',
              defaultValue: 'left',
              conditions: {
                enable: [
                  { field: 'unzerLogoDisplay', operator: 'notEquals', value: '' }
                ]
              },
              options: [
                { value: 'left', labelKey: 'invoice.schema.option.left', icon: 'format-align-left' },
                { value: 'right', labelKey: 'invoice.schema.option.right', icon: 'format-align-right' }
              ],
              metadata: {
                multiple: false
              }
            }
          ]
        }
      ]
    },
    {
      id: 'general',
      labelKey: 'invoice.schema.tab.general',
      icon: 'settings',
      sections: [
        {
          id: 'basic',
          titleKey: 'invoice.schema.section.basic',
          fields: [
            {
              key: 'locale',
              type: 'select',
              labelKey: 'invoice.schema.field.locale',
              descriptionKey: 'invoice.schema.field.localeDesc',
              defaultValue: 'en',
              options: LOCALE_OPTIONS.map(l => ({ value: l.value, labelKey: l.label })),
              metadata: {
                width: 'half'
              }
            },
            {
              key: 'expiryDays',
              type: 'number',
              labelKey: 'invoice.schema.field.expiryDays',
              descriptionKey: 'invoice.schema.field.expiryDaysDesc',
              defaultValue: 14,
              validation: {
                min: 1,
                max: 365,
                step: 1
              },
              metadata: {
                width: 'half'
              }
            },
            {
              key: 'previewMode',
              type: 'toggle',
              labelKey: 'invoice.schema.field.previewMode',
              descriptionKey: 'invoice.schema.field.previewModeDesc',
              defaultValue: true,
              metadata: {
                width: 'quarter'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'styling',
      labelKey: 'invoice.schema.tab.styling',
      icon: 'palette',
      sections: [
        {
          id: 'colors',
          titleKey: 'invoice.schema.section.colors',
          layout: 'grid',
          fields: [
            {
              key: 'primaryColor',
              type: 'color',
              labelKey: 'invoice.schema.field.primaryColor',
              descriptionKey: 'invoice.schema.field.primaryColorDesc',
              defaultValue: '#f3f4f6',
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-primary-color',
                cssScope: 'both'
              }
            },
            {
              key: 'secondaryColor',
              type: 'color',
              labelKey: 'invoice.schema.field.secondaryColor',
              descriptionKey: 'invoice.schema.field.secondaryColorDesc',
              defaultValue: '#2563eb',
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-secondary-color',
                cssScope: 'both'
              }
            },
            {
              key: 'backgroundColor',
              type: 'color',
              labelKey: 'invoice.schema.field.backgroundColor',
              descriptionKey: 'invoice.schema.field.backgroundColorDesc',
              defaultValue: '#FFFFFF',
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-background-color',
                cssScope: 'both'
              }
            },
            {
              key: 'textColor',
              type: 'color',
              labelKey: 'invoice.schema.field.textColor',
              descriptionKey: 'invoice.schema.field.textColorDesc',
              defaultValue: '#2D2D2D',
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-text-color',
                cssScope: 'both'
              }
            },
            {
              key: 'borderColor',
              type: 'color',
              labelKey: 'invoice.schema.field.borderColor',
              descriptionKey: 'invoice.schema.field.borderColorDesc',
              defaultValue: '#E0E0E0',
              conditions: {
                enable: [
                  { field: 'showBorder', operator: 'equals', value: true }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-border-color',
                cssScope: 'both'
              }
            },
            {
              key: 'infoIconColor',
              type: 'color',
              labelKey: 'invoice.schema.field.infoIconColor',
              defaultValue: '#9E9E9E',
              conditions: {
                enable: [
                  { field: 'infoButtonLayout', operator: 'equals', value: 'icon' }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-info-icon-color',
                cssScope: 'both'
              }
            },
            {
              key: 'infoLinkColor',
              type: 'color',
              labelKey: 'invoice.schema.field.infoLinkColor',
              defaultValue: '#F21C58',
              conditions: {
                enable: [
                  { field: 'infoButtonLayout', operator: 'equals', value: 'link' }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-info-link-color',
                cssScope: 'both'
              }
            }
          ]
        },
        {
          id: 'typography',
          titleKey: 'invoice.schema.section.typography',
          fields: [
            {
              key: 'fontFamily',
              type: 'select',
              labelKey: 'invoice.schema.field.fontFamily',
              descriptionKey: 'invoice.schema.field.fontFamilyDesc',
              defaultValue: 'Arial, sans-serif',
              options: [
                { value: 'Arial, sans-serif', labelKey: 'invoice.schema.option.fontArial' },
                { value: 'Helvetica, Arial, sans-serif', labelKey: 'invoice.schema.option.fontHelvetica' },
                { value: 'Georgia, serif', labelKey: 'invoice.schema.option.fontGeorgia' },
                { value: 'Times New Roman, Times, serif', labelKey: 'invoice.schema.option.fontTimesNewRoman' },
                { value: 'Courier New, Courier, monospace', labelKey: 'invoice.schema.option.fontCourierNew' },
                { value: 'Verdana, Geneva, sans-serif', labelKey: 'invoice.schema.option.fontVerdana' },
                { value: 'Trebuchet MS, Helvetica, sans-serif', labelKey: 'invoice.schema.option.fontTrebuchetMS' },
                { value: 'Palatino, Palatino Linotype, serif', labelKey: 'invoice.schema.option.fontPalatino' },
                { value: 'Impact, Charcoal, sans-serif', labelKey: 'invoice.schema.option.fontImpact' },
                { value: 'Comic Sans MS, cursive', labelKey: 'invoice.schema.option.fontComicSansMS' },
                { value: 'Lucida Console, Monaco, monospace', labelKey: 'invoice.schema.option.fontLucidaConsole' },
                { value: 'system-ui, -apple-system, sans-serif', labelKey: 'invoice.schema.option.fontSystemUI' },
                { value: 'Roboto, sans-serif', labelKey: 'invoice.schema.option.fontRoboto' },
                { value: 'Open Sans, sans-serif', labelKey: 'invoice.schema.option.fontOpenSans' },
                { value: 'Lato, sans-serif', labelKey: 'invoice.schema.option.fontLato' },
                { value: 'Montserrat, sans-serif', labelKey: 'invoice.schema.option.fontMontserrat' }
              ],
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-font-family',
                cssScope: 'both'
              }
            },
            {
              key: 'fontSize',
              type: 'range',
              labelKey: 'invoice.schema.field.fontSize',
              defaultValue: 14,
              validation: {
                min: 1,
                max: 100,
                step: 1
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-font-size',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'fontWeight',
              type: 'range',
              labelKey: 'invoice.schema.field.fontWeight',
              defaultValue: 400,
              validation: {
                min: 100,
                max: 900,
                step: 100
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-font-weight',
                cssScope: 'both'
              }
            }
          ]
        },
        {
          id: 'appearance',
          titleKey: 'invoice.schema.section.appearance',
          fields: [
            {
              key: 'showBorder',
              type: 'toggle',
              labelKey: 'invoice.schema.field.showBorder',
              defaultValue: true,
              metadata: {
                width: 'quarter'
              }
            },
            {
              key: 'borderRadius',
              type: 'range',
              labelKey: 'invoice.schema.field.borderRadius',
              defaultValue: 8,
              validation: {
                min: 1,
                max: 25,
                step: 1
              },
              conditions: {
                enable: [
                  { field: 'showBorder', operator: 'equals', value: true }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-border-radius',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'borderWidth',
              type: 'range',
              labelKey: 'invoice.schema.field.borderWidth',
              defaultValue: 1,
              validation: {
                min: 1,
                max: 4,
                step: 1
              },
              conditions: {
                enable: [
                  { field: 'showBorder', operator: 'equals', value: true }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-border-width',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'spacing',
              type: 'range',
              labelKey: 'invoice.schema.field.spacing',
              descriptionKey: 'invoice.schema.field.spacingDesc',
              defaultValue: 16,
              validation: {
                min: 0,
                max: 64,
                step: 4
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-spacing',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'shadow',
              type: 'toggle',
              labelKey: 'invoice.schema.field.shadow',
              descriptionKey: 'invoice.schema.field.shadowDesc',
              defaultValue: false,
              metadata: {
                isStyle: true,
                width: 'quarter',
                cssVariable: '--unzer-invoice-shadow',
                cssScope: 'host'
              }
            },
            {
              key: 'widgetWidth',
              type: 'range',
              labelKey: 'invoice.schema.field.widgetWidth',
              descriptionKey: 'invoice.schema.field.widgetWidthDesc',
              defaultValue: 100,
              validation: {
                min: 10,
                max: 100,
                step: 1
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-invoice-widget-width',
                cssScope: 'both',
                cssUnit: '%'
              }
            }
          ]
        }
      ]
    }
  ],
  validation: {
    global: (_config) => {
      return true;
    }
  }
};
