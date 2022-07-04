import Log, {ConsoleLog, LogLevel} from '../src/log';
import {describe} from 'mocha';
import {stdout, stderr} from 'test-console';
import {expect} from 'chai';

const prefix = '[test]';
const noneLog = new ConsoleLog(prefix, LogLevel.None);
const errorLog = new ConsoleLog(prefix, LogLevel.Error);
const warningLog = new ConsoleLog(prefix, LogLevel.Warning);
const logLog = new ConsoleLog(prefix, LogLevel.Log);
const debugLog = new ConsoleLog(prefix, LogLevel.Debug);
const timingLog = new ConsoleLog(prefix, LogLevel.Timing);
const fnRet = 'function';
const fn = () => fnRet;

function makeTests(
  logFn: Log[keyof Omit<Log, 'setLevel'>],
  stdInspect: typeof stdout | typeof stderr,
  level: LogLevel,
): void {
  const fnName = logFn.name.substring(6); // "bound error" eg., remove "bound ";
  const text = logFn.name + ' asdf';
  const doExpect = (output: ReadonlyArray<string>, text: string) => {
    if (level !== LogLevel.Timing) {
      expect(output).to.deep.equal([prefix + ' ' + text + '\n']);
    } else {
      expect(output.length).to.equal(1);
      expect(output[0]).to.match(new RegExp(prefix.replace(/[\[\]]/g, '\\$&') + ' \\(\\d+\\) ' + text));
    }
  };
  describe(fnName, () => {
    it(
      'should output to ' +
        (stdInspect === stdout ? 'stdout/console.log' : 'stderr/console.error') +
        ' on LogLevel.' +
        LogLevel[level],
      () => {
        const output = stdInspect.inspectSync(() => {
          logFn(text);
        });

        doExpect(output, text);
      },
    );
    it('should not output to ' + (stdInspect !== stdout ? 'stdout/console.log' : 'stderr/console.error'), () => {
      const otherInspect = stdInspect === stdout ? stderr : stdout;
      let output;
      stdInspect.inspectSync(() => {
        output = otherInspect.inspectSync(() => {
          logFn(text);
        });
      });

      expect(output.length).to.equal(0);
    });
    it('should not output on LogLevel.None', () => {
      const output = stdInspect.inspectSync(() => {
        noneLog[fnName](text);
      });

      expect(output.length).to.equal(0);
    });
    if (LogLevel.Error !== level) {
      it('should ' + (LogLevel.Error < level ? 'not ' : '') + 'output on LogLevel.Error', () => {
        const output = stdInspect.inspectSync(() => {
          errorLog[fnName](text);
        });

        if (LogLevel.Error < level) {
          expect(output.length).to.equal(0);
        } else {
          doExpect(output, text);
        }
      });
    }
    if (LogLevel.Warning !== level) {
      it('should ' + (LogLevel.Warning < level ? 'not ' : '') + 'output on LogLevel.Warning', () => {
        const output = stdInspect.inspectSync(() => {
          warningLog[fnName](text);
        });

        if (LogLevel.Warning < level) {
          expect(output.length).to.equal(0);
        } else {
          doExpect(output, text);
        }
      });
    }
    if (LogLevel.Log !== level) {
      it('should ' + (LogLevel.Log < level ? 'not ' : '') + 'output on LogLevel.Log', () => {
        const output = stdInspect.inspectSync(() => {
          logLog[fnName](text);
        });

        if (LogLevel.Log < level) {
          expect(output.length).to.equal(0);
        } else {
          doExpect(output, text);
        }
      });
    }
    if (LogLevel.Debug !== level) {
      it('should ' + (LogLevel.Debug < level ? 'not ' : '') + 'output on LogLevel.Debug', () => {
        const output = stdInspect.inspectSync(() => {
          debugLog[fnName](text);
        });

        if (LogLevel.Debug < level) {
          expect(output.length).to.equal(0);
        } else {
          doExpect(output, text);
        }
      });
    }
    if (LogLevel.Timing !== level) {
      it('should ' + (LogLevel.Timing < level ? 'not ' : '') + 'output on LogLevel.Timing', () => {
        const output = stdInspect.inspectSync(() => {
          timingLog[fnName](text);
        });

        if (LogLevel.Timing < level) {
          expect(output.length).to.equal(0);
        } else {
          doExpect(output, text);
        }
      });
    }
    it('should resolve function arguments before output', () => {
      const output = stdInspect.inspectSync(() => {
        logFn(fn);
      });

      doExpect(output, fnRet);
    });
    it('should resolve mixed arguments before output', () => {
      const output = stdInspect.inspectSync(() => {
        logFn(text, fn);
      });

      doExpect(output, text + ' ' + fnRet);
    });
  });
}

describe('ConsoleLog', () => {
  makeTests(errorLog.error.bind(errorLog), stderr, LogLevel.Error);
  makeTests(warningLog.warn.bind(warningLog), stderr, LogLevel.Warning);
  makeTests(logLog.log.bind(logLog), stdout, LogLevel.Log);
  makeTests(debugLog.debug.bind(debugLog), stdout, LogLevel.Debug);
  makeTests(timingLog.timing.bind(timingLog), stdout, LogLevel.Timing);
});
