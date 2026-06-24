(() => {
  const {
    keys,
    values,
    entries
  } = Object;
  const isString = x => typeof x === 'string' || x instanceof String;
  const isObject = x => typeof x === 'object' && x !== null;
  const toArray = x => x?.[Symbol.iterator] ? [...x] : (isObject(x) ? entries(x) : [...String(x)]);
  const stringify = (...args) => {
    const x = args[0];
    try {
      if (isString(x)) {
        return String(x);
      }
      return String(JSON.stringify(...args));
    } catch (e) {
      console.warn(e, ...args.map(Boolean));
      return String(x);
    }
  };
  const re = (...args) => {
    try {
      return RegExp(...args);
    } catch (e) {
      console.warn(e, ...args);
      return RegExp();
    }
  };
  const g = x => re(x, [...new Set(`${x?.flags||''}g`)].join``);
  const _g = x => re(x, String(x?.flags || '').replaceAll('g', ''));
  const rm = (x, y) => String(x).replaceAll(g(y), '');
  const split = (x, y) => String(x).split(_g(y));
  const join = (x = [], y = '') => [...(x[Symbol.iterator] ? x : toArray(x))].map(stringify).join(String(y));
  const test = (x, str) => re(x).test(stringify(str));
  const regexes = {
    star: [/[\*•]+/, 'cornflowerblue'],
    curly: [/[\{\}‘’']+/, '#ff79c6'],
    square: [/[\[\]“”""]+/, '#ba7dff'],
    paren: [/[\(\)]+/, 'orange'],
    number: [/[0-9]+/, 'deepskyblue'],
  };
  const compoundRe = {
    yellow: [/\b(Y|Yellow)\b/, 'yellow'],
    red: [/\b(R|Red)\b/, 'red'],
    x: [/(\bx\b)/, '#ffffff'],
    symbol: [re(`[^a-zA-Z0-9\\s${join(values(regexes).map(x =>x[0].source.slice(1,-2)))}]+`), '#00ff00'],
    ...regexes
  };
  const allRegex = re(join(values(compoundRe).map(x => x[0].source), '|'), 'ig');
  const ts = 'black';
  const sz = '0.1ch';
  globalThis.color ??= (text) =>
    text.replace(allRegex, ch => {
      for (const key in compoundRe) {
        if (test(compoundRe[key]?.[0], ch)) {
          return `<span class="color-${key}">${rm(ch,/[<>]/g)}</span>`;
        }
      }
      return ch;
    });
  const style = document.createElement('style');
  style.textContent = join(keys(compoundRe).map(key =>
    `.color-${key} ${
      rm(stringify({
        color: `${compoundRe[key]?.[1]} !important`,
        "xxtext-shadow": `-${sz} -${sz} 0 ${ts}, ${sz} -${sz} 0 ${ts}, -${sz} ${sz} 0 ${ts}, ${sz} ${sz} 0 ${ts} !important`,
      },null,2),'"').replace(/!important,?/g,'!important;')
    }`), ' ');
  document.firstElementChild.appendChild(style);
})();
