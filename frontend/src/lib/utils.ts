const SUFFIXES = ["", "k", "m", "b", "a", "b", "c", "d", "e", "f"];

export function formatNumber(number: number | string): string {
    const num = Number(number);

    if (isNaN(num)) {
        return '0';
    }

    if (num < 0.1 && num > 0) {
        return num.toFixed(2);
    }
    if (num < 1000) {
        const fixed = num.toFixed(1);
        return fixed.endsWith('.0') ? num.toFixed(0) : fixed;
    }

    const tier = Math.floor(Math.log10(num) / 3);

    if (tier >= SUFFIXES.length) {
        return num.toExponential(1);
    }

    const suffix = SUFFIXES[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;

    return scaled.toFixed(2) + suffix;
}