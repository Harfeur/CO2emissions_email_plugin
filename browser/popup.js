import { formatBytes, formatDistance, formatGrammes, formatTime, MO } from "../global/functions.js";

async function* listMessages(folder) {
    let page = await messenger.messages.list(folder);
    for (let message of page.messages) {
        yield message;
    }

    while (page.id) {
        page = await messenger.messages.continueList(page.id);
        for (let message of page.messages) {
            yield message;
        }
    }
}


let data = { accounts: [] };
let CO2, CO2u, OIL, CAR, TGV, BULB, BULBW, BREATHING, KWH_STOCK, YEAR, CO2_BYTE_MS, ELEC_STOCK;

/**
 * Change les valeurs affichées en fonction de la sélection du formulaire
 */
function display() {
    // Obtention de la période sélectionnée
    const input_periodes = document.getElementsByName("periode");
    let periode;
    for (const input of input_periodes) {
        if (input.checked) periode = input.value;
    }

    let periode_title;
    switch (periode) {
        case "week":
            periode_title = browser.i18n.getMessage("browserPopupPeriodTitleWeek");
            break;
        case "month":
            periode_title = browser.i18n.getMessage("browserPopupPeriodTitleMonth");
            break;
        case "year":
            periode_title = browser.i18n.getMessage("browserPopupPeriodTitleYear");
            break;
        case "forever":
            periode_title = browser.i18n.getMessage("browserPopupPeriodTitleForever");
            break;
    }

    // Obtention des mails sélectionnés
    const input_mails = document.getElementsByName("mails");
    let mails;
    for (const input of input_mails) {
        if (input.checked) mails = input.value;
    }

    let mails_title;
    switch (mails) {
        case "sent":
            mails_title = browser.i18n.getMessage("browserPopupEmailsTitleSent");
            break;
        case "received":
            mails_title = browser.i18n.getMessage("browserPopupEmailsTitleReceived");
            break;
        case "all":
            mails_title = browser.i18n.getMessage("browserPopupEmailsTitleBoth");
            break;
    }

    document.getElementById("data_title").innerText = `${periode_title} ` + browser.i18n.getMessage("browserPopupEmailsOf") + ` ${mails_title}`;

    // Obtention de l'adresse sélectionnée
    const address = document.getElementById("address").value;
    let co2_storage = 0.0;
    let co2_sending = 0.0;
    let size = 0.0;
    data.accounts.forEach(account => {
        if (address === "all" || address === account.name) {
            co2_storage += account.co2_storage[mails][periode];
            co2_sending += account.co2_sending[mails][periode];
            size += account.size[mails][periode];
        }
    });

    const petrole = co2_storage + co2_sending / OIL;
    const voiture = co2_storage + co2_sending / CAR;
    const tgv = co2_storage + co2_sending / TGV;
    const ampoule = co2_storage + co2_sending / (BULBW * BULB);
    const respiration = co2_storage + co2_sending / BREATHING;

    document.getElementById("size").innerHTML = formatBytes(size);
    document.getElementById("co2_sending").innerHTML = formatGrammes(co2_sending);
    document.getElementById("co2_storage").innerHTML = formatGrammes(co2_storage);

    document.getElementById("co2").innerHTML = formatGrammes(co2_storage + co2_sending);
    document.getElementById("oil").innerHTML = formatGrammes(petrole);
    document.getElementById("car").innerHTML = formatDistance(voiture);
    document.getElementById("tgv").innerHTML = formatDistance(tgv);
    document.getElementById("bulb").innerHTML = formatTime(ampoule);
    document.getElementById("breathing").innerHTML = formatTime(respiration);
}

/**
 * Calcule les valeurs pour l'affichage
 * @returns {Promise<void>}
 */
