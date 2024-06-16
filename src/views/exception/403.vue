<template>
  <div class="not-found">
    <div class="content">
      <img src="@/assets/img/404.png" alt="404 Illustration" class="illustration">
      <div class="text">
        <h1>403</h1>
        <p>抱歉，你没有权限访问此页面</p>
        <router-link to="/" class="home-link">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
  .not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #e0f7fa, #80deea);
    text-align: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    max-width: 90%;

    .illustration {
      max-width: 400px;
      width: 100%;
      margin-bottom: 1rem;
    }
  }

  .text {
    margin-top: 1rem;
    width: 100%;

    h1 {
      font-size: 5rem;
      margin: 0;
      color: #007bff;
      /* Blue color */
      animation: textGlow 2s infinite alternate;
    }

    p {
      font-size: 1.5rem;
      color: #666;
    }
  }

  .home-link {
    display: inline-block;
    margin-top: 20px;
    padding: 0.4rem 1.2rem;
    color: #fff;
    background: #007bff;
    text-decoration: none;
    border: none;
    border-radius: 0.5rem;
    overflow: hidden;
    position: relative;
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);

    /* 初始阴影 */
    &:hover {
      background-color: rgba(3, 108, 222, 0.7);
    }
  }


</style>
