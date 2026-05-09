// SVGA预览插件主逻辑
(function() {
  console.log('[SVGA预览] 插件已加载', location.href);

  let previewContainer = null;
  let sandboxIframe = null;
  let hideTimer = null;
  let isSandboxReady = false;
  let lastSvgaUrl = null;

  const SVGA_REGEX = /https?:\/\/[^\s"'<>]+\.svga(?:[?#][^\s"'<>]*)?/gi;

  // 从字符串提取SVGA链接
  function extractSVGAUrl(str) {
    if (!str) return null;
    SVGA_REGEX.lastIndex = 0;
    const match = SVGA_REGEX.exec(str);
    return match ? match[0] : null;
  }

  // 只识别 <a href="...svga"> 标签
  function findSVGAUrlFromTarget(el) {
    let cur = el;
    while (cur && cur !== document.body) {
      if (cur.tagName === 'A') {
        const url = extractSVGAUrl(cur.getAttribute('href') || '');
        if (url) return url;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  // 创建预览容器
  function createPreviewContainer() {
    const container = document.createElement('div');
    container.id = 'svga-preview-container';

    const loading = document.createElement('div');
    loading.className = 'svga-preview-loading';
    loading.textContent = '加载中...';
    container.appendChild(loading);

    const iframe = document.createElement('iframe');
    iframe.id = 'svga-preview-iframe';
    iframe.src = chrome.runtime.getURL('sandbox.html');
    iframe.sandbox = 'allow-scripts';
    container.appendChild(iframe);

    sandboxIframe = iframe;
    document.body.appendChild(container);
    return container;
  }

  // 监听sandbox消息
  window.addEventListener('message', function(event) {
    if (!event.data || !event.data.action) return;
    const { action } = event.data;

    if (action === 'ready') {
      console.log('[SVGA预览] Sandbox已准备好');
      isSandboxReady = true;
    } else if (action === 'loaded') {
      if (previewContainer) {
        previewContainer.querySelector('.svga-preview-loading').style.display = 'none';
        sandboxIframe.style.display = 'block';
      }
    } else if (action === 'error') {
      if (previewContainer) {
        const loading = previewContainer.querySelector('.svga-preview-loading');
        loading.textContent = '加载失败';
        loading.style.display = 'block';
      }
    }
  });

  // 显示预览
  function showPreview(svgaUrl, mouseX, mouseY) {
    if (svgaUrl === lastSvgaUrl && previewContainer && previewContainer.style.display === 'block') {
      positionPreview(mouseX, mouseY);
      return;
    }
    lastSvgaUrl = svgaUrl;

    console.log('[SVGA预览] 加载:', svgaUrl);

    if (!previewContainer) {
      previewContainer = createPreviewContainer();
    }

    const loading = previewContainer.querySelector('.svga-preview-loading');
    loading.textContent = '加载中...';
    loading.style.display = 'block';
    sandboxIframe.style.display = 'none';
    previewContainer.style.display = 'block';

    positionPreview(mouseX, mouseY);

    const doLoad = () => {
      sandboxIframe.contentWindow.postMessage({ action: 'load', url: svgaUrl }, '*');
    };

    if (isSandboxReady) {
      doLoad();
    } else {
      const timer = setInterval(() => {
        if (isSandboxReady) {
          clearInterval(timer);
          doLoad();
        }
      }, 50);
    }
  }

  // 定位预览框（fixed定位，直接用clientX/Y）
  function positionPreview(mouseX, mouseY) {
    const W = 320, H = 240, offset = 15;
    let left = mouseX + offset;
    let top  = mouseY + offset;

    if (left + W > window.innerWidth)  left = mouseX - W - offset;
    if (top  + H > window.innerHeight) top  = mouseY - H - offset;

    previewContainer.style.left = left + 'px';
    previewContainer.style.top  = top  + 'px';
  }

  // 隐藏预览
  function hidePreview() {
    if (previewContainer) {
      previewContainer.style.display = 'none';
    }
    lastSvgaUrl = null;
  }

  // mouseover：检测SVGA链接
  document.addEventListener('mouseover', (e) => {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }

    // 跳过自身预览框
    if (e.target.closest && e.target.closest('#svga-preview-container')) return;

    const url = findSVGAUrlFromTarget(e.target);
    if (url) {
      showPreview(url, e.clientX, e.clientY);
    } else {
      hideTimer = setTimeout(hidePreview, 150);
    }
  });

  // mousemove：跟随鼠标移动
  document.addEventListener('mousemove', (e) => {
    if (previewContainer && previewContainer.style.display === 'block') {
      positionPreview(e.clientX, e.clientY);
    }
  });
})();
