import { MAX_SKELS } from './constants/SKEL.js';
import { Store } from './Store.js';
import { Graph } from './dash/Graph.js';
import { Table } from './dash/Table.js';
import { Canvas } from './three/Canvas.js';
import {
  WIDTH,
  HEIGHT,
  DEPTH,
  LIVE_CAMERA_POSITION,
  LIVE_SKEL_POSITION,
  LIVE_SPOTLIGHT_POSITION,
  SAVED_CAMERA_OFFSET,
  SAVED_SKEL_DY,
  SAVED_SKEL_OFFSET,
  SAVED_SKEL_POSITION,
  SAVED_SKEL_SCALE,
  SAVED_SPOTLIGHT_OFFSET
} from './constants/CANVAS.js';
import { Spotlight, Moonlight } from './three/Lights.js';
import { Camera } from './three/Camera.js';
import { Skel } from './three/Skel.js';
import { State } from './State.js';
import { sampleLiveData } from "./dash/sampleLiveData.js";
import { FPS, MAX_EMAIL } from "./constants/GLOBAL.js";
import { Interact } from "./three/Interact.js";

const state = new State();

function setRotation(rotation) {
  // Setting state.rotation serves no purpose right now
  state.rotate(rotation);
  liveSkel.rotate(state.rotation);
  for (let i = 0; i < MAX_SKELS; i += 1) {
    exerciseSkels[i].rotate(state.rotation);
  }
}

function tapSkeleton(id) {
  if (state.selectedId === -1) {
    onSelect(id);
  }
}

const skelElem = document.getElementById('webGLcanvas');
const canvas = new Canvas(skelElem);
const { scene, renderer } = canvas;

const { spotlight } = new Spotlight();
scene.add(spotlight);
const { moonlight } = new Moonlight();
scene.add(moonlight);

const { camera } = new Camera(skelElem);
let desiredCamera = LIVE_CAMERA_POSITION.clone();
let desiredSpotlight = LIVE_SPOTLIGHT_POSITION.clone();

new Interact(skelElem, setRotation, tapSkeleton, camera, scene);

function handleResize() {
  const { clientWidth, clientHeight } = document.getElementById('webGLcanvas');
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(clientWidth, clientHeight);
}

window.addEventListener('resize', handleResize, false);

const liveSkel = new Skel(LIVE_SKEL_POSITION);
scene.add(liveSkel.object3d);
let exerciseSkels = [];
for (let i = 0; i < MAX_SKELS; i += 1) {
  const dy = SAVED_SKEL_DY * i;
  const x = SAVED_SKEL_POSITION.x;
  const y = SAVED_SKEL_POSITION.y - (dy + SAVED_SKEL_OFFSET);
  const z = SAVED_SKEL_POSITION.z;
  const exerciseSkel = new Skel(new THREE.Vector3(x, y, z));
  exerciseSkel.object3d.scale.set(SAVED_SKEL_SCALE, SAVED_SKEL_SCALE, SAVED_SKEL_SCALE);
  exerciseSkels.push(exerciseSkel);
  scene.add(exerciseSkel.object3d);
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
    for (let j = 0; j < frames.length; j += 1) {
      frames[j] = Skel.normalize(frames[j]);
    }
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
  graph.updateSaved(graphData);
  console.log('exercises loaded');
}

