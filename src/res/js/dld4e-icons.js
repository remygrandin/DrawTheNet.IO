var drawIcons = function (svg, diagram, icons, iconTextRatio) {
  var deviceCellsAll = svg.selectAll("cells")
    .data(Object.entries(icons))
    .enter()

  var cells = deviceCellsAll.append("g")
    .attr("id", function(d) { return d[0] })
    .attr("transform", function(d) { return "translate(" + diagram.xBand(d[1].x) + "," + diagram.yBand(d[1].y) + ")" })
    .on("mouseenter", handleMouseOver)
    .on("mouseleave", handleMouseOut)
    .each( function (d) {
      if (d[1].metadata) {
        var text = d3.select(this)
        text.style("cursor", "pointer")
      }
    })

  var cellFill = cells
    .append("rect")
    .attr("rx", function(d) { return d[1].rx })
    .attr("ry", function(d) { return d[1].ry })
    .attr("width", function(d) { return d[1].width })
    .attr("height", function(d) { return d[1].height })
    .attr("fill", function(d) { return d[1].fill || "orange"})
    .style("stroke", function(d) { return d[1].stroke || "orange" })
    .style("stroke-dasharray", function(d) { return d[1].strokeDashArray || [0,0] })


  var cellText = cells
    .append("text")
    .attr('class', 'iconLabel')
    .text( function (d) { return d[1].text || d[0] })
    .each( function(d) {
      d[1].fontSize = Math.floor(Math.min(d[1].width*.9 / this.getComputedTextLength() * 12, d[1].height/2*iconTextRatio))
      d[1].textPosition = textPositions(0,0,d[1].width,d[1].height,d[1].fontSize + 2)[d[1].textLocation]
      if (d[1].url) {
        var text = d3.select(this)
        text.on("click", function() { window.open(d[1].url); })
        text.style("cursor", "pointer")
        text.style("text-decoration", "underline")
      }
    })
    .style("font-size", function(d) { return d[1].fontSize + "px"; })
    .attr("id", function(d) { return d[0] + '-text'})
    .attr("transform", function(d) { return "translate(" + d[1].textPosition.x + "," + d[1].textPosition.y + ")rotate(" + d[1].textPosition.rotate + ")" })
    .attr('fill', function(d) { return d[1].color || "orange"} )
    .attr("text-anchor", function(d) { return d[1].textPosition.textAnchor})
    .attr("dominant-baseline", "central")

  var icon = cells
    .each ( function(d) {
      var cell = document.getElementById(d[0])
      var cellText = document.getElementById(d[0] + "-text")
      var fontSize =  Math.ceil(parseFloat(cellText.style.fontSize))
      // center
      var x = (d[1].width*d[1].iconPaddingX)
      var y = (d[1].height*d[1].iconPaddingY)
      var width = d[1].width*(1-2*d[1].iconPaddingX)
      var height = (d[1].height)*(1-2*d[1].iconPaddingY)
      switch (true) {
        case d[1].textLocation.startsWith('top'):
          y += fontSize
          height = (d[1].height - fontSize)*(1-2*d[1].iconPaddingY)
          break;
        case d[1].textLocation.startsWith('left'):
          x += fontSize
          width = (d[1].width - fontSize)*(1-2*d[1].iconPaddingX)
          break;
        case d[1].textLocation.startsWith('right'):
          width = (d[1].width - fontSize)*(1-2*d[1].iconPaddingX)
          break;
        case d[1].textLocation.startsWith('bottom'):
          height = (d[1].height - fontSize)*(1-2*d[1].iconPaddingY)
          break;
      }

      let family = d[1].iconFamily
      let icon = d[1].icon
      var url = "res/icons/" + family + "/" + icon + ".svg"
      d3.svg(url).then(function(xml) {
        var svg = xml.getElementsByTagName("svg")[0]
        svg.setAttribute("x", x)
        svg.setAttribute("y", y)
        svg.setAttribute("width", width)
        svg.setAttribute("height", height)
        var paths = xml.getElementsByTagName("path")
        for (i = 0; i < paths.length; i++) {
          if ((d[1].preserveWhite) && (paths[i].getAttribute("fill") == '#fff')) {
            //paths[i].setAttribute("fill", d[1].replaceWhite)
          } else if ((d[1].iconFill) && (paths[i].getAttribute("fill") != 'none')) {
            paths[i].setAttribute("fill", d[1].iconFill)
          }
          if ((d[1].iconStroke) && (paths[i].getAttribute("stroke") != 'none')) {
            paths[i].setAttribute("stroke", d[1].iconStroke)
          }
          if ((d[1].iconStrokeWidth) && (paths[i].getAttribute("stroke-width"))) {
            paths[i].setAttribute("stroke-width", d[1].iconStrokeWidth)
          }
        }
        cell.insertBefore(xml.documentElement.cloneNode(true), cellText);
      })
    })

    function handleMouseOver(d, i) {
      if ((i[1].metadata) && (i[1].metadata.url)) {
        var url = i[1].metadata.url
        var replacements = url.match(/{{\s*[\w\.]+\s*}}/g)
        if (replacements) {
          replacements.forEach(function(replacement){
            var inner = replacement.match(/[\w\.]+/)[0]
            if (inner == 'key') {
              url = url.replace(replacement, i[0])
            } else {
              url = url.replace(replacement, i[1][inner])
            }
          })
        }
        d3.json(url, function (error, json) {
          if (error) {
            var metadata = Object.assign({}, i[1].metadata);
            delete metadata.url
            if (i[1].metadata.errorText) {
              metadata.note = i[1].metadata.errorText
              delete metadata.errorText
            } else {
              metadata.status = "HTTP:" + error.target.status
              metadata.statusText = error.target.statusText
            }
            mouseOver(d,i,metadata)
            return
          } else {
            var metadata = Object.assign({},json, i[1].metadata);
            delete metadata.url
            delete metadata.errorText
            mouseOver(d,i,metadata)
            return
          }
        });
      } else if (i[1].metadata) {
        mouseOver(d,i,i[1].metadata)
      }
    }

    function mouseOver(d,i,json) {
      var metadata = json
      if (metadata) {
        var length = Object.keys(metadata).length
        var jc = "flex-start"
        var meta = svg
          .append("foreignObject")
          .attr("id", "t" + i[1].x + "-" + i[1].y + "-" + i)
          .attr("class", "mouseOver")
          .attr("x", function() {
            if ((i[1].x2 + i[1].width * 2) < diagram.width) {
              return i[1].x2
            } else {
              jc = "flex-end"
              return i[1].x1 - (i[1].width * 3)
            }
            return i[1].x2; })
          .attr("y", function() { return i[1].centerY - (length * i[1].fontSize) })
          .append("xhtml:div")
          .attr("class", "metadata")
          .style("width", function() { return i[1].width * 3 + "px" })
          .style("height", function() { return length * i[1].fontSize })
          .style("justify-content", jc)
          .style("font-size", function() { return i[1].fontSize + "px"; })
          .html(function() {
            var text = "<table>"
            for (key in metadata) {
              text += ("<tr><td>" + key + ":&nbsp</td><td>" + metadata[key] + "</td></tr>")
            }
            text += "</table>"
            return text;
          })
      }
    }
    function handleMouseOut(d, i) {
      svg.selectAll(".mouseOver")
        .remove()
    }
}
