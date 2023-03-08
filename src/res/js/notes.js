export function RenderNotes(container, doc, dataBag) {

    showdown.extension('highlight', function () {
        return [{
            type: "output",
            filter: function (text, converter, options) {
                let left = "<pre><code\\b[^>]*>",
                    right = "</code></pre>",
                    flags = "g";

                let replacement = function (wholeMatch, match, left, right) {
                    let lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
                    left = left.slice(0, 18) + 'hljs ' + left.slice(18);
                    if (lang && hljs.getLanguage(lang)) {
                        return left + hljs.highlight(match, { language: lang }).value + right;
                    } else {
                        return left + hljs.highlightAuto(match).value + right;
                    }
                };
                return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
            }
        }];
    });

    let converter = new showdown.Converter({
        extensions: ['highlight']
    });
    converter.setOption('prefixHeaderId', 'notes-');
    converter.setOption('tables', 'true');




    let notesContainer = container.append("g")
        .attr("class", "notes");

    dataBag.notes = {};

    let previous = {};

    Object.keys(doc.notes).forEach(function (key, index) {
        let computed = {};

        if (!("x" in doc.notes[key])) {
            doc.notes[key].x = parseFloat(previous.x);
        } else if (doc.notes[key].x.toString().startsWith('+')) {
            doc.notes[key].x = parseFloat(previous.x) + parseFloat(doc.notes[key].x.toString().split('+')[1]);
        } else if (doc.notes[key].x.toString().startsWith('-')) {
            doc.notes[key].x = parseFloat(previous.x) - parseFloat(doc.notes[key].x.toString().split('-')[1]);
        }
        doc.notes[key].x = parseFloat(doc.notes[key].x)
        computed.xScaled = dataBag.Scaler.X.ScaleWithOffset(doc.notes[key].x)

        if (!("y" in doc.notes[key])) {
            doc.notes[key].y = parseFloat(previous.y);
        } else if (doc.notes[key].y.toString().startsWith('+')) {
            doc.notes[key].y = parseFloat(previous.y) + parseFloat(doc.notes[key].y.toString().split('+')[1]);
        } else if (doc.notes[key].y.toString().startsWith('-')) {
            doc.notes[key].y = parseFloat(previous.y) - parseFloat(doc.notes[key].y.toString().split('-')[1]);
        }
        doc.notes[key].y = parseFloat(doc.notes[key].y)
        computed.yScaled = dataBag.Scaler.Y.ScaleWithOffset(doc.notes[key].y);

        computed.scaledMargin = {
            top: doc.notes[key].margin.top * dataBag.Scaler.Y.UnitStepAbs,
            right: doc.notes[key].margin.right * dataBag.Scaler.X.UnitStepAbs,
            bottom: doc.notes[key].margin.bottom * dataBag.Scaler.Y.UnitStepAbs,
            left: doc.notes[key].margin.left * dataBag.Scaler.X.UnitStepAbs
        }

        computed.scaledPadding = {
            top: doc.notes[key].padding.top * dataBag.Scaler.Y.UnitStepAbs,
            right: doc.notes[key].padding.right * dataBag.Scaler.X.UnitStepAbs,
            bottom: doc.notes[key].padding.bottom * dataBag.Scaler.Y.UnitStepAbs,
            left: doc.notes[key].padding.left * dataBag.Scaler.X.UnitStepAbs
        }

        computed.wScaled = doc.notes[key].w * dataBag.Scaler.X.UnitStepAbs;
        computed.hScaled = doc.notes[key].h * dataBag.Scaler.Y.UnitStepAbs;

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

        let fontSize = doc.notes[key].textSizeRatio * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs)

        let noteContainer = notesContainer.append("g")
            .attr("transform", `translate(${computed.xScaled}, ${computed.yScaled})`)

        let noteRect = noteContainer.append("rect")
            .attr("x", computed.x1Marged)
            .attr("y", computed.y1Marged)
            .attr("width", computed.wMarged)
            .attr("height", computed.hMarged)
            .attr("rx", computed.cornerRad)
            .attr("ry", computed.cornerRad)
            .attr("fill", doc.notes[key].fill)
            .attr("stroke", doc.notes[key].stroke);

        let noteFO = noteContainer.append("foreignObject")
            .attr("width", computed.wPadded)
            .attr("height", computed.hPadded)
            .attr("transform", `translate(${computed.x1Padded}, ${computed.y1Padded})`)
            
        noteFO.append("xhtml:div")
            .attr("xmlns", "http://www.w3.org/1999/xhtml")
            .style("width", `${computed.wPadded}px`)
            .style("height", `${computed.hPadded}px`)
            .style('font-size', `${fontSize}px`)
            .style("color", doc.notes[key].color)
            .style('display', 'flex')
            .style('flex-direction', doc.notes[key].flexDirection)
            .style('align-items', doc.notes[key].alignItems)
            .style('justify-content', doc.notes[key].justifyContent)
            .style('text-align', doc.notes[key].textAlign)
            .html(converter.makeHtml(doc.notes[key].text));

        hljs.initLineNumbersOnLoad({
            singleLine: false
        });

        dataBag.notes[key] = computed;
        previous = doc.notes[key];
    });
}