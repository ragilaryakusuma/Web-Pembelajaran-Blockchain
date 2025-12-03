// --- Date & Time updater ---
function updateDateTime() {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
  const dayName = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ss = now.getSeconds().toString().padStart(2, "0");

  document.getElementById(
    "datetime"
  ).textContent = `${dayName}, ${date} ${month} ${year} (${hh}:${mm}:${ss} WIB)`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// --- Weather Info ---
async function getWeather() {
  try {
    // Open-Meteo API - Surabaya
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-7.2575&longitude=112.7521&current_weather=true&timezone=Asia/Jakarta');
    const data = await response.json();
    
    if (data.current_weather) {
      const weather = data.current_weather;
      const temp = Math.round(weather.temperature);
      const weatherCode = weather.weathercode;
      
      // Weather code to emoji
      let weatherEmoji = '☀️';
      let weatherDesc = 'Cerah';
      if (weatherCode >= 51 && weatherCode <= 67) {
        weatherEmoji = '🌧️';
        weatherDesc = 'Hujan';
      } else if (weatherCode >= 71 && weatherCode <= 77) {
        weatherEmoji = '❄️';
        weatherDesc = 'Salju';
      } else if (weatherCode >= 80 && weatherCode <= 82) {
        weatherEmoji = '🌧️';
        weatherDesc = 'Hujan Deras';
      } else if (weatherCode >= 1 && weatherCode <= 3) {
        weatherEmoji = '⛅';
        weatherDesc = 'Berawan';
      } else if (weatherCode === 45 || weatherCode === 48) {
        weatherEmoji = '🌫️';
        weatherDesc = 'Kabut';
      }
      
      document.getElementById('weather-info').innerHTML = `
        <span class="weather-icon">${weatherEmoji}</span>
        <span class="weather-text">Surabaya: ${temp}°C • ${weatherDesc}</span>
      `;
    }
  } catch (error) {
    document.getElementById('weather-info').innerHTML = '<span class="error">⚠️ Gagal memuat cuaca</span>';
  }
}

// Load weather on page load
getWeather();
// Refresh every 10 minutes
setInterval(getWeather, 600000);

// --- SHA-256 helper ---
async function sha256(msg) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(msg));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- Navigation ---
function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".navbar button")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  document
    .getElementById("tab-" + pageId.split("-")[1])
    .classList.add("active");
}
// Navbar buttons
const navButtons = ["home", "about", "hash", "block", "chain", "ecc", "consensus"];
navButtons.forEach((page) => {
  const btn = document.getElementById("tab-" + page);
  if (btn) {
    btn.onclick = () => showPage("page-" + page);
  }
});

// Guide cards navigation
document.querySelectorAll(".guide-card[data-page]").forEach((card) => {
  card.addEventListener("click", (e) => {
    // Prevent button inside card from triggering card click
    if (e.target.tagName === 'BUTTON') return;
    const pageId = card.getAttribute("data-page");
    if (pageId) showPage(pageId);
  });
});

// Guide buttons inside cards
document.querySelectorAll(".guide-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent card click
    const card = btn.closest(".guide-card");
    if (card) {
      const pageId = card.getAttribute("data-page");
      if (pageId) showPage(pageId);
    }
  });
});

// --- Footer Slide Up Animation ---
function checkFooterVisibility() {
  const footer = document.querySelector('footer.footer');
  if (!footer) return;
  
  const footerPosition = footer.getBoundingClientRect().top;
  const screenPosition = window.innerHeight;
  
  if (footerPosition < screenPosition) {
    footer.classList.add('visible');
  }
}

// Trigger animation on scroll
window.addEventListener('scroll', checkFooterVisibility);

// Trigger animation on page load with delay for smooth effect
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(checkFooterVisibility, 300);
});

// --- Theme Toggle ---
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
let isDarkMode = true;

// Load saved theme preference
if (localStorage.getItem("theme") === "light") {
  isDarkMode = false;
  document.body.classList.add("light-mode");
  themeIcon.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("light-mode");
  
  if (isDarkMode) {
    themeIcon.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  } else {
    themeIcon.textContent = "☀️";
    localStorage.setItem("theme", "light");
  }
});

// --- Info Cards Click Navigation ---
document.querySelectorAll('.info-card[data-page]').forEach(card => {
  card.addEventListener('click', () => {
    const pageId = card.getAttribute('data-page');
    showPage(pageId);
  });
});
// --- Hash Page ---
document.getElementById("hash-input").addEventListener("input", async (e) => {
  document.getElementById("hash-output").textContent = await sha256(
    e.target.value
  );
});