async function calculate() {
    let preferencesValues = await browser.storage.local.get(["CO2", "CO2u", "KWH_STOCK", "ELEC_STOCK", "OIL", "CAR", "TGV", "BULB", "BULBW", "BREATHING"]);
    CO2 = preferencesValues.CO2 ? parseFloat(preferencesValues.CO2) : 13; // en g/Mo
    CO2u = preferencesValues.CO2u ? parseFloat(preferencesValues.CO2u) : 6; // en g/Mo
    KWH_STOCK = preferencesValues.KWH_STOCK ? parseFloat(preferencesValues.KWH_STOCK) : 0.130333033; // en kWh/Go/an
    ELEC_STOCK = preferencesValues.ELEC_STOCK ? parseFloat(preferencesValues.ELEC_STOCK.elec) : 0.0520; // en g CO2e/Wh
    OIL = preferencesValues.OIL ? parseFloat(preferencesValues.OIL) : 3.34; // en g CO2e/g de pétrole
    CAR = preferencesValues.CAR ? parseFloat(preferencesValues.CAR) : 0.1901; // en g CO2e/m
    TGV = preferencesValues.TGV ? parseFloat(preferencesValues.TGV) : 2.30e-3; // en g CO2e/m
    BULB = preferencesValues.BULB ? parseFloat(preferencesValues.BULB) : 0.0520 / 60; // en g CO2e/(W.min) (électricité)
    BULBW = preferencesValues.BULBW ? parseFloat(preferencesValues.BULBW) : 40; // en W
    document.getElementById("bulbw").insertAdjacentHTML('beforeend', " " + BULBW + " W");
    BREATHING = preferencesValues.BREATHING ? parseFloat(preferencesValues.BREATHING) : 1.131; // en g CO2/min

    YEAR = 365.25 * 24 * 3600 * 1000; // ms
    CO2_BYTE_MS = (KWH_STOCK / 2 ** 30 / YEAR * 1000) * ELEC_STOCK; // g CO2e/octet/ms

    const accounts = await messenger.accounts.list();

    let now = new Date();
    let firstJanuary = new Date(now.getFullYear() + '-01-01T00:00:00');

    now = now.getTime();
    firstJanuary = now - firstJanuary.getTime();

    let diff, recipientsCount, co2value_sending, co2value_stockage;

    // On compte le nombre de mails
    let totalCount = 0;
    for (const account of accounts) {
        if (account.type !== "imap") continue;
        let folders = await messenger.folders.getSubFolders(account);
        while (folders.length !== 0) {
            const folder = folders.shift(); // Supprime le premier dossier de la liste et le renvoie
            const infos = await messenger.folders.getFolderInfo(folder);
            totalCount += infos.totalMessageCount;
            // On regarde si le dossier contient des sous dossiers
            if (folder.subFolders) folders = folders.concat(folder.subFolders);
        }
    }

    // Initialisation de la barre de progression
    let count = 0;
    document.getElementById("percentComplete").setAttribute("max", totalCount);
    document.getElementById("progressText").innerText = `0 / ${totalCount}`;

    for (const account of accounts) {
        if (account.type !== "imap") continue;
        let co2_sending = {
            sent: {
                week: 0,
                month: 0,
                year: 0,
                forever: 0
            },
            received: {
                week: 0,
                month: 0,
                year: 0,
                forever: 0
            }
        };
        let co2_storage = {
            sent: {
                week: 0,
                month: 0,
                year: 0,
                forever: 0
            },
            received: {
                week: 0,
                month: 0,
                year: 0,
                forever: 0
            }
        };
        let size = {
            sent: {
                week: 0,
                month: 0,
                year: 0,
                forever: 0
            },
            received: {
                week: 0,
                month: 0,
                year: 0,
                forever: 0
            }
        };
        let folders = await messenger.folders.getSubFolders(account);
        while (folders.length !== 0) {
            const folder = folders.shift();
            if (folder.subFolders) folders = folders.concat(folder.subFolders);

            const messages = listMessages(folder);
            if (folder.type === "sent") {
                for await (const message of messages) {
                    count += 1;
                    if (count % 100 === 0) {
                        document.getElementById("percentComplete").setAttribute("value", count);
                        document.getElementById("progressText").innerText = `${count} / ${totalCount}`;
                    }

                    diff = now - message.date;
                    recipientsCount = message.recipients.length + message.ccList.length + message.bccList.length;
                    co2value_stockage = message.size * diff * CO2_BYTE_MS; // g CO2e
                    co2value_sending = recipientsCount === 0 ? message.size * (CO2 + CO2u) / MO : message.size * (CO2 + recipientsCount * CO2u) / MO;

                    if (diff <= 604800000) { // 7 jours
                        co2_sending.sent.week += co2value_sending;
                        co2_sending.sent.month += co2value_sending;
                        co2_storage.sent.week += co2value_stockage;
                        co2_storage.sent.month += co2value_stockage;
                        size.sent.week += message.size;
                        size.sent.month += message.size;
                    } else if (diff <= 2592000000) { // 30 jours
                        co2_sending.sent.month += co2value_sending;
                        co2_storage.sent.month += co2value_stockage;
                        size.sent.month += message.size;
                    }
                    if (diff <= firstJanuary) { // Année en cours
                        co2_sending.sent.year += co2value_sending;
                        co2_storage.sent.year += co2value_stockage;
                        size.sent.year += message.size;
                    }

                    co2_sending.sent.forever += co2value_sending;
                    co2_storage.sent.forever += co2value_stockage;
                    size.sent.forever += message.size;
                }
            } else {
                for await (const message of messages) {
                    count += 1;
                    if (count % 100 === 0) {
                        document.getElementById("percentComplete").setAttribute("value", count);
                        document.getElementById("progressText").innerText = `${count} / ${totalCount}`;
                    }

                    diff = now - message.date;
                    co2value_stockage = message.size * diff * CO2_BYTE_MS; // g CO2e

                    if (diff <= 604800000) { // 7 jours
                        co2_storage.received.week += co2value_stockage;
                        co2_storage.received.month += co2value_stockage;
                        size.received.week += message.size;
                        size.received.month += message.size;
                    } else if (diff <= 2592000000) { // 30 jours
                        co2_storage.received.month += co2value_stockage;
                        size.received.month += message.size;
                    }
                    if (diff <= firstJanuary) { // Année en cours
                        co2_storage.received.year += co2value_stockage;
                        size.received.year += message.size;
                    }

                    co2_storage.received.forever += co2value_stockage;
                    size.received.forever += message.size;
                }
            }
            // Mise à jour de la barre de progression
            document.getElementById("percentComplete").setAttribute("value", count);
            document.getElementById("progressText").innerText = `${count} / ${totalCount}`;

        }

        co2_storage.all = {
            week: co2_storage.sent.week + co2_storage.received.week,
            month: co2_storage.sent.month + co2_storage.received.month,
            year: co2_storage.sent.year + co2_storage.received.year,
            forever: co2_storage.sent.forever + co2_storage.received.forever
        }

        co2_sending.all = {
            week: co2_sending.sent.week + co2_sending.received.week,
            month: co2_sending.sent.month + co2_sending.received.month,
            year: co2_sending.sent.year + co2_sending.received.year,
            forever: co2_sending.sent.forever + co2_sending.received.forever
        }

        size.all = {
            week: size.sent.week + size.received.week,
            month: size.sent.month + size.received.month,
            year: size.sent.year + size.received.year,
            forever: size.sent.forever + size.received.forever
        }
        data.accounts.push({
            name: account.name,
            co2_sending: co2_sending,
            co2_storage: co2_storage,
            size: size
        });
    }
    display();

    const inputs = document.getElementsByTagName("input");
    for (const input of inputs) {
        input.removeAttribute("disabled");
        input.addEventListener("change", display);
    }

    const select = document.getElementById("address");
    for (const account of accounts) {
        if (account.type === "imap") {
            const opt = document.createElement('option');
            opt.value = account.name;
            opt.innerText = account.name;
            select.appendChild(opt);
        }

    }
    document.getElementById("loading").hidden = true;
    document.getElementById("loader").hidden = true;
    select.removeAttribute("disabled");
    select.addEventListener("change", display)
}

// Lorsque le document est chargé
document.addEventListener("DOMContentLoaded", function() {
    calculate();
});