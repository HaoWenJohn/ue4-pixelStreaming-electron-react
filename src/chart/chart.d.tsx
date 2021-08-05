interface Props {
  title: string;
  xAxis: string[];
  legend: string[];
}

interface State {
  series: { name: string, type: string, data: number[] }[];
  legends:string[],
  fields:string[]
}
