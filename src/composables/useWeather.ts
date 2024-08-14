import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { type WeatherData } from "@/types";

export function useWeather() {
  const weatherData = reactive<WeatherData>({
    city: "",
    reporttime: "",
    temperature: "",
    weather: "",
  });
  const loading = ref(true);

  async function getWeather() {
    const req = await axios.get(
      "https://restapi.amap.com/v3/weather/weatherInfo?city=440100&key=9e887ea2d26d9b862ae41c91d911e00f&extensions=base&output=JSON"
    );
    const { city, reporttime, temperature, weather } = req.data.lives[0];
    Object.assign(weatherData, { city, reporttime, temperature, weather });
    loading.value = false;
  }

  onMounted(() => {
    getWeather();
  });

  return { weatherData, loading };
}
