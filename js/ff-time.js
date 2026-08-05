/* ============================================================
   FORGE & FABLE — schedule time engine
   Parses spreadsheet-style cells ("5-9P", "Bonus 7-10P", "12P",
   "8:30P-12:30A", "9A-1P / 2:30-5:30") and converts them between
   each streamer's timezone and the visitor's local time.
   Used by: schedule page (Your Time toggle, .ics export) and the
   home page's "next strike" countdown.
   ============================================================ */
(function () {
  'use strict';

  const IANA = {
    EST: 'America/New_York', CST: 'America/Chicago', PST: 'America/Los_Angeles',
    AST: 'America/Halifax', GMT: 'Europe/London'
  };
  const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  function ianaFor(tz) { return IANA[String(tz || '').replace('*', '').trim()] || null; }

  /* ---------- cell parsing ---------- */
  // A range: "10A-6P", "7-9:30P" (start inherits end's meridiem), "12P" (open-ended).
  const TIME_RE = /(\d{1,2})(?::(\d{2}))?\s*(a|p)?/i;

  function toMinutes(h, m, mer) {
    h = parseInt(h, 10); m = m ? parseInt(m, 10) : 0;
    if (mer === 'a') { if (h === 12) h = 0; }
    else if (mer === 'p') { if (h !== 12) h += 12; }
    return h * 60 + m;
  }

  function parsePart(part) {
    const segs = part.split('-').map(s => s.trim()).filter(Boolean);
    if (!segs.length || segs.length > 2) return null;
    const toks = segs.map(s => {
      const m = s.match(TIME_RE);
      return m && m[1] ? { h: m[1], min: m[2], mer: m[3] ? m[3].toLowerCase() : null } : null;
    });
    if (toks.some(t => !t)) return null;
    // meridiem inheritance: missing side borrows from the other; default P
    const merA = toks[0].mer || (toks[1] && toks[1].mer) || 'p';
    const start = toMinutes(toks[0].h, toks[0].min, toks[0].mer || merA);
    let end = null;
    if (toks[1]) {
      const merB = toks[1].mer || toks[0].mer || 'p';
      end = toMinutes(toks[1].h, toks[1].min, merB);
      // "6P-6P" is a typo in the sheet, not a 24-hour stream: treat it as
      // open-ended rather than exporting a day-long weekly calendar event.
      if (end === start) end = null;
      else if (end < start) end += 24 * 60; // genuinely crosses midnight ("8:30P-12:30A")
    }
    return { start, end };
  }

  // Returns { label, ranges: [{start,end|null}] } — label keeps words like "Bonus".
  function parseCell(text) {
    if (!text) return null;
    const label = text.replace(/[\d:]/g, ' ').replace(/\b[ap]\b/gi, ' ')
      .replace(/[-/,]/g, ' ').replace(/\s+/g, ' ').trim();
    const ranges = text.split('/')
      .map(p => p.replace(/[^\d:apAP\-]/g, ' ').trim())
      .filter(p => /\d/.test(p))
      .map(parsePart)
      .filter(Boolean);
    return { label: label || null, ranges };
  }

  /* ---------- timezone conversion ---------- */
  // UTC instant whose wall-clock reading in `tz` matches the given components.
  // The two local re-parses share the same bias, so it cancels and what
  // remains is the target zone's true UTC offset at that moment.
  function zonedTime(y, mo, d, minutes, tz) {
    const guess = Date.UTC(y, mo, d, Math.floor(minutes / 60), minutes % 60);
    const inTz = new Date(new Date(guess).toLocaleString('en-US', { timeZone: tz })).getTime();
    const inUtc = new Date(new Date(guess).toLocaleString('en-US', { timeZone: 'UTC' })).getTime();
    return new Date(guess - (inTz - inUtc));
  }

  // Next occurrence (>= today) of the schedule slot as a real Date.
  function nextOccurrence(dayIdx, startMinutes, tz, from) {
    const now = from || new Date();
    for (let add = 0; add < 8; add++) {
      const cand = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add);
      if ((cand.getDay() + 6) % 7 !== dayIdx) continue;
      const t = zonedTime(cand.getFullYear(), cand.getMonth(), cand.getDate(), startMinutes, tz);
      if (t.getTime() > now.getTime()) return t;
    }
    return null;
  }

  function fmtLocal(date) {
    let s = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return s.replace(':00', '').replace(/\s?(AM|PM)/i, m => m.trim().charAt(0));
  }

  // Convert one cell to the viewer's local clock. Returns display string or null.
  function cellToLocal(cellText, dayIdx, tz) {
    const iana = ianaFor(tz);
    const parsed = parseCell(cellText);
    if (!iana || !parsed || !parsed.ranges.length) return null;
    // anchor on this week's instance of the column's weekday
    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    const anchor = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + dayIdx);
    const parts = parsed.ranges.map(r => {
      const s = zonedTime(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), r.start, iana);
      let out = fmtLocal(s);
      if (r.end != null) {
        const e = zonedTime(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), r.end, iana);
        out += '-' + fmtLocal(e);
      }
      const shift = (s.getDay() + 6) % 7 - dayIdx;
      if (shift === 1 || shift === -6) out += ' (+1d)';
      if (shift === -1 || shift === 6) out += ' (-1d)';
      return out;
    });
    return (parsed.label ? parsed.label + ' ' : '') + parts.join(' / ');
  }

  // Does this member have a scheduled slot on the given weekday (Mon = 0)?
  function streamsOn(member, dayIdx) {
    const s = member && member.schedule;
    if (!s || s.note) return false;
    const parsed = parseCell(s[DAYS[dayIdx]]);
    return !!(parsed && parsed.ranges.length);
  }

  // Soonest upcoming scheduled start across all members.
  function nextStrike(members) {
    let best = null;
    const now = new Date();
    for (const m of members) {
      const s = m.schedule;
      if (!s || s.note) continue;
      const iana = ianaFor(s.tz);
      if (!iana) continue;
      DAYS.forEach((d, di) => {
        const parsed = parseCell(s[d]);
        if (!parsed) return;
        for (const r of parsed.ranges) {
          const t = nextOccurrence(di, r.start, iana, now);
          if (t && (!best || t < best.time)) best = { member: m, time: t, day: d };
        }
      });
    }
    return best;
  }

  /* ---------- .ics generation ---------- */
  function icsForTeam(members, siteUrl) {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Forge and Fable//Stream Schedule//EN',
      'X-WR-CALNAME:Forge & Fable — Stream Schedule',
      'X-WR-CALDESC:Weekly streaming schedule for the Forge & Fable Twitch team'
    ];
    const BYDAY = { mon: 'MO', tue: 'TU', wed: 'WE', thu: 'TH', fri: 'FR', sat: 'SA', sun: 'SU' };
    const pad = n => String(n).padStart(2, '0');
    // RFC 5545: commas, semicolons and backslashes are delimiters in text values,
    // so a member name like "Sam, the Bard" would otherwise corrupt the event.
    const esc = v => String(v == null ? '' : v).replace(/([\\;,])/g, '\\$1').replace(/\r?\n/g, '\\n');
    const MAX_MIN = 12 * 60;   // a recurring weekly slot longer than this is a parse artifact
    const now = new Date();
    const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

    for (const m of members) {
      const s = m.schedule;
      if (!s || s.note) continue;
      const iana = ianaFor(s.tz);
      if (!iana) continue;
      const approxTz = /\*/.test(String(s.tz || ''));  // the sheet's "CST*" — a guess, not a confirmation
      DAYS.forEach((d, di) => {
        const parsed = parseCell(s[d]);
        if (!parsed || !parsed.ranges.length) return;
        parsed.ranges.forEach((r, ri) => {
          // first occurrence: this week's (or next week's) instance of the day
          let first = null;
          for (let add = 0; add < 8 && !first; add++) {
            const cand = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add);
            if ((cand.getDay() + 6) % 7 === di) first = cand;
          }
          let durMin = r.end != null ? r.end - r.start : 120; // open-ended slots default to 2h
          if (durMin <= 0) durMin = 120;
          if (durMin > MAX_MIN) durMin = MAX_MIN;
          const dt = first.getFullYear() + pad(first.getMonth() + 1) + pad(first.getDate()) +
            'T' + pad(Math.floor(r.start / 60) % 24) + pad(r.start % 60) + '00';
          const desc = 'Regular weekly stream time for ' + m.name + '.' +
            (r.end == null ? ' End time is not listed, so this is a 2-hour placeholder.' : '') +
            (approxTz ? ' Heads up: this streamer\'s timezone is approximate, so the event may be off by an hour.' : '') +
            ' Schedules shift — the Live page always knows who is actually on the air.';
          lines.push(
            'BEGIN:VEVENT',
            'UID:' + (m.channel || m.name.toLowerCase().replace(/\W+/g, '')) + '-' + d + '-' + ri + '@forge-and-fable',
            'DTSTAMP:' + stamp,
            'DTSTART;TZID=' + iana + ':' + dt,
            'DURATION:PT' + durMin + 'M',
            'RRULE:FREQ=WEEKLY;BYDAY=' + BYDAY[d],
            'SUMMARY:' + esc(m.name + ' live on Twitch' + (parsed.label ? ' (' + parsed.label + ')' : '') + (approxTz ? ' ~' : '')),
            'DESCRIPTION:' + esc(desc),
            'URL:' + (m.channel ? 'https://www.twitch.tv/' + m.channel : siteUrl),
            'END:VEVENT'
          );
        });
      });
    }
    lines.push('END:VCALENDAR');
    // RFC 5545 caps a content line at 75 octets; long descriptions must be folded
    // or strict clients reject the file.
    // Fold at 70 rather than the 75-octet limit so multi-byte characters keep
    // headroom, and never break between a backslash and the character it escapes.
    const fold = line => {
      if (line.length <= 70) return line;
      const out = [];
      let i = 0, width = 70;
      while (i < line.length) {
        let take = Math.min(width, line.length - i);
        while (take > 1 && line[i + take - 1] === '\\') take--;
        out.push((i ? ' ' : '') + line.substr(i, take));
        i += take; width = 69;
      }
      return out.join('\r\n');
    };
    return lines.map(fold).join('\r\n');
  }

  window.FFTime = { ianaFor, parseCell, cellToLocal, nextStrike, streamsOn, icsForTeam, fmtLocal };
})();
