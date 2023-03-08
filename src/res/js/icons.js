import { ApplyTextLocation } from './common.js'

export function RenderIcons(container, doc, dataBag) {
    let iconsContainer = container.append("g")
        .attr("class", "icons");

    dataBag.icons = {};

    let previous = {};
    Object.keys(doc.icons).forEach(function (key, index) {
        let computed = {};

        if (!("x" in doc.icons[key])) {
            doc.icons[key].x = parseFloat(previous.x);
        } else if (doc.icons[key].x.toString().startsWith('+')) {
            doc.icons[key].x = parseFloat(previous.x) + parseFloat(doc.icons[key].x.toString().split('+')[1]);
        } else if (doc.icons[key].x.toString().startsWith('-')) {
            doc.icons[key].x = parseFloat(previous.x) - parseFloat(doc.icons[key].x.toString().split('-')[1]);
        }
        doc.icons[key].x = parseFloat(doc.icons[key].x)
        computed.xScaled = dataBag.Scaler.X.ScaleWithOffset(doc.icons[key].x)

        if (!("y" in doc.icons[key])) {
            doc.icons[key].y = parseFloat(previous.y);
        } else if (doc.icons[key].y.toString().startsWith('+')) {
            doc.icons[key].y = parseFloat(previous.y) + parseFloat(doc.icons[key].y.toString().split('+')[1]);
        } else if (doc.icons[key].y.toString().startsWith('-')) {
            doc.icons[key].y = parseFloat(previous.y) - parseFloat(doc.icons[key].y.toString().split('-')[1]);
        }
        doc.icons[key].y = parseFloat(doc.icons[key].y)
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

        iconContainer.append("rect")
            .attr("x", computed.x1Marged)
            .attr("y", computed.y1Marged)
            .attr("width", computed.wMarged)
            .attr("height", computed.hMarged)
            .attr("rx", computed.cornerRad)
            .attr("ry", computed.cornerRad)
            .attr("fill", doc.icons[key].fill)
            .attr("stroke", doc.icons[key].stroke);

        // Text

        let fontSize = doc.icons[key].textSizeRatio * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs)

        let iconText = iconContainer.append("text")
            .attr("class", "icon-label")
            .attr("color", doc.icons[key].color)
            .style("font-size", `${fontSize}px`);

        let textContent = key;
        if ("text" in doc.icons[key]) {
            textContent = doc.icons[key].text;
        }

        iconText.text(textContent);

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

        let family = doc.icons[key].iconFamily.toLowerCase();
        let icon = doc.icons[key].icon.toLowerCase();
        let url = "./res/icons/" + family + "/" + icon + ".svg";

        if (family == "iconify") {
            url = `https://api.iconify.design/${icon.replace(":", "/")}.svg`;
        }

        let iconImage = iconContainer.append("g")
            .attr("transform", `translate(${iconSize / 2 * -1 + computed.iconImageXOffset / 2}, ${iconSize / 2 * -1 + computed.iconImageYOffset / 2})`);

        fetch(url).then(function (raw) {
            let svg = raw.text().then(text => {
                let parser = new DOMParser();
                let svg = parser.parseFromString(text, "image/svg+xml").documentElement;

                svg.setAttribute("width", iconSize);
                svg.setAttribute("height", iconSize);

                svg.querySelector("script").remove();

                iconImage._groups[0][0].innerHTML = svg.outerHTML;
            });
        });

        dataBag.icons[key] = computed;
        previous = doc.icons[key];
    });

}