var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CorsTester {
    constructor() {
        this.targetUrlInput = document.getElementById("target-url");
        this.testCorsBtn = document.getElementById("test-cors-btn");
        this.resultContent = document.getElementById("result-content");
        this.initEventListeners();
    }
    initEventListeners() {
        this.testCorsBtn.addEventListener("click", () => this.handleCorsTest());
        this.targetUrlInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter")
                this.handleCorsTest();
        });
    }
    handleCorsTest() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.targetUrlInput.value.trim();
            if (!url) {
                alert("请输入一个有效的URL");
                return;
            }
            if (!this.isValidUrl(url)) {
                alert("请输入一个有效的URL格式（例如：https://example.com）");
                return;
            }
            this.showLoading();
            try {
                const response = yield fetch(url);
                const headers = {};
                for (const [key, value] of response.headers.entries()) {
                    headers[key] = value;
                }
                const result = {
                    status: response.status,
                    statusText: response.statusText,
                    headers
                };
                this.displayResult(result);
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    showLoading() {
        this.resultContent.style.display = 'block';
        this.resultContent.innerHTML = "<p>正在检测CORS配置...</p>";
    }
    displayResult(result) {
        this.resultContent.style.display = 'block';
        const corsHeaders = Object.keys(result.headers).filter(header => header.toLowerCase().includes("access-control"));
        const corsHeadersHtml = corsHeaders.length > 0
            ? `
        <div class="cors-headers">
          <h4>CORS相关头部:</h4>
          <ul>
            ${corsHeaders.map(header => `<li><strong>${header}:</strong> ${result.headers[header]}</li>`).join('')}
          </ul>
        </div>`
            : '<p><em>未发现CORS相关头部</em></p>';
        const allHeadersHtml = `
      <div class="all-headers">
        <h4>所有响应头:</h4>
        <ul>
          ${Object.keys(result.headers).map(header => `<li><strong>${header}:</strong> ${result.headers[header]}</li>`).join('')}
        </ul>
      </div>`;
        this.resultContent.innerHTML = `
      <h2>检测结果</h2>
      <div class="response-info">
        <h3>响应信息</h3>
        <p><strong>状态码:</strong> ${result.status}</p>
        <p><strong>状态文本:</strong> ${result.statusText}</p>
      </div>
      <div class="headers-info">
        <h3>响应头信息</h3>
        ${corsHeadersHtml}
        ${allHeadersHtml}
      </div>`;
    }
    handleError(error) {
        this.resultContent.style.display = 'block';
        console.error("CORS检测失败:", error);
        this.resultContent.innerHTML = `
      <h2>检测结果</h2>
      <div class="error-info">
        <h3>错误信息</h3>
        <p><strong>错误类型:</strong> ${error.name}</p>
        <p><strong>错误消息:</strong> ${error.message}</p>
        <div class="error-explanation">
          <h4>可能的原因:</h4>
          <ul>
            <li>目标服务器不允许跨域请求</li>
            <li>请求被CORS策略阻止</li>
            <li>网络连接问题</li>
            <li>URL格式不正确</li>
          </ul>
        </div>
      </div>`;
    }
}
document.addEventListener("DOMContentLoaded", () => new CorsTester());
