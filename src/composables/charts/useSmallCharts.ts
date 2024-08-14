import * as echarts from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer, TitleComponent]);
/* 用于展示数据的小卡片中的折线小图 */
export function useSmallCharts() {
    const chartInstances: echarts.ECharts[] = [];

    const renderChart = (chartEl: HTMLElement | null | undefined, data: number[]) => {
        const chart = echarts.init(chartEl);
        chart.setOption({
            xAxis: { show: false, type: "category"},
            yAxis: { show: false, type: "value" },
            series: [{
                data: data,
                type: "line",
                smooth: true,
                symbol: "none",
                lineStyle: {
                    width: 2,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(0, 170, 255, 1)" },
                        { offset: 0.5, color: "rgba(0, 170, 255, 0.5)" },
                        { offset: 1, color: "rgba(0, 170, 255, 0)" },
                    ]),
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(0, 170, 255, 0.5)" },
                        { offset: 1, color: "rgba(0, 170, 255, 0)" },
                    ]),
                },
            }],
            grid: { left: 0, right: 0, top: "10%", bottom: 0 },
        });
        return chart;
    };

    const setSmallCharts = (cards: any) => {
        cards.forEach((card: any, index: number) => {
            const chartEl = document.getElementById(`chart-${index}`);
            if (chartEl) {
                const chartInstance = renderChart(chartEl, card.chartData);
                chartInstances.push(chartInstance);
            }
        });
    };

    const disposeSmallCharts = () => {
        chartInstances.forEach((chart) => {
            chart.dispose();
        });
    }
    return { setSmallCharts, disposeSmallCharts };
}
