<template>
  <div id="treeVisualization">
    <svg>
      <g id="zoomContainer">
      </g>
    </svg>
  </div>
</template>

<script>
import axios from 'axios'
import Component from 'vue-class-component';
import {select, forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, zoom,zoomIdentity, event} from 'd3';

@Component
class TreeVisualization {
  data() {
    return {
      nodes: [],
      links: []
    }
  }

  async created() {
    const linkForce = forceLink()
      .id(d => d.id)
      .distance(300);

    this.simulation = forceSimulation()
      // .alphaTarget(.5)
      .force("link", linkForce)
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(500, 1000))
      .force('collide', forceCollide(80));


    // get the latest family tree data from the server
    let dataLocation = 'http://' + window.location.hostname;
    if(window.location.hostname == 'localhost') {
      dataLocation += ':8080'
    }
    dataLocation += '/agent/metadata'
    const {data} = await axios.get(dataLocation);
    
    // parse the data to update nodes/links in the graph
    this.nodes = data.result
    this.nodes.forEach(node => {
      node.x = 0;
      node.y = 0;
    })
    const topLevelNodes = new Set(this.nodes.map(x => x.id))
    
    const links = []
    data.result.forEach(node => {
      node.children.forEach(child => {
        topLevelNodes.delete(child)
        links.push({source: node.id, target:child})
      })
    })
    this.links = links;
      
    // tie together top level nodes so they don't drift too far apart
    const rootNode = {name: 'root', id: 'root', fx: 0, fy:0}
    this.nodes.push(rootNode);
    topLevelNodes.forEach(nodeId => {
      this.links.push({source: 'root', target: nodeId})
    })


    // update simulation
    this.simulation.nodes(this.nodes)
    // adding links to the simulations triggers d3 modifying the links definitions
    // d3 resolved the .source and .target fields to have the values of the node objects
    // they point to
    this.simulation.force("link")
      .links(this.links);
  }

  mounted() {
    const svg = select('#treeVisualization')
    const zoomContainer = svg.select('#zoomContainer')

    this.simulation
      .on("tick", () => {
        zoomContainer
          .selectAll('line')
          .data(this.links)
          .join('line')
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)
          .attr('stroke', 'yellow')

        const nodes = zoomContainer
          .selectAll('g.node')
          .data(this.nodes, d => d.id)
          .attr('transform', (d) => `translate(${d.x},${d.y})`);

        nodes.exit().remove()

        const nodesGraphic = nodes
          .enter()
          .append('g')
          .attr('class', 'node')
          
        nodesGraphic
          .append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 60)
          .attr('stroke', 'green')

        nodesGraphic
          .append('foreignObject')
          .attr('class', 'agentData')
          .attr('x', -60)
          .attr('y', -60)
          .append('xhtml:p')
          .html(d => d.name)

      });
    // svg.call(zoom.transform, zoomIdentity.translate(0, 0).scale(.5));
    console.log(zoom.transform)
    let svgZoom = zoom()
      .on('zoom', d => {
        zoomContainer.attr('transform', event.transform);
      });
    svg.call(svgZoom);
  }
}

export default TreeVisualization
</script>

<style lang="scss">
  #treeVisualization {
    background: black;
    color: white;
    font-family: sans-serif;

    svg {
      width: 100%;
      height: 100%;

      #zoomContainer rect {
        width: 100vw;
        height: 100vh;
      }

      .agentData {
        width: 120px;
        height: 120px;

        p {
          margin: 0;
          padding: 0 10px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          word-break: break-word;
        }
      }
    }
  }
</style>
