function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchOptionalChars(text: string) {
  return text.replaceAll(' ', '[`*]* [`*]*');
}

export function buildMatcher(query: string) {
  return new RegExp(matchOptionalChars(escapeRegExp(query)), 'ig');
}
