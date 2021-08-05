import React from 'react';

import 'antd/dist/antd.css';

import { Col, Row } from 'antd';
import Sider from '../slider/Slider';
import UE4 from '../ue4/UE4';
import Bar from '../chart/bar';


export default class App extends React.Component {
  state = {
    collapsed: false
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    return (
      <Row justify='space-between' style={{width:"100%",height:"100%"}}>
        <Col span={4} >
          <Sider/>
        </Col>
        <Col span={16}>
          <UE4/>
        </Col>
        <Col span={4}>
          <Bar
            title="test"
            legend={["销量"]}
            xAxis={["123","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]}/>
        </Col>
      </Row>
    );
  }

  // render() {
  //   return (
  //     <Layout style={{width:"100%",height:"100%"}}>
  //       <Sider theme='dark' trigger={null} collapsible collapsed={this.state.collapsed}>
  //         <div className="logo" />
  //         <Menu  mode="inline" defaultSelectedKeys={['1']}>
  //           <Menu.Item key="1" icon={<UserOutlined />}>
  //             nav 1
  //           </Menu.Item>
  //           <Menu.Item key="2" icon={<VideoCameraOutlined />}>
  //             nav 2
  //           </Menu.Item>
  //           <Menu.Item key="3" icon={<UploadOutlined />}>
  //             nav 3
  //           </Menu.Item>
  //         </Menu>
  //       </Sider>
  //       <Layout className="site-layout">
  //         {/* <Header className="site-layout-background" style={{ padding: 0 }}>
  //
  //         </Header> */}
  //         <Content
  //           className="site-layout-background"
  //           // style={{
  //           //   margin: '24px 16px',
  //           //   padding: 24,
  //           //   minHeight: 280,
  //           // }}
  //         >
  //           {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
  //             className: 'trigger',
  //             onClick: this.toggle,
  //           })}
  //         <UE4/>
  //         </Content>
  //       </Layout>
  //     </Layout>
  //   );
  // }
}


