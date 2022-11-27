import log, {Logger} from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

type LogPlaceholders = Omit<LogColors, 'message'> & {logLevel: string};
const TEMPLATE_PLACEHOLDERS: LogPlaceholders = {
  prefix: '%c%p%c',
  timestamp: '%c[%t]%c',
  logLevel: '%c%l%c',
  name: '%c(%n)%c',
};
const SCRIPT_PREFIX = '[Quick Crafter]';
const MESSAGE_TEMPLATE = `${TEMPLATE_PLACEHOLDERS.prefix}${TEMPLATE_PLACEHOLDERS.name} ${TEMPLATE_PLACEHOLDERS.logLevel}:%c`;

type LogExtensionStringFunction = (
  methodName: log.LogLevelNames,
  logLevel: log.LogLevelNumbers,
  loggerName: string | symbol,
) => string;
interface LogColors {
  prefix: string;
  timestamp: string;
  logLevel: string | LogExtensionStringFunction;
  name: string;
  message: string | LogExtensionStringFunction;
}
const colors: LogColors = {
  prefix: 'background-color:darkolivegreen;color:white;border-radius:2px;padding:2px',
  timestamp: 'color:gray',
  logLevel: (methodName, _, __) => {
    switch (methodName) {
      case 'trace':
        return 'color:magenta';
      case 'debug':
        return 'color:cyan';
      case 'info':
        return '';
      case 'warn':
        return 'color:yellow';
      case 'error':
        return 'color:red';
    }
  },
  name: 'background-color:darkolivegreen;color:white;border-radius:2px;padding:2px',
  message: (_, __, loggerName) => {
    switch (loggerName) {
      case 'critical':
        return 'color:red;font-weight:bold';
      default:
        return '';
    }
  },
};

log.setDefaultLevel('INFO');
prefix.reg(log);
prefix.apply(log, {
  template: MESSAGE_TEMPLATE.replace(/%p/, SCRIPT_PREFIX),
  levelFormatter(level) {
    return level.toLocaleUpperCase();
  },
  nameFormatter(name) {
    return name || 'root';
  },
  timestampFormatter(date) {
    return date.toISOString();
  },
});

const placeholderIndex = (type: keyof LogPlaceholders): [keyof LogPlaceholders, number] => {
  return [type, MESSAGE_TEMPLATE.indexOf(TEMPLATE_PLACEHOLDERS[type])];
};
const placeholderOrder = new Map(
  [
    placeholderIndex('prefix'),
    placeholderIndex('timestamp'),
    placeholderIndex('logLevel'),
    placeholderIndex('name'),
    ['message', MESSAGE_TEMPLATE.match(/(?<!%\w)%c$/) ? 999 : -1] as [keyof LogColors, number],
  ].sort(([_, aIndex], [__, bIndex]) => aIndex - bIndex),
);

// Supplement above formatter with browser css color args
const originalFactory = log.methodFactory;
log.methodFactory = function addCssColors(methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);

  const colorArgs = [];
  for (let [key, value] of placeholderOrder) {
    if (!!~value) {
      const colorVal = colors[key];
      const colorArg = typeof colorVal === 'string' ? colorVal : colorVal(methodName, logLevel, loggerName);
      if (key === 'message') {
        colorArgs.push(colorArg);
      } else {
        colorArgs.push(colorArg, '');
      }
    }
  }

  return function colorTemplate(...messages) {
    rawMethod(messages.shift(), ...colorArgs, ...messages);
  };
};

export default log;
export {Logger};
