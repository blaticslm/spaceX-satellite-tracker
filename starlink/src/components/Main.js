import React, {Component} from 'react';
import{Row, Col} from "antd"; //整体布局是行列式
import axios from "axios";

import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";

import {SAT_API_KEY, NEARBY_SATELLITE_PREFIX, STARLINK_CATEGORY} from "../constants";


class Main extends Component {
    state = { //状态值， 数据的transfer从SatSetting里传到SetList里。而不是得到satSetting的response传给main再传给satList
        satInfo: null,
        settings: null,
        isLoadingList: false,
        satList: [],
    }
    // Main - isLoading - SatList
    // Satlist需要检测是不是有loading的情况

    //this.showNearbysatellite是子到父传递
    render() {
        const {satInfo, settings, satList, isLoadingList} = this.state //解构一下来确定状态
        return (
            <Row className="main">
                <Col className="left-side" span = {8}>
                    <SatSetting onShow = {this.showNearbySatellite}/>
                    <SatelliteList satInfo = {satInfo} isLoad = {isLoadingList} onShowMap = {this.showMap}/>
                </Col>
                <Col className="right-side" span = {16}>
                    <WorldMap satData = {satList} observerData={settings}/>
                </Col>
            </Row>
        );
    }
    //main: onShowMap = {this.showMap}, 设定好子传父的数据路径
    //SatelliteList: onClick = {this.onShowSatMap} ---> onShowSatMap{this.props.onShowMap(this.state.selected)}
    //也就是说，父告诉子要更新，子在点击更新之后把数据回传给父的onShowMap

    showNearbySatellite = (setting) => {
        console.log(setting)
        this.setState({settings:setting});
        //fetch sat list from the server
        this.fetchSatellite(setting)
    }

    fetchSatellite = (setting) => {
        //step 1: get the settings
        //step 2: fetch satellite list from the server
        //  case 1: successful ---> update satInfo
        //  case 2: fail ---> display error

        const {latitude, longitude, altitude, search_radius} = setting;
        //此处/api/意思是代理
        const url = `/api/${NEARBY_SATELLITE_PREFIX}/${latitude}/${longitude}/${altitude}/${search_radius}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
        this.setState({ //加载时loading true
            isLoadingList: true,
        })
        axios.get(url)
            .then(response => { //return is a list
               // console.log("Main:fetchSatellite")
                //console.log(response)
                this.setState({satInfo: response.data, isLoadingList: false}) //传给info，并且loading结束了之后就false
            })
            .catch(err => {
                console.log("error in fetch satellite: ", err)
                this.setState({
                    isLoadingList: false,
                })
            })

    }

    showMap = (selected) => {
        console.log(selected)
        //spaceX4开始
        this.setState(preState => ({
            ...preState, //其他值不变
            //isLoadingMap: true,
            satList: [...selected] //修改satList属性。 ...selected是浅copy
        }))
    }
}

export default Main;