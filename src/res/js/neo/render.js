import { ApplyDefaults } from './defaults.js'
import { Scaler } from './scaler.js'
import { RenderTitle } from './title.js'
import { RenderGridLines } from './gridlines.js'
import { RenderIcons } from './icons.js'
import { RenderConnections } from './connections.js'
import { RenderGroups } from './groups.js'
import { RenderNotes } from './notes.js'


export function Render(containerSelector, doc) {
    ApplyDefaults(doc);

    d3.select(`${containerSelector} > svg`).remove();

    let containerBox = d3.select(containerSelector).node().getBoundingClientRect();

    let dataBag = {};

    if (doc.diagram.aspectRatio == null) {
        dataBag.AvailableHeight = containerBox.height - doc.diagram.margin.top - doc.diagram.margin.bottom;
        dataBag.AvailableWidth = containerBox.width - doc.diagram.margin.left - doc.diagram.margin.right;
        dataBag.HCenterOffset = 0;
        dataBag.VCenterOffset = 0;
    }
    else {
        let maxAvailalbeHeight = containerBox.height - doc.diagram.margin.top - doc.diagram.margin.bottom;
        let maxAvailableWidth = containerBox.width - doc.diagram.margin.left - doc.diagram.margin.right;

        let aspectRatio = doc.diagram.aspectRatio.split(':');
        aspectRatio = aspectRatio[0] / aspectRatio[1];

        let heightByWidth = maxAvailableWidth / aspectRatio;
        let widthByHeight = maxAvailalbeHeight * aspectRatio;

        if(heightByWidth > maxAvailalbeHeight)
        {
            dataBag.AvailableHeight = maxAvailalbeHeight;
            dataBag.AvailableWidth = widthByHeight;
            dataBag.HCenterOffset = (maxAvailableWidth - widthByHeight) / 2;
            dataBag.VCenterOffset = 0;
        }
        else
        {
            dataBag.AvailableHeight = heightByWidth;
            dataBag.AvailableWidth = maxAvailableWidth;
            dataBag.HCenterOffset = 0;
            dataBag.VCenterOffset = (maxAvailalbeHeight - heightByWidth) / 2;
        }

    }


    let mainContainer = d3.select(containerSelector)
        .append("svg")
        .attr("width", containerBox.width)
        .attr("height", containerBox.height)
        .style("background-color", doc.diagram.fill)
        .call(d3.zoom().on("zoom", function (e) {
            margedContainer.attr("transform", e.transform)
        }));

    let margedContainer = mainContainer.append("g")
        .attr("transform", `translate(${doc.diagram.margin.left + dataBag.HCenterOffset}, ${doc.diagram.margin.top + dataBag.VCenterOffset})`);

    RenderTitle(margedContainer, doc, dataBag);

    if (dataBag.TitleRendered) {
        dataBag.DiagramHeight = dataBag.AvailableHeight - dataBag.TitleHeight - doc.diagram.padding.top - doc.diagram.padding.bottom;
        dataBag.DiagramWidth = dataBag.AvailableWidth - doc.diagram.padding.left - doc.diagram.padding.right;
    }
    else {
        dataBag.DiagramHeight = dataBag.AvailableHeight;
        dataBag.DiagramWidth = dataBag.AvailableWidth;
    }

    dataBag.Scaler = {}
    dataBag.Scaler.X = new Scaler(0, doc.diagram.columns - 1, 0, dataBag.DiagramWidth, 1);
    if (doc.diagram.invertY) {
        dataBag.Scaler.Y = new Scaler(0, doc.diagram.rows - 1, dataBag.DiagramHeight, 0, 1);
    }
    else {
        dataBag.Scaler.Y = new Scaler(0, doc.diagram.rows - 1, 0, dataBag.DiagramHeight, 1);
    }

    let diagramContainer = margedContainer.append("g")
        .attr("transform", `translate(${doc.diagram.padding.left}, ${doc.diagram.padding.top})`);

    RenderGridLines(diagramContainer, doc, dataBag);
    RenderIcons(diagramContainer, doc, dataBag);
    RenderNotes(diagramContainer, doc, dataBag);
    RenderGroups(diagramContainer, doc, dataBag);
    RenderConnections(diagramContainer, doc, dataBag);

    // Order : grid, groups, connections, notes, icons
    bringForward(diagramContainer, '.grids');
    bringForward(diagramContainer, '.groups');
    bringForward(diagramContainer, '.connections');
    bringForward(diagramContainer, '.notes');
    bringForward(diagramContainer, '.icons');


    bringForward(diagramContainer, '.icon-label');
    bringForward(diagramContainer, '.group-label');
    bringForward(diagramContainer, '.connection-label');
}

function bringForward(container, selector)
{
    container.selectAll(selector).each(function (d) {
        d3.select(this).each(function () {
            this.parentNode.appendChild(this);
        });
    });
}