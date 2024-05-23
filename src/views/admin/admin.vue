<template>
    <div class="gvb-admin">
        <aside>
            <div><span class="iconfont icon-caidan"></span></div>
        </aside>
        <div class="main">
            <header></header>
            <div class="tabs"></div>
            <main></main>
        </div>

    </div>
</template>

<script setup lang='ts'>

</script>

<style lang="scss">
    .gvb-admin {
        width: 100%;
        display: flex;
        aside{  
            width: 240px;
            height: 100vh;
            background-color: #2b3539;
        }
        .main {
            width: calc(100% - 240px);
            height: 100vh;
            overflow-y: auto;
            background-color: var(--bg);
            overflow-x: hidden;

            header {
                height: 60px;
                background-color: white;
            }
            .tabs{
                height: 30px;
                border: 1px solid #f0eeee;
            }
            main{
                background-color: #f0eeee;
                height: calc(100vh - 90px);
            }
        }
    }
</style>