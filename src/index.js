import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/index.css";

class Page extends React.Component{

    render(){
        return (
            <main className="page">
                <h1 className="page__header">Date check</h1>
                <Container />
            </main>
        );
    }

}

class Container extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            message: [],
            warning: false,
            error: false,
            value: "дд.мм.гггг",
        }
    }

    render(){
        return(
            <div className="container">
                <p className = "container__header">Введите дату для получения информации:</p>
                <Input value={this.state.value} onFocus={()=>this.handleFocus()} 
                onChange={(v)=>this.handleChange(v)} onBlur={()=>this.handleBlur()}/>
                <Message message={this.state.message} warning={this.state.warning} error={this.state.error}/>
            </div>
        );
    }

    checkDay(value){
        value = Number(value);
        if (value > 31 || value === 0){
            this.setState(
                {
                    message: ["Неправильно введен день. Пожалуйста, проверьте ввод."], 
                    error: true
        });
        return value.slice(0,-1);
        }
        return value;
    }

    handleRightData(value, date){
        let currentDate = new Date();
        if((date - currentDate)/(24*3600*1000) <= 0){
            clearInterval(this.timerID);
            this.timerID = 0;
                this.setState(
                    {
                    message: ["Данная дата уже наступила."], 
                    warning: true,
                    value:value
                });
                return;
        } 
        let years = date.getFullYear() - currentDate.getFullYear();
            let months = date.getMonth() - currentDate.getMonth();
            let dates = date.getDate() - currentDate.getDate();

            if (years > 0 && (months < 0 || (months === 0 && dates <= 0))){
                years -= 1;
            }
            if(years > 10 ||
            (years === 10 && months > 0) ||
            (years === 10 && months === 0 && dates > 0)){
                this.setState(
                        {
                        message: [`До введенной даты более 10 лет. Дата не должна быть позже
                         ${currentDate.toLocaleDateString().slice(2,-4) + (currentDate.getFullYear()+10)}.`], 
                        warning: true,
                        value:value
                        });
                    return;
            }

            let days = (years? Math.floor((date - new Date(currentDate.getFullYear() + years,currentDate.getMonth(),currentDate.getDate()))/(24*3600*1000)) - 1:
            Math.floor((date - currentDate)/(24*3600*1000)));
            let hours = 24 - (currentDate.getHours() + 1);
            let minutes = 60 - (currentDate.getMinutes() + 1);
            let seconds = 60 - (currentDate.getSeconds() + 1);
           

            let firstDayOfYear = (new Date(date.getFullYear(),0,1)).getDay();
            let firstFullWeek =  firstDayOfYear === 1;
            let dayNumber = Math.floor((date - new Date(date.getFullYear(),0,0)) / (24*3600*1000));

            let weekNumber;
            if (dayNumber <= 8 - (firstDayOfYear === 0? 7: firstDayOfYear)){
                weekNumber = 1;
            } else {
                weekNumber = firstFullWeek ? Math.ceil(dayNumber / 7) : 
                firstDayOfYear === 0? Math.ceil((dayNumber - 1)/7  + 1): Math.ceil((dayNumber - (8 - firstDayOfYear))/7 + 1);
            }
            this.setState(
                {
                    message: [`Номер дня введённой даты в году: ${dayNumber}`,
                    `Номер недели в году:  ${weekNumber}`,
                    `До введенной даты осталось: ${years}
                    ${ (0 < years && years < 5)? ((years === 1)? "год": "года"):"лет"} 
                    ${Math.max(0,days)} дней ${hours} часов ${minutes} минут ${seconds} секунд`,
                ],
                    value:value
                });
                return;

    }

    handleChange(value){

        let valueLength = value.length;
        let stateValueLength = this.state.value.length;

        let input = document.querySelector(".input-container__input");
        if(input.selectionStart === input.selectionEnd && input.selectionStart < valueLength){
           input.selectionStart = input.value.length-1;
           return;
        }
        if(valueLength > 10 || (isNaN(value[valueLength-1]) && valueLength > stateValueLength)) return;
        if(this.state.message.length && valueLength < stateValueLength) {
            if(this.timerID){
                clearInterval(this.timerID);
                this.timerID = 0;
            }
            this.setState({error:false, warning: false, message: []});
        }
        if(this.state.error && valueLength > stateValueLength) return;
        if(valueLength === 2 && valueLength > stateValueLength) 
            { 
                if (+value > 31 || +value === 0){
                    this.setState(
                        {
                        message: ["Неправильно введен день. Пожалуйста, проверьте ввод."], 
                        error: true,
                        value:value
                        });
                    return;
                }
                value += ".";
                this.setState({value: value});
                return;
            }
        if(valueLength === 5 && valueLength > stateValueLength){
            let month = +value.slice(3)
                 if (month > 12 || month === 0){
                    this.setState(
                        {
                        message: ["Неправильно введен месяц. Пожалуйста, проверьте ввод."], 
                        error: true,
                        value:value
                        });
                    return;
                }

                value += ".";
                this.setState({value: value});
                return;
            }
        if((valueLength === 2 || valueLength === 3 ||valueLength === 5 || valueLength === 6) && valueLength < stateValueLength) {
            this.setState({value: value.slice(0,-1)});
            return;
        }
        if((valueLength === 3 || valueLength === 6) && value[valueLength - 1] !== "."){
            this.setState({value: this.state.value + "." + value[valueLength - 1]});
            return;
        }

        if(valueLength === 10){
            let dateLst = value.split(".").map((num, i)=>{
                if(i === 1){
                    return Number(num) - 1
                } else {
                return Number(num);
                }
            });
    
            dateLst.reverse();
            let date = new Date(...dateLst);
            if (!(date.getFullYear() === dateLst[0] && date.getMonth() === dateLst[1] && date.getDate() === dateLst[2])){
                this.setState(
                        {
                        message: ["Такой даты не существует. Пожалуйста, проверьте ввод"], 
                        error: true,
                        value:value
                        });
                    return;
            }
            let currentDate = new Date();
            if((date - currentDate)/(24*3600*1000) <= 0){
                    this.setState(
                        {
                        message: ["Данная дата уже наступила."], 
                        warning: true,
                        value:value
                        });
                    return;
            }   
            
            this.timerID = setInterval(()=>{this.handleRightData(value, date); console.log("tick")}, 1000);     
        }
        this.setState({value: value});
    }

    handleFocus(){
        if(this.state.value === "дд.мм.гггг"){
        this.setState({value: ""});
        }
    }

    handleBlur(){
        if(this.state.value === ""){
            this.setState({value: "дд.мм.гггг"});
            }
    }
}

class Input extends React.Component{

    render(){
        return(
            <div className="input-container">
                <input className="input-container__input" value={this.props.value}
                 onFocus={()=>this.props.onFocus()} onChange={(e)=>this.props.onChange(e.target.value)}
                 onBlur={()=>this.props.onBlur()}/>
            </div>
        );
    }
}

class Message extends React.Component{

    render(){
        return (
            <div className={"message-container" + (this.props.error?" _error":"")
        + (this.props.warning?" _warning":"")}>
            {this.props.message.map((text, index) =>
            <p key={index} className="message-container__message">{text}</p>
            )
    }
            </div>
        );
    }
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Page/>);