var drawNotes = function (svg, diagram, notes) {

    showdown.extension('highlight', function () {
        return [{
            type: "output",
            filter: function (text, converter, options) {
                var left = "<pre><code\\b[^>]*>",
                    right = "</code></pre>",
                    flags = "g";
                hljs.initLineNumbersOnLoad({
                    singleLine: false
                });
                var replacement = function (wholeMatch, match, left, right) {
                    var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
                    left = left.slice(0, 18) + 'hljs ' + left.slice(18);
                    if (lang && hljs.getLanguage(lang)) {
                        return left + hljs.highlight(lang, match).value + right;
                    } else {
                        return left + hljs.highlightAuto(match).value + right;
                    }
                };
                return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
            }
        }];
    });


    var converter = new showdown.Converter({
        extensions: ['highlight']
    });
    converter.setOption('prefixHeaderId', 'notes-');
    converter.setOption('tables', 'true');


    var xAlign = {
        left: {
            textAlign: "left",
            alignItems: "flex-start"
        },
        right: {
            textAlign: "right",
            alignItems: "flex-end"
        },
        center: {
            textAlign: "center",
            alignItems: "center"
        }
    }
    var yAlign = {
        top: {
            justifyContent: "flex-start"
        },
        center: {
            justifyContent: "center"
        },
        bottom: {
            justifyContent: "flex-end"
        }
    }

    var notes = svg.selectAll("notes")
        .data(Object.entries(notes))
        .enter()

    var notesg = notes.append("g")
        .attr("transform", function (d) { return "translate(" + d[1].x1 + "," + d[1].y1 + ")" })

    var noteFill = notesg
        .append("rect")
        .attr("rx", function (d) { return d[1].rx })
        .attr("ry", function (d) { return d[1].ry })
        .attr("width", function (d) { return d[1].width })
        .attr("height", function (d) { return d[1].height })
        .attr("id", function (d) { return d[0] })
        .attr("fill", function (d) { return d[1].fill || "red" })
        .style("stroke", function (d) { return d[1].stroke || "red" })

    var noteTextDiv = notesg
        .append("foreignObject")
        .attr("width", function (d) { return d[1].width + "px" })
        .attr("height", function (d) { return d[1].height + "px" })
        .append("xhtml:div")
        .style("width", function (d) { return d[1].width + "px" })
        .style("height", function (d) { return d[1].height + "px" })
        .style('font-size', Math.min(diagram.yBand.bandwidth() * .125, diagram.xBand.bandwidth() * .125) + 'px')
        .style('display', 'flex')
        .style('padding', function (d) { return d[1].padding + "px" })
        .attr("class", "notes")
        .style("color", function (d) { return d[1].color || "white" })
        .style('flex-direction', function (d) { return d[1].flexDirection || "column" })
        .style('align-items', function (d) { return d[1].alignItems || xAlign[d[1].xAlign].alignItems })
        .style('justify-content', function (d) { return d[1].justifyContent || yAlign[d[1].yAlign].justifyContent })
        .style('text-align', function (d) { return d[1].textAlign || xAlign[d[1].xAlign].textAlign })
        .html(function (d) { return converter.makeHtml(d[1].text || "Missing text in note") })
}
