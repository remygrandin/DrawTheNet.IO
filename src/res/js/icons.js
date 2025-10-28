import { ApplyTextLocation, GetPropByStringPath, DeepClone, ComputeNodeValue, HashCode, ExtractColorAndOpacity } from './common.js'
import PQueue from 'https://cdn.jsdelivr.net/npm/p-queue@8.0.1/+esm'

export function RenderIcons(container, doc, dataBag) {
    let iconsContainer = container.append("g")
        .attr("class", "icons");

    let queue = new PQueue({ concurrency: 20 });

    dataBag.icons = {};

    let previous = {};
    Object.keys(doc.icons).forEach(async function (key, index) {

        let computed = {};

        doc.icons[key].x = ComputeNodeValue(doc.icons[key], key, "x", previous, doc, key);
        doc.icons[key].y = ComputeNodeValue(doc.icons[key], key, "y", previous, doc, key);

        computed.xScaled = dataBag.Scaler.X.ScaleWithOffset(doc.icons[key].x)
        computed.yScaled = dataBag.Scaler.Y.ScaleWithOffset(doc.icons[key].y);

        computed.scaledMargin = {
            top: doc.icons[key].margin.top * dataBag.Scaler.Y.UnitStepAbs,
            right: doc.icons[key].margin.right * dataBag.Scaler.X.UnitStepAbs,
            bottom: doc.icons[key].margin.bottom * dataBag.Scaler.Y.UnitStepAbs,
            left: doc.icons[key].margin.left * dataBag.Scaler.X.UnitStepAbs
        }

        computed.scaledPadding = {
            top: doc.icons[key].padding.top * dataBag.Scaler.Y.UnitStepAbs,
            right: doc.icons[key].padding.right * dataBag.Scaler.X.UnitStepAbs,
            bottom: doc.icons[key].padding.bottom * dataBag.Scaler.Y.UnitStepAbs,
            left: doc.icons[key].padding.left * dataBag.Scaler.X.UnitStepAbs
        }

        computed.wScaled = doc.icons[key].w * dataBag.Scaler.X.UnitStepAbs;
        computed.hScaled = doc.icons[key].h * dataBag.Scaler.Y.UnitStepAbs;

        computed.x1 = computed.wScaled / 2 * -1;
        computed.y1 = computed.hScaled / 2 * -1;

        computed.x2 = computed.wScaled / 2;
        computed.y2 = computed.hScaled / 2;

        computed.x1Marged = computed.x1 + computed.scaledMargin.left;
        computed.y1Marged = computed.y1 + computed.scaledMargin.top;

        computed.x2Marged = computed.x2 - computed.scaledMargin.right;
        computed.y2Marged = computed.y2 - computed.scaledMargin.bottom;

        computed.x1Padded = computed.x1Marged + computed.scaledPadding.left;
        computed.y1Padded = computed.y1Marged + computed.scaledPadding.top;

        computed.x2Padded = computed.x2Marged - computed.scaledPadding.right;
        computed.y2Padded = computed.y2Marged - computed.scaledPadding.bottom;

        computed.wMarged = computed.wScaled - computed.scaledMargin.left - computed.scaledMargin.right;
        computed.hMarged = computed.hScaled - computed.scaledMargin.top - computed.scaledMargin.bottom;

        computed.wPadded = computed.wMarged - computed.scaledPadding.left - computed.scaledPadding.right;
        computed.hPadded = computed.hMarged - computed.scaledPadding.top - computed.scaledPadding.bottom;

        computed.cornerRad = Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs) * (1 / 16);

        let iconContainer = iconsContainer.append("g")
            .attr("id", "icon-" + key)
            .attr("transform", `translate(${computed.xScaled}, ${computed.yScaled})`);

        let fill = doc.icons[key].fill;
        let stroke = doc.icons[key].stroke;

        let { color: fillColor, opacity: fillOpacity } = ExtractColorAndOpacity(fill);
        let { color: strokeColor, opacity: strokeOpacity } = ExtractColorAndOpacity(stroke);

        iconContainer.append("rect")
            .attr("x", computed.x1Marged)
            .attr("y", computed.y1Marged)
            .attr("width", computed.wMarged)
            .attr("height", computed.hMarged)
            .attr("rx", computed.cornerRad)
            .attr("ry", computed.cornerRad)
            .attr("fill", fillColor)
            .attr("fill-opacity", fillOpacity)
            .attr("stroke", strokeColor)
            .attr("stroke-opacity", strokeOpacity);

        // Text

        let fontSize = doc.icons[key].textSizeRatio * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs)

        let { color: textColor, opacity: textOpacity } = ExtractColorAndOpacity(doc.icons[key].color);

        let iconText = iconContainer.append("text")
            .attr("class", "icon-label")
            .attr("fill", textColor)
            .attr("fill-opacity", textOpacity)
            .style("font-size", `${fontSize}px`);

        let textContent = key;
        if ("text" in doc.icons[key]) {
            textContent = doc.icons[key].text;
        }

        if (!("url" in doc.icons[key])) {
            iconText.text(textContent);
        }
        else {
            iconText.append("a")
                .attr("xlink:href", doc.icons[key].url)
                .attr("target", "_blank")
                .attr("class", "link")
                .text(textContent);
        }

        if ("metadata" in doc.icons[key]) {
            iconContainer.attr("class", iconContainer.attr("class") + " metadata")

            let tooltip = null;

            iconContainer.on("mouseenter mousemove", async function (event) {
                event.preventDefault();

                if (tooltip != null) {
                    return;
                }

                tooltip = "lock"

                let metadataBag = DeepClone(doc.icons[key].metadata);

                delete metadataBag.url;
                delete metadataBag.errorText;

                if ("url" in doc.icons[key].metadata) {
                    let url = doc.icons[key].metadata.url;

                    let matcher = /{{\s*(\S*)\s*}}/gm

                    let result;
                    while (result = matcher.exec(url)) {
                        let matchKey = result[1];

                        if (matchKey == "key") {
                            url = url.replace(result[0], key);
                        }
                        else {
                            url = url.replace(result[0], GetPropByStringPath(doc.icons[key], matchKey));
                        }
                    }

                    try {
                        let fetchRes = await fetch(url);

                        if (!fetchRes.ok) {
                            if ("errorText" in doc.icons[key].metadata) {
                                metadataBag.Error = doc.icons[key].metadata.errorText;
                            }
                            else {
                                metadataBag.Error = `${fetchRes.status} ${fetchRes.statusText}`;
                            }
                        }
                        else {
                            let json = await fetchRes.json();

                            for (let key in json) {
                                metadataBag[key] = json[key];
                            }
                        }
                    }
                    catch (err) {
                        if ("errorText" in doc.icons[key].metadata) {
                            metadataBag.Error = doc.icons[key].metadata.errorText;
                        }
                        else {
                            metadataBag.Error = "Error while querying metadata. Check URL/service availability."
                        }
                    }
                }

                if (tooltip === "destroy") {
                    tooltip = null;
                    return;
                }

                let metatable = document.createElement("table");
                metatable.classList.add("table", "table-sm", "table-borderless", "table-dark", "mb-0", "metadata-table", "table-striped");
                let tbody = document.createElement("tbody");
                metatable.appendChild(tbody);

                for (let metaKey in metadataBag) {
                    let tr = document.createElement("tr");
                    let td1 = document.createElement("th");
                    let td2 = document.createElement("td");

                    td1.innerText = metaKey;
                    td2.innerText = metadataBag[metaKey];

                    tr.appendChild(td1);
                    tr.appendChild(td2);

                    tbody.appendChild(tr);
                }

                let tooltipContent = metatable.outerHTML;

                tooltip = new bootstrap.Tooltip(event.target, {
                    html: true,
                    sanitize: false,
                    container: "body",
                    trigger: "manual",
                    title: tooltipContent
                })


                tooltip.show();
            });

            iconContainer.on("mouseleave", function (event) {
                event.preventDefault();
                if (tooltip === null || tooltip === "destroy") {
                    return;
                }

                if (tooltip === "lock") {
                    tooltip = "destroy";
                    return;
                }

                tooltip.dispose();
                tooltip = null;
            });
        }


        // Text location

        ApplyTextLocation(iconText, doc.icons[key].textLocation, computed.x1Padded, computed.y1Padded, computed.x2Padded, computed.y2Padded)

        computed.iconImageXOffset = 0;
        computed.iconImageYOffset = 0;

        if (doc.icons[key].textLocation.startsWith("top")) {
            computed.iconImageYOffset = fontSize * 1.2;
        }
        else if (doc.icons[key].textLocation.startsWith("bottom")) {
            computed.iconImageYOffset = fontSize * 1.2 * -1;
        }
        else if (doc.icons[key].textLocation.startsWith("left")) {
            computed.iconImageXOffset = fontSize * 1.2;
        }
        else if (doc.icons[key].textLocation.startsWith("right")) {
            computed.iconImageXOffset = fontSize * 1.2 * -1;
        }

        // Icon
        let iconSize = Math.min(computed.wPadded - Math.abs(computed.iconImageXOffset), computed.hPadded - Math.abs(computed.iconImageYOffset));


        if (doc.icons[key].iconFamily != null && doc.icons[key].iconFamily != "none" && doc.icons[key].icon != null && doc.icons[key].icon != "none") {            
            let icon = doc.icons[key].icon.toLowerCase();
            let family = doc.icons[key].iconFamily.toLowerCase();

            let url = "./res/icons/" + family + "/" + icon + ".svg";

            if (family == "iconify") {
                url = `https://api.iconify.design/${icon.replace(":", "/")}.svg`;
            }

            let urlHash = HashCode(url);

            let iconImage = iconContainer.append("g")
                .attr("transform", `translate(${iconSize / 2 * -1 + computed.iconImageXOffset / 2}, ${iconSize / 2 * -1 + computed.iconImageYOffset / 2})`);

            let iconProcessor = function (text) {
                iconCache[urlHash] = text;

                let parser = new DOMParser();
                let svg = parser.parseFromString(text, "image/svg+xml").documentElement;

                svg.setAttribute("width", iconSize);
                svg.setAttribute("height", iconSize);

                let scripts = svg.querySelectorAll("script");
                if (scripts != null && scripts.length > 0) {
                    scripts.forEach(script => {
                        script.remove();
                    });
                }

                let preserveWhite = "preserveWhite" in doc.icons[key] ? doc.icons[key].preserveWhite : false;

                if ("iconFill" in doc.icons[key]) {
                    let { color: iconFillColor, opacity: iconFillOpacity } = ExtractColorAndOpacity(doc.icons[key].iconFill);
                    let fills = svg.querySelectorAll("[fill]");
                    if (fills != null && fills.length > 0) {
                        fills.forEach(fill => {
                            let fillAttr = fill.getAttribute("fill");
                            if (!preserveWhite) {
                                fill.setAttribute("fill", iconFillColor);
                                fill.setAttribute("fill-opacity", iconFillOpacity);
                            }
                            else {
                                if (!(fillAttr == "#fff" || fillAttr == "#ffffff" || fillAttr == "white")) {
                                    fill.setAttribute("fill", iconFillColor);
                                    fill.setAttribute("fill-opacity", iconFillOpacity);
                                }
                            }
                        });
                    }
                }

                if ("iconStroke" in doc.icons[key]) {
                    let { color: iconStrokeColor, opacity: iconStrokeOpacity } = ExtractColorAndOpacity(doc.icons[key].iconStroke);
                    let strokes = svg.querySelectorAll("[stroke]");
                    if (strokes != null && strokes.length > 0) {
                        strokes.forEach(stroke => {
                            let strokeAttr = stroke.getAttribute("stroke");
                            if (!preserveWhite) {
                                stroke.setAttribute("stroke", iconStrokeColor);
                                stroke.setAttribute("stroke-opacity", iconStrokeOpacity);
                            }
                            else {
                                if (!(strokeAttr == "#fff" || strokeAttr == "#ffffff" || strokeAttr == "white")) {
                                    stroke.setAttribute("stroke", iconStrokeColor);
                                    stroke.setAttribute("stroke-opacity", iconStrokeOpacity);
                                }
                            }
                        });
                    }
                }

                iconImage._groups[0][0].innerHTML = svg.outerHTML;
            };

            if (!(urlHash in iconCache)) {
                queue.add(async () => {
                    const response = await fetch(url);
                    if (!response.ok) {
                        // Handle fetch failure, e.g., skip or log error
                        console.error(`Failed to fetch icon from ${url}: ${response.status} ${response.statusText}`);
                        return;
                    }
                    const text = await response.text();
                    iconProcessor(text);
                });

            }
            else {
                iconProcessor(iconCache[urlHash]);
            }
        };

        dataBag.icons[key] = computed;
        previous = doc.icons[key];
    });
}

let iconCache = {};