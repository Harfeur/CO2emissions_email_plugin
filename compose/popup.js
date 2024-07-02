import {
    formatBytes,
    formatDistance,
    formatGrammes,
    formatTime,
    lengthInUtf8Bytes,
    MO,
    onError
} from "../global/functions.js";

/**
 * Ajoute la fonction format() (comme Python) dans JS
 * @returns {String}
 */
String.prototype.format = function() {
    var a = this;
    for (var k in arguments) a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
    return a
}

const HEADER_SIZE = 800;

let recipientsCount, totalSize, co2, petrole, voiture, tgv, ampoule, respiration, BULBW; // variables globales

/**
 * Calcule l'impact d'un mail
 * @param {Object} tabInfo Information sur les onglets
 */
async function calculate(tabInfo) {
    // Récupération des valeurs des préférences si définies ; valeurs par défaut sinon
    var preferencesValues = await browser.storage.local.get(["CO2", "CO2u", "OIL", "CAR", "TGV", "BULB", "BULBW", "BREATHING"]);
    var CO2 = preferencesValues.CO2 ? parseFloat(preferencesValues.CO2) : 13; // en g/Mo
    var CO2u = preferencesValues.CO2u ? parseFloat(preferencesValues.CO2u) : 6; // en g/Mo
    var OIL = preferencesValues.OIL ? parseFloat(preferencesValues.OIL) : 3.34; // en g CO2e/g de pétrole
    var CAR = preferencesValues.CAR ? parseFloat(preferencesValues.CAR) : 0.1901; // en g CO2e/m
    var TGV = preferencesValues.TGV ? parseFloat(preferencesValues.TGV) : 2.30e-3; // en g CO2e/m
    var BULB = preferencesValues.BULB ? parseFloat(preferencesValues.BULB) : 0.0520 / 60; // en g CO2e/(W.min) (électricité)
    BULBW = preferencesValues.BULBW ? parseFloat(preferencesValues.BULBW) : 40; // en W
    var BREATHING = preferencesValues.BREATHING ? parseFloat(preferencesValues.BREATHING) : 1.131; // en g CO2/min

    // Récupération des informations sur le mail
    var data = await messenger.compose.getComposeDetails(tabInfo[0].id);
    var attachments = await messenger.compose.listAttachments(tabInfo[0].id);

    // Rangement de chaque information dans une variable et calcul des différentes tailles en octets
    let messageBodySize = lengthInUtf8Bytes(data.isPlainText ? data.plainTextBody : data.body);
    let to = data.to;
    let cc = data.cc;
    let bcc = data.bcc;
    let subject = data.subject;
    recipientsCount = to.length + cc.length + bcc.length;
    let headerSize = HEADER_SIZE + lengthInUtf8Bytes(to.join(",") + cc.join(",") + subject);
    let attachmentsSize = attachments.reduce((acc, val) => acc + val.size, 0);
    totalSize = headerSize + messageBodySize + attachmentsSize;

    // Affichage des différentes tailles calculées
    document.getElementById("header-size").replaceChildren(formatBytes(headerSize));
    document.getElementById("body-size").replaceChildren(formatBytes(messageBodySize));
    document.getElementById("attachments-size").replaceChildren(formatBytes(attachmentsSize));
    document.getElementById("size").replaceChildren(formatBytes(totalSize));

    // Calcul des différentes équivalences
    co2 = recipientsCount === 0 ? totalSize * (CO2 + CO2u) / MO : totalSize * (CO2 + recipientsCount * CO2u) / MO;
    petrole = co2 / OIL;
    voiture = co2 / CAR;
    tgv = co2 / TGV;
    ampoule = co2 / (BULBW * BULB);
    respiration = co2 / BREATHING;

    // Affichage des équivalences
    const span_tooltip = document.createElement("span");
    span_tooltip.className = "tooltiptext tooltiptext-left"
    span_tooltip.textContent = browser.i18n.getMessage("recipient");

    const recipent_tooltip = document.createElement("div");
    recipent_tooltip.className = "tooltip tooltip-left";
    recipent_tooltip.textContent = browser.i18n.getMessage("recipientShort");
    recipent_tooltip.appendChild(span_tooltip);

    document.getElementById("co2").textContent = formatGrammes(co2)
    document.getElementById("oil").textContent = formatGrammes(petrole)
    document.getElementById("car").textContent = formatDistance(voiture)
    document.getElementById("tgv").textContent = formatDistance(tgv)
    document.getElementById("bulbw").insertAdjacentHTML('beforeend', " " + BULBW + " W");
    document.getElementById("bulb").textContent = formatTime(ampoule)
    document.getElementById("breathing").textContent = formatTime(respiration)

    if (recipientsCount === 0) {
        document.getElementById("co2").textContent += " / ";
        document.getElementById("oil").textContent += " / ";
        document.getElementById("car").textContent += " / ";
        document.getElementById("tgv").textContent += " / ";
        document.getElementById("bulb").textContent += " / ";
        document.getElementById("breathing").textContent += " / ";

        document.getElementById("co2").append(recipent_tooltip.cloneNode(true));
        document.getElementById("oil").append(recipent_tooltip.cloneNode(true));
        document.getElementById("car").append(recipent_tooltip.cloneNode(true));
        document.getElementById("tgv").append(recipent_tooltip.cloneNode(true));
        document.getElementById("bulb").append(recipent_tooltip.cloneNode(true));
        document.getElementById("breathing").append(recipent_tooltip.cloneNode(true));
    }

    // Paramétrage des boutons pour ajouter / supprimer la signature
    document.getElementById("addEqui").onclick = () => { addEquivalences(tabInfo[0].id) };
    document.getElementById("removeEqui").onclick = () => { removeEquivalences(tabInfo[0].id) };
    document.getElementById("openRecommendations").onclick = () => { openRecommendations() };


    const attachement_warning_1 = document.createElement('img');
    attachement_warning_1.setAttribute('src', '../images/warning-icon-red.png');
    attachement_warning_1.setAttribute('alt', 'Warning icon');
    attachement_warning_1.setAttribute('height', '14px');

    const attachement_warning_2 = document.createElement('span');
    attachement_warning_2.setAttribute('class', 'tooltiptext tooltiptext-left');
    attachement_warning_2.setAttribute('style', 'width: 130px; margin-top: -25px;');

    const attachement_warning_3 = document.createElement('small');
    attachement_warning_2.appendChild(attachement_warning_3);

    const attachement_warning_4 = document.createElement('span');
    attachement_warning_3.textContent = browser.i18n.getMessage("composePopupSizesAttachmentWarning") + " ";
    attachement_warning_3.appendChild(attachement_warning_4);

    const attachement_warning_5 = document.createElement('a');
    attachement_warning_5.textContent = browser.i18n.getMessage("composePopupSizesAttachmentWarningLink");
    attachement_warning_5.setAttribute('href', 'https://alt.framasoft.org/fr/framadrop');
    attachement_warning_3.appendChild(attachement_warning_5);

    const attachement_warning_6 = document.createElement('span');
    attachement_warning_6.textContent = browser.i18n.getMessage("punctuationSpace") + "!";
    attachement_warning_3.appendChild(attachement_warning_6);

    // Affichage avertissement en cas de pièce jointe équivalente à 1 Mo
    var needsAttachmentWarning = recipientsCount === 0 ? (attachmentsSize / MO >= 1) : (attachmentsSize * recipientsCount / MO >= 1); // si pièce jointe grosse et/ou envoyée à trop de destinataires
    if (needsAttachmentWarning) {
        document.getElementById("attachmentWarning").replaceChildren(attachement_warning_1, attachement_warning_2)
    }

    const recipents_warning_1 = attachement_warning_1.cloneNode(true);

    const recipents_warning_2 = document.createElement("span");
    recipents_warning_2.setAttribute('class', 'tooltiptext tooltiptext-left ');
    recipents_warning_2.setAttribute('style', 'width: 190px; margin-top: -14px;');

    const recipents_warning_3 = document.createElement('small');
    recipents_warning_3.textContent = browser.i18n.getMessage("composePopupSizesRecipientsWarning");
    recipents_warning_2.appendChild(recipents_warning_3);

    // Affichage avertissement en cas d'un grand nombre de destinataires
    var needsRecipientsWarning = recipientsCount >= 10; // si nombre de destinataires important
    if (needsRecipientsWarning) {
        document.getElementById("recipientsWarning").replaceChildren(recipents_warning_1, recipents_warning_2)
    }

    // Bouton des préférences
    document.getElementById("preferencesLink").onclick = () => { openPreferences() };
}


