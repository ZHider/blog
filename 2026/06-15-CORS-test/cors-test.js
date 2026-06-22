// CORS 检测工具核心逻辑

/**
 * 检测 CORS 支持情况
 * @param {string} url - 目标 URL
 * @param {object} options - 配置选项
 * @returns {Promise<object>} 检测结果
 */
async function detectCORS(url, options = {}) {
  const {
    method = 'HEAD',
    forcePreflight = false,
    timeout = 5000
  } = options;

  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // 构建请求头
  const headers = new Headers();
  
  // 如果强制预检，添加自定义头使请求变为"非简单请求"
  if (forcePreflight) {
    headers.append('X-CORS-Test', 'true');
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // 请求成功，解析响应头
    const corsHeaders = {};
    const allHeaders = {};

    // 迭代所有响应头
    response.headers.forEach((value, key) => {
      allHeaders[key] = value;
      
      // 提取 CORS 相关头
      if (key.toLowerCase().startsWith('access-control-')) {
        corsHeaders[key] = value;
      }
    });

    // 尝试读取响应体（仅对 GET 请求）
    let responseBody = null;
    if (method === 'GET') {
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && (contentType.includes('text/') || contentType.includes('application/json'))) {
          responseBody = await response.text();
        }
      } catch (e) {
        responseBody = '(无法读取响应体)';
      }
    }

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      corsHeaders: corsHeaders,
      allHeaders: allHeaders,
      responseBody: responseBody,
      error: null
    };

  } catch (error) {
    clearTimeout(timeoutId);

    // 分析错误类型
    let errorType = 'unknown';
    let errorMessage = error.message || '未知错误';
    let errorName = error.name || 'Error';

    if (error.name === 'AbortError') {
      errorType = 'timeout';
      errorMessage = `请求超时（${timeout}ms）`;
    } else if (error.message && error.message.includes('Failed to fetch')) {
      errorType = 'cors_or_network';
      errorMessage = '请求被阻止（可能是 CORS 策略阻止或网络错误）';
    } else if (error.message && error.message.includes('NetworkError')) {
      errorType = 'network';
      errorMessage = '网络错误（DNS 失败、连接拒绝等）';
    } else if (error.message && error.message.includes('CORS')) {
      errorType = 'cors';
      errorMessage = 'CORS 策略阻止';
    }

    return {
      success: false,
      status: null,
      statusText: null,
      corsHeaders: {},
      allHeaders: {},
      responseBody: null,
      error: {
        type: errorType,
        name: errorName,
        message: errorMessage,
        originalMessage: error.message
      }
    };
  }
}

/**
 * 隐藏所有结果区域
 */
function hideAllResultElements() {
  const resultSection = document.getElementById('resultSection');
  const simpleAlert = document.getElementById('simpleAlert');
  
  if (resultSection) {
    resultSection.style.display = 'none';
    // 隐藏所有子元素
  }
  
  if (simpleAlert) {
    simpleAlert.style.display = 'none';
  }
}

/**
 * 显示简单提示消息
 */
function showAlert(message, type = 'info') {
  hideAllResultElements();
  
  const simpleAlert = document.getElementById('simpleAlert');
  const alertDiv = simpleAlert.querySelector('.alert');
  
  // 清除旧的 alert 类
  alertDiv.className = 'alert alert-' + type;
  alertDiv.textContent = message;
  
  simpleAlert.style.display = 'block';
}

/**
 * 填充响应头条目
 */
function fillHeaderItems(container, headers) {
  const templateDiv = document.getElementById('headerItemTmpl');
  
  for (const [key, value] of Object.entries(headers)) {
    // 克隆模板内容
    const clone = templateDiv.querySelector('.header-item').cloneNode(true);
    const nameSpan = clone.querySelector('.header-name');
    const valueSpan = clone.querySelector('.header-value');
    
    nameSpan.textContent = key + ':';
    valueSpan.textContent = value || '(空)';
    
    container.appendChild(clone);
  }
}

/**
 * 显示检测结果
 */
