const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];

export function formatNumber(number: number): string {
    if (number < 0.1 && number > 0) {
        return number.toFixed(2);
    }
    if (number < 1000) {
        const fixed = number.toFixed(1);
        return fixed.endsWith('.0') ? number.toFixed(0) : fixed;
    }

    const tier = Math.floor(Math.log10(number) / 3);

    if (tier >= SUFFIXES.length) {
        return number.toExponential(1);
    }

    const suffix = SUFFIXES[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = number / scale;

    return scaled.toFixed(2) + suffix;
}