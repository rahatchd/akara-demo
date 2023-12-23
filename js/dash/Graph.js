export class Graph {
  static Trace(x, y) {
    return [{ x, y: 0 }, { x, y }];
  }

  constructor(onScrub, onRelease) {
    this.dom = document.getElementById('chart');
    this.width = this.dom.width;
    this.onScrub = onScrub;
    this.onRelease = onRelease;
    this.id = -1;
    this.lock = false;
    this.index = 0;
    this.data = [];
    this.layout = {
      title: 'Motion',
      showlegend: false,
      autosize: true,
    }
    this.config = {
      responsive: true
    }
    const color = 'rgb(255, 255, 255)';
    this.chart = new Chart(this.dom.getContext('2d'), { 
      type: 'line',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6],
        datasets: [{
          label: 'curve',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(236, 239, 244, 0.5)',
          data: []
        }, {
          label: 'trace',
          backgroundColor: color,
          borderColor: color,
          data: []
        }]
      },
      options: {
        animation: { duration: 0 },
        scales: {
          yAxes: [{ ticks: { display: false } }],
          xAxes: [{ ticks: { display: false } }]
        },
        legend: { display: false }
      }
    });
    this.name = document.getElementById('name');
    this.reps = document.getElementById('reps');

    this.dom.addEventListener('mousedown', this.startScrub, false);
    this.dom.addEventListener('mousemove', this.move, false);
    this.dom.addEventListener('mouseup', this.release, false);
    this.dom.addEventListener('mouseout', this.release, false);
    this.dom.addEventListener('touchstart', this.startScrub, false);
    this.dom.addEventListener('touchmove', this.move, false);
    this.dom.addEventListener('touchend', this.release, false);
    this.dom.addEventListener('touchcancel', this.release, false);
  }

  getFrame(x) {
    const frac = x / (this.chart.chartArea.right - this.chart.chartArea.left);
    if (this.id >= 0) {
      const frame = Math.round(frac * this.data[this.id].motion.length);
      return frame;
    }
    return null;
  }

  startScrub = (e) => {
    this.lock = true;
    this.move(e);
  }

  move = (e) => {
    let index;
    if (!this.lock) return;
    if (e.type.includes('mouse')) {
      index = this.getFrame(e.offsetX);
    }
    else if (e.type.includes('touch')) {
      e.preventDefault();
      e.stopPropagation();
      index = this.getFrame(e.touches[0].pageX - this.chart.chartArea.left);
    }
    this.onScrub(index);
  }

  release = (e) => {
    this.lock = false;
    if (e.type.includes('touch')) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.onRelease();
  }

  update(data) {
    this.data = data;
  }

  select(id) {
    if (this.data.length > 0) {
      this.id = id;
      if (id >= 0) {
        const { motion, name, reps } = this.data[id];
        const labels = motion.map((m, i) => i);
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = motion;
        this.chart.update();
        this.name.innerHTML = name;
        this.reps.innerHTML = `0 / ${reps.length} reps`;
      }
      else {
        this.chart.data.datasets[0].data = [];
        this.chart.data.datasets[1].data = [];
        this.chart.update();
        this.name.innerHTML = '';
        this.reps.innerHTML = '';
      }
    }
  }

  updateFrame(frame_num) {
    if (this.id >= 0 && this.data.length > 0) {
      const { motion, reps } = this.data[this.id];
      this.chart.data.datasets[1].data = Graph.Trace(frame_num, motion[frame_num]);
      this.chart.update();
      const completed = reps.filter(r => r <= frame_num).length;
      this.reps.innerHTML = `${completed} / ${reps.length} reps`;
    }
  }
}
