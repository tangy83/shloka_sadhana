/**
 * Festival date integrity.
 *
 * Anchor dates are for New Delhi (IST) and were derived from sunrise/pradosh/
 * nishita/madhyahna tithi rules (amanta months, Lahiri sankrantis, 2026 Adhik
 * Jyeshtha 2026-05-17 -> 2026-06-15) and cross-checked against Drik Panchang.
 */
import festivalsData from '@/data/festivals.json';
import ekadashiData from '@/data/ekadashi.json';

interface Festival {
  name: string;
  date: string;
}

const festivals: Festival[] = (festivalsData as { festivals: Festival[] }).festivals;

const ekadashiDates = (name: string): string[] =>
  (ekadashiData as { months: { ekadashis: { name: string; date: string }[] }[] }).months
    .flatMap((m) => m.ekadashis)
    .filter((e) => e.name === name)
    .map((e) => e.date);

/** All dates of festivals whose name matches `pattern` in the given year. */
const datesFor = (pattern: RegExp, year: number): string[] =>
  festivals
    .filter((f) => pattern.test(f.name) && f.date.startsWith(`${year}-`))
    .map((f) => f.date);

describe('festivals.json — structural integrity', () => {
  it('every date is a real ISO calendar date (YYYY-MM-DD)', () => {
    for (const f of festivals) {
      expect(f.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const d = new Date(`${f.date}T00:00:00Z`);
      expect(Number.isNaN(d.getTime())).toBe(false);
      expect(d.toISOString().slice(0, 10)).toBe(f.date);
    }
  });

  it('has no duplicate (name, date) pairs', () => {
    const seen = new Map<string, number>();
    for (const f of festivals) {
      const key = `${f.name}|${f.date}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    const dups = [...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k);
    expect(dups).toEqual([]);
  });
});

describe('festivals.json — astronomical anchor dates (New Delhi)', () => {
  const anchors: [RegExp, number, string[]][] = [
    // 2025
    [/^Karva Chauth$/, 2025, ['2025-10-10']],
    [/^Dhanteras/, 2025, ['2025-10-18']],
    [/^Diwali/, 2025, ['2025-10-20']],
    [/^Govardhan Puja/, 2025, ['2025-10-22']],
    [/^Bhai Dooj/, 2025, ['2025-10-23']],
    [/^Chhath Puja$/, 2025, ['2025-10-27']],
    [/^Kartik Purnima$/, 2025, ['2025-11-05']],
    [/^Gita Jayanti$/, 2025, ['2025-12-01']],
    [/^Vaikuntha Ekadashi$/, 2025, ['2025-12-30']],
    // 2026
    [/^Makar Sankranti/, 2026, ['2026-01-14']],
    [/Vasant Panchami/, 2026, ['2026-01-23']],
    [/^Maha Shivaratri$/, 2026, ['2026-02-15']],
    [/^Holika Dahan$/, 2026, ['2026-03-03']],
    [/^Chaitra Navratri Day 1/, 2026, ['2026-03-19']],
    [/^Rama Navami$/, 2026, ['2026-03-26']],
    [/^Buddha Purnima/, 2026, ['2026-05-01']],
    [/^Rath Yatra$/, 2026, ['2026-07-16']],
    [/^Guru Purnima$/, 2026, ['2026-07-29']],
    [/^Raksha Bandhan$/, 2026, ['2026-08-28']],
    [/^Krishna Janmashtami$/, 2026, ['2026-09-04']],
    [/^Ganesh Chaturthi$/, 2026, ['2026-09-14']],
    [/^Onam$/, 2026, ['2026-08-26']],
    [/^Sharad Navratri Day 1/, 2026, ['2026-10-11']],
    [/^Dussehra/, 2026, ['2026-10-20']],
    [/^Sharad Purnima/, 2026, ['2026-10-25']],
    [/^Karva Chauth$/, 2026, ['2026-10-29']],
    [/^Diwali$/, 2026, ['2026-11-08']],
    [/^Chhath Puja$/, 2026, ['2026-11-15']],
    [/^Kartik Purnima/, 2026, ['2026-11-24']],
    // 2027
    [/^Makar Sankranti/, 2027, ['2027-01-15']],
    [/^Holika Dahan$/, 2027, ['2027-03-21']],
    [/^Holi$/, 2027, ['2027-03-22']],
    [/^Raksha Bandhan$/, 2027, ['2027-08-17']],
    [/^Krishna Janmashtami$/, 2027, ['2027-08-25']],
    [/^Karva Chauth$/, 2027, ['2027-10-18']],
    [/^Diwali$/, 2027, ['2027-10-29']],
    // 2028
    [/^Makar Sankranti/, 2028, ['2028-01-15']],
    [/^Vasant Panchami/, 2028, ['2028-01-31']],
    [/^Maha Shivaratri$/, 2028, ['2028-02-23']],
  ];

  it.each(anchors)('%s in %i falls on the expected date', (pattern, year, expected) => {
    const found = datesFor(pattern, year);
    expect(found.length).toBeGreaterThan(0);
    for (const d of found) expect(expected).toContain(d);
  });

  it('Holi 2026 is 2026-03-03 or 2026-03-04', () => {
    expect(datesFor(/^Holi \(/, 2026)).toHaveLength(1);
    expect(['2026-03-03', '2026-03-04']).toContain(datesFor(/^Holi \(/, 2026)[0]);
  });

  it('Lohri is the day before Makar Sankranti each year', () => {
    for (const year of [2026, 2027, 2028]) {
      const lohri = datesFor(/^Lohri$/, year)[0];
      const makar = datesFor(/^Makar Sankranti/, year)[0];
      const next = new Date(`${lohri}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      expect(next.toISOString().slice(0, 10)).toBe(makar);
    }
  });

  it('festivals after the 2026 Adhik Maas are not shifted early (Diwali 2026 is after 2026-11-01)', () => {
    expect(datesFor(/^Diwali$/, 2026)[0] > '2026-11-01').toBe(true);
  });
});

describe('festivals.json — Ekadashi entries agree with ekadashi.json', () => {
  const pairs: [RegExp, string, number][] = [
    [/^Shattila Ekadashi$/, 'Shattila Ekadashi', 2026],
    [/^Nirjala Ekadashi/, 'Nirjala Ekadashi', 2026],
    [/^Devshayani Ekadashi/, 'Devshayani Ekadashi', 2026],
    [/^Dev Uthani Ekadashi$/, 'Devuthani Ekadashi', 2026],
    [/^Gita Jayanti$/, 'Mokshada Ekadashi', 2026],
  ];

  it.each(pairs)('%s %s (%i)', (pattern, ekName, year) => {
    const ek = ekadashiDates(ekName).filter((d) => d.startsWith(`${year}-`));
    expect(ek.length).toBeGreaterThan(0);
    const found = datesFor(pattern, year);
    expect(found).toHaveLength(1);
    expect(ek).toContain(found[0]);
  });

  it('Vaikuntha Ekadashi 2026 coincides with Mokshada Ekadashi (Dhanurmasa Shukla Ekadashi)', () => {
    expect(ekadashiDates('Mokshada Ekadashi')).toContain(datesFor(/^Vaikuntha Ekadashi$/, 2026)[0]);
  });

  it('reports an accurate festival count in metadata', () => {
    expect((festivalsData as { metadata: { total_festivals: number } }).metadata.total_festivals).toBe(festivals.length);
  });
});
