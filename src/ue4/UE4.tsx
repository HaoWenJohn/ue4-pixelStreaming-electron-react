import React from 'react';
import { load } from './Adapter';
import './ue4.css';
export default class UE4 extends React.Component {
  render() {
    return (
      <div id='ue4'/>
    );
  }

  componentDidMount() {
    load();
  }
}
