import React from 'react'
import './style.css'
import io from 'socket.io-client'

export default class Board extends React.Component{

    timeout;
    socket = io.connect('http://localhost:5000', { transports: ['websocket'] })
    ctx
    isDrawing = false;

    constructor(props){
        super(props)

        this.socket.on("canvas-data", function(data){
            var interval = setInterval(function(){
            if(root.isDrawing) return;
            root.isDrawing = true;
            clearInterval(interval)
            var root = this
            var image = new Image();
            var canvas = document.querySelector("#board");
            var ctx = canvas.getContext('2d')
            image.onload = function(){
                ctx.drawImage(image,  0, 0)
                root.isDrawing = false
            };

            image.src = data;
            },200)
        })

        // this.state = {
        //     color: this.props.color,
        //     size: this.props.size

        // }
    }

    componentDidMount(){
        this.drawCanvas();
    }

    // componentWillReceiveProps(newProps){
    //     this.ctx.strokeStyle = newProps.color;
    //     this.ctx.lineWidth = newProps.size;
    // }

    drawCanvas(){
        var canvas = document.querySelector('#board');
        var ctx = canvas.getContext('2d');

        var sketch = document.querySelector('#sketch');
        var sketch_style = getComputedStyle(sketch);
        canvas.width = parseInt(sketch_style.getPropertyValue('width'));
        canvas.height = parseInt(sketch_style.getPropertyValue('height'));

        var mouse = {x: 0, y: 0};
        var last_mouse = {x: 0, y: 0};

        /* Mouse Capturing Work */
        canvas.addEventListener('mousemove', function(e) {
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);


        /* Drawing on Paint App */
        ctx.lineWidth = this.props.size;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.props.color;

        canvas.addEventListener('mousedown', function(e) {
            canvas.addEventListener('mousemove', onPaint, false);
        }, false);

        canvas.addEventListener('mouseup', function() {
            canvas.removeEventListener('mousemove', onPaint, false);
        }, false);

        var root = this;
        var onPaint = function() {
            ctx.beginPath();
            ctx.moveTo(last_mouse.x, last_mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();

            if(root.timeout!==undefined) clearTimeout(root.timeout);
            root.timeout = setTimeout(()=>{
                var base64ImageData = canvas.toDataURL("image/png")
                root.socket.emit("canvas-data", base64ImageData)
            },100)
        };
    }

    
    render(){
        return(
            <div id="sketch">
                <canvas  id="board" width="650px" height="850px"></canvas>
            </div>
            
        )
    }
}