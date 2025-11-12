#!/bin/bash

echo "🔍 診斷 SSG 生成問題..."

cd /Users/kyle/leaf

# 檢查 API 路由生成
echo "📋 檢查路由生成..."
node -e "
import('file:///Users/kyle/leaf/packages/core/dist/src/utils/routes.js').then(m => {
  return m.generateRoutes('/Users/kyle/leaf/docs');
}).then(routes => {
  console.log('總路由數:', routes.length);
  const apiRoute = routes.find(r => r.path === '/api');
  if (apiRoute) {
    console.log('/api 路由找到:', apiRoute);
    console.log('映射到文件:', apiRoute.component);

    // 檢查文件是否存在
    const fs = require('fs');
    const exists = fs.existsSync(apiRoute.component);
    console.log('文件存在:', exists);

    if (exists) {
      const content = fs.readFileSync(apiRoute.component, 'utf-8');
      console.log('文件前100字元:', content.substring(0, 100));
      console.log('文件包含API:', content.toLowerCase().includes('api'));
    }
  } else {
    console.log('❌ /api 路由未找到!');
    console.log('所有路由:');
    routes.forEach(r => console.log('  ', r.path, '->', r.component));
  }
}).catch(console.error);
"

echo "✅ 路由檢查完成"