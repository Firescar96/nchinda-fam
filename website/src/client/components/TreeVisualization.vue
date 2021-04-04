<template>
  <div id="treeVisualization" ref="treeVisualization">
    <div id="guide">
      Welcome:
      <p>Progress continues on the formation of nchinda.com, a digital representation of the Nchinda family.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Component from 'vue-class-component';
import { AgentModel, SMALLNESS_MULTIPLIER } from '@/models/AgentModel';
import * as THREE from 'three/build/three.module.js';
//GLTFLoader does not save branch rotations properly
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import AgentStore from '@/stores/AgentStore';

const BASE_NODE_RADIUS = 120;

@Component
class TreeVisualization {
  data() {
    return {
      nodes: [],
      links: [],
      renderer: null,
      this: null,
      camera: null,
      cube: null,
    };
  }

  //async created() {
  ////get the latest family tree data from the server
  //let dataLocation = `http://${window.location.hostname}`;
  //if (window.location.hostname == "localhost") {
  //dataLocation += ":8080";
  //}
  //dataLocation += "/agent/metadata";
  //const { data } = await axios.get(dataLocation);

  ////parse the data to update nodes/links in the graph
  //this.nodes = data.result.map(x => new AgentModel(x));
  //this.nodes.forEach(node => {
  //AgentStore.objectsById[node.id] = node;
  //});

  //const topLevelNodes = new Set(this.nodes.map(x => x.id));

  //const links = [];
  //this.nodes.forEach(node => {
  //node.children = node.children.map(x => AgentStore.objectsById[x]);

  //node.children.forEach(child => {
  //child.parent = node;
  //child.depth = node.depth + 1;
  //topLevelNodes.delete(child.id);
  //links.push({ source: node, target: child });
  //});
  //});
  //this.links = links;

  ////tie together top level nodes so they don't drift too far apart
  //const rootNode = new AgentModel({
  //name: "root",
  //id: "root",
  //children: []
  //});

  //this.nodes.push(rootNode);
  //topLevelNodes.forEach(nodeId => {
  //const node = AgentStore.objectsById[nodeId];
  //rootNode.children.push(node);
  //this.links.push({ source: rootNode, target: node });
  //node.parent = rootNode;
  //});

  //rootNode.recomputePositions();
  //}
  animate() {
    requestAnimationFrame(this.animate);
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }

  //mounted() {
  //this.scene = new THREE.Scene();
  //this.camera = new THREE.PerspectiveCamera(
  //75,
  //window.innerWidth / window.innerHeight,
  //0.1,
  //1000
  //);

  //this.renderer = new THREE.WebGLRenderer();
  //this.renderer.setSize(window.innerWidth, window.innerHeight);
  //this.$refs.treeVisualization.appendChild(this.renderer.domElement);

  //var geometry = new THREE.BoxGeoetry(1, 1, 1);
  //var material = new THREE.MeshBasicMaterial({ color: 0xad0202 });
  //this.cube = new THREE.Mesh(geometry, material);
  //this.scene.add(this.cube);

  //this.camera.position.z = 5;

  //this.animate();
  //}

  mounted() {
    //Set our main variables
    let scene;
    let renderer;
    let camera;
    let model; //Our character
    let mixer; //THREE.js animations mixer
    const clock = new THREE.Clock(); //Used for anims, which run to a clock instead of frame rate
    const raycaster = new THREE.Raycaster(); //Used to detect the click on our character
    let theta = 0;
    const radius = 20;

    const init = () => {
      const backgroundColor = 0x111111;

      //Init the scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);
      scene.fog = new THREE.Fog(backgroundColor, 60, 100);

      //Init the renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      //renderer.shadowMap.enabled = true;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.treeVisualization.appendChild(renderer.domElement);

      //Add a camera
      camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );

      const MODEL_PATH = 'http://localhost:8081/static/treesection-rendered.obj';

      const loader = new OBJLoader();

      loader.load(
        MODEL_PATH,
        (model) => {
          model.traverse((modelChild) => {
            if(!modelChild.isMesh) return;

            modelChild.castShadow = true;
            modelChild.receiveShadow = true;

            const barkTexture = THREE.ImageUtils.loadTexture('http://localhost:8081/static/FabricRope001_COL_2K.jpg');
            const barkDisplacement = THREE.ImageUtils.loadTexture('http://localhost:8081/static/FabricRope001_DISP_2K.jpg');

            const material = new THREE.MeshPhongMaterial({
              map: barkTexture,
              displacementMap: barkDisplacement,
              displacementScale: 0.1,
            });
            const mesh = new THREE.Mesh(modelChild.geometry, material);
            scene.add(mesh);
          });


          scene.add(model);
        },
        undefined, //We don't need this function
        (error) => {
          console.error(error);
        },
      );

      //Add lights
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
      hemiLight.position.set(0, 50, 0);
      //Add hemisphere light to scene
      scene.add(hemiLight);

      const geometry = new THREE.SphereGeometry(8, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); //0xf2ce2e
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.z = -15;
      sphere.position.y = 2.5;
      sphere.position.x = -0.25;
      scene.add(sphere);

      const d = 8.25;
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
      dirLight.position.set(-8, 12, 8);
      //dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 1500;
      dirLight.shadow.camera.left = d * -1;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = d * -1;
      //Add directional Light to scene
      scene.add(dirLight);

      //Floor
      const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
      const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x001033,
        shininess: 0,
      });

      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -0.5 * Math.PI;
      //floor.receiveShadow = true;
      floor.position.y = -10;
      scene.add(floor);
    };

    init();

    function update() {
      if(mixer) {
        mixer.update(clock.getDelta());
      }

      theta += 0.1;

      camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta));
      camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(theta));
      camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(theta));
      camera.lookAt(scene.position);

      camera.updateMatrixWorld();

      renderer.render(scene, camera);
      requestAnimationFrame(update);
    }

    update();

    window.addEventListener('click', (e) => raycast(e));
    window.addEventListener('touchend', (e) => raycast(e, true));

    function raycast(e, touch = false) {
      const mouse = {};
      if(touch) {
        mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
        mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
      } else {
        mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
        mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
      }
      //update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      //calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children, true);

      if(intersects[0]) {
        const { object } = intersects[0];

        //TODO animate
      }
    }
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
