export function RenderGridLines(container, doc, dataBag) {
    if (doc.diagram.gridLines) {
        let gridMargin = 20;

        let grids = container.append("g")
            .attr("class", "grids");

        // X gridlines
        let xLines = grids.append("g")
            .attr("class", "grid");

        for (var x = 0; x < doc.diagram.columns; x++) {
            let pos = dataBag.Scaler.X.ScaleWithOffset(x);

            xLines.append("line")
                .attr("stroke", "black")
                .attr("x1", pos)
                .attr("y1", 0 + gridMargin)
                .attr("x2", pos)
                .attr("y2", dataBag.DiagramHeight - gridMargin);

            xLines.append("text")
                .attr("x", pos)
                .attr("y", dataBag.DiagramHeight)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "ideographic")
                .style('font-size', '15px')
                .text(x);
        }

        // Y gridlines
        let yLines = grids.append("g")
            .attr("class", "grid");

        for (var y = 0; y < doc.diagram.rows; y++) {
            let pos = dataBag.Scaler.Y.ScaleWithOffset(y);

            yLines.append("line")
                .attr("stroke", "black")
                .attr("x1", 0 + gridMargin)
                .attr("y1", pos)
                .attr("x2", dataBag.DiagramWidth - gridMargin)
                .attr("y2", pos);

            yLines.append("text")
                .attr("x", gridMargin * (2 / 3))
                .attr("y", pos)
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .style('font-size', '15px')
                .text(y);
        }

    }
}
