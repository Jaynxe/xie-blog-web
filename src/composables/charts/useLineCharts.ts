import * as echarts from "echarts/core";

export function useLineCharts() {
    let lineChartIns: echarts.EChartsType;
    const setLineCharts = (chartElement: globalThis.Ref<HTMLElement>, flowData: any) => {
        if (chartElement.value) {
            lineChartIns = echarts.init(chartElement.value);
            const option = {
                tooltip: {
                    trigger: "axis",
                    axisPointer: { type: "line" },
                    borderWidth: 1,
                    textStyle: { color: "#333" },
                    formatter: function (params: any) {
                        const date = new Date(params[0].axisValue);
                        const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}`;
                        const traffic = params[0].data[1];
                        return `${formattedDate}<br/>数值: ${traffic}`;
                    },
                },
                grid: { top: "5%", left: 0, right: 0, bottom: "25%", containLabel: true },
                xAxis: {
                    type: "time",
                    axisLine: { lineStyle: { color: "rgba(51, 51, 51, 0.2)", width: 1 } },
                    axisLabel: {
                        color: "#666",
                        formatter: function (value: any) {
                            const date = new Date(value);
                            return `${date.getFullYear()}-${date.getMonth() + 1}`;
                        },
                    },
                    boundaryGap: ["5%", "5%"],
                    splitLine: { show: true, lineStyle: { width: 0.3, color: "rgba(101, 101, 101, 0.3)" } },
                },
                yAxis: {
                    type: "value",
                    axisLine: { lineStyle: { color: "rgba(51, 51, 51, 0.3)", width: 1 } },
                    axisLabel: {
                        color: "#666",
                        formatter: function (value: any) {
                            return value >= 1000 ? value / 1000 + "k" : value;
                        },
                    },
                    splitLine: { show: true, lineStyle: { width: 0.3, color: "rgba(101, 101, 101, 0.3)" } },
                },
                series: [{
                    data: flowData,
                    type: "line",
                    smooth: true,
                    lineStyle: { width: 3, color: "rgba(0, 170, 255, 0.8)" },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: "rgba(0, 170, 255, 0.3)" },
                            { offset: 1, color: "rgba(0, 170, 255, 0)" },
                        ]),
                    },
                    itemStyle: {
                        color: "rgba(0, 170, 255, 1)",
                        borderColor: "rgba(0, 170, 255, 0.5)",
                        borderWidth: 2,
                    },
                }],
            };

            lineChartIns.setOption(option);
        }
    };

    const disposeLineCharts = () => {
        lineChartIns.dispose();
    }
    return { setLineCharts, disposeLineCharts };
}
