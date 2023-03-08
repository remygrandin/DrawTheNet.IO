let fontCache = {};

export async function RenderPNG(el) {
    let width = parseFloat(el.attributes["width"].value);
    let height = parseFloat(el.attributes["height"].value);

    let scaleFactor = 3;

    if (!("robotoMono" in fontCache)) {
        let fontB64 = await fetch("https://fonts.googleapis.com/css2?family=Roboto+Mono").then(async resp => {
            let text = await resp.text();

            let fileURL = text.match(/\/\* latin \*\/[\s\S]*url\((\S*)\)/)[1];

            let fontData = await fetch(fileURL).then(async r => {
                let rawData = await r.arrayBuffer();
                let byteArray = new Uint8Array(rawData);
                let charArray = Array.from(byteArray, byte => String.fromCharCode(byte));
                let binaryString = charArray.join("");

                return btoa(binaryString);
            });

            return fontData;
        });


        fontCache.robotoMono = ` \
        @font-face { \n \
            font-family: 'Roboto Mono'; \n \
            font-style: normal; \n \
            font-weight: 400; \n \
            src: url(data:font/woff2;base64,${fontB64}) format('woff2');\n `

    }

    if (!("roboto" in fontCache)) {
        let fontB64 = await fetch("https://fonts.googleapis.com/css2?family=Roboto").then(async resp => {
            let text = await resp.text();

            let fileURL = text.match(/\/\* latin \*\/[\s\S]*url\((\S*)\)/)[1];

            let fontData = await fetch(fileURL).then(async r => {
                let rawData = await r.arrayBuffer();
                let byteArray = new Uint8Array(rawData);
                let charArray = Array.from(byteArray, byte => String.fromCharCode(byte));
                let binaryString = charArray.join("");

                return btoa(binaryString);
            });

            return fontData;
        });


        fontCache.roboto = ` \
        @font-face { \n \
            font-family: 'Roboto'; \n \
            font-style: normal; \n \
            font-weight: 400; \n \
            src: url(data:font/woff2;base64,${fontB64}) format('woff2');\n `

    }

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

        let cssExport = GenCSSExport();

        let clone = el.cloneNode(true);

        clone.removeAttribute("width");
        clone.removeAttribute("height");
        clone.setAttribute("viewBox", `0 0 ${width * scaleFactor} ${height * scaleFactor}`);
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

        clone.childNodes[0].setAttribute("transform", `${clone.childNodes[0].getAttribute("transform")} scale(${scaleFactor})`);
        
        let defs = document.createElement("defs");
        clone.prepend(defs);

        let robotoFont = document.createElement("style");
        robotoFont.innerHTML = `<![CDATA[${fontCache.roboto}]]>`;
        defs.appendChild(robotoFont);

        let robotoMonoFont = document.createElement("style");
        robotoMonoFont.innerHTML = `<![CDATA[${fontCache.robotoMono}]]>`;
        defs.appendChild(robotoMonoFont);

        let css = document.createElement("style");
        css.innerHTML = `<![CDATA[${cssExport}]]>`;
        defs.appendChild(css);


        let images = clone.querySelectorAll("image");

        for(let i = 0; i < images.length; i++) {
            let href = images[i].getAttribute("href");
            if(!href.startsWith("data:"))
            {
                await fetch(href).then(async resp => {

                    let rawData = await resp.arrayBuffer();
                    let byteArray = new Uint8Array(rawData);
                    let charArray = Array.from(byteArray, byte => String.fromCharCode(byte));
                    let binaryString = charArray.join("");

                    let b64 = btoa(binaryString);

                    let type = "";

                    if(href.endsWith(".png"))
                    {
                        type = "image/png";
                    }
                    else if(href.endsWith(".jpg") || href.endsWith(".jpeg"))
                    {
                        type = "image/jpeg";
                    }
                    else if(href.endsWith(".gif"))
                    {
                        type = "image/gif";
                    }
                    else if(href.endsWith(".svg"))
                    {
                        type = "image/svg+xml";
                    }
                    
                    images[i].setAttribute("href", `data:${type};base64,${b64}`);
                });

            }
        }


        let rawSVG = clone.outerHTML;

        rawSVG = EncodeChars(rawSVG);

        let uri = 'data:image/svg+xml;base64,' + window.btoa(rawSVG);

        image.src = uri;
    });
}

function EncodeChars(data) {
    data = encodeURIComponent(data);
    data = data.replace(/%([0-9A-F]{2})/g, function (match, p1) {
        var c = String.fromCharCode('0x' + p1);
        return c === '%' ? '%25' : c;
    });
    return decodeURIComponent(data);
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