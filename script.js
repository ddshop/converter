const API_URL = "https://shopee-affiliate-api-five.vercel.app/api/convert";

const urlInput = document.getElementById("urlInput");
const subIdInput = document.getElementById("subIdInput");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const statusText = document.getElementById("status");
const resultArea = document.getElementById("resultArea");
const toast = document.getElementById("toast");

convertBtn.addEventListener("click", convertLinks);
clearBtn.addEventListener("click", clearAll);

async function convertLinks() {
  const urls = urlInput.value
    .split(/\n+/)
    .map((url) => url.trim())
    .filter(Boolean);

  const subIds = subIdInput.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (urls.length === 0) {
    statusText.textContent = "請先貼上蝦皮連結";
    return;
  }

  if (urls.length > 5) {
    statusText.textContent = "每次最多只能轉換 5 個蝦皮連結";
    return;
  }

  convertBtn.disabled = true;
  statusText.textContent = "轉換中，請稍候...";
  resultArea.innerHTML = "";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        urls,
        subIds
      })
    });

    const data = await response.json();

    if (!data.success) {
      statusText.textContent = data.error || "轉換失敗";
      return;
    }

    statusText.textContent = `完成，共處理 ${data.results.length} 個連結`;
    renderResults(data.results);
  } catch (error) {
    statusText.textContent = "連線失敗，請確認 API 是否正常";
    console.error(error);
  } finally {
    convertBtn.disabled = false;
  }
}

function renderResults(results) {
  resultArea.innerHTML = "";

  results.forEach((item) => {
    const card = document.createElement("div");
    card.className = item.success ? "result-card" : "result-card error";

    if (item.success) {
      card.innerHTML = `
        <div class="result-title">轉換成功</div>
        <div>原始連結：</div>
        <div>${escapeHtml(item.originalUrl)}</div>
        <br>
        <div>分潤短連結：</div>
        <div class="link">${escapeHtml(item.shortLink)}</div>
        <div class="result-actions">
          <button onclick="copyText('${escapeAttribute(item.shortLink)}')">複製連結</button>
          <button onclick="window.open('${escapeAttribute(item.shortLink)}', '_blank')">開啟連結</button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="result-title">轉換失敗</div>
        <div>原始連結：</div>
        <div>${escapeHtml(item.originalUrl)}</div>
        <br>
        <div>錯誤原因：</div>
        <div>${escapeHtml(item.error || "未知錯誤")}</div>
      `;
    }

    resultArea.appendChild(card);
  });
}

function clearAll() {
  urlInput.value = "";
  subIdInput.value = "";
  statusText.textContent = "";
  resultArea.innerHTML = "";
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 900);
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(text) {
  return String(text)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");
}
