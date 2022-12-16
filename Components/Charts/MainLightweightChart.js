import { createChart, ColorType, CrosshairMode } from "lightweight-charts";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";


/* HOW TO USE */ 

// IMPORTANT NOTE: if you're using Nextjs, you have to reconfig your next-config file:
// please refer to this github disccusion for more information if you encounter a similar bug
// https://github.com/tradingview/lightweight-charts/issues/543

// you need to install the next-transpile-modules and wrap your config file like this
// npm i next-transpile-modules

// BEGINNING OF NEXT_CONFIG FILE
// const withTM = require('next-transpile-modules')(['lightweight-charts', 'fancy-canvas']);
// nextConfig = {...}
// module.exports = withTM(nextConfig)
// END OF NEXT_CONFIG FILE

// here's a tutorial for react: https://tradingview.github.io/lightweight-charts/tutorials/react/simple


// 1) install library
// npm i lightweight-charts 
// https://www.npmjs.com/package/lightweight-charts

// 2) add component
// How to use the mainchart component with props

{/* <MainLightweightChart
    chartType = "line"
    backgroundColor = "transparent"
    lineColor = "#00ffd3"
    textColor = "white"
    areaTopColor = "#00ffd5"
    areaBottomColor = "rgba(0, 255, 213, 0.08)"
    data = {allMeans}
    timestamps = {timestamps}
    height = {400} // in pixels
    vertLines = {false} //add vertical or horizontal grid lines
    horzLines = {false} 
    loader = {<Loader/>}
    fontSize = {14}
/> */}

// 3) make sure the data and timestamps structures are correct
// DATA structure:
// when you give your x coordinates, they should be an array of epochs, in seconds, and the y coordinates
// should be array of your Int/Float values. For sake of simplicity, just add a prop "data" for the y coordinates
// and add the "timestamps" prop for x values

// 4) make more specific changes
// see the github issues if you have problem or message me on discord: Askar#1000
// documentation: https://tradingview.github.io/lightweight-charts/docs/api
// github: https://github.com/tradingview/lightweight-charts

// you do not need to mess with the code below; however, I added comments to help explain functions 
// in case you want to add specific changes. Again, reach out if there is any confusion.

// PLEASE reach out (askar@flips.finance or Discord: Askar#1000). I have no problems explaining in case anything's confusing which I'm sure will be
// because I probably didn't explain this perfectly haha. 

export default function MainLightweightChart(props) {
  const [dataArray, setDataArray] = useState([]);
  const [loading, toggleLoading] = useState(true);
  // aesthetic states - this is for the aesthetic properties of the chart
  // not all states will be used depending on the chartType
  const [chartType, setChartType] = useState("line");
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [lineColor, setLineColor] = useState("white");
  const [textColor, setTextColor] = useState("white");
  const [areaTopColor, setAreaTopColor] = useState("white");
  const [areaBottomColor, setAreaBottomColor] = useState("white");
  const chartContainerRef = useRef();

  // this is the initial useeffect that gets everything set up for the chart
  // updates each time a prop is changed
  useEffect(() => {
    setProperties();
    if (props.data != undefined && props.timestamps != undefined) { organizeData(props.data, props.timestamps); } 
    else {console.log("Either your data or timestamps is undefined. Check your props");}
  }, [props]);

  // this is a function called in the useeffect to update the chart settings
  // from the props in case they change, as shown below, you don't have to include each
  // aesthetic property
  async function setProperties() {
    if (props.chartType != undefined) { setChartType(props.chartType); }
    if (props.backgroundColor != undefined) { setBackgroundColor(props.backgroundColor); }
    if (props.lineColor != undefined) {setLineColor(props.lineColor);}
    if (props.textColor != undefined) {setTextColor(props.textColor);}
    if (props.areaTopColor != undefined) {setAreaTopColor(props.areaTopColor);}
    if (props.areaBottomColor != undefined) {setAreaBottomColor(props.areaBottomColor);}
  }

  // this is to organize the data array to be compatible with the lighweight charts format
  // note, in the loop, we check if the previous timestamp is the same before, that's because
  // lightweight charts will get mad if you have repeated or non chronological timestamps
  // that also includes repeated timestamps. this function is called in the first useEffect
  async function organizeData(data, timestamps) {
    let prev_x = 0;
    let temp_array = [];
    if (data.length === 0) {return}
    data.forEach((element, index) => {
      // floor work
      let x = Math.floor(new Date(timestamps[index]).getTime());
      let y = element;
      if (x > prev_x) {
        temp_array.push({ time: x, value: y });
      }
      prev_x = x;
    });
    // this gets rid of loading sign
    toggleLoading(false);
    setDataArray(temp_array);
  }

  // this is the main useEffect that is used in order to create the chart
  useEffect(() => {
    if (loading) {return; }
    const handleResize = () => {
    //   chart.applyOptions({ title: "Floor", priceLineVisible: true, width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
        fontSize: props.fontSize != undefined ? props.fontSize : 14,
      },
      width: props.width != undefined ? props.width : chartContainerRef.current.clientWidth,
      height: props.height != undefined ? props.height : 300,
      grid: {
        vertLines: {
          visible: props.vertLines != undefined ? props.vertLines : false,
        },
        horzLines: {
          visible: props.horzLines != undefined ? props.horzLines : false,
        },
      },
      leftPriceScale: {
        visible: true,
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      watermark: {
        visible: true,
        fontSize: 20,
        horzAlign: "right",
        vertAlign: "bottom",
        color: "rgba(220,220,220,0.3)",
        text: "Degenz.Finance",
      },
    });
    chart.timeScale().fitContent();

    // this is a method that can be used to adjust chart options in real-time
    //chart.applyOptions({});

    // create the type of series, either area or line in your case
    var newSeries;
    if (chartType === "area") {
        newSeries = chart.addAreaSeries({ lineColor,
            topColor: areaTopColor,
            bottomColor: areaBottomColor,
            priceScaleId: "left"
        });
    }
    else if (chartType === "line") {
        newSeries = chart.addLineSeries({
        color: lineColor,
        priceScaleId: "left",
        lineWidth: 2,
        });
    }
    // add the data to the series type above
    if (newSeries != undefined || newSeries != null) {newSeries.setData(dataArray);}

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [dataArray]);

  return (
    <div>
      {!loading ? (<div ref={chartContainerRef}/>) : 
      ( <div> {props.loader != undefined ? props.loader : "Loading..."} </div> )}
    </div>
  );
}
