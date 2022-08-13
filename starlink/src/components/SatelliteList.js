import React, {Component} from 'react';
import {Button, List, Avatar, Checkbox, Spin} from "antd";
import satellite from '../assets/images/satellite.svg';

class SatelliteList extends Component {
    state = {
        selected: [],
    }
    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const {selected} = this.state;
        return (
            <div className="sat-list-box">
                <div className="btn-container">
                    <Button className = "sat-list-btn" size="large" disabled={selected.length === 0} onClick={this.onShowSatMap} type = "primary">
                        track Satellite
                    </Button>
                </div>
                <hr />
                {
                        <List
                            className="sat-list"
                            itemLayout="horizontal"
                            dataSource={satList}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar src={satellite} />
                                        }
                                        title={<p>{item.satname}</p>}
                                        description={`launch Date: ${item.launchDate}`}
                                    />
                                </List.Item>
                            )}
                        />
                }
            </div>
        );
    }

    onChange = e => { //on change是记录checkbox时的记录的数据，从SpaceX3开始就是利用这个来做地图上的显示
        //console.log(e.target)
        //step 1: get current selected/unselected satellite
        //step 2: remove/add the satellite to the list

        const {dataInfo, checked } = e.target //拿信息
        const {selected} = this.state //拿list
        const list = this.addOrRemove(dataInfo, checked, selected)
        this.setState({selected: list})
        console.log(list)

    }

    addOrRemove= (item,check,list) => {
        //case 1: check to true
        //  - not in the list: add
        //  - in the list: do nothing

        //case 2: check is false
        //  - in the list: remove
        //  - not in the list: do nothing

        //判断能不能找到, true or false
        const found = list.some(sat => sat.satid === item.satid)

        //case 1: check to true but nothing find
        if(check && !found) {
            list = [...list, item]
        }

        if(!check && found) {
            list = list.filter(sat => sat.satid !== item.satid) //不相等的保留， 相等的删除
        }

        return list
    }

    onShowSatMap = () => {
        this.props.onShowMap(this.state.selected); //props是子传父，传给main里面的 satellite实例
    }

    //Update: if previous obtained satatellite info != current one, then we cancel create a new empty selected list
    componentDidUpdate(prevProps, prevState, snapshot) { //用于更新选中的表单，要不然会有残留（已经看到了刚才为什么会有东西了）
        if(prevProps.satInfo !== this.props.satInfo) {
            this.setState({selected: []})
        }
    }
}

export default SatelliteList;