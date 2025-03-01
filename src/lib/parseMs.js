export default function parseMs(str) {
    if (typeof str !== 'string' || !str.trim()) return 60000;

    const match = str.match(/^(\d+)(ms|s|m|h|d|w|y)?$/);
    if (!match) return 60000;

    const value = parseInt(match[1], 10);
    const unit = match[2] || 'ms';

    const multipliers = {
        ms: 1,
        s: 1000,
        m: 60000,
        h: 3600000,
        d: 86400000,
        w: 604800000,
        y: 31557600000,
    };

    return Math.round(value * (multipliers[unit] || 1));
}
