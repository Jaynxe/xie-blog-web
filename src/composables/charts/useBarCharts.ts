import * as echarts from "echarts/core";

export function useBarCharts() {

    let barChartIns: echarts.EChartsType;

    const setBarCharts = (chartElement: globalThis.Ref<HTMLElement>, xAxisData: string[], seriesData: number[]) => {
        if (chartElement.value) {
            barChartIns = echarts.init(chartElement.value);
            const option = {
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "line",
                    },
                    borderWidth: 1,
                    textStyle: {
                        color: "#333",
                    },
                },
                grid: {
                    top: "5%",
                    left: "3%",
                    right: "4%",
                    bottom: 0,
                    containLabel: true,
                },
                xAxis: {
                    type: "category",
                    data: xAxisData,
                    boundaryGap: ["10%", "10%"],
                },
                yAxis: {
                    type: "value",
                    splitLine: {
                        show: true,
                        lineStyle: {
                            width: 0.3,
                            color: "rgba(101, 101, 101, 0.5)",
                            type: "solid",
                        },
                    },
                },
                series: [
                    {
                        data: seriesData,
                        type: "bar",
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: "#00aaff" },
                                { offset: 1, color: "rgba(0, 170, 255, 0.1)" },
                            ]),
                        },
                        barWidth: "40%",
                    },
                ],
            };

            barChartIns.setOption(option);
        }
    };

    const disposeBarCharts = () => {
        barChartIns.dispose();
    }
    return { setBarCharts, disposeBarCharts };
}
