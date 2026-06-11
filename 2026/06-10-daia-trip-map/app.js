/**
 * 貂貂端午节长春旅游计划 - 交互式地图
 * 使用高德地图 JSAPI v2.0 - 公共交通路线规划
 * 路线数据缓存至 localStorage，有效期 30 天，避免重复 API 调用
 */

// 全局变量
let map = null;
let markers = {};
let transfer = null;
let activeItem = null;
let routeOverlays = []; // 存储手动绘制的路线覆盖物
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30天

/**
 * 初始化地图
 */
function initMap() {
  window._AMapSecurityConfig = {
    securityJsCode: '6aeb08e2863bc3b406bd52dc1743fbc4',
  };

  AMapLoader.load({
    key: '6f41cd2f800bed4600e5eff90d749626',
    version: '2.0',
    plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Transfer']
  }).then((AMap) => {
    AMap.getConfig().appname = 'daia-trip-map';

    map = new AMap.Map('map-container', {
      viewMode: '3D',
      zoom: 12,
      center: [125.323, 43.885],
      pitch: 0,
      rotation: 0
    });

    map.addControl(new AMap.Scale());
    map.addControl(new AMap.ToolBar({ position: 'RT' }));

    transfer = new AMap.Transfer({
      map: map,
      city: '长春市',
      policy: AMap.TransferPolicy.LEAST_TIME
    });

    map.on('complete', function() {
      console.log('地图加载完成');
    });

    renderChecklist();

  }).catch((e) => {
    console.error('地图加载失败', e);
    document.getElementById('map-container').innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">地图加载失败，请检查网络或配置</div>';
  });
}

/**
 * 渲染行程清单
 */
