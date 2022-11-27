import log from '../log/log';

/**
 * Handles adding greasemonkey menu items to set logging level for the script.
 */
export const buildMenu = () => {
  GM.registerMenuCommand('Set Log Level to Trace', () => log.setLevel('TRACE'), 'T');
  GM.registerMenuCommand('Set Log Level to Debug', () => log.setLevel('DEBUG'), 'D');
  GM.registerMenuCommand('Set Log Level to Warning', () => log.setLevel('WARN'), 'W');
  GM.registerMenuCommand('Set Log Level to Log', () => log.setLevel('INFO'), 'L');
  GM.registerMenuCommand('Set Log Level to Error', () => log.setLevel('ERROR'), 'E');
  GM.registerMenuCommand('Turn off logging', () => log.setLevel('SILENT'), 'o');
};
