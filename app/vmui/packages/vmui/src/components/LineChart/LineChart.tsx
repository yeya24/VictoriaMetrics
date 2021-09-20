import React, {FC, useMemo, useState} from "react";
import {Line} from "react-chartjs-2";
import {Chart, ChartData, ChartOptions, ScatterDataPoint, TimeScale} from "chart.js";
import {getNameForMetric} from "../../utils/metric";
import "chartjs-adapter-date-fns";
import debounce from "lodash.debounce";
import {TimePeriod} from "../../types";
import {useAppDispatch, useAppState} from "../../state/common/StateContext";
import {dateFromSeconds, getTimeperiodForDuration} from "../../utils/time";
import {GraphViewProps} from "../Home/Views/GraphView";
import {Legend, LegendItem} from "../Legend/Legend";
import {Box} from "@material-ui/core";
import {getColorByString} from "../../utils/color";

const LineChart: FC<GraphViewProps> = ({data = []}) => {

  const {time: {duration}} = useAppState();
  const dispatch = useAppDispatch();

  const [hiddenData, setHiddenData] = useState<string[]>([]);

  const series: ChartData<"line", (ScatterDataPoint)[], unknown> = useMemo(() => ({
    datasets: data?.map(d => {
      const label = getNameForMetric(d);
      const color = getColorByString(label);
      return {
        label,
        data: d.values.map(v => ({y: +v[1], x: v[0] * 1000})),
        borderColor: color,
        backgroundColor: color,
        hidden: hiddenData.includes(label)
      };
    })
  }), [data, hiddenData]);

  const labels = useMemo(() => (
    data?.map(d => {
      const key = getNameForMetric(d);
      const {__name__, ...metric} = d.metric;
      return {
        key,
        name: __name__,
        labelData: metric,
        checked: !hiddenData.includes(key),
        color: getColorByString(key)
      };
    })
  ), [data, hiddenData]);

  const getRangeTimeScale = (chart: Chart) => {
    const {min = 0, max = 0} = (chart.boxes.find(box => box.constructor.name === "TimeScale") || {}) as TimeScale;
    return {min, max};
  };

  const onZoomComplete = ({chart}: {chart: Chart}) => {
    const {min, max} = getRangeTimeScale(chart);
    if (!min || !max || (max - min < 1000)) return;
    const period: TimePeriod = {
      from: new Date(min),
      to: new Date(max)
    };
    dispatch({type: "SET_PERIOD", payload: period});
  };

  const onPanComplete = ({chart}: {chart: Chart}) => {
    const {min, max} = getRangeTimeScale(chart);
    if (!min || !max) return;
    const {start,  end} = getTimeperiodForDuration(duration, new Date(max));
    const period: TimePeriod = {
      from: dateFromSeconds(start),
      to: dateFromSeconds(end)
    };
    dispatch({type: "SET_PERIOD", payload: period});
  };

  const onClickLegend = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, legendItem: LegendItem) => {
    const {checked} = legendItem;
    if (event.ctrlKey) {
      setHiddenData(checked ? [...hiddenData, legendItem.key] : hiddenData.filter(n => n !== legendItem.key));
    } else if (hiddenData.length && checked) {
      setHiddenData([]);
    } else {
      const hiddenLegends = labels.filter(label => label !== legendItem).map(({key}) => key) || [];
      setHiddenData(hiddenLegends);
    }
  };

  const options: ChartOptions = {
    animation: {
      delay: 0,
      duration: 250,
      easing: "linear",
    },
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "yyyy-MM-dd HH:mm:ss.SSS",
          displayFormats: {
            millisecond: "HH:mm:ss.SSS",
            second: "HH:mm:ss",
            minute: "HH:mm",
            hour: "HH:mm"
          },
        },
        ticks: {
          source: "auto",
          autoSkip: true,
        }
      }
    },
    plugins: {
      legend: {display: false},
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
          onPanComplete:  debounce(onPanComplete, 500)
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          mode: "x",
          onZoomComplete: debounce(onZoomComplete, 500)
        }
      }
    }
  };

  return <>
    <Box mb={2}>
      <Line data={series} options={options} height={90} />
    </Box>
    <Legend labels={labels} onClick={onClickLegend}/>
  </>;
};

export default LineChart;