<script setup lang='ts'>
import * as echarts from 'echarts';
import {defineProps, onMounted, ref} from 'vue';

const props = defineProps<{ type: 'line' | 'bar' }>();

const chartRef = ref<HTMLDivElement | null>(null);

const getOption = (type: 'line' | 'bar') => {
  return {
    title: {
      text: type === 'line' ? '用户增长趋势' : '文章发布趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['January', 'February', 'March', 'April', 'May', 'June'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '数据',
        type: type,
        data: [65, 59, 80, 81, 56, 55],
        smooth: true,
        itemStyle: {
          color: '#3fb1e3',
        },
      },
    ],
  };
};

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value);
    const option = getOption(props.type);
    chart.setOption(option);
  }
});
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<style lang="scss" scoped>
/* 确保图表在父容器中正确展示 */
</style>
