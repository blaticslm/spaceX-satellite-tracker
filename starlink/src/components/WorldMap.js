import React, {Component} from 'react';
import axios from 'axios'
import {WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY} from "../constants";
import {feature} from "topojson-client"
import {geoKavrayskiy7} from "d3-geo-projection";
import {geoGraticule, geoPath} from "d3-geo";
import {select as d3select} from "d3-selection";// 改select名字
import {timeFormat as d3TimeFormat} from "d3-time-format";
import {schemeDark2} from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import {Spin} from "antd";


const width = 960;
const height = 600;
class WorldMap extends Component {
    constructor() {
        super();
        //create a map ref
        //画图用。
        this.state = {
            isLoading:false,
            isDrawing:false,
        }
        this.refmap = React.createRef(); //refmap is in WorldMap.js, 初始化
        this.refTrack = React.createRef(); //第二个图层，透明图层
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeDark2); //颜色范围传入
    }
    render() {
        const { isLoading } = this.state;
        return (
            <div className="map-box">
                {
                    isLoading ?
                        (<div className="spinner">
                            <Spin tip ="I'm running" size="large"/>
                        </div>)
                        : null
                }
                <canvas className="map" ref={this.refmap}/>
                <canvas className = "track" ref = {this.refTrack} />
                <div className="hint" />
            </div>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //??????????
        //Sapce 4 start

        //step 1: fetch all satellite positions
        //step 2: display all the positions on the map

        if(prevProps.satData !== this.props.satData) { //如果前一个props的状态和当前的props状态不一样
            const { //父传子用props，在main里面定义了observerData
                latitude,
                longitude,
                altitude,
                search_radius,
                duration,
            } = this.props.observerData;

            const endTime = duration * 60; //说是拿duration的时间，实际上是拿该时间60倍的时间

            //接下来拿卫星数据
            //urls: [axios.get(url1), .....]
            //这个map作用是
            //satId 1: url1, satId 2: url2 ...
            this.setState({isLoading:true})

            const urls= this.props.satData.map(sat => {
                const {satid} = sat;

                //I cant get position data?why???????????????
                //Request: /positions/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{seconds}
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${altitude}/${endTime}/&apiKey=${SAT_API_KEY}`;

                return axios.get(url);
            });

            //连续发送数据请求
            //console.log(urls)
            Promise.all(urls)
                .then(res => {

                    //遍历array并直接画图
                    console.log(res)
                    const arr = res.map(sat => sat.data) //该处用一个sat名字来代替在data里面的各个卫星的json数据
                    this.setState({isLoading:false, isDrawing:true})

                    if(!prevState.isDrawing) { //判断是否可以画图
                        this.track(arr)
                    } else {
                        console.log(document.getElementsByClassName("hint")); //html collection
                        const onHint = document.getElementsByClassName("hint")[0];
                        onHint.innerHTML = "Please wait for these current satellites to finish drawing! "
                    }

                })
                .catch(err => {
                    console.log(`Error in fetch position ${err}`)
                    this.setState({isLoading:false, isDrawing:false})
                })
        }
    }

    track = (data) => {
        //先查看有没有position这个数据
        //console.log(data)
        if (!data[0].hasOwnProperty("positions")) {
            throw new Error("no position data");
        }

        const len = data[0].positions.length; //get length of position array
        const {context2} = this.map;

        let now = new Date(); //定义当前时间

        let i= 0; //从第0个点开始打

        //timer每秒打一个点
        const timer = setInterval( () => {
            const current_time = new Date(); //当打下点的时间
            const timePassed = i === 0 ? 0 : current_time-now; //流逝的时间，用于更新显示的时间
            const time = new Date(now.getTime() + timePassed * 60);

            //display time: d3 timer
            context2.clearRect(0,0,width,height); //清除整个区域
            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10); //在宽度一半地方放置，高度10px

            if(i >= len) { //终止条件
                clearInterval(timer)
                this.setState({isDrawing:false})
                const onHint = document.getElementsByClassName('hint')[0];
                onHint.innerHTML ="";
                return;
            }

            //draw each position
            data.forEach(sat => {
                const {info, positions} = sat;
                //console.log(sat)
                this.drawSat(info,positions[i])
            })

            i += 60; //用于对付扩大的数据范围


        }, 1000)

    }

    drawSat = (sat,pos) => {
        //console.log(pos)
        const {satlongitude, satlatitude} = pos;

        if(!satlatitude || !satlongitude) {
            return;
        }

        const{satname} = sat;
        const nameWithNumber = satname.match(/\d+/g).join(""); //利用regular expression拿到卫星数字
        const {projection, context2} = this.map;

        const xy = projection([satlongitude, satlatitude]); //得到projection array


        context2.fillStyle = this.color(nameWithNumber); //选定颜色，详细使用scaleordinal
        context2.beginPath();
        context2.arc(xy[0],xy[1], 4, 0, 2 * Math.PI); //画个圆点的方法： x轴和y轴的位置，圆的半径以及旋转角度范围
        context2.fill(); //填充

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14); //向上偏移14px
    }

    componentDidMount() { //获取地图，only one time achieve is good enough
        axios.get(WORLD_MAP_URL)
            .then(res => {
                //console.log(res)
                if (res.status === 200) {
                    const{data} = res;
                    //feature(data,data.object.countries).features
                    //feature(data,data.object.countries)这个部分res的country的部分给拿到手了。接着country这个feature下还有features，这才是我们想要的

                    //step 1: convert map data to geojson
                    const land = feature(data,data.objects.countries).features

                    //step 2: generate map
                    //geoJson --> projection parameter preparation ---> projected white board --> using D3
                    this.generateMap(land)

                }
            })
            .catch(err => {
                console.log("error on fetch map data: ", err)
            })
    }

    generateMap = land => {
        const projection = geoKavrayskiy7() //返回的是个method,然后定义projection的参数
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(0.1);

        const graticule = geoGraticule(); //经纬度

        //get map canvas
        //this.refmap has --> {current:canvas}
        const canvas = d3select(this.refmap.current) //获得地图canvas
            .attr("width", width)
            .attr("height", height);

        const canvas2 = d3select(this.refTrack.current) //画卫星轨迹的图层 我gnmlgb
            .attr("width", width)
            .attr("height", height);


        //now,canvas有projection有，那么开始把数据注入
        //画图前初始化
        const context = canvas.node().getContext("2d"); //canvas的形式
        const context2 = canvas2.node().getContext("2d"); //卫星轨迹画图的图层


        let path = geoPath()
            .projection(projection)
            .context(context)

        this.map = {
            projection:projection,
            graticule: graticule,
            context: context,
            context2: context2,
        };

        //画图
        land.forEach(ele => {
            context.fillStyle = "#B3DDEF"; //填充颜色
            context.strokeStyle = "#000"; //边界颜色
            context.globalAlpha = 0.7; //地图深浅
            //地图本身
            context.beginPath(); //开始画
            path(ele); //把path画出来
            context.fill(); //填充
            context.stroke(); //画笔

            //经纬度
            context.strokeStyle = "rgba(220,220,220,0.1)";
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();

            //这个目的是转换卫星position数据project到第二图层地图上

        });

    };
}

export default WorldMap;