const signature = browser.i18n.getMessage("composeSignature");

/**
 * Ajoute une signature au mail
 * @param {Number} tab Identifiant de l'onglet du mail
 */
async function addEquivalences(tab) {
    // Récupération des infos du mail
    let details = await browser.compose.getComposeDetails(tab);

    if (details.isPlainText) { // Si message en plain text
        // Récupération texte du mail
        let body = details.plainTextBody;
        details.body = null;

        // Modification du texte
        body += signature.format(
            "\n\n", browser.i18n.getMessage("extensionName") + " (https://addons.thunderbird.net/fr/thunderbird/addon/estimez-votre-co2/)",
            formatBytes(totalSize, false), recipientsCount === 0 ? 1 : recipientsCount, recipientsCount <= 1 ? "" : "s",
            formatGrammes(co2), "₂", formatGrammes(petrole), formatDistance(voiture),
            formatDistance(tgv), BULBW, formatTime(ampoule), formatTime(respiration), "\n", "");

        // Renvoi à l'éditeur
        details.plainTextBody = body;
        browser.compose.setComposeDetails(tab, details);
    } else { // Si message en HTML
        // Récupération texte du mail
        let body = details.body;
        details.plainTextBody = null;

        // Modification du texte
        body += signature.format(
            "<p><small>", "<a href=\"https://addons.thunderbird.net/fr/thunderbird/addon/estimez-votre-co2/\">" + browser.i18n.getMessage("extensionName") + "</a>",
            formatBytes(totalSize, false), recipientsCount === 0 ? 1 : recipientsCount, recipientsCount <= 1 ? "" : "s",
            formatGrammes(co2), "<sub>2</sub>", formatGrammes(petrole), formatDistance(voiture), formatDistance(tgv), BULBW,
            formatTime(ampoule), formatTime(respiration), "<br>", "</small></p>");

        // Renvoi à l'éditeur
        details.body = body;
        browser.compose.setComposeDetails(tab, details);
    }
}


