import { EXERCISE_NAMES } from "./constants/EXERCISE.js";
import { FPS } from "./constants/GLOBAL.js";

const API_URL = 'https://rahatchd.github.io/akara-demo/data/exercises.json';

export class Store {
  static formatData(datum) {
    const { name, reps } = datum;
    const formatted_name = name in EXERCISE_NAMES ? EXERCISE_NAMES[name] : name;
    const tut = (datum['num_frames'] / FPS).toFixed(1);
    let tpr;
    if (reps.length > 1) {
      const timeBetweenReps = (reps[reps.length - 1] - reps[0]) / FPS;
      tpr = (timeBetweenReps / (reps.length - 1)).toFixed(1);
    } else {
      tpr = tut;
    }
    const cal = (0.028 * datum['num_frames'] + 0.4 * reps.length).toFixed(1);
    const time = new Date(datum['start_time']);
    const { motion } = datum;
    const { skel } = datum;

    return { name: formatted_name, reps, tut, tpr, cal, time, motion, frames: skel };
  }

  constructor(onFetch = data => console.log(data)) {
    this.exercises = [];
    // const socket = io(WS_URL);
    // socket.on('connect', this.onConnect);
    // socket.on('notification', this.onNotification);
    // socket.on('stream', this.onStream)
    // socket.on('disconnect', this.onDisconnect);
    // this.socket = socket;
    this.onFetch = onFetch;
  }

  onConnect = () => {
    console.log('connected');
  };

  onNotification = (data) => {
    console.log('New exercise', data);
    window.siiimpleToast.message('🏋️ New exercise added ! Refreshing ... 🏋️‍', {
      position: 'top|center',
      margin: 15,
      delay: 0,
      duration: 3000
    });
    this.getData();
  };

  onStream = (data) => {
    console.log('livestream', data);
  };

  onDisconnect = () => {
    console.log('disconnected');
  };

  getData = () => {
    fetch(API_URL)
      .then((response) => {
        return response.json();
      })
      .then ((data) => {
        this.onFetch(data.map(datum => Store.formatData(datum)));
      })
      .catch((err) => {
        console.log(err);
      });

  }
}
