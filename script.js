
function updateDynamicGreeting() {
    const greetingElement = document.getElementById('dynamic-greeting');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greeting = "";
    let emoji = "";

    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning";
        emoji = "☀️";
    } else if (hour >= 12 && hour < 16) {
        greeting = "Good Afternoon";
        emoji = "🌤️";
    } else if (hour >= 16 && hour < 18) {
        greeting = "Good Evening";
        emoji = "🌇";
         } else if (hour >= 18 && hour < 20) {
        greeting = "Good Evening";
        emoji = "🌆";
    } else {
        greeting = "Good Night";
        emoji = "🌙";
    }

    // Update the HTML content
    greetingElement.innerHTML = `${greeting} ${emoji}<br>demo User!`;
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', updateDynamicGreeting);

let type = 'transaction';
let date = new Date().toLocaleDateString(); // Sets a default current date
let amount = 0;
let phone = "";
let walletBalances = {
    transaction: 0,
    sms: 540,
    type: 'transaction'
};

let transactionId = null;

// Logic for Automated Billing
function updateBillingCycle() {
    const activeDays = 25; // Trigger 5 days before 30-day expiry
    const monthlyIncome = 105000; // Example income
    const invoiceCountEl = document.querySelector('#page-dashboard .card h4:contains("Invoices") + .stat-large');

    if (currentDay >= activeDays && !invoicePaid) {
        const invoiceAmount = monthlyIncome * 0.15;
        // Show invoice in UI
        invoiceCountEl.innerHTML = `1 <span class="muted" style="font-size:14px">Generated (KES ${invoiceAmount})</span>`;
        document.getElementById('payBtn').style.display = 'block';

    }
}

if (walletBalances.type === 'transaction') {
    document.querySelector('.stat-large[style*="var(--orange)"]').innerText = `KES ${walletBalances.transaction}`;
    document.querySelector('.wallet-info span').innerText = `KES ${walletBalances.transaction}`;
} else {
    // amount should be defined where you call this logic (e.g., from an input)
    let amount = 0;
    walletBalances.sms += amount;

    // Update the SMS balance display (Blue card)
    const smsDisplay = document.querySelector('.stat-large[style*="var(--blue)"]');
    if (smsDisplay) smsDisplay.innerText = walletBalances.sms;
}
// Add to Transactions Table (Finance Page)
const tableBody = document.getElementById('mpesaTable');
if (tableBody) {
    const row = `<tr>
            <td>${transactionId}</td>
            <td>${phone}</td>
            <td>${amount}</td>
            <td>${date}</td>
            <td>${type.toUpperCase()}</td>
        </tr>`;
    tableBody.innerHTML = row + tableBody.innerHTML;
}
console.log("Wallet updated. Monthly Income chart remains unaffected as per requirements.");
function topUpSMS() {
    const amount = document.getElementById('smsAmount').value;
    // Redirect payment to Admin credit account
    const adminWalletID = "ADMIN_SMS_GATEWAY";

    triggerMpesaPush(adminWalletID, amount);
    console.log("SMS top-up directed to Admin Gateway.");
}

// Ensure navigate function works for the new modal
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

//  GLOBAL STATE 
let wallets = [];
let hotspotPackages = [];
let mpesaTransactions = [
    {
        mpesaId: "QHX7PLM9",
        phone: "254712345678",
        amount: 500,
        datetime: "2025-12-19 09:12",
        walletId: "WLT-001"
    },
    {
        mpesaId: "QHX7PLMA",
        phone: "254798765432",
        amount: 1200,
        datetime: "2025-12-19 11:34",
        walletId: "WLT-001"
    }
];

// Router test logs
let routerTestLogs = [];
let lastRouterTestStatus = "not_run"; // "success", "failed", "running", "not_run"

// Bank data
const bankData = {
    "KCB Bank": "522522",
    "Equity Bank": "247247",
    "Co-operative Bank": "400200",
    "Absa Bank": "303030",
    "NCBA Bank": "880100",
    "Stanbic Bank": "600100"
};

// Initialize sample wallets
wallets = [
    { id: "WL-001", name: "Main Bank Account", type: "Bank", balance: 10000, bank: "KCB Bank", paybill: "522522", account: "12345678" }
];

//  SIDEBAR FUNCTIONALITY 
const sidebar = document.getElementById('sidebar');
const main = document.getElementById('main');
const hamburgerToggle = document.getElementById('hamburgerToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

let hoverTimeout;

function openSidebar() {
    sidebar.classList.add('open');
    main.classList.add('sidebar-open');
    sidebarOverlay.classList.add('show');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    main.classList.remove('sidebar-open');
    sidebarOverlay.classList.remove('show');
    clearTimeout(hoverTimeout);
}

// CURSOR DETECTION
sidebar.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
});

sidebar.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(closeSidebar, 300);
});

// Hamburger click
hamburgerToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
});

// Overlay click
sidebarOverlay.addEventListener('click', closeSidebar);

