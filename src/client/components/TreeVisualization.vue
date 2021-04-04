<template>
  <div id="treeVisualization" ref="treeVisualization">
    <div id="guide">
      Guide:

      <p>Click and drag to move around the tree.</p>
      <p>Zoom in and out to focus on certain aspects.</p>
    </div>

    <svg>
      <g id="zoomContainer">
        <g id="linksG" />
        <line class="stem" stroke="yellow" x1="0" y1="2" x2="0" y2="-300" stroke-width="10" />
        <g id="nodesG" />
      </g>
    </svg>
  </div>
</template>

<script>
import axios from 'axios';
import Component from 'vue-class-component';
import {
  select, forceSimulation, forceLink, forceManyBody, forceY, forceCollide, zoom, zoomIdentity, event,
} from 'd3';
import { AgentModel, SMALLNESS_MULTIPLIER } from '@/models/AgentModel';
import AgentStore from '@/stores/AgentStore';

const BASE_NODE_RADIUS = 120;

@Component
class TreeVisualization {
  data() {
    return {
      nodes: [],
      links: [],
    };
  }

  async created() {
    this.simulation = forceSimulation()
      //.alphaTarget(.5)
      .force('charge', forceManyBody().strength(-20))
      //.force('down', forceY(2000))
      .force('collide', forceCollide(8));


    //get the latest family tree data from the server
    let dataLocation = `http://${window.location.hostname}`;
    if(window.location.hostname == 'localhost') {
      dataLocation += ':8080';
    }
    dataLocation += '/agent/metadata';
    const { data } = await axios.get(dataLocation);

    //parse the data to update nodes/links in the graph
    this.nodes = data.result.map((x) => new AgentModel(x));
    this.nodes.forEach((node) => {
      AgentStore.objectsById[node.id] = node;
    });

    const topLevelNodes = new Set(this.nodes.map((x) => x.id));

    const links = [];
    this.nodes.forEach((node) => {
      node.children = node.children.map((x) => AgentStore.objectsById[x]);

      node.children.forEach((child) => {
        child.parent = node;
        child.depth = node.depth + 1;
        topLevelNodes.delete(child.id);
        links.push({ source: node, target: child });
      });
    });
    this.links = links;

    //tie together top level nodes so they don't drift too far apart
    const rootNode = new AgentModel({
      name: 'root', id: 'root', fx: 0, fy: 0, children: [],
    });
    this.nodes.push(rootNode);
    topLevelNodes.forEach((nodeId) => {
      const node = AgentStore.objectsById[nodeId];
      rootNode.children.push(node);
      this.links.push({ source: rootNode, target: node });
      node.parent = rootNode;
    });


    rootNode.recomputePositions();


    //update simulation
    //this.simulation.nodes(this.nodes);
  }

  mounted() {
    const svg = select('#treeVisualization');
    const zoomContainer = svg.select('#zoomContainer');

    this.simulation
      .on('tick', () => {
        zoomContainer
          .select('#linksG')
          .selectAll('line.link')
          .data(this.links)
          .join('line')
          .attr('class', 'link')
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)
          .attr('stroke', 'yellow')
          .attr('stroke-width', (d) => 5 * (SMALLNESS_MULTIPLIER ** d.source.depth));

        const nodes = zoomContainer
          .select('#nodesG')
          .selectAll('g.node')
          .data(this.nodes, (d) => d.id)
          .attr('transform', (d) => `translate(${d.x},${d.y})`)
          .style('opacity', (d) => (d.id == 'root' ? 0 : null));

        nodes.exit().remove();

        const nodesGraphic = nodes
          .enter()
          .append('g')
          .attr('class', 'node');

        nodesGraphic
          .append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', (d) => BASE_NODE_RADIUS * (SMALLNESS_MULTIPLIER ** d.depth))
          .attr('stroke', 'green')
          .attr('stroke-width', (d) => 5 * (SMALLNESS_MULTIPLIER ** d.depth));

        nodesGraphic
          .append('foreignObject')
          .style('width', (d) => BASE_NODE_RADIUS * 2 * (SMALLNESS_MULTIPLIER ** d.depth))
          .style('height', (d) => BASE_NODE_RADIUS * 2 * (SMALLNESS_MULTIPLIER ** d.depth))
          .attr('class', 'agentData')
          .attr('x', (d) => -BASE_NODE_RADIUS * (SMALLNESS_MULTIPLIER ** d.depth))
          .attr('y', (d) => -BASE_NODE_RADIUS * (SMALLNESS_MULTIPLIER ** d.depth))
          .style('font-size', (d) => (BASE_NODE_RADIUS / 4) * (SMALLNESS_MULTIPLIER ** d.depth))
          .append('xhtml:p')
          .html((d) => d.name);
      });

    const zoomObject = zoom()
      .on('zoom', (d) => {
        zoomContainer.attr('transform', event.transform);
      });

    svg.call(zoomObject);

    const centerX = this.$refs.treeVisualization.getBoundingClientRect().width / 2;
    const centerY = this.$refs.treeVisualization.getBoundingClientRect().height / 3;
    const initialZoom = zoomIdentity.translate(centerX, centerY).scale(0.5);
    svg.call(zoomObject.transform, initialZoom);
  }
}

export default TreeVisualization;
</script>

<style lang="scss">
  #treeVisualization {
    background: black;
    color: white;
    font-family: sans-serif;

    #guide {
      position: fixed;
      top: 5%;
      left: 5%;
      text-align: left;
      border: solid 2px #aaa;
      border-radius: 5px;
      padding: 10px;
    }

    svg {
      width: 100%;
      height: 100%;

      line.stem {
        z-index: 100;
      }
      line.link {
        z-index: 1;
      }

      #zoomContainer rect {
        width: 100vw;
        height: 100vh;
      }

      .agentData {
        p {
          margin: 0;
          padding: 0 10px;
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          transform: translate(-50%, -50%);
          word-break: break-word;
        }
      }
    }
  }
</style>
