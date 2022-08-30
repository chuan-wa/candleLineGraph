const { move } = require("fs-extra");
const { fromPairs } = require("lodash")
const { maxValue, minValue } = require("./minData")

var mouse = {
    x: undefined,
    y: undefined
};
var CandleGraph = {
    options: {
        padding: [50, 10, 30, 10], //left right top bottom
        xPixel: 800,
        yPixel: 330,
        mainxAxisFactor: 1,
        mainyAxisFactor: 1.5,
        // subxAxisFactor:1.3,
        subyAxisFactor: 0.5,
        mainDensity: 4,
        subDensity: 2,
        PATH: "./klineData.js",
        elementList: "ks",
        ELPostion: 0,
        openPrice: "open",
        closePrice: "close",
        maxPrice: "high",
        minPrice: "low",
        volume: "volume",
        rectInterval: 0.4,
        canvasID: "candleCanvas",
        isMinute: true,
        time: "updateTime",
        date: "displayTime",
        riseColor: "red",
        fallColor: "green",
        dataNumShown: 30,
        dataEnd: 0
    },
    wordYAixsChange: 4,
    c: null,
    ctx: null,
    isClick: false,
    delta:10,


    origin: [0, 0],







    draw: function () {
        //define inside variable
        let { wordYAixsChange, c, ctx, origin } = this
        let { dataEnd, dataNumShown, subyAxisFactor, subDensity, volume, rectInterval, padding, xPixel, yPixel, mainxAxisFactor, mainyAxisFactor, mainDensity, canvasID, openPrice, closePrice, maxPrice, minPrice, PATH, date, elementList, ELPostion, isMinute, timeLineAndInterval, time, fallColor, riseColor } = this.options
        try {
            c = document.getElementById(canvasID)
            ctx = c.getContext("2d")
            ctx.lineWidth = 0.5, ctx.font = "12px sans-serif", ctx.strokeStyle = "grey", ctx.fillStyle = "black"
        } catch {
            console.log("please write correct canvasID")
            return
        }

        //react to mouse event
        ctx.translate(origin[0], origin[1])
        ctx.clearRect(0, 0, 2000, 2000)  //2000 is temp data






        try {
            var minData = require(PATH)
        } catch {
            console.log("Please enter correct PATH in initialization")
            return
        }
        // console.log(minData[elementList])

        if (typeof minData[elementList] === 'undefined') {
            console.log("Please enter correct property in the File, better double check the File Path")
            return
        }

        if(dataEnd>minData[elementList].length - dataNumShown)this.options.dataEnd=minData[elementList].length - dataNumShown
        var selectedData = minData[elementList].filter(function (el, index) {
            return index >= minData[elementList].length - dataNumShown - dataEnd && index <= minData[elementList].length - dataEnd;
        })

        console.log(selectedData)


        var maxValue = Math.max(...selectedData.map(o => o[maxPrice]))
        var minValue = Math.min(...selectedData.map(o => o[minPrice]))
        var gap = maxValue - minValue
        maxValue += gap / (2 * mainDensity), minValue -= gap / (2 * mainDensity)

        //define inside function
        function drawLine([x1, y1], [x2, y2]) {
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
            ctx.closePath()
        }

        function calculateTimeStamp(time1, time2) {
            let realTime1 = parseInt(time1.substring(0, 2)) * 60 + parseInt(time1.substring(3, 5))
            let realTime2 = parseInt(time2.substring(0, 2)) * 60 + parseInt(time2.substring(3, 5))
            return realTime2 - realTime1
        }

        function cohenseTime(time1, time2) {
            let realTime1 = parseInt(time1.substring(0, 2)) * 60 + parseInt(time1.substring(3, 5))
            realTime1 += 1
            let hour = Math.floor(realTime1 / 60), minute = realTime1 % 60
            if (hour < 10) { time1 = "0" + hour.toString() + ":" }
            else { time1 = hour.toString + ":" }
            if (minute < 10) { time1 += "0" + minute.toString() }
            else { time1 += minute.toString() }
            return time1 + "/" + time2
        }



        //---------------------------------------------
        //calculate y axis value 
        var yAixsValue = [];
        for (let i = 0; i <= mainDensity; i++) { yAixsValue[i] = minValue + i * (maxValue - minValue) / mainDensity }

        //---------------------------------------------
        //assign y axis value with related line
        var count = 0, displayYAixs = (yPixel - padding[2] - padding[3]) * mainyAxisFactor, displayXAixs = (xPixel - padding[0] - padding[1]) * mainxAxisFactor, subdisplayYAixs = (yPixel - padding[2] - padding[3]) * subyAxisFactor
        for (const value of yAixsValue) {
            ctx.fillText(value, 0, wordYAixsChange + displayYAixs * (1 - count / mainDensity) + padding[2])
            drawLine([padding[0], displayYAixs * (1 - count / mainDensity) + padding[2]], [displayXAixs + padding[0], displayYAixs * (1 - count / mainDensity) + padding[2]])
            count++
        }
        count = 0

        //x axis value cannot be built at one step
        //require to read data from strat to end
        //can be inserted in drawing KLine component

        var dataSample = selectedData.length //fake data


        var xAxisUnit = displayXAixs / dataSample  //erase two points at ends
        var yAxisUnit = displayYAixs / (maxValue - minValue)
        ctx.save()
        ctx.translate(padding[0] + xAxisUnit / 2, padding[2])

        //###############################################




        //-------------------------------------------

        var temp = null, startTime = null, endTime = null   //for compare date

        count = 0

        for (const value of selectedData) {
            //minute graph
            if (isMinute) {
                ctx.strokeStyle = "grey", ctx.fillStyle = "black"
                if (count == 0) { startTime = value[time], ctx.fillText(startTime, -xAxisUnit / 2 - ctx.measureText(value[time]).width / 2, displayYAixs + padding[3]); drawLine([-xAxisUnit / 2, 0], [-xAxisUnit / 2, displayYAixs]); drawLine([-xAxisUnit / 2, displayYAixs + padding[2] + padding[3]], [-xAxisUnit / 2, displayYAixs + padding[2] + padding[3] + subdisplayYAixs]) }

                if (temp != null) {
                    if (calculateTimeStamp(temp[time], value[time]) != 1) {
                        ctx.fillText(cohenseTime(temp[time], value[time]), count * xAxisUnit - ctx.measureText(cohenseTime(temp[time], value[time])).width / 2, displayYAixs + padding[3])
                        drawLine([count * xAxisUnit, 0], [count * xAxisUnit, displayYAixs])
                        drawLine([count * xAxisUnit, displayYAixs + padding[2] + padding[3]], [count * xAxisUnit, displayYAixs + padding[2] + padding[3] + subdisplayYAixs])
                    }

                }
                //fill mouse pointer time info
                if (count == dataSample - 1) { endTime = value[time], ctx.fillText(value[time], displayXAixs - xAxisUnit / 2 - ctx.measureText(value[time]).width / 2, displayYAixs + padding[3]); drawLine([displayXAixs - xAxisUnit / 2, 0], [displayXAixs - xAxisUnit / 2, displayYAixs]); drawLine([displayXAixs - xAxisUnit / 2, displayYAixs + padding[2] + padding[3]], [displayXAixs - xAxisUnit / 2, displayYAixs + padding[2] + padding[3] + subdisplayYAixs]) }

                ctx.fillStyle = "black"
            }
            //-------------------------------
            //day graph
            if (!isMinute) {
                ctx.strokeStyle = "grey", ctx.fillStyle = "black"
                if (count == 0) { ctx.fillText(value[date], -xAxisUnit / 2 - ctx.measureText(value[date]).width / 2, displayYAixs + padding[3]) }
                else if (count == dataSample - 1) { ctx.fillText(value[date], displayXAixs - xAxisUnit / 2 - ctx.measureText(value[date]).width / 2, displayYAixs + padding[3]) }
                else {
                    try {
                        if (value[date].substring(5, 6) !== temp[date].substring(5, 6)) {
                            ctx.fillText(value[date].substring(0, 6), count * xAxisUnit - ctx.measureText(value[date].substring(0, 6)).width / 2, displayYAixs + padding[3])
                            drawLine([count * xAxisUnit, displayYAixs], [count * xAxisUnit, 0])
                        }
                    } catch { }
                }
            }
            //------------------------------
            //draw k Line

            ctx.fillStyle = "black", ctx.strokeStyle = "black"
            if (value[openPrice] < value[closePrice]) { ctx.fillStyle = riseColor, ctx.strokeStyle = riseColor }
            if (value[openPrice] > value[closePrice]) { ctx.fillStyle = fallColor, ctx.strokeStyle = fallColor }

            //draw top line
            drawLine([count * xAxisUnit, (maxValue - value[maxPrice]) * yAxisUnit], [count * xAxisUnit, (maxValue - Math.max(value[openPrice], value[closePrice])) * yAxisUnit])
            //draw Rect
            if (value[openPrice] <= value[closePrice]) { ctx.strokeRect((count - (1 - rectInterval) / 2) * xAxisUnit, (maxValue - Math.max(value[openPrice], value[closePrice])) * yAxisUnit, xAxisUnit * (1 - rectInterval), Math.abs(value[openPrice] - value[closePrice]) * yAxisUnit) }
            else { ctx.fillRect((count - (1 - rectInterval) / 2) * xAxisUnit, (maxValue - Math.max(value[openPrice], value[closePrice])) * yAxisUnit, xAxisUnit * (1 - rectInterval), Math.abs(value[openPrice] - value[closePrice]) * yAxisUnit) }
            //draw bottom lone
            drawLine([count * xAxisUnit, (maxValue - value[minPrice]) * yAxisUnit], [count * xAxisUnit, (maxValue - Math.min(value[openPrice], value[closePrice])) * yAxisUnit])

            temp = value
            count++
        }
        count = 0

        ctx.save()
        ctx.translate(0, displayYAixs + padding[3] + padding[2])

        var maxVolume = Math.max(...selectedData.map(o => o[volume]))
        //leave blank space
        maxVolume += maxVolume / 10
        //
        yAixsValue = []
        ctx.strokeStyle = "grey"
        for (var i = 0; i <= subDensity; i++) {
            yAixsValue[i] = i * maxVolume / subDensity
            drawLine([-xAxisUnit / 2, subdisplayYAixs * (1 - i / subDensity)], [-xAxisUnit / 2 + displayXAixs, subdisplayYAixs * (1 - i / subDensity)])
            ctx.fillText(yAixsValue[i], -xAxisUnit / 2 - padding[0], subdisplayYAixs * (1 - i / subDensity) + wordYAixsChange)
        }

        var subyAxisUnit = subdisplayYAixs / maxVolume
        for (const value of selectedData) {
            if (value[openPrice] <= value[closePrice]) { ctx.fillStyle = riseColor, ctx.strokeStyle = riseColor }
            if (value[openPrice] > value[closePrice]) { ctx.fillStyle = fallColor, ctx.strokeStyle = fallColor }
            ctx.fillRect((count - (1 - rectInterval) / 2) * xAxisUnit, (maxVolume) * subyAxisUnit, xAxisUnit * (1 - rectInterval), -value[volume] * subyAxisUnit)
            count++
        }
        this.origin = [-padding[0] - xAxisUnit / 2, -displayYAixs - 2 * padding[2] - padding[3]]




        //#########
        function interact() {
            function isInMainAfter() {
                return !(mouse.x < 0 || mouse.x >= displayXAixs || mouse.y < 0 || mouse.y > displayYAixs)
            }

            function isInSubBefore() {
                return !(mouse.x < 0 || mouse.x >= displayXAixs || mouse.y < displayYAixs + padding[2] + padding[3] || mouse.y > displayYAixs + padding[2] + padding[3] + subdisplayYAixs)
            }

            function isInSubAfter() {
                return !(mouse.x < 0 || mouse.x >= displayXAixs || mouse.y < 0 || mouse.y > subdisplayYAixs)
            }

            function translateMouseAxis() {
                mouse.x -= c.getBoundingClientRect().left + padding[0] + xAxisUnit / 2
                mouse.y -= c.getBoundingClientRect().top + padding[2]
                if (mouse.x % xAxisUnit < xAxisUnit / 2) { mouse.x = Math.floor((mouse.x / xAxisUnit)) * xAxisUnit }
                else { mouse.x = (Math.ceil(mouse.x / xAxisUnit)) * xAxisUnit }
            }

            function drawCrossLine() {
                ctx.strokeStyle = "grey"
                ctx.setLineDash([1, 2])
                drawLine([0, mouse.y], [displayXAixs, mouse.y])
                drawLine([mouse.x, 0], [mouse.x, displayYAixs + padding[2] + padding[3] + subdisplayYAixs])
                ctx.setLineDash([1, 0])
            }
            function transformYAxisToYValue(y, originy, unit, max) {
                return (-(y - originy) / unit + max).toFixed(2)
            }


            function fillCrossInfo() {

                ctx.fillStyle = "black"
                var numOfSample = Math.floor(mouse.x / xAxisUnit)
                //console.log(numOfSample)
                var value = selectedData[numOfSample]
                ctx.fillRect(mouse.x - ctx.measureText(value[time]).width / 2 - 4, displayYAixs, ctx.measureText(value[time]).width + 8, padding[3] + 2)
                ctx.fillStyle = "white"
                ctx.fillText(value[time], mouse.x - ctx.measureText(value[time]).width / 2, displayYAixs + padding[3])


                if (isInMainAfter()) {
                    ctx.fillStyle = "black"
                    let tempInfo = transformYAxisToYValue(mouse.y, 0, yAxisUnit, maxValue)
                    //width of M is similar to any number's height
                    ctx.fillRect(-padding[0] - 4, mouse.y - 1 / 2 * ctx.measureText("M").width - 8, ctx.measureText(tempInfo).width + 8, 1 / 2 * ctx.measureText("M").width + 12)
                    ctx.fillStyle = "white"
                    ctx.fillText(tempInfo, -padding[0], mouse.y)
                }
                if (isInSubBefore()) {
                    ctx.fillStyle = "black"
                    let tempInfo = transformYAxisToYValue(mouse.y, displayYAixs + padding[2] + padding[3], subyAxisUnit, maxVolume)
                    ctx.fillRect(-padding[0] - 4, mouse.y - 1 / 2 * ctx.measureText("M").width - 8, ctx.measureText(tempInfo).width + 8, 1 / 2 * ctx.measureText("M").width + 12)
                    ctx.fillStyle = "white"
                    ctx.fillText(tempInfo, -padding[0], mouse.y)
                }

            }
            //this horionzal center
            //x is container length
            function showWordsC(value, x, y) {
                ctx.fillText(value, (x - ctx.measureText(value).width) / 2, y)
            }

            function RorG(start, value) {
                if (start < value) ctx.fillStyle = "red"
                else if (start > value) ctx.fillStyle = "green"
                else ctx.fillStyle = "black"
            }

            function detailInfo() {
                let x = null
                if (mouse.x > displayXAixs / 2) x = -xAxisUnit / 2
                else x = displayXAixs * 2 / 3 - xAxisUnit / 2
                let y = displayYAixs * 1 / 4, dx = displayXAixs / 3, dy = displayYAixs * 3 / 4
                ctx.fillStyle = "white"
                ctx.fillRect(x, y, dx, dy)
                ctx.strokeStyle = "grey"
                ctx.strokeRect(x, y, dx, dy)
                ctx.translate(x, y)
                var numOfSample = Math.floor(mouse.x / xAxisUnit)
                var value = selectedData[numOfSample]
                ctx.fillStyle = "black"
                ctx.font = "15px sans-serif"
                showWordsC(value[date] + " " + value[time], dx, dy / 10)
                //console.log((2*x+dx)/2-ctx.measureText(value[date]+" "+value[time]).width/2)
                showWordsC(" 开 盘 : " + value[openPrice], dx, 3 * dy / 10)
                RorG(value[openPrice], value[closePrice])
                showWordsC(" 收 盘 : " + value[closePrice], dx, 4 * dy / 10)
                RorG(value[openPrice], value[maxPrice])
                showWordsC(" 最 高 : " + value[maxPrice], dx, 5 * dy / 10)
                RorG(value[openPrice], value[minPrice])
                showWordsC(" 最 低 : " + value[minPrice], dx, 6 * dy / 10)
                let symbol = null
                if (value[openPrice] == value[closePrice]) symbol = ""
                else if (value[openPrice] < value[closePrice]) symbol = "+"
                else symbol = "-"
                RorG(value[openPrice], value[closePrice])
                showWordsC(" 收 跌 : " + symbol + Math.abs(value[openPrice] - value[closePrice]), dx, 7 * dy / 10)
                RorG(value[openPrice], value[closePrice])
                showWordsC(" 涨 跌 幅 : " + symbol + Math.abs((value[openPrice] - value[closePrice]) * 100 / value[openPrice]).toFixed(2) + "%", dx, 8 * dy / 10)
                ctx.fillStyle = "blue"
                showWordsC(" 成 交 量 : " + value[volume], dx, 9 * dy / 10)
                ctx.fillStyle = "black"
                ctx.translate(-x, -y)

            }
            translateMouseAxis()
            if (mouse.x < 0 || mouse.x >= displayXAixs || mouse.y <= 0 || (mouse.y >= displayYAixs && mouse.y <= displayYAixs + padding[2] + padding[3]) || mouse.y > displayYAixs + padding[2] + padding[3] + subdisplayYAixs) return
            ctx.translate(origin[0], origin[1])
            ctx.translate(padding[0] + xAxisUnit / 2, padding[2])
            drawCrossLine()
            fillCrossInfo()
            detailInfo()
            ctx.translate(0, displayYAixs + padding[3] + padding[2])

        }
        if (typeof mouse.x !== "undefined") interact()
    },
}




window.onload = function () {
    CandleGraph.draw()
}

window.addEventListener("mousedown", function (e) {
    mouse.x = e.x
    mouse.y = e.y
})

window.addEventListener("mouseup", function (e) {
    var diffx = e.x - mouse.x
    var diffy = e.y - mouse.y
    if (Math.abs(diffx) < CandleGraph.delta) {
        CandleGraph.isClick = !CandleGraph.isClick
        if (CandleGraph.isClick == false) {
            mouse.x = undefined, mouse.y = undefined
        }
    }
    else {
        CandleGraph.options.dataEnd = Math.max(0, CandleGraph.options.dataEnd+diffx / 100)
        mouse.x = undefined, mouse.y = undefined
        console.log(CandleGraph.options.dataEnd)
    }
    console.log(mouse)
    CandleGraph.draw()

}

)




window.addEventListener("mousemove", function (e) {
    if (CandleGraph.isClick == false) return
    mouse.x = e.x;
    mouse.y = e.y;
    CandleGraph.draw()
});



    // console.log(yAixsPixelValueTransformUnit)
