// =====================================================
// 社員一覧（第3段：別サービス「社員マスタAPI」を呼んで表示する）
// 認証方式は config.API_AUTH_MODE で切り替わる（none / apikey / jwt）
// =====================================================
const express = require('express');
const config = require('../config');
const { requireLogin } = require('../auth/middleware');
const employeeApi = require('../lib/employeeApi');

const router = express.Router();

router.get('/', requireLogin, async (req, res) => {
  let employees = [];
  let error = null;
  try {
    employees = await employeeApi.listEmployees();
  } catch (e) {
    error = e.message;
  }
  res.render('employees', { title: '社員一覧（API連携）', employees, error, mode: config.API_AUTH_MODE, apiBase: config.API_BASE_URL });
});

module.exports = router;
