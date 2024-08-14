<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { ElConfigProvider } from "element-plus";
// 引入中文包
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { useGreeting } from "@/composables/useGreeting";
import { useWeather } from "@/composables/useWeather";
import { useSmallCharts } from "@/composables/charts/useSmallCharts";
import { useBarCharts } from "@/composables/charts/useBarCharts";
import { useLineCharts } from "@/composables/charts/useLineCharts";
const { greet } = useGreeting();
const { weatherData, loading } = useWeather();
const { setBarCharts, disposeBarCharts } = useBarCharts();
const { setLineCharts, disposeLineCharts } = useLineCharts();
// 
function generateRandomData(length:number,scope:number):number[]{
  return Array.from({ length }, () => Math.floor(Math.random() * scope))
}
// 小卡片展示数据
const cards = reactive([
  {
    icon: "icon-yonghuzongshu",
    label: "用户总数",
    value: Math.floor(Math.random() * 1000) + 200,
    percentage: "+88%",
    trendIcon: "TopRight",
    chartData: generateRandomData(7, 1000),
  },
  {
    icon: "icon-wenzhang",
    label: "文章总数",
    value: Math.floor(Math.random() * 300) + 100,
    percentage: "+12%",
    trendIcon: "TopRight",
    chartData: generateRandomData(7, 1000),
  },
  {
    icon: "icon-tubiaozhizuomoban-",
    label: "新增文章",
    value: Math.floor(Math.random() * 50) + 50,
    percentage: "+5%",
    trendIcon: "TopRight",
    chartData: generateRandomData(7, 1000),
  },
  {
    icon: "icon-xinzengyonghu",
    label: "近七天注册",
    value: Math.floor(Math.random() * 100),
    percentage: "-2%",
    trendIcon: "BottomRight",
    chartData:  generateRandomData(7, 1000),
  },
]);
const { setSmallCharts, disposeSmallCharts } = useSmallCharts();

const weatherMap: { [key: string]: string } = {
  晴: "Sunny",
  多云: "PartlyCloudy",
  阴: "MostlyCloudy",
  雪: "Drizzling",
};

const weatherIcon = computed(() => {
  const weather = weatherData.weather;

  if (weather === "雷阵雨") {
    return "Lightning";
  }

  if (weather.includes("雨")) {
    return "Pouring";
  }
  return weatherMap[weather] || "Sunny";
});

/* 网站流量图 */
const flowData = reactive(
  Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3 + i); // 设置为当前月前3个月至后3个月
    return [date.toISOString().slice(0, 10), Math.floor(Math.random() * 1000)];
  })
);
const flowChartRef = ref();

/* 注册人员分布柱状图 */
const distributionChartRef = ref();
const BarChartXData = reactive([
  "北京",
  "上海",
  "广东",
  "江苏",
  "浙江",
  "吉林",
]);
const BarChartYData = reactive(
  generateRandomData(6, 1000),
);

// 日历的数据
const date = ref(new Date());

onMounted(() => {
  setSmallCharts(cards);
  setBarCharts(distributionChartRef, BarChartXData, BarChartYData);
  setLineCharts(flowChartRef, flowData);
});
onUnmounted(() => {
  /* 销毁echarts实例 */
  disposeSmallCharts();
  disposeLineCharts();
  disposeBarCharts();
});
</script>

<template>
  <div class="home">
    <div class="welcome mb-2 bg-white rounded">
      <el-card
        class="relative h-64 flex flex-col justify-center items-center bg-welcome-bg bg-center bg-contain bg-no-repeat"
        shadow="hover"
      >
        <div class="card-content absolute left-2.5 top-2.5 p-2.5 rounded">
          <p class="text-xl font-semibold">{{ greet }}</p>
          <div
            v-if="!loading"
            class="weather-info flex items-center mt-2.5 text-base"
          >
            {{ weatherData.city }} - {{ weatherData.reporttime }} -
            {{ weatherData.temperature }}°C - {{ weatherData.weather }}
            <el-icon class="ml-1 text-xl">
              <component :is="weatherIcon" />
            </el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <div class="data-preview flex flex-wrap gap-1 mb-2 w-full">
      <el-card
        v-for="(card, index) in cards"
        :key="index"
        shadow="hover"
        class="flex-1 max-w-1/4 min-w-50 box-border p-0"
      >
        <div class="card-header flex items-center justify-between w-full">
          <p class="font-bold">{{ card.label }}</p>
          <i
            :class="[
              'iconfont',
              card.icon,
              'mr-1 text-2xl text-sky-500 font-medium',
            ]"
          ></i>
        </div>
        <div class="card-body flex justify-between items-center w-full">
          <div class="left-section flex-1">
            <p class="value text-lg font-light my-2.5">
              <el-statistic :value="card.value" />
            </p>
            <span
              class="flex items-center percentage font-bold"
              :class="{
                'text-green-500': card.percentage.includes('+'),
                'text-red-500': card.percentage.includes('-'),
              }"
            >
              {{ card.percentage }}
              <el-icon class="inline ml-1.5">
                <component :is="card.trendIcon" />
              </el-icon>
            </span>
          </div>
          <div class="right-section flex-1 flex justify-end items-center">
            <div
              :id="`chart-${index}`"
              class="mini-chart w-full h-12 mt-2.5"
            ></div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="data-visual flex w-full gap-1">
      <div class="visual-left w-1/2 h-full flex flex-col gap-2">
        <el-card class="flow w-full h-64" shadow="hover">
          <template #header>网站流量</template>
          <div ref="flowChartRef" class="chart h-56 text-black"></div>
        </el-card>
        <el-card
          class="register-distribution flex-1 h-60 w-full"
          shadow="hover"
        >
          <template #header>注册人员分布前六地区</template>
          <div ref="distributionChartRef" class="chart h-52 text-black"></div>
        </el-card>
      </div>
      <el-config-provider :locale="zhCn">
        <el-calendar
          v-model="date"
          ref="calendar"
          class="calendar-date w-1/2 h-full"
        >
          <template #date-cell="{ data }">
            <p :class="data.isSelected ? 'is-selected' : ''">
              {{ data.day.split("-").slice(1).join("-") }}
              {{ data.isSelected ? "✔️" : "" }}
              {{
                data.day.split("-").slice(1).join("-") === "10-27" ? "🎂" : ""
              }}
            </p>
          </template>
        </el-calendar>
      </el-config-provider>
    </div>
  </div>
</template>

<style scoped></style>