// Prevent closing when hovering hamburger
hamburgerToggle.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
});

// Resize handler
window.addEventListener('resize', () => {
    if (!sidebar.classList.contains('open')) return;

    if (window.innerWidth < 720) {
        sidebarOverlay.classList.add('show');
    } else {
        sidebarOverlay.classList.remove('show');
    }
});

//  CORE UI CONTROLS 
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'flex';
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    const target = document.getElementById('page-' + pageId);
    if (target) {
        target.classList.add('active');
        if (pageId === 'packages') renderPackages();
        if (pageId === 'wallets') renderWallets();
        if (pageId === 'transactions') renderMpesaTable();
    }

    closeSidebar(); // auto close on mobile
}

//  THEME TOGGLE 
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
        if (themeIcon) themeIcon.className = 'fa fa-sun';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light');
        if (themeIcon) themeIcon.className = 'fa fa-moon';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

// Toggle on click
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light');
        setTheme(isLight ? 'dark' : 'light');
    });
}

function showSection(sectionId) {
    // Hide all sections (assuming main dashboard has id="dashboard-section")
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'none';

    // Show target section
    document.getElementById(sectionId + '-section').style.display = 'block';

    // If showing analytics, initialize the chart
    if (sectionId === 'analytics') {
        initChart();
    }
}