function displayResult(result) {
  hideAllResultElements();
  
  const resultSection = document.getElementById('resultSection');
  const loadingAlert = document.getElementById('loadingAlert');
  const successAlert = document.getElementById('successAlert');
  const httpStatusCard = document.getElementById('httpStatusCard');
  const corsHeadersCard = document.getElementById('corsHeadersCard');
  const noCorsHeadersAlert = document.getElementById('noCorsHeadersAlert');
  const allHeadersCard = document.getElementById('allHeadersCard');
  const responseBodyCard = document.getElementById('responseBodyCard');
  const errorDetail = document.getElementById('errorDetail');
  const debugSuggest = document.getElementById('debugSuggest');
  
  resultSection.style.display = 'block';
  
  if (result.success) {
    // 显示加载提示（已完成，隐藏）
    loadingAlert.style.display = 'none';
    
    // 显示成功提示
    successAlert.style.display = 'block';
    
    // 显示 HTTP 状态卡片
    httpStatusCard.querySelector('[data-ref="statusText"]').textContent = 
      result.status + ' ' + result.statusText;
    httpStatusCard.style.display = 'block';
    
    // CORS 相关头
    if (Object.keys(result.corsHeaders).length > 0) {
      const body = corsHeadersCard.querySelector('[data-ref="body"]');
      body.innerHTML = ''; // 清空
      fillHeaderItems(body, result.corsHeaders);
      corsHeadersCard.style.display = 'block';
    } else {
      // 显示无 CORS 头警告
      noCorsHeadersAlert.style.display = 'block';
    }
    
    // 所有响应头
    const allHeadersBody = allHeadersCard.querySelector('[data-ref="body"]');
    allHeadersBody.innerHTML = ''; // 清空
    fillHeaderItems(allHeadersBody, result.allHeaders);
    allHeadersCard.style.display = 'block';
    
    // 响应体（如果有）
    if (result.responseBody) {
      const code = responseBodyCard.querySelector('.hljs.HTML');
      const gutter = responseBodyCard.querySelector('.gutter pre');

      let gutterHtml = "";
      let linesNum = String(result.responseBody).match(/\n/g).length;
      for (let i = 1; i < linesNum; i++) {
        gutterHtml += `<span class="line">${i}</span><br>`;
      }
      gutter.innerHTML = gutterHtml;
      
      code.textContent = result.responseBody;
      hljs.highlightElement(code);
      
      responseBodyCard.style.display = 'block';
    }
    
  } else {
    // 失败情况
    // 隐藏加载提示
    loadingAlert.style.display = 'none';
    
    // 根据错误类型显示对应内容
    const errorType = result.error.type;
    const errorContent = errorDetail.querySelector('[data-ref="errorContent"]');
    const errorTypeDivs = errorContent.querySelectorAll('[data-error-type]');
    
    for (let i = 0; i < errorTypeDivs.length; i++) {
      const div = errorTypeDivs[i];
      if (div.getAttribute('data-error-type') === errorType) {
        div.style.display = 'block';
      } else {
        div.style.display = 'none';
      }
    }
    
    // 填充错误信息
    errorDetail.querySelector('[data-ref="errorName"]').textContent = result.error.name;
    errorDetail.querySelector('[data-ref="errorMessage"]').textContent = result.error.message;
    errorDetail.querySelector('[data-ref="errorOriginal"]').textContent = 
      result.error.originalMessage || '(无)';
    
    errorDetail.style.display = 'block';
    
    // 显示调试建议
    debugSuggest.style.display = 'block';
  }
}

/**
 * 执行 CORS 检测并更新 UI
 */
async function performCORSTest() {
  const urlInput = document.getElementById('targetUrl');
  const methodSelect = document.getElementById('requestMethod');
  const forcePreflightCheckbox = document.getElementById('forcePreflight');
  const testBtn = document.getElementById('testBtn');

  const url = urlInput.value.trim();
  
  // 验证 URL
  if (!url) {
    showAlert('请输入目标 URL', 'warning');
    return;
  }

  try {
    new URL(url);
  } catch (e) {
    showAlert('请输入有效的 URL（例如：https://api.example.com/data）', 'warning');
    return;
  }

  // 禁用按钮，显示加载状态
  testBtn.disabled = true;
  testBtn.textContent = '检测中...';
  
  hideAllResultElements();
  const resultSection = document.getElementById('resultSection');
  const loadingAlert = document.getElementById('loadingAlert');
  
  if (resultSection) {
    resultSection.style.display = 'block';
  }
  if (loadingAlert) {
    loadingAlert.style.display = 'block';
  }

  const options = {
    method: methodSelect.value,
    forcePreflight: forcePreflightCheckbox.checked,
    timeout: 5000
  };

  const result = await detectCORS(url, options);

  // 恢复按钮状态
  testBtn.disabled = false;
  testBtn.textContent = '检测 CORS';

  // 显示结果
  displayResult(result);
}

// 初始化函数
function initCORSTest() {
  const testBtn = document.getElementById('testBtn');
  const urlInput = document.getElementById('targetUrl');
  
  if (testBtn) {
    testBtn.addEventListener('click', performCORSTest);
  }
  
  // 支持回车键触发检测
  if (urlInput) {
    urlInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performCORSTest();
      }
    });
  }
}

// 在 DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCORSTest);
} else {
  initCORSTest();
}
