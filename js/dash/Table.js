import { MAX_SKELS } from '../constants/SKEL.js';


export class Table {
  static cellwidth = {
    name: '25%',
    reps: '6%',
    tut: '15%',
    tpr: '15%',
    cal: '10%',
    time: '25%'
  }

  static FormatTimestamp(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hourString = hours > 12 ? (hours % 12) : hours;
    const ampm = hours < 12 ? 'am': 'pm';
    return `${month}/${day} ${hourString}:${minutes}${ampm}`;
  }

  static FormatTable(exercises) {
    return exercises.map(exercise => ({
      ...exercise,
      reps: exercise['reps'].length,
      time: Table.FormatTimestamp(exercise['time']),
      tut: `${exercise.tut} <i>s</i>`,
      tpr: `${exercise.tpr} <i>s</i>`,
      cal: `${exercise.cal} <i>Cal</i>`
    }));
  }

  constructor(
    tbody,
    onSelect = (data) => console.log(data),
    onPaginate = (pagenum) => console.log(pagenum)
    ) {
    this.tableDOM = document.getElementById('table');
    this.tbody = tbody;
    this.exercises = [];
    this.onSelect = onSelect;
    this.onPaginate = onPaginate;
    this.selected = -1;
  }

  update = (exercises = []) => {
    this.exercises = exercises;
    this.render();
  }

  select = (id) => {
    this.selected = id;
    this.onSelect(id);
  }

  paginate = (page) => {
    this.onPaginate(page);
  }

  render() {
    while(this.tbody.firstChild) { this.tbody.removeChild(this.tbody.firstChild) };
    this.tableDOM.deleteTFoot();
    Table.FormatTable(this.exercises)
      .forEach((exercise, index) => {
        const row = document.createElement('tr');
        const icon = document.createElement('i');
        icon.className = 'material-icons';
        icon.style.fontSize = '32px';
        icon.style.color = '#eceff4';
        icon.innerHTML = 'assignment';
        const button = document.createElement('a');
        button.className = 'smooth btn btn-sm';
        button.style.padding = 0;
        button.style.background = 'none';
        button.onclick = () => this.select(index);
        button.appendChild(icon);
        row.appendChild(button);

        const fields = Object.keys(exercise);
        fields.forEach(field => {
          const td = document.createElement('td');
          td.innerHTML = exercise[field];
          row.appendChild(td);
          td.setAttribute('width', Table.cellwidth[field]);
        })

        this.tbody.appendChild(row);
      });
      longtable(this.tableDOM, { 'perPage': MAX_SKELS }, this.paginate);
  }
}
