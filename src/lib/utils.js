// Определяем суффиксы для больших чисел
const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];

/**
 * Форматирует большое число в короткую, читаемую строку.
 * @param {number} number - Число для форматирования.
 * @returns {string} - Отформатированная строка.
 */
export function formatNumber(number) {
    if (number < 1000) {
        return Math.floor(number).toString();
    }

    // Определяем, какой суффикс использовать, через логарифм
    const tier = Math.floor(Math.log10(number) / 3);

    if (tier >= SUFFIXES.length) {
        return number.toExponential(1);
    }

    const suffix = SUFFIXES[tier];
    const scale = Math.pow(10, tier * 3);

    // Делим число и форматируем до 2 знаков после запятой
    const scaled = number / scale;

    return scaled.toFixed(2) + suffix;
}