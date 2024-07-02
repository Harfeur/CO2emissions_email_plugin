document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('[data-locale]').forEach(elem => {
        if (elem.dataset.locale === "equivalencesCo2") {
            const strs = browser.i18n.getMessage(elem.dataset.locale).split("<sub>2</sub>");
            const sub_2 = document.createElement("sub");
            sub_2.textContent = 2;
            elem.replaceChildren(
                document.createTextNode(strs[0]),
                sub_2,
                document.createTextNode(strs[1])
            );
        } else elem.textContent = browser.i18n.getMessage(elem.dataset.locale);
    });
});

document.getElementsByTagName("html")[0].setAttribute("lang", browser.i18n.getUILanguage());