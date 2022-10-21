<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table class="treeTable" :show-row-hover="false" border index-text="#"
                  :columns="columns" :selection-type="false" :expand-type="false"
                  :show-index="true"
                  :data="catelist.slice((queryInfo.pagenum-1)*queryInfo.pagesize,queryInfo.pagenum*queryInfo.pagesize)">
        <template slot="isok" slot-scope="scope">
          <i v-if="scope.row.cate_delete===false" class="el-icon-success" style="color: lightgreen"></i>
          <i v-else class="el-icon-error" style="color: lightgreen"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cate_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cate_level === 1">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 3, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible"
      width="70%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cate_name">
          <el-input v-model="addCateForm.cate_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" prop="">
          <el-cascader
            change-on-select
            :checkStrictly="true"
            :clearable="true"
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 2
      },
      catelist: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cate_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cate_name: '',
        cate_pid: 0,
        cate_level: 0
      },
      addCateFormRules: {
        cate_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      cascaderProps: {
        value: 'cate_id',
        label: 'cate_name',
        children: 'children'
      },
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.catelist = res.data.result
      this.total = res.data.total
      console.log(this.catelist)
    },
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败')
      this.parentCateList = res.data
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    parentCateChanged () {
      console.log(this.selectedKeys, 1111)
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cate_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cate_level = this.selectedKeys.length
      } else {
        this.addCateForm.cate_pid = 0
        this.addCateForm.cate_level = 0
      }
    },
    addCate () {
      console.log(this.addCateForm, '添加新分类')
      this.$refs.addCateFormRef.validate(
        async valid => {
          if (!valid) return false
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) return this.$message.error('添加分类失败!')
          this.$message.success('添加分类成功!')
          this.getCateList()
          this.addCateDialogVisible = false
        }
      )
    },
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cate_pid = 0
      this.addCateForm.cate_level = 0
      this.selectedKeys = []
    }
  }
}
</script>
<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%
  }
</style>
