var drawTitle = function (svg, document, title) {
    if (title.heightPercentage > 0) {
        // title bar
        title.width = document.width;
        title.x1 = 0;
        title.y1 = document.height;
        title.x2 = title.x1 + title.width;
        title.y2 = title.y1 + title.height;

        var titleBox = svg.append("g")
            .attr("transform", "translate(" + title.x1 + "," + title.y1 + ")")

        if (document.watermark) {
            let link = svg.append("a")
                .attr("href", "https://drawthenet.io")
                .attr("target", "_blank")
            
                link.append("text")
                .attr("transform", "translate(" + title.x1 + "," + title.y1 + ")")
                .attr("x", title.width)
                .attr("y", title.height * 7 / 8)
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .style("fill", title.color)
                .style('font-size', title.height * .2 + 'px')
                .text("Made with DrawTheNet.IO");
        }

        if (title.type == "bar") {
            let fill = document.fill;

            if (typeof title.fill !== 'undefined' && title.fill != null && title.fill != "none"
                && title.fill != "transparent" && title.fill != "") {
                fill = title.fill
            }

            titleBox.append("line")
                .attr("fill", fill)
                .attr("stroke", title.stroke)
                .attr("x2", title.width)
        }
        else if (title.type == "box") {
            let fill = document.fill;

            if (typeof title.fill !== 'undefined' && title.fill != null && title.fill != "none"
                && title.fill != "transparent" && title.fill != "") {
                fill = title.fill
            }

            titleBox.append("rect")
                .attr("fill", fill)
                .attr("stroke", title.stroke)
                .attr('width', title.width)
                .attr('height', title.height)
        }
        else if (typeof title.type === 'undefined' || title.type != null || title.type == "none") {
            return;
        }
        else {
            throw "Invalid title type: " + title.type
        }

        // image and imagefill
        var padding = title.height * .025
        var titleInner = titleBox.append("g")
            .attr("transform", "translate(" + padding + "," + padding + ")")

        var logo = titleInner.append("g")
        if (typeof title.logoFill !== 'undefined' && title.logoFill != null && title.logoFill != "none"
            && title.logoFill != "transparent" && title.logoFill != "") {
            logo.append("rect")
                .attr('width', title.height - 2 * padding)
                .attr('height', title.height - 2 * padding)
                .attr("fill", title.logoFill)
        }
        else {
            logo.append("rect")
                .attr('width', title.height - 2 * padding)
                .attr('height', title.height - 2 * padding)
                .attr("fill", document.fill)
        }
        logo.append("svg:image")
            .attr('width', title.height - 2 * padding)
            .attr('height', title.height - 2 * padding)
            .attr("xlink:href", title.logoUrl)

        // the text
        titleInner.append("text")
            .attr("x", title.height)
            .attr("y", title.height * 2 / 5)
            .attr("dominant-baseline", "middle")
            .style("fill", title.color)
            .style('font-size', title.height * .5 + 'px')
            .text(title.text)

        // the subtext
        titleInner.append("text")
            .attr("x", title.height)
            .attr("y", title.height * 4 / 5)
            .attr("dominant-baseline", "middle")
            .style("fill", title.color)
            .style('font-size', title.height * .25 + 'px')
            .text(title.subText)

        // credits and detail
        // Author
        if (typeof title.author !== 'undefined' && title.author != "" && title.author != null) {
            titleInner.append("text")
                .attr("x", title.width - title.width / 5)
                .attr("y", title.height * 1 / 8)
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", "end")  // set anchor y justification
                .style("fill", title.color)
                .style('font-size', title.height * .25 + 'px')
                .style("font-weight", "bold")
                .text("Author:")

            titleInner.append("text")
                .attr("x", title.width - title.width / 5 + 2 * padding)
                .attr("y", title.height * 1 / 8)
                .attr("dominant-baseline", "middle")
                .style("fill", title.color)
                .style('font-size', title.height * .25 + 'px')
                .text(title.author)
        }
        // Company
        if (typeof title.company !== 'undefined' && title.company != "" && title.company != null) {
            titleInner.append("text")
                .attr("x", title.width - title.width / 5)
                .attr("y", title.height * 3 / 8)
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", "end")  // set anchor y justification
                .style("fill", title.color)
                .style('font-size', title.height * .25 + 'px')
                .style("font-weight", "bold")
                .text("Company:")

            titleInner.append("text")
                .attr("x", title.width - title.width / 5 + 2 * padding)
                .attr("y", title.height * 3 / 8)
                .attr("dominant-baseline", "middle")
                .style("fill", title.color)
                .style('font-size', title.height * .25 + 'px')
                .text(title.company)
        }
        // Date
        if (typeof title.date !== 'undefined' && title.date != "" && title.date != null) {
            titleInner.append("text")
                .attr("x", title.width - title.width / 5)
                .attr("y", title.height * 5 / 8)
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", "end")  // set anchor y justification
                .style("fill", title.color)
                .style('font-size', title.height * .25 + 'px')
                .style("font-weight", "bold")
                .text("Date:")

            titleInner.append("text")
                .attr("x", title.width - title.width / 5 + 2 * padding)
                .attr("y", title.height * 5 / 8)
                .attr("dominant-baseline", "middle")
                .style("fill", title.color)
                .style('font-size', title.height * .25 + 'px')
                .text(title.date)
        }
        // Version
        if (typeof title.version !== 'undefined' && title.version != "" && title.version != null) {
            titleInner.append("text")
                .attr("x", title.width - title.width / 5)
                .attr("y", title.height * 7 / 8)
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", "end")  // set anchor y justification
                .style("fill", title.color)
                .style('font-size', title.height * .25 + 'px')
                .style("font-weight", "bold")
                .text("Version:")

            titleInner.append("text")
                .attr("x", title.width - title.width / 5 + 2 * padding)
                .attr("y", title.height * 7 / 8)
                .attr("dominant-baseline", "middle")
                .style("fill", title.color)
                .style('font-size', title.height * .25 + 'px')
                .text(title.version)
        }
    }
}