//  TRANSACTIONS LOGIC 
function renderMpesaTable() {
    const tbody = document.getElementById("mpesaTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    let walletTotal = 0;
    let monthlyTotal = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const today = now.toDateString();

    // This function populates the <tbody> with id="mpesaTable"
    function renderTransactions(transactions) {
        const tableBody = document.getElementById('mpesaTable');
        tableBody.innerHTML = ''; // Clear old data

        transactions.forEach(txn => {
            // We define 'date' locally here to prevent the ReferenceError
            const rowDate = txn.date || new Date().toLocaleString();

            const rowHTML = `
            <tr>
                <td>${txn.id}</td>
                <td>${txn.phoneNumber || 'N/A'}</td>
                <td>KES ${txn.amount}</td>
                <td>${rowDate}</td> <td>${txn.walletId || 'Main'}</td>
            </tr>`;
            tableBody.innerHTML += rowHTML;
        });
    }

    const walletBalance = document.getElementById("walletBalance");
    const monthlyIncome = document.getElementById("monthlyIncome");

    if (walletBalance) walletBalance.innerText = `KES ${walletTotal}`;
    if (monthlyIncome) monthlyIncome.innerText = `KES ${monthlyTotal}`;
}

function applyFilter() {
    const fromValue = document.getElementById("fromDate").value;
    const toValue = document.getElementById("toDate").value;

    if (!fromValue || !toValue) return alert("Please select both dates");

    const from = new Date(fromValue);
    const to = new Date(toValue);
    to.setHours(23, 59, 59, 999);

    const filtered = mpesaTransactions.filter(tx => {
        const d = new Date(tx.datetime.replace(" ", "T"));
        return d >= from && d <= to;
    });

    renderFilteredTable(filtered);
}

function renderFilteredTable(data) {
    const tbody = document.getElementById("mpesaTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    data.forEach(tx => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${tx.mpesaId}</td>
      <td>${tx.phone}</td>
      <td>${tx.amount}</td>
      <td>${tx.datetime}</td>
      <td>${tx.walletId}</td>
    `;
        tbody.appendChild(tr);
    });
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("M-Pesa Statement", 14, 10);

    let y = 20;
    mpesaTransactions.forEach(t => {
        doc.text(
            `${t.mpesaId} | ${t.phone} | KES ${t.amount} | ${t.datetime}`,
            14,
            y
        );
        y += 8;
        if (y > 280) { doc.addPage(); y = 20; }
    });

    doc.save("mpesa_statement.pdf");
}

//  WALLET SYSTEM 
function toggleWalletFields() {
    const type = document.getElementById('wType').value;
    const container = document.getElementById('dynamicFields');

    if (!container) return;

    if (type === 'Bank') {
        let bankOptions = Object.keys(bankData).map(b => `<option value="${b}">${b}</option>`).join('');
        container.innerHTML = `
      <label class="muted">Select Bank</label>
      <select id="wBankName" onchange="updateBankPaybill()">
        <option value="">-- Select Bank --</option>
        ${bankOptions}
        <option value="Other">Other (Manual Entry)</option>
      </select>
      <label class="muted" style="margin-top:10px; display:block;">Bank Paybill Number</label>
      <input type="number" id="wBankPaybill" placeholder="Paybill will auto-fill" readonly>
      <label class="muted" style="margin-top:10px; display:block;">Bank Account Number</label>
      <input type="text" id="wBankAccount" placeholder="Enter your Account Number">`;
    } else if (type === 'Paybill') {
        container.innerHTML = `
      <label class="muted">Store Number</label>
      <input type="number" id="wStoreNumber" placeholder="123456">
      <label class="muted" style="margin-top:10px; display:block;">Account Number</label>
      <input type="text" id="wAccount" placeholder="ACC-001">`;
    } else {
        container.innerHTML = `<label class="muted">Till Number</label><input type="number" id="wTill">`;
    }
}

function updateBankPaybill() {
    const bankSelect = document.getElementById('wBankName');
    const paybillInput = document.getElementById('wBankPaybill');

    if (!bankSelect || !paybillInput) return;

    if (bankSelect.value === "Other") {
        paybillInput.value = "";
        paybillInput.readOnly = false;
        paybillInput.placeholder = "Enter Paybill Number";
        paybillInput.style.border = "1px solid var(--orange)";
    } else {
        paybillInput.value = bankData[bankSelect.value] || "";
        paybillInput.readOnly = true;
        paybillInput.style.border = "1px solid rgba(255,255,255,0.1)";
    }
}

function deleteWallet(id) {
    if (confirm("Are you sure you want to delete this wallet?")) {
        wallets = wallets.filter(w => w.id !== id);
        renderWallets();
    }
}

function submitNewWallet() {
    const name = document.getElementById('wName').value;
    const type = document.getElementById('wType').value;
    if (!name) return alert("Please enter a wallet name");

    let walletDetails = {
        id: "WL-" + Math.floor(Math.random() * 1000),
        name: name,
        type: type,
        balance: 0
    };

    if (type === 'Bank') {
        walletDetails.bank = document.getElementById('wBankName').value;
        walletDetails.paybill = document.getElementById('wBankPaybill').value;
        walletDetails.account = document.getElementById('wBankAccount').value;
    } else if (type === 'Paybill') {
        walletDetails.paybill = document.getElementById('wStoreNumber').value;
        walletDetails.account = document.getElementById('wAccount').value;
    } else {
        walletDetails.paybill = document.getElementById('wTill').value;
    }

    wallets.push(walletDetails);
    renderWallets();
    closeModal('modalCreateWallet');
    document.getElementById('wName').value = "";
}

function renderWallets() {
    const grid = document.getElementById("walletGrid");
    if (!grid) return;

    grid.innerHTML = wallets.map(w => `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="muted" style="font-size:10px; text-transform:uppercase;">${w.type} Wallet</div>
        <button onclick="deleteWallet('${w.id}')" style="background:none; border:none; color:var(--red); cursor:pointer;">
          <i class="fa fa-trash"></i>
        </button>
      </div>
      <h3 style="margin:5px 0;">${w.name}</h3>
      <div style="font-size:12px; color:var(--blue);">
        ${w.type === 'Bank' ? `${w.bank} | Paybill: ${w.paybill} | Acc: ${w.account}` : ''}
        ${w.type === 'Paybill' ? `Paybill: ${w.paybill} | Acc: ${w.account}` : ''}
        ${w.type === 'BuyGoods' ? `Till: ${w.paybill}` : ''}
      </div>
      <div class="stat-large" style="margin-top:10px; color:var(--green);">KES ${w.balance.toLocaleString()}</div>
    </div>
  `).join('');
}

//  HOTSPOT PACKAGE LOGIC 
function toggleExpiryFields() {
    const mode = document.getElementById('pExpiryMode').value;
    const input = document.getElementById('pExpiryValue');
    if (!input) return;

    if (mode === 'Data') {
        input.placeholder = "e.g. 1GB or 500MB";
    } else if (mode === 'Fixed') {
        input.placeholder = "e.g. 1H (Usage based)";
    } else {
        input.placeholder = "e.g. 24H (From first login)";
    }
}

function submitNewPackage() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;

    if (!name || !price) return alert("Please fill in Plan Name and Price");

    const activeDays = Array.from(document.querySelectorAll('.pDay:checked')).map(cb => cb.value);

    const newPkg = {
        id: "PKG-" + Math.floor(Math.random() * 10000),
        name: name,
        price: price,
        mode: document.getElementById('pExpiryMode').value,
        expiryVal: document.getElementById('pExpiryValue').value || "1GB",
        speed: document.getElementById('pSpeed').value || "5",
        devices: document.getElementById('pDevices').value || "1",
        scope: document.getElementById('pScope').value,
        activeDays: activeDays.length > 0 ? activeDays : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    };

    hotspotPackages.push(newPkg);
    renderPackages();
    closeModal('modalAddPackage');

    // Reset form fields
    document.getElementById('pName').value = "";
    document.getElementById('pPrice').value = "";
    document.getElementById('pExpiryValue').value = "";
    document.getElementById('pSpeed').value = "5";
    document.getElementById('pDevices').value = "1";
    document.querySelectorAll('.pDay').forEach(cb => cb.checked = true);
}

function renderPackages() {
    const grid = document.getElementById("packageGrid");
    if (!grid) return;

    grid.innerHTML = hotspotPackages.map(p => `
    <div class="card" style="border-left: 4px solid var(--blue);">
      <div style="display:flex; justify-content:space-between; align-items: flex-start;">
        <div>
          <div class="muted" style="font-size:10px; text-transform:uppercase;">${p.mode} Plan</div>
          <h3 style="margin:5px 0;">${p.name}</h3>
        </div>
        <button onclick="deletePackage('${p.id}')" style="background:none; border:none; color:var(--red); cursor:pointer;">
          <i class="fa fa-trash"></i>
        </button>
      </div>
      <div style="font-size:12px; margin: 10px 0;">
        <div>Speed: ${p.speed} Mbps | Devices: ${p.devices}</div>
        <div>Limit: ${p.expiryVal} | Scope: ${p.scope}</div>
        <div>Days: ${p.activeDays.join(', ')}</div>
      </div>
      <div class="stat-large" style="color:var(--orange)">KES ${p.price}</div>
    </div>
  `).join('');
}

function deletePackage(id) {
    if (confirm("Delete this package?")) {
        hotspotPackages = hotspotPackages.filter(p => p.id !== id);
        renderPackages();
    }
}
let vouchers = [];

function generateVoucherLogic() {
    const pkg = document.getElementById('vouchPackage').value;
    const qty = parseInt(document.getElementById('vouchQty').value);
    const prefix = document.getElementById('vouchPrefix').value.toUpperCase();

    for (let i = 0; i < qty; i++) {
        // Generate random 6-character code
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newVoucher = {
            code: prefix + randomCode,
            package: pkg,
            created: new Date().toLocaleDateString(),
            status: 'Unused'
        };
        vouchers.unshift(newVoucher);
    }

    renderVouchers();
    closeModal('modalGenerateVouchers');
}

function renderVouchers() {
    const tbody = document.getElementById('voucherTableBody');
    if (!tbody) return;

    tbody.innerHTML = vouchers.map((v, index) => `
    <tr>
      <td style="font-family: monospace; font-weight: 800; color: var(--orange);">${v.code}</td>
      <td>${v.package}</td>
      <td>${v.created}</td>
      <td><span class="test-status test-success">${v.status}</span></td>
      <td>
        <button class="btn btn-ghost" onclick="copyVoucher('${v.code}')"><i class="fa fa-copy"></i></button>
        <button class="btn btn-danger" onclick="deleteVoucher(${index})"><i class="fa fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

    // Update Stats
    document.getElementById('totalVoucherCount').innerText = vouchers.length;
    document.getElementById('unusedVoucherCount').innerText = vouchers.filter(v => v.status === 'Unused').length;
}

function copyVoucher(code) {
    navigator.clipboard.writeText(code);
    alert("Voucher " + code + " copied to clipboard!");
}

function deleteVoucher(index) {
    if (confirm("Delete this voucher?")) {
        vouchers.splice(index, 1);
        renderVouchers();
    }
}
let hotspotUsers = [];

function toggleHsManualFields() {
    const method = document.getElementById('hsMethod').value;
    document.getElementById('hsPackageDiv').style.display = (method === 'package') ? 'block' : 'none';
    document.getElementById('hsManualFields').style.display = (method === 'manual') ? 'grid' : 'none';
}

function submitHotspotUser() {
    const user = document.getElementById('hsUser').value;
    const pass = document.getElementById('hsPass').value;
    const method = document.getElementById('hsMethod').value;

    if (!user || !pass) return alert("Username and Password are required");

    let newUser = {
        id: Date.now(),
        username: user,
        password: pass,
        method: method
    };

    if (method === 'package') {
        newUser.displayMode = document.getElementById('hsSelectedPackage').value;
        newUser.limit = "Per Package";
        newUser.speed = "Auto";
    } else {
        newUser.displayMode = document.getElementById('hsManualMode').value;
        newUser.limit = document.getElementById('hsManualLimit').value || "No Limit";
        newUser.speed = (document.getElementById('hsManualSpeed').value || "5") + " Mbps";
    }

    hotspotUsers.push(newUser);
    renderHotspotUsers();
    closeModal('modalAddHotspotUser');

    // Reset fields
    document.getElementById('hsUser').value = '';
    document.getElementById('hsPass').value = '';
}

function renderHotspotUsers() {
    const tbody = document.getElementById('hotspotUserTableBody');
    if (!tbody) return;

    tbody.innerHTML = hotspotUsers.map((u, index) => `
    <tr>
      <td><i class="fa fa-user muted"></i> <strong>${u.username}</strong></td>
      <td><span class="chip" style="background:rgba(0,82,204,0.1); color:var(--blue)">${u.displayMode}</span></td>
      <td>${u.limit}</td>
      <td>${u.speed}</td>
      <td>
        <button class="btn btn-danger" style="padding: 5px 10px;" onclick="deleteHotspotUser(${index})">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function deleteHotspotUser(index) {
    if (confirm("Permanently delete this hotspot user?")) {
        hotspotUsers.splice(index, 1);
        renderHotspotUsers();
    }
}

// Update the navigation hook to refresh the table when clicking the page
const currentNavigateHS = navigate;
navigate = function (pageId) {
    currentNavigateHS(pageId);
    if (pageId === 'hotspot-users') renderHotspotUsers();
};

// Update your existing navigate function check
const originalVoucherNavigate = navigate;
navigate = function (pageId) {
    if (typeof originalVoucherNavigate === 'function') originalVoucherNavigate(pageId);
    if (pageId === 'vouchers') renderVouchers();
};

function generateMikrotikConfig() {
    const routerName = document.getElementById("routerNameCorrect").value;
    const ssid = document.getElementById("ssidCorrect").value;
    const error = document.getElementById("error");
    const output = document.getElementById("output");
    const configContent = document.getElementById("configContent");

    error.textContent = "";
    output.style.display = "none";

    if (!routerName || !ssid) {
        error.textContent = "Router name and SSID are required.";
        return;
    }

    const checked = document.querySelectorAll('#page-router-setup .checkbox-group input:checked');
    if (checked.length === 0) {
        error.textContent = "Select at least one bridge interface.";
        return;
    }

    let bridgePorts = "";
    checked.forEach(i => {
        bridgePorts += `/interface bridge port add bridge=bridge-lan interface=${i.value}\n`;
    });

    const rsc = `/system identity set name="${routerName}"

# Bridge
/interface bridge
add name=bridge-lan protocol-mode=rstp

${bridgePorts}

# WiFi
/interface wireless
set [ find default-name=wlan1 ] mode=ap-bridge ssid="${ssid}" disabled=no

# IP Address
/ip address
add address=192.168.88.1/24 interface=bridge-lan

# DHCP
/ip pool
add name=dhcp_pool ranges=192.168.88.10-192.168.88.254

/ip dhcp-server
add name=dhcp1 interface=bridge-lan address-pool=dhcp_pool disabled=no

/ip dhcp-server network
add address=192.168.88.0/24 gateway=192.168.88.1 dns-server=8.8.8.8,1.1.1.1`;

    configContent.textContent = rsc;
    output.style.display = "block";
}

function copyConfig() {
    const content = document.getElementById("configContent").textContent;
    navigator.clipboard.writeText(content).then(() => alert("Config copied!"));
}

//  PPPoE FUNCTIONS 
function addPppoeUser() {
    const name = document.getElementById('newPppUser').value.trim();
    const plan = document.getElementById('newPppPlan').value;
    if (!name) { alert('Enter username'); return; }
    const tbody = document.getElementById('pppoeList');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${name}</td><td>${plan}</td><td>Active</td><td><button class="btn btn-ghost" onclick="openManagePppoe(this)">Manage</button><button class="btn btn-danger" onclick="deletePppoe(this)">Delete</button></td>`;
    tbody.appendChild(tr);
    document.getElementById('newPppUser').value = '';
    closeModal('modalAddPppoe');
}

let _manageRow = null;
function openManagePppoe(btn) {
    const tr = btn.closest('tr');
    _manageRow = tr;
    document.getElementById('managePppName').innerText = tr.children[0].innerText;
    openModal('modalManagePppoe');
}

function togglePppStatus() {
    if (!_manageRow) return;
    const c = _manageRow.children[2];
    c.innerText = c.innerText === 'Active' ? 'Suspended' : 'Active';
    closeModal('modalManagePppoe');
}

function deletePppoe(btn) {
    if (!confirm('Delete this PPPoE user?')) return;
    const tr = btn.closest('tr');
    tr.parentNode.removeChild(tr);
}

function confirmDeletePpp() {
    if (!confirm('Confirm delete?')) return;
    if (_manageRow) {
        _manageRow.parentNode.removeChild(_manageRow);
        _manageRow = null;
    }
    closeModal('modalManagePppoe');
}

function sendBulkSMS() {
    const t = document.getElementById('smsText').value.trim();
    if (!t) { alert('Enter message'); return; }
    alert('Queued: ' + (t.length > 40 ? t.slice(0, 40) + '...' : t));
    closeModal('modalBulkSms');
}

//  CHARTS 
window.addEventListener('load', () => {
    const opt = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: {
                    color: document.body.classList.contains('light') ? '#0f1724' : '#bcd2ff',
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                ticks: {
                    color: document.body.classList.contains('light') ? '#0f1724' : '#bcd2ff'
                }
            }
        }
    };

    // Monthly chart
    const monthlyCanvas = document.getElementById('chartMonthlyCanvas');
    if (monthlyCanvas) {
        new Chart(monthlyCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Income',
                    data: [120000, 130000, 115000, 140000, 150000, 160000, 170000, 180000, 165000, 190000, 200000, 210000],
                    borderColor: 'rgba(255,127,0,1)',
                    backgroundColor: 'rgba(255,127,0,0.08)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: opt
        });
    }

    // Weekly chart
    const weeklyCanvas = document.getElementById('chartWeeklyCanvas');
    if (weeklyCanvas) {
        new Chart(weeklyCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    data: [7000, 8000, 6000, 12000, 10000, 9000, 4800],
                    backgroundColor: 'rgba(0,82,204,0.9)'
                }]
            },
            options: opt
        });
    }

    // Daily 24 hours chart
    const dailyCanvas = document.getElementById('chartDailyCanvas');
    if (dailyCanvas) {
        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
        new Chart(dailyCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: hours.slice(-12),
                datasets: [{
                    data: hours.slice(-12).map(() => Math.floor(Math.random() * 1200) + 200),
                    backgroundColor: 'rgba(255,127,0,0.95)'
                }]
            },
            options: opt
        });
    }

    // Usage chart
    const usageCanvas = document.getElementById('chartUsageCanvas');
    if (usageCanvas) {
        const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
        const usage = hours.slice(-12).map((_, i) => Math.floor(Math.sin(i / 3) * 50 + Math.random() * 70 + 80));
        new Chart(usageCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: hours.slice(-12),
                datasets: [{
                    data: usage,
                    borderColor: 'rgba(0,82,204,1)',
                    backgroundColor: 'rgba(0,82,204,0.06)',
                    pointRadius: 2,
                    tension: 0.3
                }]
            },
            options: opt
        });
    }

    // Router health chart
    const healthCanvas = document.getElementById('chartHealthCanvas');
    if (healthCanvas) {
        new Chart(healthCanvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['CPU', 'Memory', 'Uptime', 'Connections', 'Packet Loss'],
                datasets: [{
                    label: 'Router A',
                    data: [80, 65, 99, 60, 5],
                    borderColor: 'rgba(0,82,204,1)',
                    backgroundColor: 'rgba(0,82,204,0.08)'
                }, {
                    label: 'Router B',
                    data: [60, 45, 95, 50, 15],
                    borderColor: 'rgba(217,83,79,1)',
                    backgroundColor: 'rgba(217,83,79,0.08)'
                }]
            },
            options: {
                ...opt,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // Initialize data
    renderWallets();
    renderPackages();
    renderMpesaTable();

    // Check if we need to show a specific page by default
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
        navigate(page);
    }
    // Add this to your GLOBAL STATE section
    let notifications = [
        {
            id: 1,
            type: 'device',
            icon: 'fa-triangle-exclamation',
            title: 'Router Faulty',
            desc: 'Station AP-01 reported high packet loss (15%). Check physical connection.',
            time: '2 mins ago'
        },
        {
            id: 2,
            type: 'success',
            icon: 'fa-money-bill-wave',
            title: 'PPPoE Payment Received',
            desc: 'User pppoe_user1 paid KES 1,500 via M-Pesa. Account reactivated.',
            time: '1 hour ago'
        },
        {
            id: 3,
            type: 'admin',
            icon: 'fa-user-shield',
            title: 'New Login Attempt',
            desc: 'Successful admin login from IP 192.168.100.45.',
            time: '3 hours ago'
        },
        {
            id: 4,
            type: 'success',
            icon: 'fa-router',
            title: 'System Update',
            desc: 'New Router "MikroTik_Main" successfully added to the system.',
            time: 'Yesterday'
        }
    ];

    function renderNotifications() {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        container.innerHTML = notifications.map(n => `
    <div class="notif-item">
      <div class="notif-icon type-${n.type}">
        <i class="fa ${n.icon}"></i>
      </div>
      <div class="notif-content">
        <div style="font-weight: 800; font-size: 14px;">${n.title}</div>
        <div class="muted" style="margin-top: 2px;">${n.desc}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>
  `).join('');

        // Update badge count
        const badge = document.getElementById('notif-count');
        if (badge) badge.innerText = notifications.length;
    }

    function clearNotifications() {
        notifications = [];
        renderNotifications();
        alert("All notifications cleared.");
    }

    // Update your existing navigate function to include renderNotifications()
    const originalNavigate = navigate;
    navigate = function (pageId) {
        originalNavigate(pageId);
        if (pageId === 'notifications') renderNotifications();
    };
//< !--BULK SMS FUNCTION-- >
        function countSMS() {
            const body = document.getElementById('smsBody').value;
            const chars = body.length;
            const count = Math.ceil(chars / 160) || 0;

            document.getElementById('charCount').innerText = chars;
            document.getElementById('smsCount').innerText = count;
        }

    function applyTemplate(type) {
        const textarea = document.getElementById('smsBody');
        if (type === 'expiry') {
            textarea.value = "Dear Customer, your internet subscription expires in 2 days. Kindly top up to avoid disconnection. Thank you.";
        } else if (type === 'welcome') {
            textarea.value = "Welcome to DELTECH-ISP! Your account is now active. Log in with your phone number to start browsing.";
        }
        countSMS();
    }
//< !--pppoe function-->
        /**
         * NAVIGATION LOGIC
         * Updates the existing navigate function to support new sections
         */
        function navigate(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Also handle the analytics section if it's using the old ID
            const analytics = document.getElementById('analytics-section');
            if (analytics) analytics.style.display = 'none';

            // Show the requested page
            const targetPage = document.getElementById('page-' + pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            } else if (pageId === 'analytics' && analytics) {
                analytics.style.display = 'block'; // Fallback for the analytics section
            }

            // Close sidebar on mobile after navigation
            const sidebar = document.getElementById('sidebar');
            if (sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        }

        //< !--BULK SMS LOGIC-- >
            function countSMS() {
                const body = document.getElementById('smsBody').value;
                const chars = body.length;
                const count = Math.ceil(chars / 160) || 0;

                document.getElementById('charCount').innerText = chars;
                document.getElementById('smsCount').innerText = count;
            }

    function applyTemplate(type) {
        const textarea = document.getElementById('smsBody');
        if (type === 'expiry') {
            textarea.value = "Dear Customer, your internet subscription expires in 2 days. Kindly top up to avoid disconnection. Thank you.";
        } else if (type === 'welcome') {
            textarea.value = "Welcome to DELTECH-ISP! Your account is now active. Log in with your phone number to start browsing.";
        }
        countSMS(); // Refresh counter
    }

    /**
     * PPPoE & MODAL LOGIC
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Example logic for saving a PPPoE Plan (Generates a new card)
    function savePppoePlan() {
        // In a real app, you'd collect data from inputs:
        // const name = document.querySelector('#modalAddPppoePlan input').value;

        alert("PPPoE Plan created successfully and synced with Router!");
        closeModal('modalAddPppoePlan');
    }

    // Example logic for saving a PPPoE User
    function savePppoeUser() {
        alert("New PPPoE User account has been created.");
        closeModal('modalAddPppoeUser');
    }

    /**
     * INITIALIZATION
     * Ensure the dashboard is the default view
     */
    window.addEventListener('DOMContentLoaded', () => {
        // If no page is active, show dashboard
        if (!document.querySelector('.page.active')) {
            navigate('dashboard');
        }
    });
    /**
     * REMOTE MANAGEMENT & NETWORK LOGIC
     */

    // Function to handle Winbox/Webfig external links
    function openRemoteAccess(protocol, ip) {
        if (protocol === 'winbox') {
            // This attempts to trigger the local winbox app via protocol handler if configured
            window.location.href = `winbox://${ip}`;
            console.log(`Attempting to connect to ${ip} via Winbox...`);
        } else {
            window.open(`http://${ip}`, '_blank');
        }
    }

    // Logic for Tunnel Creation
    function initializeTunnel() {
        const deviceName = document.querySelector('#modalAddTunnel input[type="text"]').value;
        const protocol = document.querySelector('#modalAddTunnel select').value;

        if (!deviceName) {
            alert("Please enter a Device Identity.");
            return;
        }

        // Visual feedback for the user
        console.log(`Provisioning ${protocol} tunnel for ${deviceName}...`);

        // In a real scenario, this would be an API call to your MikroTik/Radius server
        setTimeout(() => {
            alert(`Success: ${protocol} Tunnel established for ${deviceName}. Link is now active.`);
            closeModal('modalAddTunnel');
        }, 1000);
    }

    /**
     * UPDATED NAVIGATION
     * Ensure 'remote-mgmt' is recognized by the page switcher
     */
    function navigate(pageId) {
        // 1. Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // 2. Show target page
        const target = document.getElementById('page-' + pageId);
        if (target) {
            target.classList.add('active');

            // Special logic: Refresh network status when entering Remote Management
            if (pageId === 'remote-mgmt') {
                console.log("Refreshing tunnel heartbeats...");
                // You could trigger a function here to fetch live VPN statuses
            }
        }

        // 3. Update sidebar active state (Optional visual polish)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick')?.includes(pageId)) {
                item.classList.add('active');
            }
        });
    }

    /**
     * MODAL HANDLERS
     */
    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Close modals if user clicks outside the modal box
    window.onclick = function (event) {
        if (event.target.classList.contains('modal-overlay')) {
            event.target.style.display = "none";
        }
    }
    /**
     * SETTINGS & BRANDING LOGIC
     */

    // Preview Logo after upload
    function previewLogo(event) {
        const reader = new FileReader();
        reader.onload = function () {
            const output = document.getElementById('logoPreview');
            output.innerHTML = `<img src="${reader.result}" style="max-height: 60px; border-radius: 8px; border: 1px solid var(--blue);">`;
            // Also update the sidebar logo for immediate effect
            document.querySelector('.brand img').src = reader.result;
        }
        reader.readAsDataURL(event.target.files[0]);
    }

    // Logic for saving account changes
    function updateAccountInfo() {
        // In a real app, send data to server here
        alert("Settings saved successfully! Some changes may require a refresh.");
    }

    /** * Extend the existing navigate function to handle 'settings' 
     * (Already handled by your dynamic page- switcher)
     */
    /**
    * LOGS MANAGEMENT LOGIC
    */

    // Simple search and filter function
    function filterLogs() {
        const searchTerm = document.getElementById('logSearch').value.toLowerCase();
        const category = document.getElementById('logCategory').value;
        const rows = document.querySelectorAll('#logsTableBody tr');

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const matchesSearch = text.includes(searchTerm);
            const matchesCategory = category === 'all' || text.includes(category);

            row.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
        });
    }

    // Function to simulate log exporting
    function exportLogs() {
        alert("Generating CSV export for all system logs...");
        // In a real app, this would trigger a download link
    }

    // Function to simulate clearing logs
    function clearLogs() {
        if (confirm("Are you sure you want to clear all history? This action cannot be undone.")) {
            document.getElementById('logsTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center" class="muted">No logs found.</td></tr>';
        }
    }
    /**FUNCTIONAL LOGS LOGIC*/

    // 1. FILTERING FUNCTION
    function filterLogs() {
        const searchTerm = document.getElementById('logSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('logCategory').value.toLowerCase();
        const rows = document.querySelectorAll('#logsTableBody tr');

        rows.forEach(row => {
            // Get text from columns: User(index 1), Category(index 2), Action(index 3)
            const cells = row.getElementsByTagName('td');
            if (cells.length > 0) {
                const user = cells[1].innerText.toLowerCase();
                const category = cells[2].innerText.toLowerCase();
                const action = cells[3].innerText.toLowerCase();

                const matchesSearch = user.includes(searchTerm) || action.includes(searchTerm);
                const matchesCategory = categoryFilter === 'all' || category.includes(categoryFilter);

                // Show/Hide row based on match
                row.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
            }
        });
    }

    // 2. EXPORT TO CSV FUNCTION
    function exportLogs() {
        const rows = document.querySelectorAll('#logsTableBody tr');
        let csvContent = "Timestamp,User,Category,Description,IP Address\n";

        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            const rowData = Array.from(cols).map(col => `"${col.innerText.replace(/"/g, '""')}"`);
            csvContent += rowData.join(",") + "\n";
        });

        // Create a download link and trigger it
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", "deltech_isp_logs.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

// 3. CLEAR HISTORY FUNCTION
function clearLogs() {
    const tableBody = document.getElementById('logsTableBody');

    // Confirm before deleting
    if (confirm("Are you sure you want to permanently clear all logs?")) {
        // Add a fade-out effect for polish
        tableBody.style.opacity = '0.5';

        setTimeout(() => {
            tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 40px;" class="muted">
            <i class="fa fa-folder-open" style="font-size: 24px; display:block; margin-bottom:10px;"></i>
            No activity logs found.
          </td>
        </tr>`;
            tableBody.style.opacity = '1';
        }, 300);
    }
}
//< !--SECURE LOGOUT LOGIC-- >
   function handleLogout() {
    // Show the logout animation/overlay
    document.getElementById('logout-overlay').style.display = 'flex';
        // 3. Security: Wipe session and local data
        localStorage.clear();
        sessionStorage.clear();

        // 4. Teardown: Reload the app to its default state
        setTimeout(() => {
            window.location.href="access.html";
        }, 1200);
        window.sendMessage = function () {
            // 1. Target the recipient textarea
            const phoneInput = document.querySelector('textarea[placeholder*="254700000000"]');
            const phone = phoneInput ? phoneInput.value : "";

            // 2. Target the message body
            const messageInput = document.getElementById('smsBody');
            const message = messageInput ? messageInput.value : "";

            if (!phone || !message) {
                alert("Please enter both a phone number and a message.");
                return;
            }

            console.log("Sending to: " + phone);
            console.log("Message: " + message);

            // Simulate sending
            alert("Message sent successfully to " + phone);

            // Optional: Clear fields after sending
            phoneInput.value = "";
            messageInput.value = "";
        };
        window.confirmTopUp = function () {
            // 1. Find the input field in your modalTopUp
            const amountInput = document.querySelector('#modalTopUp input[type="number"]');

            // 2. Define 'amount' by getting the value from that input
            let amount = parseFloat(amountInput.value);

            // 3. Check if the user actually entered a number
            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid amount.");
                return;
            }

            // Now you can safely use 'amount'
            walletBalances.transaction += amount;
            console.log("New Balance: " + walletBalances.transaction);
        };
        // Use walletBalances.type instead of just 'type'
        if (walletBalances.type === 'transaction') {
            document.querySelector('.stat-large[style*="var(--orange)"]').innerText = `KES ${walletBalances.transaction}`;
            document.querySelector('.wallet-info span').innerText = `KES ${walletBalances.transaction}`;
        } else {
            // SMS update logic
            const smsStat = document.querySelector('.stat-large[style*="var(--blue)"]');
            if (smsStat) smsStat.innerText = walletBalances.sms;
        }
}
