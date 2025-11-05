let fontCache = {};

export async function ExportSVG(el, scaleFactor, embedFontAndStyle, yamlCode = null) {

    let width = parseFloat(el.attributes["width"].value);
    let height = parseFloat(el.attributes["height"].value);

    await LoadFonts();

    let clone = el.cloneNode(true);

    let cssExport = GenCSSExport();

    clone.removeAttribute("width");
    clone.removeAttribute("height");
    clone.setAttribute("viewBox", `0 0 ${width * scaleFactor} ${height * scaleFactor}`);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    
    clone.getElementsByClassName("zoom")[0].removeAttribute("transform");

    // Get the current transform and parse the translate values
    let documentElement = clone.getElementsByClassName("document")[0];
    let currentTransform = documentElement.getAttribute("transform");
    
    // Extract translate values from the transform (e.g., "translate(10, 20)")
    let translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    
    if (translateMatch) {
        let translateX = parseFloat(translateMatch[1]);
        let translateY = parseFloat(translateMatch[2]);
        
        // Scale the translate values and apply scale to the entire transform
        documentElement.setAttribute("transform", `translate(${translateX * scaleFactor}, ${translateY * scaleFactor}) scale(${scaleFactor})`);
    } else {
        // Fallback if no translate found (shouldn't happen, but just in case)
        documentElement.setAttribute("transform", `${currentTransform} scale(${scaleFactor})`);
    }

    if (embedFontAndStyle) {
        let defs = document.createElement("defs");
        clone.prepend(defs);

        Object.keys(fontCache).forEach(fontKey => {
            let elFont = document.createElement("style");
            elFont.innerHTML = `<![CDATA[${fontCache[fontKey]}]]>`;
            defs.appendChild(elFont);
        });
        

        let css = document.createElement("style");
        css.innerHTML = `<![CDATA[${cssExport}]]>`;
        defs.appendChild(css);
    }

    // Add YAML code as hidden metadata if provided
    if (yamlCode != null && yamlCode.trim() !== "") {
        let metadata = document.createElement("metadata");
        metadata.setAttribute("id", "drawthenet-yaml-source");
        metadata.innerHTML = `<![CDATA[${yamlCode}]]>`;
        clone.prepend(metadata);
    }

    let images = clone.querySelectorAll("image");

    for (let i = 0; i < images.length; i++) {
        let href = images[i].getAttribute("href");

        if(href == null)
        {
            href = images[i].getAttribute("xlink:href");
        }

        if (!href.startsWith("data:")) {
            await fetch(href).then(async resp => {

                let rawData = await resp.arrayBuffer();
                let byteArray = new Uint8Array(rawData);
                let charArray = Array.from(byteArray, byte => String.fromCharCode(byte));
                let binaryString = charArray.join("");

                let b64 = btoa(binaryString);

                let type = "";

                if (href.endsWith(".png")) {
                    type = "image/png";
                }
                else if (href.endsWith(".jpg") || href.endsWith(".jpeg")) {
                    type = "image/jpeg";
                }
                else if (href.endsWith(".gif")) {
                    type = "image/gif";
                }
                else if (href.endsWith(".svg")) {
                    type = "image/svg+xml";
                }

                images[i].setAttribute("href", `data:${type};base64,${b64}`);
            });

        }
    }

    return clone;
}

export async function ExportPNG(el, scaleFactor) {
    let width = parseFloat(el.attributes["width"].value);
    let height = parseFloat(el.attributes["height"].value);

    return new Promise(async (resolve, reject) => {

        let image = new Image();
        image.onload = function () {
            let offscreen = new OffscreenCanvas(width * scaleFactor, height * scaleFactor);
            let context = offscreen.getContext('2d');

            context.drawImage(image, 0, 0);

            let data = offscreen.convertToBlob({ type: 'image/png' });
            resolve(data);
        }

        image.onerror = function (e) {
            reject(e);
        }

        let rawSVG = (await ExportSVG(el, scaleFactor, true)).outerHTML;

        let uri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(rawSVG)));

        image.src = uri;
    });
}

function GenCSSExport() {
    let css = "";

    Object.keys(document.styleSheets).forEach(sheetKey => {
        try {
            Object.keys(document.styleSheets[sheetKey].cssRules).forEach(ruleKey => {
                css += document.styleSheets[sheetKey].cssRules[ruleKey].cssText
                css += "\n";
            });
        } catch (e) { }
    });

    return css;
}

export async function LoadFonts() {

    let fontsDef = await fetch("https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap").then(async resp => {
        let text = await resp.text();
        return text;
    });

    fontsDef.matchAll(/\/\* ([a-zA-Z0-9-]*) \*\/[\s\S]{0,2}(@font-face {[-\s\da-zA-Z.;:+()/'%_,]*})/gm).forEach(match => {
        let fontType = match[1]
        let fontDef = match[2];

        if (!(fontType in ["latin", "latin-ext"])) {
            let url = fontDef.match(/url\((\S*)\)/)[1];

            fetch(url).then(async r => {
                let rawData = await r.arrayBuffer();
                let byteArray = new Uint8Array(rawData);
                let charArray = Array.from(byteArray, byte => String.fromCharCode(byte));
                let binaryString = charArray.join("");

                let b64 = btoa(binaryString);
                fontDef = fontDef.replace(/url\((\S*)\)/, `url(data:font/woff2;base64,${b64}) format('woff2')`);

                fontCache[url] = fontDef;
            });
        }
    });
}