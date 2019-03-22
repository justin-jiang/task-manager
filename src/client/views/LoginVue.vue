<template>
  <div
    class="div-body"
    v-loading="isSubmitting"
    element-loading-text="申请邮件发送中，请稍后"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <!-- Login Div -->
    <el-row
      v-if="isLogin"
      class="row-login"
    >
      <el-col :span="24">
        <el-row class="row-title">
          <el-col
            :span=24
            class="col-title"
          >
            账号密码登录
          </el-col>
        </el-row>
        <el-row class="row-form">
          <el-col
            :span=24
            class="col-form"
          >
            <el-form
              :model="loginFormDatas"
              status-icon
              :rules="loginFormRules"
              :ref="loginFormRefName"
              label-width="55px"
              label-position="left"
            >
              <el-form-item
                label="账号"
                prop="name"
              >
                <el-input v-model="loginFormDatas.name"></el-input>
              </el-form-item>

              <el-form-item
                label="密码"
                prop="password"
              >
                <el-input
                  type="password"
                  v-model="loginFormDatas.password"
                  @keyup.enter.native="submitForm()"
                ></el-input>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row class="row-password-register">
          <el-col :span=12>
            <el-button
              type="text"
              size="mini"
              @click="resetPassword()"
            >忘记密码</el-button>
          </el-col>
          <el-col :span=12>
            <el-button
              type="text"
              size="mini"
              @click="switchToRegister()"
            >注册新账户</el-button>
          </el-col>
        </el-row>
        <el-row class="row-login-button">
          <el-col>
            <el-button
              type="primary"
              size="mini"
              style="width:210px"
              @click="login()"
            >登录</el-button>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- Register Div -->
    <el-row
      v-else
      class="row-register"
    >
      <el-col :span="24">
        <el-row class="row-title">
          <el-col
            :span=24
            class="col-title"
          >
            账号注册
          </el-col>
        </el-row>
        <el-row class="row-radio-group">
          <el-col
            :span=24
            class="col-radio-group"
          >
            <el-radio-group v-model="registerType">
              <el-radio :label="LABEL_PUBLISHER">我要雇人办事</el-radio>
              <el-radio :label="LABEL_EXECUTOR">我要入驻赚钱</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
        <el-row class="row-protocol">
          <el-col :span=24>
            <el-button
              type="text"
              size="mini"
              style="margin-left:45px;"
              @click="downloadProtocol()"
            >尽调网服务协议</el-button>
          </el-col>
        </el-row>
        <el-row class="row-register-button">
          <el-col :span=24>
            <el-button
              type="primary"
              size="mini"
              style="width:210px"
              @click="register()"
            >同意协议并注册</el-button>
          </el-col>
        </el-row>
        <el-row class="row-switch-to-login">
          <el-col :span=24>已有账号？
            <el-button
              type="text"
              style="width:40px"
              @click="switchToLogin()"
            >登录</el-button>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <el-row class="row-footer">
      <el-col
        class="col-bottom"
        :span="24"
        style="width:100%;"
      >
        <img
          class="img-footer"
          src="../assets/login_bottom.png"
        />
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { LoginTS } from "./LoginTS";
export default class RegisterVue extends LoginTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
@loginFormWidth: 350px;
.div-body {
  background-image: url("~@/client/assets/login_background.png");
  height: 528px;
  .row-login {
    float: right;
    width: @loginFormWidth;
    height: 100%;

    .row-title {
      margin-top: 100px;
      margin-right: 50px;
      background: white;
      .col-title {
        margin-top: 10px;
        font-size: 20px;
        font-weight: 800;
      }
    }
    .row-form {
      margin-right: 50px;
      background: white;
      .col-form {
        margin-top: 10px;
        .el-form {
          .el-form-item {
            width: 90%;
            margin-left: 10px;
          }
        }
      }
    }
    .row-password-register {
      margin-right: 50px;
      background: white;
    }
    .row-login-button {
      margin-right: 50px;
      background: white;
      padding-bottom: 20px;
    }
  }

  .row-register {
    float: right;
    width: @loginFormWidth;
    height: 100%;
    .row-title {
      margin-top: 100px;
      margin-right: 50px;
      background: white;
      .col-title {
        margin-top: 10px;
        font-size: 20px;
        font-weight: 800;
      }
    }
    .row-radio-group {
      margin-right: 50px;
      background: white;
      padding-bottom: 10px;
      .col-radio-group {
        margin-top: 10px;
      }
    }
    .row-protocol {
      margin-right: 50px;
      background: white;
      text-align: left;
    }
    .row-register-button {
      margin-right: 50px;
      background: white;
    }
    .row-switch-to-login {
      margin-right: 50px;
      background: white;
      font-size: 13px;
      padding-bottom: 20px;
    }
  }

  .row-footer {
    z-index: -1;
    .img-footer {
      width: 100%;
    }
  }
}
</style>
