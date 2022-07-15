export interface Token {
  token: string;
  exclude?: true;
  tag?: string;
}

const TAG_MATCHER = /^([^":]+):(.+)$/;

function makeToken(token: string): Token {
  const exclude = token.startsWith('-');
  if (exclude) token = token.substring(1);
  let tag: string;
  if (TAG_MATCHER.test(token)) {
    const match = TAG_MATCHER.exec(token);
    tag = match[1];
    token = match[2];
  }
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.substring(1, token.length - 1);
  }
  if (token.startsWith('"') || token.endsWith('"')) {
    throw new Error('Improperly balanced quotes in search string');
  }
  const ret = {token: token} as Token;
  if (exclude) ret.exclude = true;
  if (tag) ret.tag = tag;
  return ret;
}

export default function tokenize(search: string) {
  const tokens: Array<Token> = [];
  if (!search) return tokens;

  let token = '';
  let inQuote = false;
  for (let c of search
    .toLocaleLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')) {
    //.replace(/[^\w\s]"'-/g, '')) {
    if (c === ' ' && !inQuote) {
      // Include spaces in quoted bits
      tokens.push(makeToken(token));
      token = '';
    } else {
      if (c === '"') {
        inQuote = !inQuote;
      }
      token += c;
    }
  }
  tokens.push(makeToken(token));

  return tokens;
}
