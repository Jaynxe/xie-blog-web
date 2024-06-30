<script lang="ts" setup>
import loginCom from "@/components/auth/loginCom.vue"
</script>

<template>
  <div>
    <loginCom />
  </div>
  <div class="footer">
    <el-link href="https://beian.miit.gov.cn/" target="_blank" type="default" class="footerLink">
     <img src="/src/assets/img/beian.png" alt="备案图片"> <span>粤ICP备2024184954号-1</span>
    </el-link>
  </div>
</template>

<style lang="scss" scoped>
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px 0;
    text-align: center;
    img{
      height: 16px;
      margin-right: 5px;
    }
  }

  .footerLink {
    font-size: medium;
  }
</style>