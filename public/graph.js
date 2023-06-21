function renderGraph(dataset) {
  // Set the dimensions and margins of the graph
  var margin = { top: 70, right: 0, bottom: 30, left: 0 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a group for zooming and panning
  const zoomGroup = svg.append("g");

  // Create zoom behavior
  const zoom = d3
    .zoom()
    .scaleExtent([0.1, 10]) // Set the zoom scale range
    .on("zoom", zoomed);

  // Define zoom function
  function zoomed(event) {
    // Get the current zoom transform
    const { transform } = event;

    // Apply the zoom transform to the zoomGroup
    zoomGroup.attr("transform", transform);
  }

  // Apply zoom behavior to the SVG
  svg.call(zoom);

  // Define reset view function
  function resetView() {
    // Reset the zoom transform to the default state
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  }

  // Reset view button event handler
  d3.select("#reset-button").on("click", resetView);

  // Graph layout using force-directed graph
  const simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "x",
      d3
        .forceX()
        .x(width / 2)
        .strength(0.1)
    )
    .force(
      "y",
      d3
        .forceY()
        .y(height / 2)
        .strength(0.1)
    )
    .force("collide", d3.forceCollide().radius(100).strength(0.1));

  // Create links and nodes from the dataset
  const nodes = dataset.map((game, index) => ({
    id: index,
    title: game.title,
    degree: 0, // Initialize degree to 0
    rank: game.pagerank,
    links: [],
    selected: false, // Initial selection state
  }));

  // Create links based on fans_liked array and id
  const links = [];
  dataset.forEach((game, index) => {
    game.recommendations.fans_liked.forEach((recommendation) => {
      const targetIndex = dataset.findIndex(
        (item) => item.id === recommendation
      );
      if (targetIndex !== -1) {
        links.push({ source: index, target: targetIndex });
        // Add idx to links
        nodes[index].links.push(targetIndex);

        // Increment the degree of source and target nodes
        nodes[index].degree++;
        nodes[targetIndex].degree++;
      }
    });
  });

  // Define the node size scale based on degree
  const nodeSizeScale = d3
    .scaleLinear()
    .domain(d3.extent(nodes, (d) => d.rank))
    .range([
      d3.min(nodes.map((n) => n.rank)),
      d3.max(nodes.map((n) => n.rank)),
    ]); // Adjust the range as desired for minimum and maximum node sizes

  // Create graph elements
  const link = zoomGroup
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
    .attr("marker-end", "url(#arrowhead)");

  const node = zoomGroup
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", (d) => nodeSizeScale(d.degree))
    .call(
      d3
        .drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    )
    .on("click", clicked);

  const label = zoomGroup
    .selectAll(".label")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .text((d) => d.title)
    .attr("font-size", 10)
    .attr("text-anchor", "middle")
    .attr("dy", function (d) {
      return -d.degree;
    });

  // Define drag functions
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function clicked(event, d) {
    if (d.selected) {
      // Unselect the node
      d.selected = false;
      resetSelection();
    } else {
      // Dim all nodes and links
      nodes.forEach((node) => (node.selected = false));
      link.attr("opacity", 0.1);
      node.attr("opacity", 0.1);
      label.attr("opacity", 0.1);

      // Highlight selected node and its links
      d.selected = true;
      d3.select(this).attr("opacity", 1);
      link
        .filter((linkData) => linkData.source === d || linkData.target === d)
        .attr("opacity", 1);

      node
        .filter((nodeData) => {
          return d.links.includes(nodeData.id) || nodeData.links.includes(d.id);
        })
        .attr("opacity", 1);

      label
        .filter((nodeData) => {
          console.log(nodeData);
          return (
            d.links.includes(nodeData.id) ||
            nodeData.links.includes(d.id) ||
            nodeData.id == d.id
          );
        })
        .attr("opacity", 1);
    }
    event.stopPropagation(); // Prevent click event from propagating to the SVG
  }

  function resetSelection() {
    // Restore opacity for all nodes and links
    node.attr("opacity", 1);
    link.attr("opacity", 1);
    label.attr("opacity", 1);
  }

  // Update simulation on each tick
  simulation.nodes(nodes).on("tick", () => {
    link.attr("d", linkArc);
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    label.attr("x", (d) => d.x).attr("y", (d) => d.y - 10);
  });

  simulation.force("link").links(links);

  // Calculate the path for curved edges
  function linkArc(d) {
    const dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
    return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
  }
}
