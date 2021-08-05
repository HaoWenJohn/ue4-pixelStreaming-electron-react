import React from 'react';
import * as echarts from 'echarts';
import { EChartsType } from 'echarts/types/dist/echarts';
import { addResponseEventListener, emitUIInteraction, removeResponseEventListener } from '../ue4/Adapter';
import uuid from '../utils/uuid';


export default class Bar extends React.Component<Props, State> {
  private readonly title: string;
  private readonly name: string;
  private el: HTMLDivElement | null | undefined;
  private charts: EChartsType | undefined;

  constructor(props: Props) {
    super(props);
    this.title = props.title;

    this.name = 'bar' + uuid(8, 16);
    this.charts = undefined;
  }

  state: Readonly<State> = {
    series: [],
    legends: [],
    fields: []
  };

  componentDidMount() {
    this.initialChart();
    this.addDataEvent();
  }

  componentWillUnmount() {
    this.removeDataEvent();
  }

  componentDidUpdate() {
    this.charts?.setOption({
      'title': {
        text: this.title
      },
      yAxis: {},
      'legend': {
        data: this.state.legends
      },
      'xAxis': {
        data: this.state.fields
      },
      'series': this.state.series
    });
  }

  render() {
    return (
      <div
        ref={el => (this.el = el)}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  initialChart() {
    this.charts = echarts.init(this.el!);
  }

  private listener = (e: string) => {
    let series: { name: string, type: string, data: number[] }[] = [];
    /**
     * data:{
     *   "legends":["摩卡"，“拿铁”]
     *   "fields":["阿门",“阿前”,"一颗","葡萄树"]，
     *   “阿门”：{
     *     "type":"bar"，
     *     "摩卡":[1]，
     *     “拿铁”:[3]
     *   },
     *   "阿前":{
     *     "type":"line"，
     *     "摩卡":[6]，
     *     “拿铁”:[2]
     *   }
     *   ...........................
     * }
     */
    let data: any = JSON.parse(e);
    let legends: string[] = data['legends'];
    let fields: string[] = data['fields'];
    for (let legend of legends) {
      for (let field of fields) {
        let field_data = data[field];
        series.push({
          name: legend,
          type: field_data['type'],
          data: field_data[legend]
        });
      }
    }
    this.setState({
        series: series,
        legends: legends,
        fields: fields
      }
    );
  };

  addDataEvent() {
    emitUIInteraction({
      type: 'GetData'
    });
    addResponseEventListener(this.name, this.listener);
  }

  removeDataEvent() {
    emitUIInteraction({
      type: 'CancelData'
    });
    removeResponseEventListener(this.name);
  }
}
