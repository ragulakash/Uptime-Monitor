export const formatToLocalTime = (utcDateString) => {
    if (!utcDateString) return 'Never';
    // SQLite returns 'YYYY-MM-DD HH:MM:SS' in UTC
    // We convert it to ISO format 'YYYY-MM-DDTHH:MM:SSZ' for reliable parsing
    const isoString = utcDateString.replace(' ', 'T') + 'Z';
    return new Date(isoString).toLocaleTimeString();
};
