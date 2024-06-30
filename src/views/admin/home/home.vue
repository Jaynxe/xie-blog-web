<script setup lang='ts'>
import { reactive, onMounted } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { type WeatherData } from '@/types/define'
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
// 引入图表组件
echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer, TitleComponent]);

const authStore = useAuthStore();
// 卡片主体样式
/* 定义天气部分的属性 */
const date = ref(new Date())
let weatherData = reactive<WeatherData>({
  city: '',
  reporttime: '',
  temperature: '',
  weather: ''
})//天气数据
let loading = ref(true); // 用于加载天气
// 获取当地天气
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
// 展示的天气图标
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
    '雷阵雨': 'Lightning',
    '中雨-大雨':'Pouring'
  };
  return weatherMap[weather] || 'Sunny';
});

/* 小卡片展示部分 */
// 小卡片展示数据
const cards = reactive([
  { icon: 'icon-yonghuzongshu', label: '用户总数', value: 36000, percentage: '+88%', trendIcon: "TopRight", chartData: [10, 52, 200, 334, 390, 430, 520] },
  { icon: 'icon-wenzhang', label: '文章总数', value: 5670, percentage: '+12%', trendIcon: "TopRight", chartData: [5, 10, 16, 18, 24, 27, 30] },
  { icon: 'icon-tubiaozhizuomoban-', label: '近七天登录', value: 1260, percentage: '+5%', trendIcon: "TopRight", chartData: [12, 32, 21, 54, 33, 26, 44] },
  { icon: 'icon-xinzengyonghu', label: '近七天注册', value: 570, percentage: '-2%', trendIcon: "BottomRight", chartData: [8, 15, 17, 25, 20, 18, 24] },
]);

/* 用于存放小图echarts实例 */
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
/* 设置每一个小图 */
const setupCharts = () => {
  cards.forEach((card, index) => {
    const chartEl = document.getElementById(`chart-${index}`);
    if (chartEl) {
      const chartInstance = renderChart(chartEl, card.chartData);
      chartInstances.push(chartInstance);
    }
  });
};
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

/* 网站流量图 */
// 网站流量数据
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

/* 注册人员分布柱状图 */
let distributionChart = ref()
let registerChartIns: echarts.EChartsType
const registerCharts = () => {
  if (distributionChart.value) {
    registerChartIns = echarts.init(distributionChart.value);
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
      },
      grid: {
        top: '5%',
        left: '3%',
        right: '4%',
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ['北京', '上海', '广东', '江苏', '浙江', '吉林'],
        boundaryGap: ["10%", "10%"],
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            width: 0.3,
            color: 'rgba(101, 101, 101, 0.5)',
            type: 'solid',
          },
        },
      },
      series: [
        {
          data: [565, 325, 557, 346, 977, 122],
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00aaff' },
              { offset: 1, color: 'rgba(0, 170, 255, 0.1)' },
            ]),
          },
          barWidth: '40%',
        },
      ],
    };

    registerChartIns.setOption(option);
  }
};

/* 用于接收到天气数据后渲染组件 */
onMounted(() => {
  setupCharts();
  getWeather();
  flowCharts();
  registerCharts();
});
onUnmounted(() => {
  /* 销毁echarts实例 */
  chartInstances.forEach(chart => {
    chart.dispose();
  });
  flowChartIns.dispose();
  registerChartIns.dispose();
});

</script>

<template>
  <div class="welcome mb-1 bg-white rounded">
    <el-card class="relative h-64 flex flex-col justify-center items-center bg-welcome-bg bg-center bg-contain bg-no-repeat" shadow="hover">
      <div class="card-content absolute left-2.5 top-2.5 p-2.5 rounded">
        <p class="text-xl font-semibold">{{ greet }}</p>
        <div v-if="!loading" class="weather-info flex items-center mt-2.5 text-base">
          {{ weatherData.city }} - {{ weatherData.reporttime }} - {{ weatherData.temperature }}°C - {{
            weatherData.weather }}
          <el-icon class="ml-1 text-xl">
            <component :is="weatherIcon" />
          </el-icon>
        </div>
      </div>
    </el-card>
  </div>

  <div class="data-preview flex flex-wrap gap-1 mb-1 w-full">
    <el-card v-for="(card, index) in cards" :key="index" shadow="hover" class="flex-1 max-w-1/4 min-w-50 box-border p-0">
      <div class="card-header flex items-center justify-between w-full">
        <p class="font-bold">{{ card.label }}</p>
        <i :class="['iconfont', card.icon, 'mr-1 text-2xl text-sky-500 font-medium']"></i>
      </div>
      <div class="card-body flex justify-between items-center w-full">
        <div class="left-section flex-1">
          <p class="value text-lg font-light my-2.5"><el-statistic :value="card.value" /></p>
          <span class="flex items-center percentage font-bold" :class="{ 'text-green-500': card.percentage.includes('+'), 'text-red-500': card.percentage.includes('-') }">
            {{ card.percentage }}
            <el-icon class="inline ml-1.5">
              <component :is="card.trendIcon" />
            </el-icon>
          </span>
        </div>
        <div class="right-section flex-1 flex justify-end items-center">
          <div :id="`chart-${index}`" class="mini-chart w-full h-12 mt-2.5"></div>
        </div>
      </div>
    </el-card>
  </div>

  <div class="data-visual flex w-full h-160 gap-1 ">
    <div class="visual-left w-1/2 flex flex-col gap-1">
      <el-card class="flow w-full h-80" shadow="hover">
        <template #header>网站流量</template>
        <div ref="flowChart" class="chart h-80 text-black"></div>
      </el-card>
      <el-card class="register-distribution flex-1 h-56 w-full" shadow="hover">
        <template #header>注册人员分布前六地区</template>
        <div ref="distributionChart" class="chart h-56 text-black"></div>
      </el-card>
    </div>
    <el-calendar v-model="date" ref="calendar" class="calendar-date w-1/2 h-full border border-gray-200 rounded">
      <template #date-cell="{ data }">
        <p :class="data.isSelected ? 'is-selected' : ''">
          {{ data.day.split('-').slice(1).join('-') }}
          {{ data.isSelected ? '✔️' : '' }}
          {{ data.day.split('-').slice(1).join('-') === "10-27" ? '🎂' : '' }}
        </p>
      </template>
    </el-calendar>
  </div>
</template>

<style scoped>
/* 去除 scoped 样式，改用 Tailwind CSS */
</style>
