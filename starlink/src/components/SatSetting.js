import React, {Component} from 'react';
import {Button, InputNumber, Form} from "antd";

class SatSettingForm extends Component {
    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 11 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 13 },
            },
        };

        //console.log(this.props.form);
        return (
            <Form {...formItemLayout} className="sat-setting" onSubmit={this.showSatellite}>

                <Form.Item label="Latitude(degrees)">
                    {
                        getFieldDecorator("latitude", {rules: [{required: true, message: "Please input your Latitude",}],})
                        (<InputNumber min={-90} max={90} style={{width: "100%"}} placeholder="Please input Latitude"/>)
                    }
                </Form.Item>

                <Form.Item label="Longitude(degrees)">
                    {
                        getFieldDecorator("longitude", {rules: [{required: true, message: "Please input your Longitude",}],})
                        (<InputNumber min={-180} max={180} style={{width: "100%"}} placeholder="Please input Longitude"/>)
                    }
                </Form.Item>

                <Form.Item label="Altitude(meters)">
                    {
                        getFieldDecorator("altitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Altitude",
                                }],
                        })(<InputNumber min={-413} max={8850} style={{width: "100%"}} placeholder="Please input Altitude"/>)
                    }
                </Form.Item>

                <Form.Item label="Search Radius(degrees)">
                    {
                        getFieldDecorator("search_radius", {rules: [{required: true, message: "Please input your Search Radius",}],})
                        (<InputNumber min={0} max={90} style={{width: "100%"}} placeholder="Please input Search Radius"/>)
                    }
                </Form.Item>

                <Form.Item label="Duration(secs)">
                    {
                        getFieldDecorator("duration", {rules: [{required: true, message: "Please input your Duration",}],})
                        (<InputNumber min={0} max={90} style={{width: "100%"}} placeholder="Please input Duration"/>)
                    }
                </Form.Item>


                <Form.Item className="show-nearby">
                    <Button type="primary" htmlType="submit" style={{textAlign: "center"}}>
                        Find Nearby Satellite
                    </Button>
                </Form.Item>

            </Form>

        );
    }

    showSatellite = e => {
        e.preventDefault();
        console.log("clicked")

        this.props.form.validateFields((err, values) => { //帮我们获取SatSetting
            if(!err) {
                console.log("received value of form: ", values);
                this.props.onShow(values); //子传父
            } //以上是SpaceX第一节课的内容
        })
    }

    //HDF：higher Ordered Function, 高阶函数
    //参数是函数：回调函数
    //cb - call back
    //高阶函数的定义：函数的参数是函数，或者函数的返回也是个函数

    fn = cb => {
        console.log(1);
        cb();
    }

    fn1 = (a) => {
        console.log(2)
        return(num) => {
            console.log(num + a)
        }
    }



}

const SatSetting = Form.create({name:"Satellite-Setting"})(SatSettingForm) //这个额外的括号说明我这个东西返回的还是个函数
//这个form.create（）里面的是高阶组件， 所以这个satsettingform可以用props拿到。 这个是父传子
export default SatSetting;