function renderChecklist() {
  const container = document.getElementById('checklist-container');
  let html = '';

  TRIP_DATA.forEach(day => {
    html += `<div class="day-group">`;
    html += `<div class="day-title">${day.day}</div>`;

    day.items.forEach(item => {
      html += `
        <div class="checklist-item" data-id="${item.id}" onclick="handleItemClick('${item.id}')">
          <div class="item-icon">${item.icon}</div>
          <div class="item-content">
            <div class="item-name">${item.name}</div>
            <div class="item-time">${item.time}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `
    <button id="route-btn" class="route-btn" onclick="handleRoutePlanning()" disabled>
      查看完整路线
    </button>
  `;

  container.innerHTML = html;
}

/**
 * 查找项目
 */
function findItem(itemId) {
  for (const day of TRIP_DATA) {
    for (const item of day.items) {
      if (item.id === itemId) return item;
    }
  }
  return null;
}

/**
 * 处理项目点击
 */
function handleItemClick(itemId) {
  const targetItem = findItem(itemId);
  if (!targetItem) return;

  updateActiveItem(itemId);
  clearAllMarkers();
  clearRoute();
  addMarker(targetItem);
  map.setCenter(targetItem.location);
  map.setZoom(15);
  showInfoWindow(targetItem);
}

/**
 * 更新激活状态
 */
function updateActiveItem(itemId) {
  document.querySelectorAll('.checklist-item').forEach(el => {
    el.classList.remove('active');
  });

  const el = document.querySelector(`.checklist-item[data-id="${itemId}"]`);
  if (el) {
    el.classList.add('active');
    activeItem = itemId;
  }

  const routeBtn = document.getElementById('route-btn');
  if (routeBtn) routeBtn.disabled = false;
}

/**
 * 添加标记
 */
function addMarker(item) {
  const marker = new AMap.Marker({
    position: item.location,
    content: `<div class="map-marker">
      <div class="marker-icon">${item.icon}</div>
      <div class="marker-label">${item.name}</div>
    </div>`,
    offset: new AMap.Pixel(-15, -30)
  });

  map.add(marker);
  markers[item.id] = marker;
}

/**
 * 显示信息窗口
 */
function showInfoWindow(item) {
  const infoWindow = new AMap.InfoWindow({
    content: `<div class="info-window">
      <h4>${item.icon} ${item.name}</h4>
      <p>时间：${item.time}</p>
    </div>`,
    offset: new AMap.Pixel(0, -30)
  });

  infoWindow.open(map, item.location);
}

/**
 * 清除所有标记
 */
function clearAllMarkers() {
  Object.values(markers).forEach(marker => marker.setMap(null));
  markers = {};
}

/**
 * 清除路线（包括手动绘制的覆盖物）
 */
function clearRoute() {
  routeOverlays.forEach(overlay => overlay.setMap(null));
  routeOverlays = [];

  const panel = document.getElementById('route-panel');
  if (panel) {
    panel.style.display = 'none';
    panel.innerHTML = '';
  }
}

/**
 * 缓存相关工具函数
 */
function getCachedRoute(cacheKey) {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const now = Date.now();
    if (now - cached.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return cached.data;
  } catch (e) {
    return null;
  }
}

function setCachedRoute(cacheKey, data) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));
  } catch (e) {
    console.warn('缓存写入失败', e);
  }
}

/**
 * 手动渲染缓存的路线到地图和面板
 */
function renderCachedRoute(cachedData, dayItems) {
  const panel = document.getElementById('route-panel');
  let panelHtml = '<div class="route-panel-content">';
  panelHtml += `<div class="route-summary">
    <strong>公共交通路线</strong>
    <span>全程约 ${cachedData.totalDistance}，预计 ${cachedData.totalTime}</span>
  </div>`;

  cachedData.segments.forEach((seg, idx) => {
    // 绘制路线折线
    if (seg.path && seg.path.length > 0) {
      const polyline = new AMap.Polyline({
        path: seg.path,
        strokeColor: seg.color || '#1890ff',
        strokeWeight: 5,
        strokeOpacity: 0.8,
        strokeStyle: seg.dashed ? 'dashed' : 'solid',
        lineJoin: 'round',
        lineCap: 'round'
      });
      map.add(polyline);
      routeOverlays.push(polyline);
    }

    // 面板中的分段信息
    panelHtml += `<div class="route-segment">
      <div class="segment-header" style="border-left: 3px solid ${seg.color || '#1890ff'}">
        <span class="segment-type">${seg.type}</span>
        <span class="segment-info">${seg.info}</span>
      </div>
      <div class="segment-detail">${seg.detail}</div>
    </div>`;
  });

  panelHtml += '</div>';
  panel.innerHTML = panelHtml;
  panel.style.display = 'block';
}

/**
 * 处理路线规划
 */
function handleRoutePlanning() {
  if (!activeItem) return;

  // 找到当前选中的项目所在的天
  let dayIndex = -1;
  let selectedIndex = -1;
  for (let i = 0; i < TRIP_DATA.length; i++) {
    const idx = TRIP_DATA[i].items.findIndex(item => item.id === activeItem);
    if (idx !== -1) {
      dayIndex = i;
      selectedIndex = idx;
      break;
    }
  }

  if (dayIndex === -1) return;

  const currentDay = TRIP_DATA[dayIndex];
  const currentDayItems = currentDay.items;
  if (currentDayItems.length < 2) {
    alert('当天行程不足两个地点，无法规划路线');
    return;
  }

  clearAllMarkers();
  clearRoute();

  let startPoint, endPoint;

  if (selectedIndex === currentDayItems.length - 1) {
    // 最后一个项目：计算上一个 -> 当前
    startPoint = currentDayItems[selectedIndex - 1];
    endPoint = currentDayItems[selectedIndex];
  } else {
    // 其他项目：计算当前 -> 下一个
    startPoint = currentDayItems[selectedIndex];
    endPoint = currentDayItems[selectedIndex + 1];
  }

  // 显示起点和终点标记
  addMarker(startPoint);
  addMarker(endPoint);

  // 缓存 key 基于起点和终点
  const cacheKey = `daia_trip_route_${dayIndex}_${startPoint.name}_${endPoint.name}`;
  const cached = getCachedRoute(cacheKey);

  if (cached) {
    console.log('使用缓存的路线数据（30天内有效）');
    renderCachedRoute(cached, [startPoint, endPoint]);
    map.setFitView();
    return;
  }

  // 无缓存，调用 API 获取路线
  transfer.search(startPoint.location, endPoint.location, function(status, result) {
    if (status === 'complete') {
      console.log('路线规划成功');
      const routeData = parseTransferResult(result);
      if (!routeData) {
        showError('路线数据解析失败，请查看控制台日志');
        return;
      }
      // 缓存解析后的路线数据
      setCachedRoute(cacheKey, routeData);
      renderCachedRoute(routeData, [startPoint, endPoint]);
      map.setFitView();
    } else {
      const errorMsg = result && result.info ? result.info : status;
      console.error('路线规划失败:', status, result);
      showError('路线规划失败：' + errorMsg);
    }
  });
}

/**
 * 显示错误信息
 */
function showError(msg) {
  const panel = document.getElementById('route-panel');
  panel.innerHTML = `<div class="route-panel-content">
    <div class="route-error">
      <strong>错误</strong>
      <p>${msg}</p>
      <p class="error-hint">请检查控制台 (F12) 获取详细日志</p>
    </div>
  </div>`;
  panel.style.display = 'block';
}

/**
 * 解析高德 Transfer 结果为可缓存的格式
 */
function parseTransferResult(result) {
  const plan = result.plans && result.plans[0];
  if (!plan) return null;

  const segments = [];
  let totalDistance = 0;
  let totalTime = plan.time || 0;

  if (plan.segments) {
    plan.segments.forEach(seg => {
      const transit = seg.transit;
      if (!transit) return;

      if (seg.transit_mode === 'WALK') {
        // 步行段
        totalDistance += seg.distance || 0;

        if (transit.path && transit.path.length > 0) {
          const instructions = transit.steps
            ? transit.steps.map(s => s.instruction).filter(Boolean).join('；')
            : seg.instruction || '';

          segments.push({
            type: '步行',
            color: '#52c41a',
            dashed: true,
            info: `步行 ${formatDistance(seg.distance || 0)}`,
            detail: instructions,
            path: transit.path
          });
        }
      } else if (seg.transit_mode === 'BUS') {
        // 公交/地铁段
        const lineName = parseBusLineName(seg.instruction);
        const onStation = transit.on_station ? transit.on_station.name : '';
        const offStation = transit.off_station ? transit.off_station.name : '';
        const isMetro = lineName.includes('地铁') || lineName.includes('轻轨');

        if (transit.path && transit.path.length > 0) {
          segments.push({
            type: isMetro ? '地铁' : '公交',
            color: getLineColor(lineName),
            dashed: false,
            info: `${lineName}（${onStation} → ${offStation}）`,
            detail: seg.instruction || '',
            path: transit.path
          });
        }
      }
    });
  }

  return {
    totalDistance: formatDistance(totalDistance),
    totalTime: formatTime(totalTime),
    segments: segments
  };
}

/**
 * 从指令中提取公交线路名称
 */
function parseBusLineName(instruction) {
  if (!instruction) return '公交线路';
  // 匹配 "乘坐Z226路(火烧李--平泉路)途径5站到达平阳街"
  const match = instruction.match(/乘坐(.+?)\(/);
  if (match) return match[1];
  // 匹配 "乘坐地铁X号线"
  const metroMatch = instruction.match(/乘坐(地铁.+?线)/);
  if (metroMatch) return metroMatch[1];
  return '公交线路';
}

/**
 * 根据线路名称获取颜色
 */
function getLineColor(lineName) {
  if (lineName.includes('地铁')) return '#e74c3c';
  if (lineName.includes('轻轨')) return '#f39c12';
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2'];
  let hash = 0;
  for (let i = 0; i < lineName.length; i++) {
    hash = lineName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * 格式化距离
 */
function formatDistance(meters) {
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + ' 公里';
  }
  return meters + ' 米';
}

/**
 * 格式化时间
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours > 0 ? `${hours} 小时 ${minutes} 分钟` : `${minutes} 分钟`;
}

/**
 * 切换主题
 */
function toggleTheme() {
  const html = document.documentElement;
  const moonIcon = document.getElementById('theme-icon');
  const sunIcon = document.getElementById('theme-icon-sun');

  if (html.getAttribute('data-user-color-scheme') === 'dark') {
    html.removeAttribute('data-user-color-scheme');
    moonIcon.style.display = 'block';
    sunIcon.style.display = 'none';
    localStorage.setItem('theme', 'light');
  } else {
    html.setAttribute('data-user-color-scheme', 'dark');
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
    localStorage.setItem('theme', 'dark');
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme');
  const moonIcon = document.getElementById('theme-icon');
  const sunIcon = document.getElementById('theme-icon-sun');

  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-user-color-scheme', 'dark');
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
  } else if (savedTheme === 'light') {
    moonIcon.style.display = 'block';
    sunIcon.style.display = 'none';
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-user-color-scheme', 'dark');
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.setAttribute('data-user-color-scheme', 'dark');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
      } else {
        document.documentElement.removeAttribute('data-user-color-scheme');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
      }
    }
  });

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  initMap();
});
