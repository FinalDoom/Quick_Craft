import {expect} from 'chai';
import {describe} from 'mocha';
import tokenize from './search-text-tokenizer';

describe('SearchTextTokenizer', () => {
  it('should return empty array for undefined', () => {
    expect(tokenize(undefined)).to.deep.equal([]);
  });
  it('should return empty array for empty string', () => {
    expect(tokenize('')).to.deep.equal([]);
  });
  it('should tokenize single words', () => {
    expect(tokenize('word')).to.deep.equal([{token: 'word'}]);
  });
  it('should tokenize single-word phrases', () => {
    expect(tokenize('"word"')).to.deep.equal([{token: 'word'}]);
  });
  it('should tokenize multi-word phrases', () => {
    expect(tokenize('"word phrase"')).to.deep.equal([{token: 'word phrase'}]);
  });
  it('should tokenize negated words', () => {
    expect(tokenize('-word')).to.deep.equal([{token: 'word', exclude: true}]);
  });
  it('should tokenize negated phrases', () => {
    expect(tokenize('-"word phrase"')).to.deep.equal([{token: 'word phrase', exclude: true}]);
  });
  it('should allow dashes in words', () => {
    expect(tokenize('compound-word')).to.deep.equal([{token: 'compound-word'}]);
  });
  it('should allow dashes in negated words', () => {
    expect(tokenize('-compound-word')).to.deep.equal([{token: 'compound-word', exclude: true}]);
  });
  it('should allow dashes in phrases', () => {
    expect(tokenize('"compound-word phrase"')).to.deep.equal([{token: 'compound-word phrase'}]);
  });
  it('should allow dashes beginning phrases', () => {
    expect(tokenize('"-dashed"')).to.deep.equal([{token: '-dashed'}]);
  });
  it('should parse tags from words', () => {
    expect(tokenize('tag:word')).to.deep.equal([{token: 'word', tag: 'tag'}]);
  });
  it('should parse negated tags from words', () => {
    expect(tokenize('-tag:word')).to.deep.equal([{token: 'word', tag: 'tag', exclude: true}]);
  });
  it('should parse tags from phrases', () => {
    expect(tokenize('tag:"word phrase"')).to.deep.equal([{token: 'word phrase', tag: 'tag'}]);
  });
  it('should parse negated tags from phrases', () => {
    expect(tokenize('-tag:"word phrase"')).to.deep.equal([{token: 'word phrase', tag: 'tag', exclude: true}]);
  });
  it('should not parse tags from within phrases', () => {
    expect(tokenize('"tag:word phrase" "word tag:phrase"')).to.deep.equal([
      {token: 'tag:word phrase'},
      {token: 'word tag:phrase'},
    ]);
  });
  it('should tokenize all mixtures passed', () => {
    const res = tokenize(
      '"not" -a "word phrase" is -"an untagged:word phrase" or:some other:"word phrase" -"but:not this:word-phrase"',
    );
    expect(res.length).to.equal(8);
    expect(res[0]).to.deep.equal({token: 'not'});
    expect(res[1]).to.deep.equal({token: 'a', exclude: true});
    expect(res[2]).to.deep.equal({token: 'word phrase'});
    expect(res[3]).to.deep.equal({token: 'is'});
    expect(res[4]).to.deep.equal({token: 'an untagged:word phrase', exclude: true});
    expect(res[5]).to.deep.equal({token: 'some', tag: 'or'});
    expect(res[6]).to.deep.equal({token: 'word phrase', tag: 'other'});
    expect(res[7]).to.deep.equal({token: 'but:not this:word-phrase', exclude: true});
  });
  it('should throw when tokenizing unbalanced quotes', () => {
    expect(() => tokenize('"this is not a phrase')).to.throw(/Improperly balanced quotes/);
    expect(() => tokenize('this is not a phrase"')).to.throw(/Improperly balanced quotes/);
    expect(() => tokenize('"this is" not "a phrase')).to.throw(/Improperly balanced quotes/);
  });
});