// --- Single Block Page ---
const blockNumber = document.getElementById("block-number");
const blockData = document.getElementById("block-data");
const blockNonce = document.getElementById("block-nonce");
const blockTimestamp = document.getElementById("block-timestamp");
const blockHash = document.getElementById("block-hash");
const speedControl = document.getElementById("speed-control");
const miningStatus = document.getElementById("mining-status");

let mining = false;

// Batasi input nonce: hanya angka
blockNonce.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
  updateBlockHash();
});

async function updateBlockHash() {
  const number = blockNumber.value || "0";
  const data = blockData.value;
  const nonce = blockNonce.value || "0";
  const timestamp = blockTimestamp.value || "";
  const input = number + data + timestamp + nonce;
  blockHash.textContent = await sha256(input);
}
blockData.addEventListener("input", updateBlockHash);
blockNumber.addEventListener("input", updateBlockHash);

// Tombol Mine
document.getElementById("btn-mine").addEventListener("click", async () => {
  if (mining) return;
  const number = blockNumber.value.trim() || "0";
  const data = blockData.value.trim();
  if (!data) {
    alert("Isi data terlebih dahulu sebelum mining!");
    return;
  }

  // Set timestamp dan reset nilai
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  blockTimestamp.value = timestamp;
  blockHash.textContent = "";
  blockNonce.value = "0";
  let nonce = 0;
  mining = true;

  const difficulty = "0000";
  const baseBatch = 1000;
  const speedMultiplier = parseInt(speedControl.value);
  const batchSize = baseBatch * speedMultiplier;

  miningStatus.textContent = "⛏️ Mining dimulai...";
  const startTime = performance.now();

  async function mineBatch() {
    for (let i = 0; i < batchSize; i++) {
      const input = number + data + timestamp + nonce;
      const h = await sha256(input);
      if (h.startsWith(difficulty)) {
        blockNonce.value = nonce;
        blockHash.textContent = h;
        mining = false;
        const durasi = ((performance.now() - startTime) / 1000).toFixed(2);
        miningStatus.textContent = `✅ Selesai! Nonce: ${nonce.toLocaleString()}, waktu: ${durasi} detik.`;
        return true;
      }
      nonce++;
    }
    blockNonce.value = nonce;
    miningStatus.textContent = `⛏️ Mining... Nonce: ${nonce.toLocaleString()}`;
    return false;
  }

  async function mine() {
    const done = await mineBatch();
    if (!done && mining) requestAnimationFrame(mine);
  }
  mine();
});

// --- Blockchain Page ---
const ZERO_HASH = "0".repeat(64);
let blocks = [];
const chainDiv = document.getElementById("blockchain");

function renderChain() {
  chainDiv.innerHTML = "";
  blocks.forEach((blk, i) => {
    // Validasi: cek apakah previous hash cocok dengan hash block sebelumnya
    let isValid = true;
    if (i > 0) {
      const prevBlock = blocks[i - 1];
      isValid = blk.previousHash === prevBlock.hash && prevBlock.hash.startsWith("0000");
    }
    // Block 0 valid jika sudah dimining
    if (i === 0 && blk.hash && !blk.hash.startsWith("0000")) {
      isValid = false;
    }

    const validClass = blk.hash && blk.hash.startsWith("0000") 
      ? (isValid ? "valid" : "invalid") 
      : "";

    const div = document.createElement("div");
    div.className = `blockchain-block ${validClass}`;
    div.innerHTML = `
      <h3>Block #${blk.index}</h3>
      <label>Previous Hash:</label>
      <div class="output" id="prev-${i}">${blk.previousHash}</div>

      <label>Data:</label>
      <textarea rows="3" id="data-${i}">${blk.data}</textarea>

      <label>Timestamp:</label>
      <div class="output" id="timestamp-${i}">${blk.timestamp}</div>

      <label>Nonce:</label>
      <div class="output" id="nonce-${i}">${blk.nonce}</div>

      <label>Hash:</label>
      <div class="output" id="hash-${i}">${blk.hash}</div>

      <button id="mine-${i}" class="mine">Mine Block</button>
      <div id="status-${i}" class="status"></div>
    `;
    chainDiv.appendChild(div);

    document.getElementById(`data-${i}`).addEventListener("input", (e) => {
      blocks[i].data = e.target.value;
      blocks[i].hash = "";
      blocks[i].timestamp = "";
      blocks[i].nonce = 0;
      document.getElementById(`hash-${i}`).textContent = "";
      // Re-render untuk update validasi
      renderChain();
    });

    document.getElementById(`mine-${i}`).addEventListener("click", () => {
      mineChainBlock(i);
    });
  });
  // Setelah semua block dirender, kunci blok yang sudah ditambang
  blocks.forEach((blk, i) => {
    if (blk.hash && blk.hash.startsWith("0000")) {
      const dataField = document.getElementById(`data-${i}`);
      if (dataField) dataField.readOnly = true;
    }
  });
}

