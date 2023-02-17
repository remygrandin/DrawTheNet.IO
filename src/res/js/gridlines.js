var drawGridLines = function (svg, document) {
    if (document.gridLines) {
        let gridMargin = 10;

        // X gridlines
        xLines = svg.append("g")
            .attr("class", "grid");

        for (var x = 0; x < document.columns; x++) {
            let pos = document.xBand.ScaleWithOffset(x);

            xLines.append("line")
                .attr("stroke", "black")
                .attr("x1", pos)
                .attr("y1", 0 + gridMargin)
                .attr("x2", pos)
                .attr("y2", document.height - gridMargin);

            xLines.append("text")
                .attr("x", pos)
                .attr("y", document.height + gridMargin / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style('font-size', '15px')
                .text(x);
        }

        // Y gridlines
        yLines = svg.append("g")
            .attr("class", "grid");

        for (var y = 0; y < document.rows; y++) {
            let pos = document.yBand.ScaleWithOffset(y);

            yLines.append("line")
                .attr("stroke", "black")
                .attr("x1", 0 + gridMargin)
                .attr("y1", pos)
                .attr("x2", document.width - gridMargin)
                .attr("y2", pos);

                yLines.append("text")
                .attr("x", 0)
                .attr("y", pos)
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .style('font-size', '15px')
                .text(y);
        }

    }
}
