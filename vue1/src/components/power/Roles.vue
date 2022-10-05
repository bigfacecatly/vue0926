<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="[ 'vcenter', 'bdbottom', i1 === 0 ? 'bdtop' : '' ]" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <el-col :span="5">
                <el-tag v-if="item1.children && item1.children.length !== 0">{{ item1.authName }}</el-tag>
                <el-tag v-else closable @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
                <i v-if="item1.children && item1.children.length !== 0" class="el-icon-right"></i>
              </el-col>
              <!-- 二级权限渲染 -->
              <el-col :span="19">
                <el-row :class="[ 'vcenter', i2 === 0 ? '' : 'bdtop' ]" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag  type="success"  v-if="item2.children && item2.children.length !== 0">{{ item2.authName }}</el-tag>
                    <el-tag  type="success"  v-else closable @close="removeRightById(scope.row,item2.id)">{{ item2.authName }}</el-tag>
                    <i v-if="item2.children && item2.children.length !== 0" class="el-icon-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag @close="removeRightById(scope.row,item3.id)" closable v-for="(item3, i3) in item2.children" :key="i3" type="warning">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- {{scope.row.id}}-->
            <el-button @click="showEditRolesDialog(scope.row.id)" type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button @click="deleteRoles(scope.row.id)" type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button @click="showSetRightDialog(scope.row)" type="warning" icon="el-icon-setting" size="mini">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDg" width="70%" @close="rolesDialogClosed">
      <el-form :model="addFormRole" :rule="addFormRoleRules" ref="addFormRoleRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addFormRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addFormRole.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDg = false">取消</el-button>
        <el-button type="primary" @click="addFormRoleInfo">确定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog title="编辑角色" :visible.sync="showEditRolesDg" width="70%" @close="rolesDgClosed">
      <el-form :model="editRoles" :rules="editRolesRules" ref="editRolesRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色说明" prop="roleDesc">
          <el-input v-model="editRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditRolesDg = false">取消</el-button>
        <el-button @click="showEditRolesDgInfo" type="primary">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!--  树形控件 -->
      <el-tree :default-checked-keys="defKeys" node-key="id" default-expand-all :data="rightslist" :props="treeProps" show-checkbox></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="setRightDialogVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 获取角色列表数据
      roleList: [],
      addRoleDg: false,
      addFormRole: {},
      addFormRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在2~15个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述内容', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2～20个字符', trigger: 'blur' }
        ]
      },
      showEditRolesDg: false,
      editRoles: {},
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在2～15个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述内容', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2~20个字符', trigger: 'blur' }
        ]
      },
      setRightDialogVisible: false,
      rightslist: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
    },
    // 添加角色对话框
    addRoleDialog () {
      this.addRoleDg = true
    },
    rolesDialogClosed () {
      this.$refs.addFormRoleRef.resetFields()
    },
    // 添加角色数据
    addFormRoleInfo () {
      this.$refs.addFormRoleRef.validate(async valite => {
        if (!valite) return
        const { data: res } = await this.$http.post('roles', this.addFormRole)
        if (res.meta.status !== 201) return this.$message.error('角色添加失败!')
        this.addRoleDg = false
        this.getRolesList()
        this.$message.success('角色添加成功')
      })
    },
    // 编辑角色
    async showEditRolesDialog (id) {
      const { data: res } = await this.$http.get('roles/find/' + id)
      this.showEditRolesDg = true
      this.editRoles = res.data
    },
    rolesDgClosed () {
      this.$refs.editRolesRef.resetFields()
    },
    // 提交编辑数据
    showEditRolesDgInfo () {
      this.$refs.editRolesRef.validate(async valite => {
        if (!valite) return
        const { data: res } = await this.$http.put('roles', this.editRoles)
        if (res.meta.status !== 200) return this.$message.error('角色数据更新失败！')
        this.showEditRolesDg = false
        this.getRolesList()
        this.$message.success('角色数据更新成功')
      })
    },
    // 删除角色
    async deleteRoles (id) {
      const Result = await this.$confirm('此操作将删除该角色,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (Result !== 'confirm') return this.$message.info('已经取消删除')
      const { data: res } = await this.$http.delete('roles/find/' + id)
      if (res.meta.status !== 200) return this.$message.error('角色删除失败')
      this.getRolesList()
      this.$message.success('角色删除成功！')
    },
    // 根据ID删除对应权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      role.children = res.data
      this.$message.success('删除权限成功')
    },
    // 展示分配
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败!')
      this.rightslist = res.data
      // 递归获取三级节点ID
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式获取角色下所有三级权限的ID，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 提交分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配角色数据失败！')
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