function onSelect(id) {
  const liveButton = document.getElementById('live-button');
  if (id === -1) {
    desiredCamera = LIVE_CAMERA_POSITION.clone();
    desiredSpotlight = LIVE_SPOTLIGHT_POSITION.clone();
    document.getElementById('motion').innerText = "Live Activity";
    liveButton.disabled = true;
  } else {
    const selected = exerciseSkels[id % MAX_SKELS];
    const { position } = selected.object3d;
    const { x, y, z } = position;
    desiredCamera = new THREE.Vector3(x + SAVED_CAMERA_OFFSET.x, y + SAVED_CAMERA_OFFSET.y, z + SAVED_CAMERA_OFFSET.z);
    desiredSpotlight = new THREE.Vector3(x + SAVED_SPOTLIGHT_OFFSET.x, y + SAVED_SPOTLIGHT_OFFSET.y, z + SAVED_SPOTLIGHT_OFFSET.z);
    document.getElementById('motion').innerText = "Exercise Replay";
    liveButton.disabled = false;
  }
  state.select(id);
  graph.select(id);
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
    } else {
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

function onToggle(play_state) {
  state.toggle(play_state);
}

const store = new Store(onFetch);
const graph = new Graph(onScrub, onToggle);
graph.updateLive(sampleLiveData);
graph.select(-1);
const table = new Table(document.getElementById('exercises'), onSelect, onPaginate);

const liveButton = document.getElementById('live-button');
liveButton.disabled = true;
liveButton.onclick = () => {
  onSelect(-1);
};

if (!!window.EventSource) {
  let source = new EventSource('/');
  source.onmessage = function (msg) {
    let liveData = JSON.parse(msg.data);
    if (liveData.skel.length === 0) {
      // Do nothing (This happens a lot by the way)
    } else {
      liveData.skel = Skel.normalize(liveData.skel);
      graph.updateLive(liveData);
      liveSkel.updateFrame(liveData.skel);
    }
  };
}

const emailButton = document.getElementById('email-button');
const emailModal = new tingle.modal({
  closeMethods: ['escape', 'button']
});
emailModal.setContent(document.getElementById('email-modal').innerHTML);
const emailTbody = document.getElementById('selection-tbody');
emailButton.onclick = () => {
  while (emailTbody.firstChild) {
    emailTbody.removeChild(emailTbody.firstChild)
  }
  Table.FormatTable(tableData).slice(0, MAX_EMAIL)
    .forEach((exercise, index) => {
      const row = document.createElement('tr');
      const checkbox = document.createElement('input');
      checkbox.className = 'regular-checkbox';
      checkbox.id = `ch-${index}`;
      checkbox.type = 'checkbox';
      const checkboxLabel = document.createElement('label');
      checkboxLabel.htmlFor = `ch-${index}`;
      row.appendChild(checkbox);
      row.appendChild(checkboxLabel);

      const fields = Object.keys(exercise);
      fields.forEach(field => {
        const td = document.createElement('td');
        td.innerHTML = exercise[field];
        row.appendChild(td);
        td.setAttribute('width', Table.cellwidth[field]);
      });

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
    document.getElementById('to-email').value = '';
    const firstName = document.getElementById('first-name').value;
    document.getElementById('first-name').value = '';
    const lastName = document.getElementById('last-name').value;
    document.getElementById('last-name').value = '';
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(toEmail)) {
      let request = new XMLHttpRequest();
      request.onload = function () {
        // We could do more interesting things with the response
        // or, we could ignore it entirely
        console.log(request.responseText);
      };
      // We point the request at the appropriate command
      request.open("POST", "/", true);
      // We attach a payload
      let payload = { email: toEmail, firstName: firstName, lastName: lastName, exercises: selection };

      // and then we send it off
      request.send(JSON.stringify(payload));

      emailModal.close();
    }
  };
  emailModal.open();
}
  ;

//const stats = new Stats();
//stats.showPanel(0);
//stats.dom.style.position = 'relative';
//document.getElementById('debug').appendChild(stats.dom);

function panCamera() {
  const cameraMovement = new THREE.Vector3().subVectors(desiredCamera, camera.position);
  if (cameraMovement.length() >= 1) {
    camera.position.copy(new THREE.Vector3().addVectors(camera.position, cameraMovement.multiplyScalar(1 / 10)));
  }
  const spotlightMovement = new THREE.Vector3().subVectors(desiredSpotlight, spotlight.position);
  if (spotlightMovement.length() >= 1) {
    spotlight.position.copy(new THREE.Vector3().addVectors(spotlight.position, spotlightMovement.multiplyScalar(1 / 10)));
  }
}

let time = performance.now();
let period = 0;
let delta = 0;
animate();

store.getData();

function animate() {
  //stats.begin();

  period = (performance.now() - time) / 1000.0;
  delta = Math.round(FPS * period);
  state.update(delta);

  if (delta > 0) {
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
  }

  requestAnimationFrame(animate);
  panCamera();
  renderer.render(scene, camera);
  time += delta * 1000 / FPS;

  //stats.end();
}