/**
 * Supprime une signature au mail
 * @param {Number} tab Identifiant de l'onglet du mail
 */
async function removeEquivalences(tab) {
    // Récupération des infos du mail
    let details = await browser.compose.getComposeDetails(tab)
    if (details.isPlainText) { // Si message en plain text
        // Récupération texte du mail
        let body = details.plainTextBody;
        details.body = null;

        // Recherche du texte ajouté
        let indexStart = body.indexOf("\n\n" + browser.i18n.getMessage("composeSignature").substring(3, browser.i18n.getMessage("composeSignature").indexOf("extension") + 9));
        if (indexStart === -1) return;

        let indexEnd = body.indexOf("(2011).", indexStart) + 7;

        // Modification du texte
        let text = body.substring(indexStart, indexEnd);

        // Renvoi à l'éditeur
        details.plainTextBody = body.replace(text, '');
        browser.compose.setComposeDetails(tab, details);
    } else { // Si message en HTML
        // Récupération texte du mail
        let body = details.body;
        details.plainTextBody = null;

        // Recherche du texte ajouté
        let indexStart = body.indexOf("<p><small>" + browser.i18n.getMessage("composeSignature").substring(3, browser.i18n.getMessage("composeSignature").indexOf("extension") + 9));
        if (indexStart === -1) return;
        let indexEnd = body.indexOf("(2011).</small></p>", indexStart) + 19;

        // Modification du texte
        let text = body.substring(indexStart, indexEnd);

        // Renvoi à l'éditeur
        details.body = body.replace(text, '');
        browser.compose.setComposeDetails(tab, details);
    }
}

/**
 * Ouvre un onglet redirigeant vers des préconisations pour réduire son impact informatique
 */
function openRecommendations() {
    browser.tabs.create({
        url: "https://librairie.ademe.fr/ged/6555/guide-en-route-vers-sobriete-numerique-202209.pdf"
    }).then(tab => {
        browser.windows.update(tab.windowId, {
            focused: true
        });
    });
}

/**
 * Ouvre l'onglet des préférences
 */
function openPreferences() {
    browser.tabs.create({
        url: "../preferences/preferences.html"
    }).then(tab => {
        browser.windows.update(tab.windowId, {
            focused: true
        });
    });
}




// Lorsque le document est chargé
document.addEventListener("DOMContentLoaded", function() {
    // Lancement de la promesse pour obtenir les tabs
    browser.tabs.query({ currentWindow: true })
        .then(calculate)
        .catch(onError);
    console.log(document.getElementById("co2").parentElement.innerHTML);
});