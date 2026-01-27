import { describe, expect, it } from 'vitest';
import { durationDateTime, formatTimestamp } from '../time';

describe('durationDateTime', () => {
  describe('without seekRange', () => {
    it('returns PT0S for zero duration', () => {
      expect(durationDateTime(0)).toBe('PT0S');
    });

    it('returns PT0S for negative duration', () => {
      expect(durationDateTime(-10)).toBe('PT0S');
    });

    it('returns PT0S for non-finite values', () => {
      expect(durationDateTime(Number.NaN)).toBe('PT0S');
      expect(durationDateTime(Number.POSITIVE_INFINITY)).toBe('PT0S');
    });

    it('formats seconds correctly', () => {
      expect(durationDateTime(30)).toBe('PT30S');
    });

    it('formats minutes correctly', () => {
      expect(durationDateTime(90)).toBe('PT1M30S');
    });

    it('formats hours correctly', () => {
      expect(durationDateTime(3661)).toBe('PT1H1M1S');
    });

    it('formats days correctly', () => {
      expect(durationDateTime(86400)).toBe('P1DT');
    });

    it('formats weeks correctly', () => {
      expect(durationDateTime(604800)).toBe('P1WT');
    });

    it('formats complex durations', () => {
      // 1 week + 2 days + 3 hours + 4 minutes + 5 seconds
      const seconds = 7 * 86400 + 2 * 86400 + 3 * 3600 + 4 * 60 + 5;
      expect(durationDateTime(seconds)).toBe('P1W2DT3H4M5S');
    });
  });

  describe('with seekRange (LXD-321 fix)', () => {
    it('correctly converts seekRange seconds to duration', () => {
      // seekRange values are in seconds, not milliseconds
      const seekRange = { start: 0, end: 90 }; // 90 seconds = 1m30s
      expect(durationDateTime(0, seekRange)).toBe('PT1M30S');
    });

    it('handles seekRange with non-zero start', () => {
      // Range from 60s to 150s = 90 seconds duration
      const seekRange = { start: 60, end: 150 };
      expect(durationDateTime(0, seekRange)).toBe('PT1M30S');
    });

    it('handles hour-long seekRange', () => {
      const seekRange = { start: 0, end: 3600 }; // 1 hour in seconds
      expect(durationDateTime(0, seekRange)).toBe('PT1H');
    });

    it('handles multi-hour seekRange', () => {
      const seekRange = { start: 0, end: 7261 }; // 2h1m1s
      expect(durationDateTime(0, seekRange)).toBe('PT2H1M1S');
    });

    it('handles seekRange with offset start', () => {
      // Live stream scenario: start at 1000s, end at 4600s (1 hour duration)
      const seekRange = { start: 1000, end: 4600 };
      expect(durationDateTime(0, seekRange)).toBe('PT1H');
    });
  });
});

describe('formatTimestamp', () => {
  describe('basic formatting', () => {
    it('returns 00:00 for zero', () => {
      expect(formatTimestamp(0)).toBe('00:00');
    });

    it('returns 00:00 for negative values', () => {
      expect(formatTimestamp(-10)).toBe('00:00');
    });

    it('returns 00:00 for non-finite values', () => {
      expect(formatTimestamp(Number.NaN)).toBe('00:00');
      expect(formatTimestamp(Number.POSITIVE_INFINITY)).toBe('00:00');
    });

    it('formats seconds correctly', () => {
      expect(formatTimestamp(30)).toBe('00:30');
    });

    it('formats minutes and seconds', () => {
      expect(formatTimestamp(90)).toBe('01:30');
    });

    it('formats large minute values', () => {
      expect(formatTimestamp(599)).toBe('09:59');
      expect(formatTimestamp(600)).toBe('10:00');
    });
  });

  describe('with showHours=true', () => {
    it('returns 00:00:00 for zero', () => {
      expect(formatTimestamp(0, true)).toBe('00:00:00');
    });

    it('returns 00:00:00 for negative values', () => {
      expect(formatTimestamp(-10, true)).toBe('00:00:00');
    });

    it('formats seconds with hours', () => {
      expect(formatTimestamp(30, true)).toBe('00:00:30');
    });

    it('formats minutes with hours', () => {
      expect(formatTimestamp(90, true)).toBe('00:01:30');
    });

    it('formats hours correctly', () => {
      expect(formatTimestamp(3661, true)).toBe('01:01:01');
    });

    it('formats large hour values', () => {
      expect(formatTimestamp(36000, true)).toBe('10:00:00');
    });
  });

  describe('edge cases', () => {
    it('handles fractional seconds by flooring', () => {
      expect(formatTimestamp(30.7)).toBe('00:30');
      expect(formatTimestamp(30.999)).toBe('00:30');
    });

    it('returns default for extremely large values', () => {
      expect(formatTimestamp(1e13)).toBe('00:00');
      expect(formatTimestamp(1e13, true)).toBe('00:00:00');
    });
  });
});
