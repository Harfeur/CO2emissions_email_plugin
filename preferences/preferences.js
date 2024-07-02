// Valeurs
function saveOptionsValues(e) {
    e.preventDefault();
    browser.storage.local.set({
        CO2: document.querySelector("#CO2").value,
        CO2u: document.querySelector("#CO2u").value,
        KWH_STOCK: document.querySelector("#KWH_STOCK").value,
        ELEC_STOCK: { country: document.querySelector("#ELEC_STOCK").value, elec: ELECTRICALMIXES[document.querySelector("#ELEC_STOCK").value] },
        OIL: document.querySelector("#OIL").value,
        CAR: document.querySelector("#CAR").value,
        TGV: document.querySelector("#TGV").value,
        BULB: document.querySelector("#BULB").value,
        BULBW: document.querySelector("#BULBW").value,
        BREATHING: document.querySelector("#BREATHING").value
    });
}

function restoreOptionsValues() {

    function setCurrentChoice(result) {
        document.querySelector("#CO2").value = result.CO2 || document.getElementById("defaultCO2").textContent;
        document.querySelector("#CO2u").value = result.CO2u || document.getElementById("defaultCO2u").textContent;
        document.querySelector("#KWH_STOCK").value = result.KWH_STOCK || document.getElementById("defaultKWH_STOCK").textContent;
        document.querySelector("#ELEC_STOCK").value = result.ELEC_STOCK ? result.ELEC_STOCK.country : document.getElementById("defaultELEC_STOCK").textContent;
        document.querySelector("#OIL").value = result.OIL || document.getElementById("defaultOIL").textContent;
        document.querySelector("#CAR").value = result.CAR || document.getElementById("defaultCAR").textContent;
        document.querySelector("#TGV").value = result.TGV || document.getElementById("defaultTGV").textContent;
        document.querySelector("#BULB").value = result.BULB || document.getElementById("defaultBULB").textContent;
        document.querySelector("#BULBW").value = result.BULBW || document.getElementById("defaultBULBW").textContent;
        document.querySelector("#BREATHING").value = result.BREATHING || document.getElementById("defaultBREATHING").textContent;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting = browser.storage.local.get(["CO2", "CO2u", "KWH_STOCK", "ELEC_STOCK", "OIL", "CAR", "TGV", "BULB", "BULBW", "BREATHING"]);
    getting.then(setCurrentChoice, onError);
}

function setDefaultOptionsValues() {
    document.querySelector("#CO2").value = document.getElementById("defaultCO2").textContent;
    document.querySelector("#CO2u").value = document.getElementById("defaultCO2u").textContent;
    document.querySelector("#KWH_STOCK").value = document.getElementById("defaultKWH_STOCK").textContent;
    document.querySelector("#ELEC_STOCK").value = document.getElementById("defaultELEC_STOCK").textContent;
    document.querySelector("#OIL").value = document.getElementById("defaultOIL").textContent;
    document.querySelector("#CAR").value = document.getElementById("defaultCAR").textContent;
    document.querySelector("#TGV").value = document.getElementById("defaultTGV").textContent;
    document.querySelector("#BULB").value = document.getElementById("defaultBULB").textContent;
    document.querySelector("#BULBW").value = document.getElementById("defaultBULBW").textContent;
    document.querySelector("#BREATHING").value = document.getElementById("defaultBREATHING").textContent;
}

document.addEventListener("DOMContentLoaded", () => {
    restoreOptionsValues();

    /* Générer liste déroulante des pays pour les mix électriques */
    ELECTRICALMIXES = { // kg CO2e/kWh - https://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element/categorie/68
        "France": 0.0569,
        "Afrique du Sud": 0.927,
        "Albanie": 2.15e-3,
        "Algérie": 0.548,
        "Allemagne": 0.461,
        "Angola": 0.44,
        "Antilles néerlandaises": 0.707,
        "Arabie saoudite": 0.737,
        "Argentine": 0.367,
        "Arménie": 0.0922,
        "Australie": 0.841,
        "Autriche": 0.188,
        "Azerbaïdjan": 0.439,
        "Bahreïn": 0.64,
        "Bangladesh": 0.593,
        "Bélarus": 0.449,
        "Belgique": 0.22,
        "Bénin": 0.72,
        "Birmanie": 0.262,
        "Bolivie": 0.423,
        "Bosnie-Herzégovine": 0.723,
        "Botswana": 2.52,
        "Brésil": 0.0868,
        "Brunéi Darussalam": 0.717,
        "Bulgarie": 0.535,
        "Cambodge": 0.804,
        "Cameroun": 0.207,
        "Canada": 0.186,
        "Chili": 0.41,
        "Chine": 0.766,
        "Chypre": 0.697,
        "Colombie": 0.176,
        "Congo": 0.142,
        "Corée du Nord": 0.465,
        "Corée du Sud": 0.533,
        "Costa Rica": 0.0557,
        "Côte d'Ivoire": 0.445,
        "Croatie": 0.236,
        "Cuba": 1.01,
        "Danemark": 0.36,
        "Égypte": 0.45,
        "El Salvador": 0.223,
        "Émirats arabes unis": 0.598,
        "Équateur": 0.389,
        "Érythrée": 0.646,
        "Espagne": 0.238,
        "Estonie": 1.01,
        "États-Unis": 0.522,
        "Éthiopie": 7.01e-3,
        "Finlande": 0.229,
        "Gabon": 0.383,
        "Géorgie": 0.0687,
        "Ghana": 0.259,
        "Gibraltar": 0.762,
        "Grèce": 0.718,
        "Guatemala": 0.286,
        "Haïti": 0.538,
        "Honduras": 0.332,
        "Hongrie": 0.317,
        "Inde": 0.912,
        "Indonésié": 0.709,
        "Iraq": 1,
        "Irlande": 0.458,
        "Islande": 1.83e-4,
        "Israël": 0.689,
        "Italie": 0.406,
        "Jamaïque": 0.711,
        "Japon": 0.416,
        "Jordanie": 0.566,
        "Kazakhstan": 0.403,
        "Kenya": 0.274,
        "Kirghizistan": 0.0591,
        "Kosovo": 1.29,
        "Koweït": 0.842,
        "Lettonie": 0.12,
        "Liban": 0.709,
        "Libye": 0.885,
        "Lituanie": 0.337,
        "Luxembourg": 0.41,
        "Macédonie": 0.685,
        "Malaisie": 0.727,
        "Malte": 0.872,
        "Maroc": 0.718,
        "Mexique": 0.455,
        "Moldavie": 0.517,
        "Mongolie": 0.949,
        "Monténégro": 0.405,
        "Mozambique": 6.48e-4,
        "Namibie": 0.197,
        "Népal": 1.06e-3,
        "Nicaragua": 0.46,
        "Nigéria": 0.405,
        "Norvège": 0.0167,
        "Nouvelle-Zélande": 0.15,
        "Oman": 0.794,
        "Ouzbékistan": 0.55,
        "Pakistan": 0.425,
        "Panama": 0.298,
        "Pays-Bas": 0.415,
        "Pérou": 0.289,
        "Philippines": 0.481,
        "Pologne": 0.781,
        "Portugal": 0.255,
        "Qatar": 0.494,
        "République démocratique du Congo": 2.91e-3,
        "République dominicaine": 0.589,
        "République tchèque": 0.589,
        "Roumanie": 0.413,
        "Royaume-Uni": 0.457,
        "Russie": 0.384,
        "Sénégal": 0.637,
        "Serbie": 0.718,
        "Singapour": 0.499,
        "Slovaquie": 0.197,
        "Slovénie": 0.325,
        "Soudan": 0.344,
        "Sri Lanka": 0.379,
        "Suède": 0.0296,
        "Suisse": 0.0273,
        "Syrie": 0.594,
        "Tadjikistan": 0.0143,
        "Taïwan": 0.624,
        "Tanzanie": 0.329,
        "Thaïlande": 0.513,
        "Togo": 0.195,
        "Trinité-et-Tobago": 0.7,
        "Tunisie": 0.463,
        "Turkménistan": 0.954,
        "Turquie": 0.46,
        "Ukraine": 0.392,
        "Union européenne": 0.42,
        "Uruguay": 0.081,
        "Venezuela": 0.264,
        "Viêt Nam": 0.432,
        "Yémen": 0.655,
        "Zambie": 2.68e-3,
        "Zimbabwe": 0.66
    };

    var select = document.getElementById("ELEC_STOCK");

    for (var i in ELECTRICALMIXES) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        select.appendChild(opt);
    }

    const span_gco2 = document.createElement("span");
    span_gco2.appendChild(document.createElement("span"));
    span_gco2.lastChild.textContent = " g CO";
    span_gco2.appendChild(document.createElement("sub"));
    span_gco2.lastChild.textContent = "2";
    span_gco2.appendChild(document.createElement("span"));
    span_gco2.lastChild.textContent = "e / Wh"

    const span_elec_stock = span_gco2.cloneNode(true);
    span_elec_stock.firstChild.textContent = ELECTRICALMIXES[document.getElementById("ELEC_STOCK").value] + " g CO";
    document.getElementById("ELEC_STOCK_unit").replaceChildren(span_elec_stock); // afficher la valeur

    document.getElementById("ELEC_STOCK").onchange = function() { // à chaque fois que le pays est modifié
        span_elec_stock.firstChild.textContent = ELECTRICALMIXES[document.getElementById("ELEC_STOCK").value] + " g CO";
    };
});
document.querySelector("#valuesForm").addEventListener("submit", saveOptionsValues);
document.getElementById("defaultButton").onclick = () => { setDefaultOptionsValues() };