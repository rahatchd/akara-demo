import { MAX_SKELS } from './constants/SKEL.js';
import { Store } from './Store.js';
import { Graph } from './dash/Graph.js';
import { Table } from './dash/Table.js';
import { Canvas } from './three/Canvas.js';
import {
  HEIGHT,
  WIDTH,
  DEPTH,
} from './constants/CANVAS.js';
import { Spotlight, Moonlight } from './three/lights.js';
import { Camera } from './three/Camera.js';
import { Skel } from './three/Skel.js';
import { State } from './State.js';

const MAX_EMAIL = 6;


const skelElem = document.getElementById('webGLcanvas');
const canvas = new Canvas(skelElem);
const { scene, renderer } = canvas;

const { spotlight, spotlightHelper } = new Spotlight();
scene.add(spotlight);
// scene.add(spotlightHelper);
const { moonlight } = new Moonlight();
scene.add(moonlight);

const { camera, cameraHelper } = new Camera(skelElem, spotlight, renderer);
// scene.add(cameraHelper);

function handleResize() {
  const { clientWidth, clientHeight } = document.getElementById('webGLcanvas');
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(clientWidth, clientHeight);
}
window.addEventListener('resize', handleResize, false)

const liveSkel = new Skel(- (WIDTH / 20), 0, 3000);
scene.add(liveSkel.object3d);
let exerciseSkels = [];
for (let i = 0; i < MAX_SKELS; i += 1) {
  const dy = 600 * i;
  const x = WIDTH / 5;
  const y = HEIGHT / 2 - (dy + 1800);
  const z = DEPTH - 300;
  const exerciseSkel = new Skel(x, y, z);
  exerciseSkel.object3d.scale.set(0.2, 0.2, 0.2);
  exerciseSkels.push(exerciseSkel);
  scene.add(exerciseSkel.object3d);
  const exerciseLight = new Spotlight({x, y: y + 1, z: z - 200});
  scene.add(exerciseLight.spotlight);
}

function onSelect(id) {
  if (id === -1) {
    camera.position.set(0, 0, -1);
  }
  else {
    const selected = exerciseSkels[id % MAX_SKELS];
    const { position } = selected.object3d;
    const { x, y, z } = position;
    camera.position.set(x, y, z - 400);
  }
  state.select(id);
  graph.select(id);
}

let exercises = new Array(MAX_SKELS).fill([]);
let tableData = [];
let graphData = [];
function onFetch(data) {
  const maxFrames = [];
  exercises = [];
  tableData = [];
  graphData = [];
  for (let i = 0; i < data.length; i += 1) {
    const { name, reps, tut, tpr, cal, time, motion, frames } = data[i];
    tableData.push({ time, name, reps, tut, tpr, cal });
    graphData.push({ time, name, reps, motion });
    exercises.push(frames);
    maxFrames.push(frames.length);
  }
  if (data.length < MAX_SKELS) {
    for (let i = MAX_SKELS - data.length; i > 0; i -= 1) {
      exercises.push([]);
    }
  }
  state.initialize(maxFrames);
  table.update(tableData);
  graph.update(graphData);
  onSelect(-1);
  console.log('exercises loaded');
}

function onPaginate(pagenum) {
  const a = (pagenum - 1) * MAX_SKELS;
  const b = pagenum * MAX_SKELS;
  const skelIndices = [];
  const maxFrames = [];
  for (let i = a; i < b; i += 1) {
    if (i < exercises.length) {
      skelIndices.push(i);
      maxFrames.push(exercises[i].length);
    }
    else {
      skelIndices.push(-1);
      maxFrames.push(1);
    }
  }
  state.paginate(skelIndices, maxFrames);
  if (state.selectedId >= 0) {
    let id = a + (state.selectedId % MAX_SKELS);
    if (id >= tableData.length) id = tableData.length - 1;
    onSelect(id);
  }
}

function onScrub(index) {
  state.trace(index);
}

function onRelease() {
  state.release();
}

const store = new Store(onFetch);
const state = new State();
const graph = new Graph(onScrub, onRelease);
const table = new Table(document.getElementById('exercises'), onSelect, onPaginate);

const liveButton = document.getElementById('live-button');
liveButton.onclick = () => onSelect(-1);

const emailButton = document.getElementById('email-button');
const emailModal = new tingle.modal({
  closeMethods: ['overlay', 'button', 'escape']
});
emailModal.setContent(document.getElementById('email-modal').innerHTML);
const emailTbody = document.getElementById('selection-tbody');
emailButton.onclick = () => {
  while(emailTbody.firstChild) { emailTbody.removeChild(emailTbody.firstChild) };
  Table.FormatTable(tableData).slice(0, MAX_EMAIL)
    .forEach((exercise, index) => {
      const row = document.createElement('tr');
      const checkbox = document.createElement('input');
      checkbox.id = `ch-${index}`;
      checkbox.type = 'checkbox';
      row.appendChild(checkbox);

      const fields = Object.keys(exercise);
      fields.forEach(field => {
        const td = document.createElement('td');
        td.innerHTML = exercise[field];
        row.appendChild(td);
        td.setAttribute('width', Table.cellwidth[field]);
      })

      emailTbody.appendChild(row);
    });
  const sendEmail = document.getElementById('send-email');
  sendEmail.onclick = () => {
    const selection = [];
    for (let i = 0; i < MAX_EMAIL; i += 1) {
      if (document.getElementById(`ch-${i}`).checked) {
        selection.push(tableData[i]);
      }
    }
    const toEmail = document.getElementById('to-email').value;
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(toEmail)) {
      console.log({payload: {
        email: toEmail,
        data: selection
      }});
      // call email API here
      emailModal.close();
    }
  }
  emailModal.open();
}

const stats = new Stats();
stats.showPanel(0);
stats.dom.style.position = 'relative';
document.getElementById('debug').appendChild(stats.dom);

let time = performance.now();
let period = 0;
let delta = 0;
const FPS = 30;
animate();

store.getData();

function animate() {
  stats.begin();

  period = (performance.now() - time) / 1000.0;
  delta = Math.round(FPS * period);
  state.update(delta);

  for (let i = 0; i < MAX_SKELS; i += 1) {
    const skelIndex = state.skelIndices[i];
    if (skelIndex >= 0) {
      const exercise = exercises[skelIndex];
      exerciseSkels[i].updateFrame(exercise[state.scrub[i]]);
    }
    if (i === state.selectedId) {
      graph.updateFrame(state.scrub[i]);
    }
  }
  
  requestAnimationFrame(animate);
  liveSkel.updateFrame();
  renderer.render(scene, camera);
  if (delta >= 1) {
    time = performance.now();
  }

  stats.end();
}
