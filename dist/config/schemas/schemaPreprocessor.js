export const normalizeNames = (data, aliases = {}) => {
    const normalized = {};
    for (const key in data) {
        normalized[key.toLowerCase()] = data[key];
    }
    for (const [preset, alternative] of Object.entries(aliases)) {
        for (const alt of alternative) {
            if (normalized[alt.toLowerCase()] && !normalized[preset.toLowerCase()]) {
                normalized[preset.toLowerCase()] = normalized[alt.toLowerCase()];
            }
        }
    }
    return normalized;
};
export const normalizeAllNames = (data, aliases = {}) => {
    const result = {};
    const lowerToCanonical = {};
    for (const [canonical, alternativeNames] of Object.entries(aliases)) {
        lowerToCanonical[canonical.toLowerCase()] = canonical;
        for (const alt of alternativeNames) {
            lowerToCanonical[alt.toLowerCase()] = canonical;
        }
    }
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        const canonicalKey = lowerToCanonical[lowerKey] || key;
        if (!(canonicalKey in result)) {
            result[canonicalKey] = value;
        }
    }
    return result;
};
