<script setup lang='ts'>
import { reactive, onMounted } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { } from 'echarts/components';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { type WeatherData } from '@/types/define'
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const authStore = useAuthStore();
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer, TitleComponent]);
let weatherData = reactive<WeatherData>({
  city: '',
  reporttime: '',
  temperature: '',
  weather: ''
})//天气数据
let loading = ref(true); // 用于加载天气
const cardBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
} as const;
/* 项目依赖数据 */
const dependencies: { name: string, version: string }[] = reactive([
  {
    name: 'vue',
    version: '^3.4.21',
  },
  {
    name: 'element-plus',
    version: '^2.7.3',
  },
  {
    name: 'vue-router',
    version: '^4.3.0',
  },
  {
    name: 'pinia',
    version: '^2.1.7',
  },
  {
    name: 'less',
    version: '^4.2.0',
  },
  {
    name: 'vueuse',
    version: '^10.9.0',
  },
  {
    name: 'axios',
    version: '^1.7.2',
  },
  {
    name: 'echarts',
    version: '^5.5.0',
  },

])
/* 网站流量数据 */
const flowData = reactive([
  ['2024-02-01', 2200],
  ['2024-03-01', 4000],
  ['2024-04-01', 8000],
  ['2024-05-01', 9000],
  ['2024-06-01', 10000],
  ['2024-07-01', 6000],
],)
let flowChart = ref()
let flowChartIns: echarts.EChartsType
/* 卡片展示数据 */
const cards = reactive([
  { icon: 'icon-yonghuzongshu', label: '用户总数', value: '36,000', percentage: '+88%', trendIcon: "TopRight", chartData: [10, 52, 200, 334, 390, 430, 520] },
  { icon: 'icon-wenzhang', label: '文章总数', value: '5670', percentage: '+12%', trendIcon: "TopRight", chartData: [5, 10, 16, 18, 24, 27, 30] },
  { icon: 'icon-tubiaozhizuomoban-', label: '近七天登录', value: '1260', percentage: '+5%', trendIcon: "TopRight", chartData: [12, 32, 21, 54, 33, 26, 44] },
  { icon: 'icon-xinzengyonghu', label: '近七天新增', value: '570', percentage: '-2%', trendIcon: "BottomRight", chartData: [8, 15, 17, 25, 20, 18, 24] },
]);
/* 用于存放echarts实例 */
const chartInstances: echarts.ECharts[] = [];

