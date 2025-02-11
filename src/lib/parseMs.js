export default function parseMs(str) {
    if (typeof str !== 'string' || !str.trim()) return 3600;

    const match = str.match(/^(\d+)(ms|s|m|h|d|w|y)?$/);
    if (!match) return 3600;

    const value = parseInt(match[1], 10);
    const unit = match[2] || 'ms';

    const multipliers = {
        ms: 1 / 1000,
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
        w: 604800,
        y: 31557600,
    };

    return Math.round(value * (multipliers[unit] || 1));
}
