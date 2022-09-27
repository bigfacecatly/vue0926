<template>
  <div>
    <el-container>
      <el-header>
        <div>
          <img src="../assets/logo.png" width="45px" height="45px" alt="">
          <span>平台练习</span>
        </div>
        <div>
          <el-button type="info" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse?'64px': '200px'">
          <div class="toggle-button" @click="toggleCollapse" align="center">
            <div v-if="isCollapse">|||</div>
            <div v-else>≡</div>
          </div>
          <!-- 左侧菜单 -->
            <el-menu
              :default-active="activePath"
              :router="true"
              :collapse-transition="false"
              :collapse="isCollapse"
              :unique-opened="true"
              background-color="#333744"
              text-color="#fff"
              active-text-color="#ffd04b"
              >
              <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                <template slot="title">
                  <i :class="iconsObj[item.id]"></i>
                  <span>{{ item.authName }}</span>
                </template>
                <!-- 二级菜单 -->
                <el-menu-item @click="saveNavState('/' + subItem.path)"
                  :index="'/' + subItem.path + ''" v-for="subItem in item.children" :key="subItem.id">
                  <i class="el-icon-menu"></i>
                  <span slot="title">{{ subItem.authName }}</span>
                </el-menu-item>
              </el-submenu>
            </el-menu>
        </el-aside>
        <el-container>
          <el-main>
            <!-- 路由重定向 -->
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj: {
        1: 'iconfont icon-kehu',
        2: 'iconfont icon--shangpinguanli1',
        3: 'iconfont icon-daizi-',
        4: 'iconfont icon-wodedingdan',
        5: 'iconfont icon-ico_bb_zj_zzt'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error('res.meta.msg')
      this.menuList = res.data
      // console.log(res.data)
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 点击高亮
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>
<style lang="less" scoped>
  .el-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 20px;
    font-size: 20px;
    color: white;
    div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
    img {
      border-radius: 50%;
    }
  }
  .el-aside {
    background-color: #333744;
  }
  .el-main {
    background-color: #eaedf1;
  }
  .iconfont {
    margin-right: 10px;
  }
  .el-menu {
    border-right: 0px;
  }
</style>