const renderChart = (chartEl: HTMLElement | null | undefined, data: number[]) => {
  const chart = echarts.init(chartEl);
  chart.setOption({
    xAxis: {
      show: false,
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      show: false,
      type: 'value',
    },
    series: [{
      data: data,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        // color: '#00aaff',
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 170, 255, 1)' },
          { offset: 0.5, color: 'rgba(0, 170, 255, 0.5)' },
          { offset: 1, color: 'rgba(0, 170, 255, 0)' }
        ]),
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 170, 255, 0.5)' },
          { offset: 1, color: 'rgba(0, 170, 255, 0)' }
        ]),
      },
    }],
    grid: {
      left: 0,
      right: 0,
      top: "10%",
      bottom: 0,
    },
  });
  return chart;
};
/* 设置 */
const setupCharts = () => {
  cards.forEach((card, index) => {
    const chartEl = document.getElementById(`chart-${index}`);
    if (chartEl) {
      const chartInstance = renderChart(chartEl, card.chartData);
      chartInstances.push(chartInstance);
    }
  });
};
/* 网站流量图 */
const flowCharts = () => {
  if (flowChart.value) {
    flowChartIns = echarts.init(flowChart.value);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
        },
        borderWidth: 1,
        textStyle: {
          color: '#333',
        },
        formatter: function (params: any) {
          const date = new Date(params[0].axisValue);
          const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}`;
          const traffic = params[0].data[1];
          return `${formattedDate}<br/>网站流量: ${traffic}`;
        },
      },
      grid: {
        top: "5%",
        left: 0,
        right: 0,
        bottom: '30%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        axisLine: {
          lineStyle: {
            color: 'rgba(51, 51, 51, 0.2)',
            width: 1,
            type: "solid",
          },
        },
        axisLabel: {
          color: '#666',
          formatter: function (value: any) {
            const date = new Date(value);
            return `${date.getFullYear()}-${date.getMonth() + 1}`;
          }
        },
        boundaryGap: ["10%", "10%"],
        splitLine: {
          show: true,
          lineStyle: {
            width: 0.3,
            color: 'rgba(101, 101, 101, 0.3)',
            type: 'solid',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(51, 51, 51, 0.3)',
            width: 1,
          },
        },
        axisLabel: {
          color: '#666',
          formatter: function (value: any) {
            return value >= 1000 ? (value / 1000) + 'k' : value;
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            width: 0.3,
            color: 'rgba(101, 101, 101, 0.3)',
            type: 'solid',
          },
        },
      },
      series: [
        {
          data: flowData,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
            color: 'rgba(0, 170, 255, 0.8)',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 170, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 170, 255, 0)' }
            ]),
          },
          itemStyle: {
            color: 'rgba(0, 170, 255, 1)',
            borderColor: 'rgba(0, 170, 255, 0.5)',
            borderWidth: 2,
          },
        },
      ],
    };


    flowChartIns.setOption(option);
  }
}
/* 用于接收到天气数据后渲染组件 */
onMounted(() => {
  setupCharts();
  getWeather();
  flowCharts();
});
onUnmounted(() => {
  /* 销毁echarts实例 */
  chartInstances.forEach(chart => {
    chart.dispose();
  });
  flowChartIns.dispose();
});
/* 获取当地天气 */
async function getWeather() {
  let req = await axios.get("https://restapi.amap.com/v3/weather/weatherInfo?city=440100&key=9e887ea2d26d9b862ae41c91d911e00f&extensions=base&output=JSON"
  )
  const { city, reporttime, temperature, weather } = req.data.lives[0];

  const wd: WeatherData = {
    city,
    reporttime,
    temperature,
    weather
  };
  Object.assign(weatherData, wd)
  loading.value = false; // 加载完成
}
// 定义 greet 方法
const greet = computed(() => {
  const hours = new Date().getHours();
  const name = authStore.userInfo.name;
  if (hours >= 5 && hours < 9) {
    return `早上好,${name},今天又是充满活力的一天!`;
  } else if (hours >= 9 && hours < 12) {
    return `上午好,${name},保持元气满满哦!`;
  } else if (hours >= 12 && hours < 14) {
    return `中午好,${name},记得吃午饭哦!`;
  } else if (hours >= 14 && hours < 18) {
    return `下午好,${name},今天的工作顺利吗?`;
  } else if (hours >= 18 && hours < 21) {
    return `傍晚好,${name},工作辛苦了,放松一下吧!`;
  } else if (hours >= 21 && hours < 23) {
    return `晚上好,${name},今天过得怎么样?`;
  } else {
    return `夜深了,${name},该休息了,晚安!`;
  }
});
const weatherIcon = computed(() => {
  const weather = weatherData.weather as keyof typeof weatherMap;
  const weatherMap = {
    '晴': 'Sunny',
    '多云': 'PartlyCloudy',
    '阴': 'MostlyCloudy',
    '大雨': 'Pouring',
    '小雨': 'Drizzling',
    '雨': 'Drizzling',
    '中雨': 'Pouring',
    '雪': 'Drizzling',
    '雷雨': 'Lightning'
  };
  return weatherMap[weather] || 'Sunny';
});

</script>

<template>
  <div class="welcome">
    <el-card shadow="hover">
      <div class="card-content">
        <p>{{ greet }}</p>
        <div v-if="!loading" class="weather-info">
          {{ weatherData.city }} - {{ weatherData.reporttime }} - {{ weatherData.temperature }}°C - {{
            weatherData.weather }}
          <el-icon>
            <component :is="weatherIcon" />
          </el-icon>
        </div>
      </div>
    </el-card>
  </div>
  <div class="data-preview">
    <el-card v-for="(card, index) in cards" :key="index" shadow="hover" :body-style="cardBodyStyle">
      <div class="card-header">
        <p>{{ card.label }}</p>
        <i :class="['iconfont', card.icon]"></i>
      </div>
      <div class="card-body">
        <div class="left-section">
          <p class="value">{{ card.value }}</p>
          <span class="percentage"
            :class="{ positive: card.percentage.includes('+'), negative: card.percentage.includes('-') }">{{
              card.percentage }} <el-icon>
              <component :is="card.trendIcon" />
            </el-icon></span>
        </div>
        <div class="right-section">
          <div :id="`chart-${index}`" class="mini-chart"></div>
        </div>
      </div>
    </el-card>
  </div>
  <div class="data-visual">
    <el-card class="Pro-Dependencies" shadow="hover">
      <el-scrollbar>
        <el-table :data="dependencies" stripe height="250" style="width: 100%">
          <el-table-column prop="name" label="依赖名称"></el-table-column>
          <el-table-column prop="version" label="版本"></el-table-column>
        </el-table>
      </el-scrollbar>

    </el-card>
    <el-card class="flow" shadow="hover">
      <template #header>网站流量</template>
      <div ref="flowChart" class="chart"></div>
    </el-card>
  </div>

</template>

<style lang="scss" scoped>

  /* 欢迎卡片 */
  .welcome {
    margin-bottom: 5px;
    background: white; // 使用渐变背景
    border-radius: 5px; // 圆角

    .el-card {
      position: relative;
      height: 250px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: url("/src/assets/img/welcome.png") no-repeat center center;
      background-size: contain;

      .card-content {
        position: absolute;
        left: 10px;
        top: 10px;
        padding: 10px;
        border-radius: 5px;

        p {
          font-size: 24px;
          font-weight: bold;
        }

        .weather-info {
          display: flex;
          align-items: center;
          font-size: 1em;
          margin-top: 10px;
        }

        .weather-info .el-icon {
          margin-left: 5px;
          font-size: 1.5em;
        }

      }
    }
  }

  /* 四个数据展示卡片 */
  .data-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 5px;
    width: 100%;

    .el-card {
      flex: 1 1 calc(25% - 4px);
      max-width: calc(25% - 4px);
      min-width: 200px;
      box-sizing: border-box;
      padding: 0;

      .card-header {
        display: flex;
        justify-content: space-between;
        width: 100%;

        p {
          font-weight: 700;
        }

        i.iconfont {
          margin-right: 5px;
          font-size: 25px;
          color: #00aaff;
          font-weight: 500;
        }
      }

      .card-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .left-section {
          flex: 1;
        }

        .right-section {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .value {
          font-size: 22px;
          font-weight: 300;
          margin: 10px 0;
        }

        .percentage {
          font-weight: 700;

          &.positive {
            color: rgb(34 197 94);
          }

          &.negative {
            color: #ff0000;
          }
        }

        .mini-chart {
          width: 100%;
          height: 50px;
          margin-top: 10px;
        }
      }
    }
  }

  .data-visual {
    display: flex;
    justify-content: space-between;
    gap: 5px;

    .el-card {
      height: 300px;
    }

    .Pro-Dependencies {
      width: 40%;
    }

    .flow {
      flex: 1;

      .chart {
        height: 300px;
        color: #000;
      }
    }

  }


</style>
