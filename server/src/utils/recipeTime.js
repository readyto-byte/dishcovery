function parseMinutes(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function formatTotalMinutes(total) {
  if (total == null || !Number.isFinite(total) || total < 1) return null;
  const rounded = Math.round(total);
  if (rounded < 60) return `${rounded} min`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (m === 0) return `${h} hour${h === 1 ? '' : 's'}`;
  return `${h} hr ${m} min`;
}

function totalMinutesFromSuggestion(s) {
  if (!s || typeof s !== 'object') return null;
  const prep = parseMinutes(s.prepTimeMin ?? s.prep_time_min);
  const cook = parseMinutes(s.cookTimeMin ?? s.cook_time_min);
  if (prep != null || cook != null) {
    const sum = (prep ?? 0) + (cook ?? 0);
    return sum > 0 ? sum : null;
  }
  const total = parseMinutes(s.totalTimeMin ?? s.total_time_min);
  if (total != null) return total;
  return parseMinutes(s.estimatedTime);
}

function estimatedTimeLabelFromSuggestions(suggestions) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;
  const first = totalMinutesFromSuggestion(suggestions[0]);
  if (first != null && first > 0) return formatTotalMinutes(first);
  for (let i = 1; i < suggestions.length; i += 1) {
    const m = totalMinutesFromSuggestion(suggestions[i]);
    if (m != null && m > 0) return formatTotalMinutes(m);
  }
  return null;
}

/**
 * Prefer API estimatedTime unless it is the legacy "Cached" placeholder;
 * then derive from prep/cook fields on the suggestion.
 */
function displayEstimatedTime(responseEstimatedTime, suggestion) {
  if (responseEstimatedTime && responseEstimatedTime !== 'Cached' && responseEstimatedTime !== 'cached') {
    return responseEstimatedTime;
  }
  const mins = totalMinutesFromSuggestion(suggestion);
  if (mins != null && mins > 0) return formatTotalMinutes(mins);
  return null;
}

module.exports = {
  parseMinutes,
  formatTotalMinutes,
  totalMinutesFromSuggestion,
  estimatedTimeLabelFromSuggestions,
  displayEstimatedTime,
};