function addChainBlock() {
  const idx = blocks.length;
  const prev = idx ? blocks[idx - 1].hash || ZERO_HASH : ZERO_HASH;
  const blk = {
    index: idx,
    data: "",
    previousHash: prev,
    timestamp: "",
    nonce: 0,
    hash: "",
  };
  blocks.push(blk);
  renderChain();
  chainDiv.scrollLeft = chainDiv.scrollWidth;
}

async function mineChainBlock(i) {
  const blk = blocks[i];
  const prev = blk.previousHash;
  const data = blk.data;

  if (!data.trim()) {
    alert("Isi data block terlebih dahulu!");
    return;
  }

  const timeDiv = document.getElementById(`timestamp-${i}`);
  const nonceDiv = document.getElementById(`nonce-${i}`);
  const hashDiv = document.getElementById(`hash-${i}`);
  const statusDiv = document.getElementById(`status-${i}`);

  blk.nonce = 0;
  blk.timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  timeDiv.textContent = blk.timestamp;
  hashDiv.textContent = "";
  statusDiv.textContent = "⛏️ Mining dimulai...";
  const difficulty = "0000";

  const baseBatch = 1000;
  const batchSize = baseBatch * 10;
  const startTime = performance.now();

  async function mineBatch() {
    for (let j = 0; j < batchSize; j++) {
      const input = blk.index + prev + data + blk.timestamp + blk.nonce;
      const h = await sha256(input);
      if (h.startsWith(difficulty)) {
        blk.hash = h;
        hashDiv.textContent = h;

        //KUNCI FIELD DATA SETELAH MINING SELESAI
        document.getElementById(`data-${i}`).readOnly = true;

        const durasi = ((performance.now() - startTime) / 1000).toFixed(2);
        statusDiv.textContent = `✅ Selesai! Nonce: ${blk.nonce.toLocaleString()}, waktu: ${durasi} detik.`;

        if (blocks[i + 1]) {
          blocks[i + 1].previousHash = blk.hash;
          renderChain();
        } else {
          // Re-render untuk update visual validation
          renderChain();
        }
        return true;
      }
      blk.nonce++;
    }
    nonceDiv.textContent = blk.nonce.toLocaleString();
    statusDiv.textContent = `⛏️ Mining... Nonce: ${blk.nonce.toLocaleString()}`;
    return false;
  }

  async function mine() {
    const done = await mineBatch();
    if (!done) requestAnimationFrame(mine);
  }
  mine();
}

// === ECC Digital Signature Section ===
const ec = new elliptic.ec("secp256k1");

const eccPublic = document.getElementById("ecc-public");
const eccPrivate = document.getElementById("ecc-private");
const eccMessage = document.getElementById("ecc-message");
const eccSignature = document.getElementById("ecc-signature");
const eccVerifyResult = document.getElementById("ecc-verify-result");

