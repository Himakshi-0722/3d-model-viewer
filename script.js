import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js?module";
import { GLTFLoader } from "https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js?module";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight.position.set(0,20,0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3,10,10);
scene.add(dirLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Grid helper
const gridHelper = new THREE.GridHelper(10, 20);
scene.add(gridHelper);

// Load GLB model
const loader = new GLTFLoader();

// ✅ Path to your GLB file in models folder
const modelName = "Demo_model_Rooftop.glb"; // <-- put your GLB here
loader.load(
  `./models/${modelName}`,
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(2,2,2);
    model.position.set(0,0,0);

    // Safe material replacement
    model.traverse((child)=>{
      if(child.isMesh){
        const mats = Array.isArray(child.material)? child.material : [child.material];
        mats.forEach((mat,i)=>{
          if(!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)){
            const newMat = new THREE.MeshStandardMaterial({
              color: mat.color || new THREE.Color(0xffffff),
              map: mat.map || null,
              roughness: mat.roughness!==undefined?mat.roughness:0.5,
              metalness: mat.metalness!==undefined?mat.metalness:0.5,
              transparent: true
            });
            if(Array.isArray(child.material)) child.material[i] = newMat;
            else child.material = newMat;
          }
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(model);
  },
  (xhr) => console.log((xhr.loaded/xhr.total)*100 + "% loaded"),
  (error) => console.error("GLTF Load Error:", error)
);

// Animate
function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,camera);
}
animate();

// Resize
window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
