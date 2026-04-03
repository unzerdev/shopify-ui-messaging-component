/**
 * Installment Widget Configuration Schema
 * Defines the configuration structure for installment widget
 */

import { ConfigurationSchema } from '@unzer/messaging-core';
import { CURRENCIES, COUNTRIES, CUSTOMER_TYPES } from '../types/installment-types.js';
import { LOCALE_OPTIONS } from '@unzer/messaging-core';

/**
 * Installment widget configuration schema
 */
export const INSTALLMENT_CONFIG_SCHEMA: ConfigurationSchema = {
  version: '1.0.0',
  widget: 'installment',
  tabs: [
    {
      id: 'components',
      labelKey: 'installments.schema.tab.components',
      icon: 'settings',
      sections: [
        {
          id: 'components',
          titleKey: 'installments.schema.section.components',
          fields: [
            {
              key: 'installmentLayout',
              type: 'drag-option',
              labelKey: 'installments.schema.field.layout',
              descriptionKey: 'installments.schema.field.layoutDesc',
              defaultValue: 'buttons',
              options: [
                { value: 'buttons', labelKey: 'installments.schema.option.buttons', icon: 'view-module' },
                { value: 'arrows', labelKey: 'installments.schema.option.arrows', icon: 'chevron-left' },
                { value: 'select', labelKey: 'installments.schema.option.dropdown', icon: 'list' },
                { value: 'text', labelKey: 'installments.schema.option.text', icon: 'text-fields' }
              ],
              metadata: {
                width: 'full',
                multiple: false
              }
            }
          ]
        },
        {
          id: 'display',
          titleKey: 'installments.schema.section.displayOptions',
          fields: [
            {
              key: 'infoButtonLayout',
              type: 'drag-option',
              labelKey: 'installments.schema.field.infoTrigger',
              descriptionKey: 'installments.schema.field.infoTriggerDesc',
              defaultValue: 'icon',
              options: [
                { value: 'icon', labelKey: 'installments.schema.option.button', icon: 'info' },
                { value: 'link', labelKey: 'installments.schema.option.textLink', icon: 'link' }
              ],
              metadata: {
                multiple: false
              }
            },
            {
              key: 'unzerLogoDisplay',
              type: 'drag-option',
              labelKey: 'installments.schema.field.logoVariant',
              descriptionKey: 'installments.schema.field.logoVariantDesc',
              defaultValue: 'icon',
              options: [
                { value: 'unzer-logo', labelKey: 'installments.schema.option.unzerLogo', icon: 'palette' },
                { value: 'icon', labelKey: 'installments.schema.option.icon', icon: 'image' },
                { value: 'pm-logo', labelKey: 'installments.schema.option.pmLogo', icon: 'credit-card' }
              ],
              metadata: {
                multiple: false
              }
            },
            {
              key: 'unzerLogoPosition',
              type: 'drag-option',
              labelKey: 'installments.schema.field.logoPosition',
              descriptionKey: 'installments.schema.field.logoPositionDesc',
              defaultValue: 'left',
              conditions: {
                enable: [
                  {field: 'unzerLogoDisplay', operator: 'notEquals', value: ''}
                ]
              },
              options: [
                { value: 'left', labelKey: 'installments.schema.option.left', icon: 'format-align-left' },
                { value: 'right', labelKey: 'installments.schema.option.right', icon: 'format-align-right' }
              ],
              metadata: {
                multiple: false
              }
            },
            {
              key: 'showTimeline',
              type: 'drag-option',
              labelKey: 'installments.schema.field.showTimeline',
              descriptionKey: 'installments.schema.field.showTimelineDesc',
              defaultValue: true,
              options: [
                { value: true, labelKey: 'installments.schema.option.timeline', icon: 'timeline' }
              ],
              metadata: {
                multiple: false
              }
            },
          ]
        }
      ]
    },
    {
      id: 'general',
      labelKey: 'installments.schema.tab.general',
      icon: 'settings',
      sections: [
        {
          id: 'basic',
          titleKey: 'installments.schema.section.basic',
          fields: [
            {
              key: 'demo',
              type: 'toggle',
              labelKey: 'installments.schema.field.demo',
              descriptionKey: 'installments.schema.field.demoDesc',
              defaultValue: false,
              metadata: {
                width: 'quarter'
              }
            },
            {
              key: 'previewMode',
              type: 'toggle',
              labelKey: 'installments.schema.field.previewMode',
              descriptionKey: 'installments.schema.field.previewModeDesc',
              defaultValue: true,
              metadata: {
                width: 'quarter'
              }
            },
            {
              key: 'publicKey',
              type: 'text',
              labelKey: 'installments.schema.field.publicKey',
              descriptionKey: 'installments.schema.field.publicKeyDesc',
              defaultValue: '',
              conditions: {
                enable: [
                  { field: 'demo', operator: 'equals', value: false }
                ]
              },
              metadata: {
                width: 'full'
              }
            },
            {
              key: 'locale',
              type: 'select',
              labelKey: 'installments.schema.field.locale',
              descriptionKey: 'installments.schema.field.localeDesc',
              defaultValue: 'en',
              options: LOCALE_OPTIONS.map(l => ({ value: l.value, labelKey: l.label })),
              metadata: {
                width: 'half'
              }
            },
            {
              key: 'infoLinkText',
              type: 'text',
              labelKey: 'installments.schema.field.infoLinkText',
              defaultValue: '',
              conditions: {
                enable: [
                  { field: 'infoButtonLayout', operator: 'equals', value: 'link' }
                ]
              },
              metadata: {
                width: 'full'
              }
            },
            {
              key: 'amount',
              type: 'number',
              labelKey: 'installments.schema.field.amount',
              descriptionKey: 'installments.schema.field.amountDesc',
              defaultValue: 50,
              validation: {
                min: 0,
                max: 1000000,
                step: 0.01,
                required: true
              },
              metadata: {
                width: 'full'
              }
            },
            {
              key: 'currency',
              type: 'select',
              labelKey: 'installments.schema.field.currency',
              descriptionKey: 'installments.schema.field.currencyDesc',
              defaultValue: 'EUR',
              options: CURRENCIES.map(curr => ({
                value: curr,
                labelKey: curr
              })),
              validation: {
                required: true
              },
              metadata: {
                width: 'half'
              }
            },
            {
              key: 'country',
              type: 'select',
              labelKey: 'installments.schema.field.country',
              descriptionKey: 'installments.schema.field.countryDesc',
              defaultValue: 'DE',
              options: COUNTRIES.map(country => ({
                value: country,
                labelKey: country
              })),
              validation: {
                required: true
              },
              metadata: {
                width: 'half'
              }
            },
            {
              key: 'customerType',
              type: 'select',
              labelKey: 'installments.schema.field.customerType',
              descriptionKey: 'installments.schema.field.customerTypeDesc',
              defaultValue: 'B2C',
              options: CUSTOMER_TYPES.map(type => ({
                value: type,
                labelKey: type
              })),
              metadata: {
                width: 'half'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'styling',
      labelKey: 'installments.schema.tab.styling',
      icon: 'palette',
      sections: [
        {
          id: 'colors',
          titleKey: 'installments.schema.section.colors',
          layout: 'grid',
          fields: [
            {
              key: 'backgroundColor',
              type: 'color',
              labelKey: 'installments.schema.field.backgroundColor',
              descriptionKey: 'installments.schema.field.backgroundColorDesc',
              defaultValue: '#FFFFFF',
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-background-color',
                cssScope: 'both'
              }
            },
            {
              key: 'textColor',
              type: 'color',
              labelKey: 'installments.schema.field.textColor',
              descriptionKey: 'installments.schema.field.textColorDesc',
              defaultValue: '#374151',
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-text-color',
                cssScope: 'both'
              }
            },
            {
              key: 'borderColor',
              type: 'color',
              labelKey: 'installments.schema.field.borderColor',
              descriptionKey: 'installments.schema.field.borderColorDesc',
              defaultValue: '#E0E0E0',
              conditions: {
                enable: [
                  { field: 'showBorder', operator: 'equals', value: true }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-border-color',
                cssScope: 'both'
              }
            },
            {
              key: 'infoIconColor',
              type: 'color',
              labelKey: 'installments.schema.field.infoIconColor',
              defaultValue: '#9E9E9E',
              conditions: {
                enable: [
                  { field: 'infoButtonLayout', operator: 'equals', value: 'icon' }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-info-icon-color',
                cssScope: 'both'
              }
            },
            {
              key: 'infoLinkColor',
              type: 'color',
              labelKey: 'installments.schema.field.infoLinkColor',
              defaultValue: '#F21C58',
              conditions: {
                enable: [
                  { field: 'infoButtonLayout', operator: 'equals', value: 'link' }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-info-link-color',
                cssScope: 'both'
              }
            },
            {
              key: 'defaultInstallmentButtonColor',
              type: 'color',
              labelKey: 'installments.schema.field.defaultInstallmentButtonColor',
              defaultValue: '#9C9C9C',
              conditions: {
                enable: [
                  { field: 'installmentLayout', operator: 'equals', value: 'buttons' }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-default-button-color',
                cssScope: 'both'
              }
            },
            {
              key: 'selectedInstallmentButtonColor',
              type: 'color',
              labelKey: 'installments.schema.field.selectedInstallmentButtonColor',
              defaultValue: '#F21C58',
              conditions: {
                enable: [
                  { field: 'installmentLayout', operator: 'equals', value: 'buttons' }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-selected-button-color',
                cssScope: 'both'
              }
            },
            {
              key: 'installmentsNavigationalArrowsColor',
              type: 'color',
              labelKey: 'installments.schema.field.installmentsNavigationalArrowsColor',
              defaultValue: '#F21C58',
              conditions: {
                enable: [
                  { field: 'installmentLayout', operator: 'equals', value: 'arrows' }
                ]
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-arrows-color',
                cssScope: 'both'
              }
            }
          ]
        },
        {
          id: 'typography',
          titleKey: 'installments.schema.section.typography',
          fields: [
            {
              key: 'fontFamily',
              type: 'select',
              labelKey: 'installments.schema.field.fontFamily',
              descriptionKey: 'installments.schema.field.fontFamilyDesc',
              defaultValue: 'Arial, sans-serif',
              options: [
                { value: 'Arial, sans-serif', labelKey: 'installments.schema.option.fontArial' },
                { value: 'Helvetica, Arial, sans-serif', labelKey: 'installments.schema.option.fontHelvetica' },
                { value: 'Georgia, serif', labelKey: 'installments.schema.option.fontGeorgia' },
                { value: 'Times New Roman, Times, serif', labelKey: 'installments.schema.option.fontTimesNewRoman' },
                { value: 'Courier New, Courier, monospace', labelKey: 'installments.schema.option.fontCourierNew' },
                { value: 'Verdana, Geneva, sans-serif', labelKey: 'installments.schema.option.fontVerdana' },
                { value: 'Trebuchet MS, Helvetica, sans-serif', labelKey: 'installments.schema.option.fontTrebuchetMS' },
                { value: 'Palatino, Palatino Linotype, serif', labelKey: 'installments.schema.option.fontPalatino' },
                { value: 'Impact, Charcoal, sans-serif', labelKey: 'installments.schema.option.fontImpact' },
                { value: 'Comic Sans MS, cursive', labelKey: 'installments.schema.option.fontComicSansMS' },
                { value: 'Lucida Console, Monaco, monospace', labelKey: 'installments.schema.option.fontLucidaConsole' },
                { value: 'system-ui, -apple-system, sans-serif', labelKey: 'installments.schema.option.fontSystemUI' },
                { value: 'Roboto, sans-serif', labelKey: 'installments.schema.option.fontRoboto' },
                { value: 'Open Sans, sans-serif', labelKey: 'installments.schema.option.fontOpenSans' },
                { value: 'Lato, sans-serif', labelKey: 'installments.schema.option.fontLato' },
                { value: 'Montserrat, sans-serif', labelKey: 'installments.schema.option.fontMontserrat' }
              ],
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-font-family',
                cssScope: 'both'
              }
            },
            {
              key: 'fontSize',
              type: 'range',
              labelKey: 'installments.schema.field.fontSize',
              defaultValue: 12,
              validation: {
                min: 1,
                max: 18,
                step: 1
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-font-size',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'fontWeight',
              type: 'range',
              labelKey: 'installments.schema.field.fontWeight',
              defaultValue: 300,
              validation: {
                min: 300,
                max: 900,
                step: 100
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-font-weight',
                cssScope: 'both'
              }
            }
          ]
        },
        {
          id: 'appearance',
          titleKey: 'installments.schema.section.appearance',
          fields: [
            {
              key: 'showBorder',
              type: 'toggle',
              labelKey: 'installments.schema.field.showBorder',
              defaultValue: true,
              metadata: {
                width: 'quarter'
              }
            },
            {
              key: 'borderRadius',
              type: 'range',
              labelKey: 'installments.schema.field.borderRadius',
              defaultValue: 3,
              conditions: {
                enable: [
                  { field: 'showBorder', operator: 'equals', value: true }
                ]
              },
              validation: {
                min: 1,
                max: 25,
                step: 1
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-border-radius',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'borderWidth',
              type: 'range',
              labelKey: 'installments.schema.field.borderWidth',
              defaultValue: 1,
              conditions: {
                enable: [
                  { field: 'showBorder', operator: 'equals', value: true }
                ]
              },
              validation: {
                min: 1,
                max: 4,
                step: 1
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-border-width',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'spacing',
              type: 'range',
              labelKey: 'installments.schema.field.spacing',
              descriptionKey: 'installments.schema.field.spacingDesc',
              defaultValue: 16,
              validation: {
                min: 0,
                max: 64,
                step: 4
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-spacing',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'shadow',
              type: 'toggle',
              labelKey: 'installments.schema.field.shadow',
              descriptionKey: 'installments.schema.field.shadowDesc',
              defaultValue: false,
              metadata: {
                isStyle: true,
                width: 'quarter',
                cssVariable: '--unzer-installments-shadow',
                cssScope: 'host'
              }
            },
            {
              key: 'widgetWidth',
              type: 'range',
              labelKey: 'installments.schema.field.widgetWidth',
              descriptionKey: 'installments.schema.field.widgetWidthDesc',
              defaultValue: 100,
              validation: {
                min: 10,
                max: 100,
                step: 1
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-widget-width',
                cssScope: 'both',
                cssUnit: '%'
              }
            },
            {
              key: 'widgetHeight',
              type: 'range',
              labelKey: 'installments.schema.field.widgetHeight',
              descriptionKey: 'installments.schema.field.widgetHeightDesc',
              defaultValue: 0,
              validation: {
                min: 0,
                max: 500,
                step: 5
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-widget-height',
                cssScope: 'both',
                cssUnit: 'px'
              }
            },
            {
              key: 'verticalMargin',
              type: 'range',
              labelKey: 'installments.schema.field.verticalMargin',
              descriptionKey: 'installments.schema.field.verticalMarginDesc',
              defaultValue: 0,
              validation: {
                min: 0,
                max: 64,
                step: 1
              },
              metadata: {
                isStyle: true,
                width: 'full',
                cssVariable: '--unzer-installments-vertical-margin',
                cssScope: 'both',
                cssUnit: 'px'
              }
            }
          ]
        }
      ]
    }
  ],
  validation: {
    global: (_config) => {
      // Custom validation rules can be added here
      return true;
    }
  }
};
