/**
 * Messaging Module
 * Provides shared spec-API helpers for messaging widgets.
 */

import { _di } from '../../infrastructure';
import { MessagingApiHelper, IMessagingApiHelper } from './messaging-api-helper.js';

export { MessagingApiHelper, IMessagingApiHelper } from './messaging-api-helper.js';
export type { StyleMappings } from './messaging-api-helper.js';

/**
 * Register messaging dependencies in the DI container.
 * Called from widgets bootstrap.
 */
export function registerMessagingDependencies(): void {
  _di(IMessagingApiHelper, () => new MessagingApiHelper(), { singleton: true });
}
