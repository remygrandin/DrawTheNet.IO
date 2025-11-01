import { HashCode, ExtractColorAndOpacity } from './common.js';

let iconCache = {};

export function RenderTitle(container, doc, dataBag) {
    if (doc.title.heightPercentage <= 0 || doc.title.position == null || doc.title.position == "none") {
        dataBag.TitleRendered = false;
        return;
    }

    dataBag.TitleHeight = dataBag.AvailableHeight * doc.title.heightPercentage / 100;

    let titleContainer = container.append("g");

    if (doc.title.position == "top") {
        titleContainer.attr("transform", `translate(0, 0)`);
    }
    else if (doc.title.position == "bottom") {
        titleContainer.attr("transform", `translate(0, ${dataBag.AvailableHeight - dataBag.TitleHeight})`);
    }
    else {
        throw `Invalid title position: ${doc.title.position}`
    }

    let fill = doc.title.fill;
    if ([null, "none", "transparent", ""].includes(doc.title.fill)) {
        fill = doc.document.fill
    }

    let { color: fillColor, opacity: fillOpacity } = ExtractColorAndOpacity(fill);
    let { color: strokeColor, opacity: strokeOpacity } = ExtractColorAndOpacity(doc.title.stroke);

    if (doc.title.border == "bar") {
        let line = titleContainer.append("line");

        if (strokeColor !== "none" && strokeColor !== "transparent") {
            line.attr("stroke", strokeColor);
            if (strokeOpacity !== null) {
                line.attr("stroke-opacity", strokeOpacity);
            }
        }

        if (doc.title.position == "top") {
            line.attr("x1", 0)
                .attr("y1", dataBag.TitleHeight)
                .attr("x2", dataBag.AvailableWidth)
                .attr("y2", dataBag.TitleHeight)
        }
        else if (doc.title.position == "bottom") {
            line.attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", dataBag.AvailableWidth)
                .attr("y2", 0)
        }
    }
    else if (doc.title.border == "box") {
        let rect = titleContainer.append("rect")
            .attr('width', dataBag.AvailableWidth)
            .attr('height', dataBag.TitleHeight);
        
        if (strokeColor !== "none" && strokeColor !== "transparent") {
            rect.attr("stroke", strokeColor);
            if (strokeOpacity !== null) {
                rect.attr("stroke-opacity", strokeOpacity);
            }
        }
        
        if (fillColor !== "none" && fillColor !== "transparent") {
            rect.attr("fill", fillColor);
            if (fillOpacity !== null) {
                rect.attr("fill-opacity", fillOpacity);
            }
        }
    }
    else {
        throw `Invalid title border: ${doc.title.border}`
    }

    dataBag.TitlePaddedWidth = Math.max(dataBag.AvailableWidth - doc.title.padding.left - doc.title.padding.right, 0);
    dataBag.TitlePaddedHeight = Math.max(dataBag.TitleHeight - doc.title.padding.top - doc.title.padding.bottom, 0);

    let paddedMask = titleContainer
        .append("mask")
        .attr("id", "titleMask")
        .append("rect")
        .attr("fill", "white")
        .attr('width', dataBag.TitlePaddedWidth)
        .attr('height', dataBag.TitlePaddedHeight);


    let paddedContainer = titleContainer.append("g")
        .attr("transform", `translate(${doc.title.padding.left}, ${doc.title.padding.top})`)
        .attr("mask", "url(#titleMask)");

    // Left Part : Logo
    let logoContainer = paddedContainer.append("g");

    let logoFill = doc.title.logoFill;
    if ([null, "none", "transparent", ""].includes(doc.title.logoFill)) {
        logoFill = doc.document.fill;
    }
    
    let { color: logoFillColor, opacity: logoFillOpacity } = ExtractColorAndOpacity(logoFill);
    
    let logoRect = logoContainer.append("rect")
        .attr('width', dataBag.TitlePaddedHeight)
        .attr('height', dataBag.TitlePaddedHeight);
    
    if (logoFillColor !== "none" && logoFillColor !== "transparent") {
        logoRect.attr("fill", logoFillColor);
        if (logoFillOpacity !== null) {
            logoRect.attr("fill-opacity", logoFillOpacity);
        }
    }

    // Check if logoIcon is specified, otherwise fall back to logoUrl
    if (doc.title.logoIcon != null && doc.title.logoIcon != "none") {
        let icon = doc.title.logoIcon.toLowerCase();
        let family = (doc.title.logoIconFamily || "Iconify").toLowerCase();

        let url = "./res/icons/" + family + "/" + icon + ".svg";

        if (family == "iconify") {
            url = `https://api.iconify.design/${icon.replace(":", "/")}.svg`;
        }

        let urlHash = HashCode(url);

        let iconImage = logoContainer.append("g");

        let iconProcessor = function (text) {
            iconCache[urlHash] = text;

            let parser = new DOMParser();
            let svg = parser.parseFromString(text, "image/svg+xml").documentElement;

            svg.setAttribute("width", dataBag.TitlePaddedHeight);
            svg.setAttribute("height", dataBag.TitlePaddedHeight);

            let scripts = svg.querySelectorAll("script");
            if (scripts != null && scripts.length > 0) {
                scripts.forEach(script => {
                    script.remove();
                });
            }

            iconImage._groups[0][0].innerHTML = svg.outerHTML;
        };

        if (!(urlHash in iconCache)) {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        console.error(`Failed to fetch icon from ${url}: ${response.status} ${response.statusText}`);
                        return;
                    }
                    return response.text();
                })
                .then(text => {
                    if (text) {
                        iconProcessor(text);
                    }
                });
        }
        else {
            iconProcessor(iconCache[urlHash]);
        }
    }
    else {
        // Fall back to logoUrl
        logoContainer.append("svg:image")
            .attr('width', dataBag.TitlePaddedHeight)
            .attr('height', dataBag.TitlePaddedHeight)
            .attr("xlink:href", doc.title.logoUrl)
    }

    // Left Part : Title text
    paddedContainer.append("text")
        .attr("x", dataBag.TitlePaddedHeight + doc.title.padding.left)
        .attr("y", dataBag.TitlePaddedHeight * (2 / 5)) // 2/5 from the top
        .attr("dominant-baseline", "middle")
        .style("fill", doc.title.color)
        .style('font-size', dataBag.TitlePaddedHeight * .5 + 'px')
        .text(doc.title.text)

    // Left Part : Title subtext
    paddedContainer.append("text")
        .attr("x", dataBag.TitlePaddedHeight + doc.title.padding.left)
        .attr("y", dataBag.TitlePaddedHeight * (4 / 5)) // 4/5 from the top
        .attr("dominant-baseline", "middle")
        .style("fill", doc.title.color)
        .style('font-size', dataBag.TitlePaddedHeight * .25 + 'px')
        .text(doc.title.subText)

    // Right Part Commons
    let fontSize = dataBag.TitlePaddedHeight * (1 / 4)

    // Right Part : Author
    if (![null, "none", ""].includes(doc.title.author)) {
        paddedContainer.append("text")
            .attr("x", dataBag.TitlePaddedWidth - dataBag.TitlePaddedWidth * (1 / 5)) // 1/5 from the right
            .attr("y", dataBag.TitlePaddedHeight * (1 / 8)) // 1/8 from the top
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")
            .style("fill", doc.title.color)
            .style('font-size', `${fontSize}px`)
            .style("font-weight", "bold")
            .text("Author:")

        paddedContainer.append("text")
            .attr("x", dataBag.TitlePaddedWidth - dataBag.TitlePaddedWidth * (1 / 5) + 5) // 1/5 from the right
            .attr("y", dataBag.TitlePaddedHeight * (1 / 8)) // 1/8 from the top
            .attr("dominant-baseline", "middle")
            .style("fill", doc.title.color)
            .style('font-size', `${dataBag.TitlePaddedHeight * (1 / 4)}px`)
            .text(doc.title.author)
    }

    // Right Part : Company
    if (![null, "none", ""].includes(doc.title.company)) {
        paddedContainer.append("text")
            .attr("x", dataBag.TitlePaddedWidth - dataBag.TitlePaddedWidth * (1 / 5)) // 1/5 from the right
            .attr("y", dataBag.TitlePaddedHeight * (3 / 8)) // 3/8 from the top
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")  // set anchor y justification
            .style("fill", doc.title.color)
            .style('font-size', `${fontSize}px`)
            .style("font-weight", "bold")
            .text("Company:")

        paddedContainer.append("text")
            .attr("x", dataBag.TitlePaddedWidth - dataBag.TitlePaddedWidth * (1 / 5) + 5) // 1/5 from the right
            .attr("y", dataBag.TitlePaddedHeight * (3 / 8)) // 3/8 from the top
            .attr("dominant-baseline", "middle")
            .style("fill", doc.title.color)
            .style('font-size', `${fontSize}px`)
            .text(doc.title.company)
    }

    // Right Part : Date
    if (![null, "none", ""].includes(doc.title.date)) {
        paddedContainer.append("text")
            .attr("x", dataBag.TitlePaddedWidth - dataBag.TitlePaddedWidth * (1 / 5)) // 1/5 from the right
            .attr("y", dataBag.TitlePaddedHeight * (5 / 8)) // 5/8 from the top
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")  // set anchor y justification
            .style("fill", doc.title.color)
            .style('font-size', `${fontSize}px`)
            .style("font-weight", "bold")
            .text("Date:")

        paddedContainer.append("text")
            .attr("x", dataBag.TitlePaddedWidth - dataBag.TitlePaddedWidth * (1 / 5) + 5) // 1/5 from the right
            .attr("y", dataBag.TitlePaddedHeight * (5 / 8)) // 5/8 from the top
            .attr("dominant-baseline", "middle")
            .style("fill", doc.title.color)
            .style('font-size', `${fontSize}px`)
            .text(doc.title.date)
    }

    // Right Part : Version
    if (![null, "none", ""].includes(doc.title.version)) {
        paddedContainer.append("text")
            .attr("x", dataBag.TitlePaddedWidth - dataBag.TitlePaddedWidth * (1 / 5)) // 1/5 from the right
            .attr("y", dataBag.TitlePaddedHeight * (7 / 8)) // 7/8 from the top
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")  // set anchor y justification
            .style("fill", doc.title.color)
            .style('font-size', `${fontSize}px`)
            .style("font-weight", "bold")
            .text("Version:")

        paddedContainer.append("text")
            .attr("x", dataBag.TitlePaddedWidth - dataBag.TitlePaddedWidth * (1 / 5) + 5) // 1/5 from the right
            .attr("y", dataBag.TitlePaddedHeight * (7 / 8)) // 7/8 from the top
            .attr("dominant-baseline", "middle")
            .style("fill", doc.title.color)
            .style('font-size', `${fontSize}px`)
            .text(doc.title.version)
    }

    dataBag.TitleRendered = true;
}