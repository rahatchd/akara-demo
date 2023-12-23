import { EXERCISE_NAMES } from "../constants/EXERCISE.js";
import { FPS } from "../constants/GLOBAL.js";

export class Graph {
  static Trace(x, y) {
    return [{ x, y: 0 }, { x, y }];
  }

  constructor(onScrub, onToggle) {
    this.onScrub = onScrub;
    this.onToggle = onToggle;
    this.dom = document.getElementById('chart');

    this.annotations = [];
    const fontSize = 36;
    this.annotations.push({
      id: "exLabel",
      type: 'line',
      mode: 'horizontal',
      scaleID: 'y-axis-0',
      value: 85,
      borderColor: "#00000000",
      borderWidth: 0.001,
      label: {
        yAdjust: -fontSize / 2,
        fontSize: fontSize,
        fontColor: "#ffffff",
        backgroundColor: '#00000000',
        content: '',
        enabled: true
      }
    });

    Chart.pluginService.register({
      afterUpdate: function (chart) {
        if (typeof chart.idNum !== 'undefined' && chart.idNum !== -1) {
          if (chart.is_playing) {
            chart.config.data.datasets[0]._meta[0].data[0]._model.pointStyle = chart.pauseButton;
          } else {
            chart.config.data.datasets[0]._meta[0].data[0]._model.pointStyle = chart.playButton;
          }
        }
      }
    });

    this.layout = {
      title: 'Motion',
      showlegend: false,
      autosize: true,
    };
    this.config = {
      responsive: true
    };

    this.chart = new Chart(document.getElementById('chart').getContext('2d'), {
      type: 'line',
      data: {
        datasets: [
          {
            data: [],
            showLine: false,
            fill: false,
            pointRadius: 0.01,
            lineTension: 0,
          },
          {
            data: [],
            showLine: false,
            fill: false,
            borderWidth: 4,
            borderColor: "#ffffff",
            borderJointStyle: "bevel",
            pointRadius: 5,
            pointBackgroundColor: "#ffffff",
            lineTension: 0,
          },
          {
            data: [],
            showLine: true,
            fill: false,
            borderWidth: 3,
            borderColor: "#ffffff",
            borderJointStyle: "round",
            pointRadius: 0,
          },
          {
            data: [],
            showLine: true,
            fill: false,
            borderWidth: 2,
            borderColor: "#ffffff",
            spanGaps: false,
            borderJointStyle: "bevel",
            pointRadius: 0,
            lineTension: 0,
          },
          {
            data: [],
            showLine: true,
            fill: 'start',
            backgroundColor: "#7c8392",
            pointRadius: 0,
            borderWidth: 0.01,
            lineTension: 0,
          },
          {
            data: [{ x: 0, y: 0 }, { x: 900, y: 0 }],
            showLine: true,
            fill: false,
            borderWidth: 1,
            borderColor: "#ffffff",
            borderJointStyle: "round",
            pointRadius: 0,
            lineTension: 0,
          },
        ]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'linear',
            display: false,
            ticks: {
              min: 0,
              max: 900,
            },
          }],
          yAxes: [{
            type: 'linear',
            display: false,
            ticks: {
              min: -128,
              max: 128,
            },
          }]
        },
        legend: {
          display: false
        },
        annotation: {
          annotations: this.annotations,
        },
        tooltips: { enabled: false },
      }
    });
    this.chart.mouseResponsive = false;
    this.chart.is_playing = true;

    this.chart.idNum = -1;
    this.chart.savedData = [];
    this.chart.liveData = [];

    this.chart.playButton = new Image();
    this.chart.pauseButton = new Image();
    this.chart.playButton.src = "./playButton_L.svg";
    this.chart.pauseButton.src = "./pauseButton_L.svg";

    this.dom.addEventListener('mousedown', this.startScrub, false);
    this.dom.addEventListener('mousemove', this.move, false);
    this.dom.addEventListener('mouseup', this.release, false);
    this.dom.addEventListener('mouseout', this.release, false);
    this.dom.addEventListener('touchstart', this.startScrub, false);
    this.dom.addEventListener('touchmove', this.move, false);
    this.dom.addEventListener('touchend', this.release, false);
    this.dom.addEventListener('touchcancel', this.release, false);
  }

  static createBackground(data) {
    let bg_data = [];
    for (let i = 0; i < data.exercises.length; i += 1) {
      bg_data.push({ x: data.exercises[i].start_frame, y: -128 });
      bg_data.push({ x: data.exercises[i].start_frame, y: 128 });
      bg_data.push({ x: data.exercises[i].end_frame, y: 128 });
      bg_data.push({ x: data.exercises[i].end_frame, y: -128 });
    }
    return bg_data;
  }

  static getLineData(data) {
    const lineData = new Array(data.length);
    for (let i = 0; i < data.length; i += 1) {
      lineData[i] = { x: i, y: data[i] };
    }
    return lineData;
  }

  static getTickData(data, mode) {
    const tickPos = [];
    let liveDate = 0;
    if (mode === 'live') {
      liveDate = (Date.parse(data.live_time) % 1000) / 1000;
    } else {
      liveDate = ((Date.parse(data.time) + data.motion.length * FPS) % 1000) / 1000;
    }
    for (let i = FPS * (1 - liveDate); i <= data.motion.length; i += FPS) {
      tickPos.push({ x: i, y: -128 });
      tickPos.push({ x: i, y: -112 });
      tickPos.push({ x: NaN, y: NaN });
    }
    return tickPos;
  }

  static getCoordinates(chartArea, value, domain, range) {
    const xpos = value[0] - chartArea.left;
    const ypos = value[1] - chartArea.top;
    const frame = Math.round(
      (xpos / (chartArea.right - chartArea.left)) * (domain[1] - domain[0]) + domain[0],
    );
    const y = Math.round((ypos / (chartArea.bottom - chartArea.top)) * (range[0] - range[1]) - range[0]);
    return [frame, y];
  }

  startScrub = (e) => {
    if (this.chart.idNum === -1) {
      return;
    }
    const max_x = this.chart.config.options.scales.xAxes[0].ticks.max;
    let click_value;
    if (e.type.includes('mouse')) {
      click_value = [e.layerX, e.layerY];
    } else if (e.type.includes('touch')) {
      e.preventDefault();
      e.stopPropagation();
      click_value = [e.touches[0].pageX - e.target.offsetLeft - e.target.offsetParent.offsetLeft, e.touches[0].pageY - e.target.offsetTop - e.target.offsetParent.offsetTop];
    }
    const coords = Graph.getCoordinates(
      this.chart.chartArea,
      click_value,
      [0, max_x],
      [-128, 128],
    );
    if (
      Math.abs(coords[0] - max_x / 2) < 18 &&
      Math.abs(coords[1] + 80) < 36
    ) {
      this.chart.is_playing = !this.chart.is_playing;
      this.onToggle(!this.chart.is_playing);
    } else {
      if (e.type.includes('mouse')) {
        this.chart.mouseResponsive = true;
      }
      this.chart.is_playing = false;
      this.onToggle(true);
      this.move(e);
    }
  };

  move = (e) => {
    if (this.chart.idNum === -1) {
      return;
    }
    if (this.chart.is_playing) return;
    const max_x = this.chart.config.options.scales.xAxes[0].ticks.max;
    let click_value = [];
    if (e.type.includes('mouse')) {
      if (!this.chart.mouseResponsive) {
        return;
      }
      click_value = [e.layerX, e.layerY];
    } else if (e.type.includes('touch')) {
      e.preventDefault();
      e.stopPropagation();
      click_value = [e.touches[0].pageX - e.target.offsetLeft - e.target.offsetParent.offsetLeft, e.touches[0].pageY - e.target.offsetTop - e.target.offsetParent.offsetTop];
    }
    const coords = Graph.getCoordinates(
      this.chart.chartArea,
      click_value,
      [0, max_x],
      [-128, 128],
    );
    this.onScrub(coords[0]);
  };

  release = (e) => {
    if (this.chart.idNum === -1) {
      return;
    }
    if (e.type.includes('touch')) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.chart.mouseResponsive = false;
  };

  updateExerciseLabels() {
    if (this.chart.idNum === -1) {
      if (this.chart.liveData.exercises.length >= 1) {
        const exercise = this.chart.liveData.exercises[this.chart.liveData.exercises.length - 1];
        const content = `${exercise.name} - ${exercise.reps.length} Reps`;
        this.chart.annotation.elements["exLabel"].options.label.content = content;
        this.chart.annotation.elements["exLabel"].options.label.xAdjust = Math.min(
          (Math.max(exercise.start_frame, 0) / this.chart.liveData.motion.length - 0.49) * (this.chart.chartArea.right - this.chart.chartArea.left) + this.dom.getContext('2d').measureText(content).width / 2,
          0.5 * (this.chart.chartArea.right - this.chart.chartArea.left) - this.dom.getContext('2d').measureText(content).width / 2
        );
      } else {
        this.chart.annotation.elements["exLabel"].options.label.content = '';
      }
    } else {
      const data = this.chart.savedData[this.chart.idNum];
      const content = `${data.name} - 0 of ${data.reps.length} Reps`;
      this.chart.annotation.elements["exLabel"].options.label.content = content;
      this.chart.annotation.elements["exLabel"].options.label.xAdjust = -0.49 * (this.chart.chartArea.right - this.chart.chartArea.left) + this.dom.getContext('2d').measureText(content).width / 2;
    }
  }

  updateLive(data) {
    for (let i = 0; i < data.exercises.length; i += 1) {
      const { name } = data.exercises[i];
      data.exercises[i].name = name in EXERCISE_NAMES ? EXERCISE_NAMES[name] : name;
    }
    this.chart.liveData = data;
    if (this.chart.idNum === -1) {
      // Perform live chart update
      this.chart.data.datasets[2].data = Graph.getLineData(this.chart.liveData.motion);
      this.chart.data.datasets[3].data = Graph.getTickData(this.chart.liveData, 'live');
      this.chart.data.datasets[4].data = Graph.createBackground(this.chart.liveData);
      this.updateExerciseLabels();
      this.chart.update(0);
    }
  }

  updateSaved(data) {
    this.chart.savedData = data;
    if (this.chart.idNum !== -1) {
      this.select(this.chart.idNum);
    }
  }

  select(id) {
    this.chart.idNum = id;
    this.chart.is_playing = true;
    this.onToggle(false);
    if ((this.chart.savedData.length > 0) && (id >= 0)) {
      // Perform saved chart initialization
      this.chart.config.options.scales.xAxes[0].ticks.max = this.chart.savedData[id].motion.length;
      this.chart.data.datasets[0].data = [{ x: this.chart.savedData[id].motion.length / 2, y: -80 }];
      this.chart.data.datasets[1].showLine = true;
      this.chart.data.datasets[1].pointRadius = 5;
      this.chart.data.datasets[2].data = Graph.getLineData(this.chart.savedData[id].motion);
      this.chart.data.datasets[3].data = Graph.getTickData(this.chart.savedData[id], 'saved');
      this.chart.data.datasets[4].data = [];
      this.chart.data.datasets[5].showLine = true;
      this.updateExerciseLabels();
      this.chart.update(100);
    } else {
      // Perform live chart initialization
      this.chart.config.options.scales.xAxes[0].ticks.max = this.chart.liveData.motion.length;
      this.chart.data.datasets[0].data = [];
      this.chart.data.datasets[1].showLine = false;
      this.chart.data.datasets[1].pointRadius = 0;
      this.chart.data.datasets[2].data = Graph.getLineData(this.chart.liveData.motion);
      this.chart.data.datasets[3].data = Graph.getTickData(this.chart.liveData, 'live');
      this.chart.data.datasets[4].data = Graph.createBackground(this.chart.liveData);
      this.chart.data.datasets[5].showLine = false;
      this.updateExerciseLabels();
      this.chart.update(100);
    }
  }

  updateFrame(frame_num) {
    if (this.chart.idNum >= 0 && this.chart.savedData.length > 0) {
      const { motion } = this.chart.savedData[this.chart.idNum];
      this.chart.data.datasets[1].data = Graph.Trace(frame_num, motion[frame_num]);
      const data = this.chart.savedData[this.chart.idNum];
      const completed = data.reps.filter(r => r <= frame_num).length;
      const content = `${data.name} - ${completed} of ${data.reps.length} Reps`;
      this.chart.annotation.elements["exLabel"].options.label.content = content;
      this.chart.annotation.elements["exLabel"].options.label.xAdjust = -0.49 * (this.chart.chartArea.right - this.chart.chartArea.left) + this.dom.getContext('2d').measureText(content).width / 2;
      this.chart.update(100);
    }
  }
}
