const API_URL = 'https://rahatchd.github.io/akara-demo/data/exercises.json';

export class Store {
  static formatData(datum) {
    const { name, reps } = datum;
    const timeBetweenReps = (reps[reps.length -1] - reps[0]) / 30;
    const tut = (datum['num_frames'] / 30).toFixed(1);
    const tpr = (timeBetweenReps / reps.length).toFixed(1);
    const cal = (0.056 * datum['num_frames']).toFixed(1)
    const time = new Date(datum['start_time']);
    const { motion } = datum;
    const { skel } = datum;
    return { name, reps, tut, tpr, cal, time, motion, frames: skel };
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
  }

  onNotification = (data) => {
    console.log('New exercise', data);
    window.siiimpleToast.message('🏋️ New exercise added ! Refreshing ... 🏋️‍♀️', {
      position: 'top|center',
      margin: 15,
      delay: 0,
      duration: 3000
    });
    this.getData();
  }

  onStream = (data) => {
    console.log('livestream', data);
  }

  onDisconnect = () => {
    console.log('disconnected');
  }

  getData = () => {
    this.tableData = [];
    this.graphData = [];
    this.skelData = [];
    fetch(API_URL)
      .then((response) => {
        return response.json();
      })
      .then ((data) => {
        this.onFetch(data.map(datum => Store.formatData(datum)));
      })
      .catch((err) => {
        console.error(err);
      });

  }
}
