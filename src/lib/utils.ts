const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];

export function formatNumber(number: number): string {
    if (number < 1000) {
        return Math.floor(number).toString();
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