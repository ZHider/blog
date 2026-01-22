// CORS测试页面的TypeScript逻辑
interface ResponseHeaders {
  [key: string]: string;
}

interface CorsResult {
  status: number;
  statusText: string;
  headers: ResponseHeaders;
}

// 定义错误类型接口
interface CorsError {
  name: string;
  message: string;
}

// 主要的CORS测试类
class CorsTester {
  private targetUrlInput: HTMLInputElement;
  private testCorsBtn: HTMLButtonElement;
  private resultContent: HTMLDivElement;

  constructor() {
    this.targetUrlInput = document.getElementById("target-url") as HTMLInputElement;
    this.testCorsBtn = document.getElementById("test-cors-btn") as HTMLButtonElement;
    this.resultContent = document.getElementById("result-content") as HTMLDivElement;

    this.initEventListeners();
  }

  private initEventListeners(): void {
    // 为测试按钮添加点击事件监听器
    this.testCorsBtn.addEventListener("click", () => this.handleCorsTest());

    // 添加回车键支持
    this.targetUrlInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") this.handleCorsTest();
    });
  }

  private async handleCorsTest(): Promise<void> {
    const url = this.targetUrlInput.value.trim();

    if (!url) {
      alert("请输入一个有效的URL");
      return;
    }

    if (!this.isValidUrl(url)) {
      alert("请输入一个有效的URL格式（例如：https://example.com）");
      return;
    }

    // 显示加载状态
    this.showLoading();

    try {
      const response = await fetch(url);
      const headers: ResponseHeaders = {};
      for (const [key, value] of response.headers.entries()) {
        headers[key] = value;
      }

      const result: CorsResult = {
        status: response.status,
        statusText: response.statusText,
        headers
      };

      this.displayResult(result);
    } catch (error) {
      this.handleError(error as CorsError);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private showLoading(): void {
    this.resultContent.style.display = 'block';
    this.resultContent.innerHTML = "<p>正在检测CORS配置...</p>";
  }

  private displayResult(result: CorsResult): void {
    this.resultContent.style.display = 'block';

    const corsHeaders = Object.keys(result.headers).filter(header =>
      header.toLowerCase().includes("access-control")
    );

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

  private handleError(error: CorsError): void {
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

// 确保DOM加载完成后初始化CORS测试器
document.addEventListener("DOMContentLoaded", () => new CorsTester());