// Helper: random private key (32 bytes hex)
function randomPrivateHex() {
  // gunakan crypto.getRandomValues untuk keamanan
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: hex <-> Uint8Array
function hexToUint8(hex) {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  const res = new Uint8Array(hex.length / 2);
  for (let i = 0; i < res.length; i++) {
    res[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return res;
}
function uint8ToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: normalize hex (lowercase, no 0x)
function normHex(h) {
  if (!h) return "";
  return h.toLowerCase().replace(/^0x/, "");
}

// Generate key pair (Bitcoin-like)
document.getElementById("btn-generate-key").onclick = function() {
  eccVerifyResult.textContent = "";
  const privHex = randomPrivateHex();
  // Get key pair
  const key = ec.keyFromPrivate(privHex, "hex");
  const pubPoint = key.getPublic();

  // uncompressed: 04 + X + Y
  const x = pubPoint.getX().toString("hex").padStart(64, "0");
  const y = pubPoint.getY().toString("hex").padStart(64, "0");
  const pubUncompressed = "04" + x + y;

  eccPrivate.value = normHex(privHex);
  eccPublic.value = pubUncompressed;
  eccSignature.value = "";
};

// Sign message (use private key from textarea)
document.getElementById("btn-sign").onclick = async function() {
  try {
    const msg = eccMessage.value;
    if (!msg) {
      alert("Isi pesan yang akan ditandatangani!");
      return;
    }
    const privHex = normHex(eccPrivate.value.trim());
    if (!privHex || privHex.length !== 64) {
      alert("Private key tidak valid. Harus 32 byte hex (64 hex chars).");
      return;
    }

    // Hash pesan (sha256) -> hasil fungsi sha256() mengembalikan hex
    const msgHashHex = await sha256(msg); // hex string length 64
    const msgHashBytes = hexToUint8(msgHashHex);

    // sign (elliptic) — hasil default adalah object {r, s}
    const key = ec.keyFromPrivate(privHex, "hex");
    // use canonical (low S) by default elliptic produces canonical? we'll normalize s to lowS
    const signature = key.sign(msgHashHex, { canonical: true, hex: true }); // we can pass hex directly
    // DER-encoded signature (hex)
    const derHex = signature.toDER("hex");

    eccSignature.value = derHex; // tampilkan DER hex (mirip format Bitcoin tx sig)
    eccVerifyResult.textContent = "";
  } catch (err) {
    console.error(err);
    alert("Gagal menandatangani pesan: " + err.message);
  }
};

// Verify signature using public key input (accepts uncompressed or compressed hex)
document.getElementById("btn-verify").onclick = async function() {
  try {
    const msg = eccMessage.value;
    const sigHex = normHex(eccSignature.value.trim());
    let pubInput = eccPublic.value.trim();
    if (!msg || !sigHex || !pubInput) {
      alert("Pastikan pesan, signature, dan public key terisi!");
      return;
    }

    // pubInput might contain "compressed" note; pick first hex-looking line
    pubInput = pubInput.split(/\s+/).find((t) => /^([0-9a-fA-F]+)$/.test(t));
    if (!pubInput) {
      alert(
        "Public key tidak terdeteksi (pastikan hex public key ada di textarea)."
      );
      return;
    }
    pubInput = normHex(pubInput);

    // derive public key object
    let pubKey;
    try {
      // accept 04... (uncompressed) or 02/03... (compressed)
      pubKey = ec.keyFromPublic(pubInput, "hex");
    } catch (e) {
      alert("Public key tidak valid (format hex uncompressed/compressed).");
      return;
    }

    // prepare hash
    const msgHashHex = await sha256(msg);

    // verify DER signature
    const valid = pubKey.verify(msgHashHex, sigHex);

    if (valid) {
      eccVerifyResult.textContent = "✅ Signature VALID! (public & private key cocok)";
      eccVerifyResult.style.color = "#39ff14";
      eccVerifyResult.style.borderColor = "#39ff14";
    } else {
      eccVerifyResult.textContent = "❌ Signature TIDAK valid! (keys tidak cocok)";
      eccVerifyResult.style.color = "#ff3864";
      eccVerifyResult.style.borderColor = "#ff3864";
      console.warn(
        "Verifikasi gagal. Pastikan public key cocok dengan private key yang dipakai untuk sign."
      );
    }
  } catch (err) {
    console.error(err);
    eccVerifyResult.textContent = "⚠️ Terjadi kesalahan saat verifikasi.";
    eccVerifyResult.style.color = "#ffb800";
  }
};

// =====================================================
// CONSENSUS BLOCKCHAIN SIMULATION
// =====================================================

// State untuk konsensus
let balances = { A: 100, B: 100, C: 100 };
let txPool = [];
let chainsConsensus = { A: [], B: [], C: [] };

// Parse transaksi format "A -> B : 10"
function parseTx(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([A-C])\s*->\s*([A-C])\s*:\s*(\d+)$/);
  if (!match) return null;
  return {
    from: match[1],
    to: match[2],
    amount: parseInt(match[3], 10)
  };
}

// Mining helper dengan difficulty "000" (3 leading zeros)
async function shaMine(prev, data, timestamp) {
  let nonce = 0;
  const batchSize = 50000; // 1000 * 50
  
  while (true) {
    for (let i = 0; i < batchSize; i++, nonce++) {
      const raw = prev + data + timestamp + nonce;
      const hash = await sha256(raw);
      if (hash.startsWith("000")) {
        return { hash, nonce };
      }
    }
    // Yield untuk UI tetap responsif
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// Update balance display
function updateBalancesDOM() {
  document.getElementById("saldo-A").textContent = balances.A;
  document.getElementById("saldo-B").textContent = balances.B;
  document.getElementById("saldo-C").textContent = balances.C;
}

// Genesis block untuk semua user
async function createGenesisConsensus() {
  const timestamp = Date.now();
  const data = "Genesis Block: 100 coins";
  const { hash, nonce } = await shaMine("0", data, timestamp);
  
  const genesisBlock = {
    index: 0,
    previousHash: "0",
    timestamp: timestamp,
    data: data,
    nonce: nonce,
    hash: hash,
    invalid: false
  };
  
  chainsConsensus.A = [{ ...genesisBlock }];
  chainsConsensus.B = [{ ...genesisBlock }];
  chainsConsensus.C = [{ ...genesisBlock }];
  
  renderConsensusChains();
}

// Render chains
function renderConsensusChains() {
  ["A", "B", "C"].forEach(user => {
    const container = document.getElementById(`chain-${user}`);
    container.innerHTML = "";
    
    chainsConsensus[user].forEach((blk, idx) => {
      const div = document.createElement("div");
      div.className = "chain-block";
      if (blk.invalid) div.classList.add("invalid");
      
      div.innerHTML = `
        <strong>Block #${blk.index}</strong>
        <div>Prev: ${blk.previousHash.substring(0, 8)}...</div>
        <div>Timestamp: ${blk.timestamp}</div>
        <div><strong>Data:</strong></div>
        <textarea class="block-data" data-user="${user}" data-idx="${idx}">${blk.data}</textarea>
        <div>Nonce: ${blk.nonce}</div>
        <div>Hash: ${blk.hash.substring(0, 12)}...</div>
      `;
      
      container.appendChild(div);
    });
  });
  
  // Add event listeners untuk editable data
  document.querySelectorAll(".block-data").forEach(ta => {
    ta.addEventListener("input", (e) => {
      const user = e.target.dataset.user;
      const idx = parseInt(e.target.dataset.idx);
      chainsConsensus[user][idx].data = e.target.value;
    });
  });
}

// Send transaction handlers
document.getElementById("send-A").addEventListener("click", () => {
  const to = document.getElementById("receiver-A").value;
  const amt = parseInt(document.getElementById("amount-A").value);
  if (isNaN(amt) || amt <= 0) {
    alert("Jumlah harus lebih dari 0");
    return;
  }
  if (balances.A < amt) {
    alert("Saldo User A tidak cukup!");
    return;
  }
  const tx = `A -> ${to} : ${amt}`;
  txPool.push(tx);
  document.getElementById("mempool").value = txPool.join("\n");
});

document.getElementById("send-B").addEventListener("click", () => {
  const to = document.getElementById("receiver-B").value;
  const amt = parseInt(document.getElementById("amount-B").value);
  if (isNaN(amt) || amt <= 0) {
    alert("Jumlah harus lebih dari 0");
    return;
  }
  if (balances.B < amt) {
    alert("Saldo User B tidak cukup!");
    return;
  }
  const tx = `B -> ${to} : ${amt}`;
  txPool.push(tx);
  document.getElementById("mempool").value = txPool.join("\n");
});

document.getElementById("send-C").addEventListener("click", () => {
  const to = document.getElementById("receiver-C").value;
  const amt = parseInt(document.getElementById("amount-C").value);
  if (isNaN(amt) || amt <= 0) {
    alert("Jumlah harus lebih dari 0");
    return;
  }
  if (balances.C < amt) {
    alert("Saldo User C tidak cukup!");
    return;
  }
  const tx = `C -> ${to} : ${amt}`;
  txPool.push(tx);
  document.getElementById("mempool").value = txPool.join("\n");
});

// Mine all transactions
document.getElementById("btn-mine-all").addEventListener("click", async () => {
  const mempoolText = document.getElementById("mempool").value;
  const lines = mempoolText.split("\n");
  const transactions = [];
  
  // Parse semua transaksi
  for (let line of lines) {
    const tx = parseTx(line);
    if (tx) transactions.push(tx);
  }
  
  if (transactions.length === 0) {
    alert("Tidak ada transaksi valid di mempool!");
    return;
  }
  
  // Validasi balances
  const tempBalances = { ...balances };
  for (let tx of transactions) {
    if (tempBalances[tx.from] < tx.amount) {
      alert(`Transaksi ${tx.from} -> ${tx.to} : ${tx.amount} gagal! Saldo tidak cukup.`);
      return;
    }
    tempBalances[tx.from] -= tx.amount;
    tempBalances[tx.to] += tx.amount;
  }
  
  // Update balances
  balances = tempBalances;
  updateBalancesDOM();
  
  // Build data string
  const dataStr = transactions.map(tx => `${tx.from} -> ${tx.to} : ${tx.amount}`).join("; ");
  
  // Mine untuk semua user secara bersamaan
  const timestamp = Date.now();
  const users = ["A", "B", "C"];
  
  alert("⛏️ Mining dimulai... Harap tunggu...");
  
  const miningPromises = users.map(async (user) => {
    const chain = chainsConsensus[user];
    const lastBlock = chain[chain.length - 1];
    const { hash, nonce } = await shaMine(lastBlock.hash, dataStr, timestamp);
    
    const newBlock = {
      index: chain.length,
      previousHash: lastBlock.hash,
      timestamp: timestamp,
      data: dataStr,
      nonce: nonce,
      hash: hash,
      invalid: false
    };
    
    chain.push(newBlock);
  });
  
  await Promise.all(miningPromises);
  
  // Clear mempool
  txPool = [];
  document.getElementById("mempool").value = "";
  
  renderConsensusChains();
  alert("✅ Mining selesai! Block baru ditambahkan ke semua chain.");
});

// Verify chains
document.getElementById("btn-verify-consensus").addEventListener("click", async () => {
  const users = ["A", "B", "C"];
  let hasInvalid = false;
  
  for (let user of users) {
    const chain = chainsConsensus[user];
    for (let i = 0; i < chain.length; i++) {
      const blk = chain[i];
      
      // Check previous hash link (kecuali genesis)
      if (i > 0) {
        const prevBlk = chain[i - 1];
        if (blk.previousHash !== prevBlk.hash) {
          blk.invalid = true;
          hasInvalid = true;
          continue;
        }
      }
      
      // Recompute hash
      const raw = blk.previousHash + blk.data + blk.timestamp + blk.nonce;
      const computedHash = await sha256(raw);
      
      if (computedHash !== blk.hash || !computedHash.startsWith("000")) {
        blk.invalid = true;
        hasInvalid = true;
      } else {
        blk.invalid = false;
      }
    }
  }
  
  renderConsensusChains();
  
  if (hasInvalid) {
    alert("⚠️ Ditemukan block yang tidak valid! (ditandai dengan border merah)");
  } else {
    alert("✅ Semua chain valid!");
  }
});

// Consensus algorithm (majority vote)
document.getElementById("btn-consensus").addEventListener("click", () => {
  const users = ["A", "B", "C"];
  const maxLen = Math.max(
    chainsConsensus.A.length,
    chainsConsensus.B.length,
    chainsConsensus.C.length
  );
  
  // Untuk setiap posisi block
  for (let i = 0; i < maxLen; i++) {
    const dataVotes = {};
    
    // Kumpulkan votes
    users.forEach(user => {
      const chain = chainsConsensus[user];
      if (i < chain.length) {
        const data = chain[i].data;
        dataVotes[data] = (dataVotes[data] || 0) + 1;
      }
    });
    
    // Cari majority (≥2 votes)
    let majorityData = null;
    let maxVotes = 0;
    for (let data in dataVotes) {
      if (dataVotes[data] > maxVotes) {
        maxVotes = dataVotes[data];
        majorityData = data;
      }
    }
    
    // Apply majority ke semua user
    if (majorityData && maxVotes >= 2) {
      users.forEach(user => {
        const chain = chainsConsensus[user];
        if (i < chain.length) {
          chain[i].data = majorityData;
          chain[i].invalid = false;
        }
      });
    }
  }
  
  renderConsensusChains();
  alert("⚖️ Consensus berhasil! Semua chain disinkronisasi dengan majority vote.");
});

// Initialize consensus saat halaman dibuka
if (document.getElementById("page-consensus")) {
  createGenesisConsensus();
}

// --- Init blockchain chain ---
document.getElementById("btn-add-block").onclick = addChainBlock;
addChainBlock();
