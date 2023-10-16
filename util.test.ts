import { extractJSON } from './util';

describe('extractJSON', () => {
  it('Extract JSON in a text', () => {
    const json = extractJSON(`
Hi, this is the data!

[
  {
    "json": [ true ]
  }
]

Good luck!`);
    expect(json).toBe(`[
  {
    "json": [ true ]
  }
]`);
  });

  describe('Support multiple JSON types', () => {
    it('Simple Object', () => {
      const json = extractJSON('{"json":true}');
      expect(json).toBe('{"json":true}');
    });

    it('Simple Array', () => {
      const json = extractJSON('["json"]');
      expect(json).toBe('["json"]');
    });

    it('Nested Object', () => {
      const json = extractJSON('{"nested":{"json":true}}');
      expect(json).toBe('{"nested":{"json":true}}');
    });

    it('Nested Array', () => {
      const json = extractJSON('[["nested"]]');
      expect(json).toBe('[["nested"]]');
    });

    it('Object Array', () => {
      const json = extractJSON('[{"json":true}]');
      expect(json).toBe('[{"json":true}]');
    });

    it('Empty Object', () => {
      const json = extractJSON('{}');
      expect(json).toBe('{}');
    });

    it('Empty Array', () => {
      const json = extractJSON('[]');
      expect(json).toBe('[]');
    });
  });
});
