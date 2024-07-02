/**
 * Renvoie la longueur en octets d'une chaine de caractères
 * @param {String} str
 * @returns {Number}
 */
export function lengthInUtf8Bytes(str) {
    return (new TextEncoder().encode(str)).length;
}

/**
 * Renvoie un nombre formaté (octets, ko, Mo ...)
 * @param {Number} bytes
 * @param {Boolean} html Renvoyer une balise HTML
 * @param {Number} decimals Nombre de chiffres après la virgule
 * @returns {String | HTMLElement}
 */
export function formatBytes(bytes, html = true, decimals = 2) {
    const span_tooltip = document.createElement("span");
    span_tooltip.className = "tooltiptext tooltiptext-left";
    span_tooltip.textContent = browser.i18n.getMessage("byte");
    const div_tooltip = document.createElement("div");
    div_tooltip.className = "tooltip tooltip-left";
    div_tooltip.textContent = browser.i18n.getMessage("byteShort");
    div_tooltip.appendChild(span_tooltip);

    const span_result = document.createElement("span");

    if (bytes === 0) {
        span_result.textContent = "0 ";
        span_result.appendChild(div_tooltip);

        return html ? span_result : "0 " + browser.i18n.getMessage("byte");
    }
    if (bytes < 2) {
        const value = bytes.toFixed(decimals).replace(".", ",") + " "
        span_result.textContent = value;
        span_result.appendChild(div_tooltip);
        return html ? span_result : value + browser.i18n.getMessage("byte");
    }

    span_tooltip.textContent = browser.i18n.getMessage("bytes");

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
        html ? div_tooltip : browser.i18n.getMessage("bytes"), 'k' + browser.i18n.getMessage("byteShort"),
        'M' + browser.i18n.getMessage("byteShort"), 'G' + browser.i18n.getMessage("byteShort")
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = (bytes / Math.pow(k, i)).toFixed(dm).replace(".", ",") + " ";

    span_result.textContent = value;
    if (i === 0 && html) {
        span_result.appendChild(sizes[i]);
    } else {
        span_result.textContent += sizes[i];
    }

    return html ? span_result : value + sizes[i]
}

/**
 * Renvoie un nombre formaté (g, kg, t ...)
 * @param {Number} size
 * @param {Number} decimals Nombre de chiffres après la virgule
 * @returns {String}
 */
export function formatGrammes(size, decimals = 1) {
    if (size === 0) return "0 g";
    if (0.1 > size >= 0.001) return parseFloat(size.toFixed(Math.abs(Math.floor(Math.log10(size))))).toString().replace(".", ",") + " g";
    if (size < 2) return parseFloat(size.toFixed(decimals)).toString().replace(".", ",") + " g";

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['g', 'kg', 't', 'Gg', 'Tg'];

    const i = Math.floor(Math.log(size) / Math.log(k));

    return (parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]).replace(".", ",");
}

/**
 * Renvoie un nombre formaté (m, km ...)
 * @param {Number} distance
 * @param {Number} decimals Nombre de chiffres après la virgule
 * @returns {String}
 */
export function formatDistance(distance, decimals = 1) {
    if (distance === 0) return "0 m";
    if (0.1 > distance >= 0.001) return parseFloat(distance.toFixed(Math.abs(Math.floor(Math.log10(distance))))).toString().replace(".", ",") + " m";
    if (distance < 2) return parseFloat(distance.toFixed(decimals)).toString().replace(".", ",") + " m";

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['m', 'km', 'Mm', 'Gm', 'Tm'];

    const i = Math.floor(Math.log(distance) / Math.log(k));

    return (parseFloat((distance / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]).replace(".", ",");
}

/**
 * Renvoie un nombre formaté (min, h ...)
 * @param {Number} time
 * @param {Number} decimals Nombre de chiffres après la virgule
 * @returns {String}
 */
export function formatTime(time, decimals = 1) {
    if (time === 0) return "0 min";
    if (0.1 > time >= 0.001) return parseFloat(time.toFixed(Math.abs(Math.floor(Math.log10(time))))).toString().replace(".", ",") + " min";
    if (time < 2) return parseFloat(time.toFixed(decimals)).toString().replace(".", ",") + " min";

    if (time < 1440) { // base 60
        const k = 60;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['min', 'h'];

        const i = Math.floor(Math.log(time) / Math.log(k));

        return (parseFloat((time / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]).replace(".", ",");
    }

    if (time >= 1440) { // base 24
        time = time / (60 * 24);
        return parseFloat(time.toFixed(decimals)).toString().replace(".", ",") + " " + browser.i18n.getMessage("dayShort");
    }
}

/**
 * Affiche une erreur, utilisé dans les Promises
 * @param error
 */
export function onError(error) {
    console.log(`Error: ${error}`);
}

export const MO = 1048576;