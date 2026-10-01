/* ==========================================================================
   CampusFind AI - CCIT Department Lost & Found Application Logic
   ========================================================================== */

// CONSTANTS & SYSTEM CONFIGURATION
const CONFIG = {
    DEPT_NAME: "CCIT Department",
    SBO_OFFICE: "SBO Office (Room CCIT-302)",
    OFFICE_HOURS: "8:00 AM - 3:00 PM",
    STORAGE_KEYS: {
        AUTH_ID: "campusfind_student_id",
        ITEMS: "campusfind_items_db",
        CLAIMS: "campusfind_claims_db",
        CHAT_LOGS: "campusfind_chat_logs"
    }
};

// INITIAL MOCK DATASET
const INITIAL_ITEMS = [
    {
        id: "ITEM-1001",
        type: "FOUND",
        category: "Electronics",
        title: "MacBook Air M2 Charger & MagSafe Cable",
        brandColor: "Apple White / Braided Cable",
        location: "CCIT Computer Lab 2",
        date: "2026-09-29",
        dropLocation: "SBO Office Desk (Room CCIT-302)",
        uniqueMarkings: "Small blue circuit sticker near wall plug, slight scratch near USB-C tip",
        status: "FOUND",
        reporterStudentId: "2023-CS-5591"
    },
    {
        id: "ITEM-1002",
        type: "FOUND",
        category: "ID & Cards",
        title: "CCIT Student RFID Access Badge",
        brandColor: "CCIT Lanyard / White Card",
        location: "Lecture Hall A",
        date: "2026-09-30",
        dropLocation: "SBO Office Desk (Room CCIT-302)",
        uniqueMarkings: "Contains student photo, name starting with 'K.T.', CCIT 2025 batch badge",
        status: "FOUND",
        reporterStudentId: "2024-CCIT-1082"
    },
    {
        id: "ITEM-1003",
        type: "FOUND",
        category: "Books & Notes",
        title: "Texas Instruments TI-84 Plus CE Calculator",
        brandColor: "Black Plastic Shell",
        location: "CCIT Computer Lab 1",
        date: "2026-10-01",
        dropLocation: "SBO Office Desk (Room CCIT-302)",
        uniqueMarkings: "Initial 'M.C.' etched inside battery compartment slide cover, custom matrix code wallpaper",
        status: "FOUND",
        reporterStudentId: "2025-IT-3319"
    },
    {
        id: "ITEM-1004",
        type: "FOUND",
        category: "Bags & Accessories",
        title: "SanDisk Extreme 64GB USB Flash Drive",
        brandColor: "Black with Red Trim",
        location: "CCIT Library & Study Center",
        date: "2026-09-28",
        dropLocation: "SBO Office Desk (Room CCIT-302)",
        uniqueMarkings: "Attached to a metal key ring with a miniature Tux Linux mascot keychain",
        status: "FOUND",
        reporterStudentId: "2023-CS-5591"
    },
    {
        id: "ITEM-1005",
        type: "LOST",
        category: "Electronics",
        title: "Sony WH-1000XM4 Noise Canceling Headphones",
        brandColor: "Matte Black",
        location: "CCIT Student Lounge",
        date: "2026-09-27",
        dropLocation: "N/A",
        uniqueMarkings: "Small scuff on left ear cup cushion, black hardshell case with braided aux cord",
        status: "LOST",
        reporterStudentId: "2024-CCIT-1082"
    },
    {
        id: "ITEM-1006",
        type: "FOUND",
        category: "Keys & Personal",
        title: "Hydry Flask 32oz Insulated Stainless Steel Bottle",
        brandColor: "Pacific Blue",
        location: "Lecture Hall B",
        date: "2026-09-30",
        dropLocation: "SBO Office Desk (Room CCIT-302)",
        uniqueMarkings: "Sticker of 'GitHub Octocat' and 'CCIT Code Fest 2025' on side",
        status: "FOUND",
        reporterStudentId: "2025-IT-3319"
    },
    {
        id: "ITEM-1007",
        type: "FOUND",
        category: "Apparel & Umbrella",
        title: "CCIT Department Zip-up Hoodie (Size L)",
        brandColor: "Navy Blue / White Logo",
        location: "CCIT Computer Lab 3",
        date: "2026-10-01",
        dropLocation: "SBO Office Desk (Room CCIT-302)",
        uniqueMarkings: "Enclosed in left pocket is a pair of wired 3.5mm EarPods",
        status: "FOUND",
        reporterStudentId: "2024-CCIT-1082"
    }
];

// STATE MANAGEMENT
let state = {
    currentStudentId: null,
    items: [],
    claims: [],
    activeTab: "assistant",
    chatHistory: [],
    aiFlowStep: "IDLE" // IDLE, REPORT_LOST_CAT, REPORT_LOST_BRAND, etc.
};

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    initLucide();
    setupEventListeners();
    renderAll();

    // Send welcome bot message if empty
    if (state.chatHistory.length === 0) {
        addBotMessage(
            `Hello! I am **CampusFind AI**, the official operations assistant for the **${CONFIG.DEPT_NAME} Lost & Found** module.\n\n` +
            `I process inquiries, catalog items, and generate secure claim reference codes for verification at the **${CONFIG.SBO_OFFICE}** during **${CONFIG.OFFICE_HOURS}**.\n\n` +
            (state.currentStudentId
                ? `🔐 *Authenticated as Student ID: **${state.currentStudentId}***. How can I assist you today?`
                : `⚠️ *You are currently unauthenticated.* Please log in with your Student ID to report, search, or claim items.`)
        );
    }
});

function initLucide() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// LOCAL STORAGE LOAD & SAVE
function loadState() {
    state.currentStudentId = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_ID) || null;

    const savedItems = localStorage.getItem(CONFIG.STORAGE_KEYS.ITEMS);
    state.items = savedItems ? JSON.parse(savedItems) : INITIAL_ITEMS;

    const savedClaims = localStorage.getItem(CONFIG.STORAGE_KEYS.CLAIMS);
    state.claims = savedClaims ? JSON.parse(savedClaims) : [];

    const savedChat = localStorage.getItem(CONFIG.STORAGE_KEYS.CHAT_LOGS);
    state.chatHistory = savedChat ? JSON.parse(savedChat) : [];
}

function saveState() {
    if (state.currentStudentId) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_ID, state.currentStudentId);
    } else {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_ID);
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.ITEMS, JSON.stringify(state.items));
    localStorage.setItem(CONFIG.STORAGE_KEYS.CLAIMS, JSON.stringify(state.claims));
    localStorage.setItem(CONFIG.STORAGE_KEYS.CHAT_LOGS, JSON.stringify(state.chatHistory));
}

// EVENT LISTENERS & NAVIGATION
function setupEventListeners() {
    // Navigation Tabs
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabTarget = btn.getAttribute("data-tab");
            switchTab(tabTarget);
        });
    });

    // Set today's date in form default
    const todayStr = new Date().toISOString().split("T")[0];
    const lostDateInput = document.getElementById("lostDate");
    if (lostDateInput) lostDateInput.value = todayStr;
}

function switchTab(tabId) {
    state.activeTab = tabId;

    // Update nav buttons active class
    document.querySelectorAll(".nav-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tabId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Update tab panes
    document.querySelectorAll(".tab-pane").forEach(pane => {
        if (pane.id === `tab-${tabId}`) {
            pane.classList.add("active");
        } else {
            pane.classList.remove("active");
        }
    });

    // Re-render target tab contents
    if (tabId === "browse") renderCatalog();
    if (tabId === "my-claims") renderMyClaims();
    if (tabId === "admin") renderAdminView();
    if (tabId === "report-lost" || tabId === "report-found") checkFormAuthGates();
}

function renderAll() {
    updateAuthUI();
    renderChatMessages();
    renderCatalog();
    renderMyClaims();
    renderAdminView();
    checkFormAuthGates();
    initLucide();
}

// AUTHENTICATION LOGIC
function updateAuthUI() {
    const badge = document.getElementById("userAuthBadge");
    const badgeText = document.getElementById("authBadgeText");
    const actionBtn = document.getElementById("authActionBtn");
    const chatNoticeText = document.getElementById("chatAuthNoticeText");

    if (state.currentStudentId) {
        badge.className = "user-badge authenticated";
        badgeText.textContent = `ID: ${state.currentStudentId}`;
        actionBtn.textContent = "Log Out";
        actionBtn.onclick = (e) => { e.stopPropagation(); logoutUser(); };
        if (chatNoticeText) chatNoticeText.textContent = `Authenticated (${state.currentStudentId})`;
    } else {
        badge.className = "user-badge unauthenticated";
        badgeText.textContent = "Unauthenticated";
        actionBtn.textContent = "Log In";
        actionBtn.onclick = (e) => { e.stopPropagation(); openAuthModal(); };
        if (chatNoticeText) chatNoticeText.textContent = "Logged Out (Guest)";
    }

    // Update prompt pills based on auth
    renderPromptPills();
}

function checkFormAuthGates() {
    const lostGate = document.getElementById("lostAuthGate");
    const foundGate = document.getElementById("foundAuthGate");
    const lostForm = document.getElementById("lostItemForm");
    const foundForm = document.getElementById("foundItemForm");

    if (!state.currentStudentId) {
        if (lostGate) lostGate.classList.remove("hidden");
        if (foundGate) foundGate.classList.remove("hidden");
        if (lostForm) lostForm.style.opacity = "0.4";
        if (foundForm) foundForm.style.opacity = "0.4";
    } else {
        if (lostGate) lostGate.classList.add("hidden");
        if (foundGate) foundGate.classList.add("hidden");
        if (lostForm) lostForm.style.opacity = "1";
        if (foundForm) foundForm.style.opacity = "1";
    }
}

function openAuthModal() {
    document.getElementById("authModal").classList.add("active");
}

function closeAuthModal() {
    document.getElementById("authModal").classList.remove("active");
}

function usePresetStudent(studentId, studentName) {
    document.getElementById("studentIdInput").value = studentId;
    authenticateStudent(studentId, studentName);
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const studentId = document.getElementById("studentIdInput").value.trim();
    if (studentId) {
        authenticateStudent(studentId);
    }
}

function authenticateStudent(studentId) {
    state.currentStudentId = studentId.toUpperCase();
    saveState();
    closeAuthModal();
    updateAuthUI();
    checkFormAuthGates();
    showToast(`Successfully authenticated as Student ID: ${state.currentStudentId}`, "success");

    // Post system notice in AI chat
    addBotMessage(`🔐 **Authentication Verified.** Welcome back, student **${state.currentStudentId}**! You now have full authorization to report items, search records, and generate claim reference codes.`);
}

function logoutUser() {
    showToast(`Logged out from Student ID: ${state.currentStudentId}`, "warning");
    state.currentStudentId = null;
    saveState();
    updateAuthUI();
    checkFormAuthGates();
    addBotMessage(`⚠️ You have logged out. Please log in with your Student ID to report, search, or claim items.`);
}

// TOAST SYSTEM
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconName = "info";
    if (type === "success") iconName = "check-circle";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "error") iconName = "x-circle";

    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    initLucide();

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// PROMPT PILLS IN CHAT
function renderPromptPills() {
    const container = document.getElementById("promptPills");
    if (!container) return;

    let prompts = [];
    if (!state.currentStudentId) {
        prompts = [
            { text: "🔐 Log in with Student ID", action: () => openAuthModal() },
            { text: "🔍 Search Found Items", action: () => triggerChatPrompt("Search found items") },
            { text: "ℹ️ SBO Office Hours & Location", action: () => triggerChatPrompt("What are the SBO office hours and pickup location?") }
        ];
    } else {
        prompts = [
            { text: "🔍 Search my lost laptop charger", action: () => triggerChatPrompt("I lost my MacBook charger in CCIT Lab 2") },
            { text: "📝 Report Lost Item", action: () => triggerChatPrompt("I want to report a lost item") },
            { text: "📥 Report Found Item", action: () => triggerChatPrompt("I found an item in CCIT Lab") },
            { text: "🎫 Check My Active Claims", action: () => triggerChatPrompt("Check my claim status") }
        ];
    }

    container.innerHTML = prompts.map((p, idx) => `
    <button type="button" class="btn-pill" onclick="promptClick(${idx})">${p.text}</button>
  `).join("");

    window._currentPrompts = prompts;
}

function promptClick(idx) {
    if (window._currentPrompts && window._currentPrompts[idx]) {
        window._currentPrompts[idx].action();
    }
}

function triggerChatPrompt(text) {
    const input = document.getElementById("chatInput");
    if (input) {
        input.value = text;
        handleChatSubmit(new Event('submit'));
    }
}

// AI CHATBOT SYSTEM LOGIC (CampusFind AI Engine)
function handleChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("chatInput");
    const query = input.value.trim();
    if (!query) return;

    // Add User Message
    addUserMessage(query);
    input.value = "";

    // Process AI Logic
    setTimeout(() => {
        processAiResponse(query);
    }, 300);
}

function addUserMessage(text) {
    const msgObj = {
        sender: "user",
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    state.chatHistory.push(msgObj);
    saveState();
    renderChatMessages();
}

function addBotMessage(text, cardData = null) {
    const msgObj = {
        sender: "bot",
        text: text,
        cardData: cardData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    state.chatHistory.push(msgObj);
    saveState();
    renderChatMessages();
}

function clearChatHistory() {
    state.chatHistory = [];
    saveState();
    addBotMessage(`Chat reset. How can CampusFind AI assist you?`);
}

function renderChatMessages() {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    container.innerHTML = state.chatHistory.map(msg => {
        const isBot = msg.sender === "bot";
        const avatarIcon = isBot ? `<i data-lucide="cpu"></i>` : `<i data-lucide="user"></i>`;
        const formattedText = formatMarkdownText(msg.text);

        let cardHtml = "";
        if (msg.cardData) {
            if (msg.cardData.type === "CLAIM_CODE") {
                cardHtml = `
          <div class="ai-card">
            <div class="ai-card-header">
              <span><i data-lucide="ticket"></i> OFFICIAL CLAIM REFERENCE CODE</span>
              <span>${CONFIG.DEPT_NAME}</span>
            </div>
            <div class="claim-code-display">${msg.cardData.code}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">
              <strong>Item:</strong> ${msg.cardData.itemTitle}<br>
              <strong>Verification Location:</strong> ${CONFIG.SBO_OFFICE}<br>
              <strong>Hours:</strong> ${CONFIG.OFFICE_HOURS}<br>
              <strong>Requirement:</strong> Bring physical Student ID card (<code>${state.currentStudentId}</code>) to verify distinguishing features in person.
            </div>
          </div>
        `;
            } else if (msg.cardData.type === "MATCH_LIST") {
                cardHtml = `
          <div class="ai-card">
            <div class="ai-card-header">
              <span><i data-lucide="search"></i> POTENTIAL CATALOG MATCHES</span>
              <span>${msg.cardData.items.length} Found</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
              ${msg.cardData.items.map(item => `
                <div style="background: rgba(255,255,255,0.04); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                  <div style="font-weight: 700; color: var(--primary); font-size: 0.9rem;">${item.title}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                    📍 ${item.location} • 📅 ${item.date} • Category: ${item.category}
                  </div>
                  <div class="privacy-mask-box" style="margin-top: 6px;">
                    <i data-lucide="lock" style="width: 14px; height: 14px;"></i>
                    <span>Distinguishing Markings: <em>🔒 [Confidential - In-Person Verification Required]</em></span>
                  </div>
                  <div style="margin-top: 8px; text-align: right;">
                    <button class="btn-claim-item" style="padding: 4px 10px; font-size: 0.75rem;" onclick="generateClaimFromChat('${item.id}')">
                      Claim This Item
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
            }
        }

        return `
      <div class="msg-row ${isBot ? 'bot' : 'user'}">
        <div class="msg-avatar">${avatarIcon}</div>
        <div class="msg-bubble-container">
          <div class="msg-bubble">
            ${formattedText}
            ${cardHtml}
          </div>
          <span class="msg-timestamp">${msg.timestamp}</span>
        </div>
      </div>
    `;
    }).join("");

    container.scrollTop = container.scrollHeight;
    initLucide();
}

function formatMarkdownText(txt) {
    if (!txt) return "";
    return txt
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");
}

// AI CONVERSATIONAL PROTOCOL PROCESSOR
function processAiResponse(rawQuery) {
    const query = rawQuery.toLowerCase();

    // AUTHENTICATION PROTOCOL CHECK
    // Rule: Always verify if user authenticated via USER_STUDENT_ID before granting access to reporting or searching
    const isAuthRequiredIntent =
        query.includes("report") ||
        query.includes("lost") ||
        query.includes("found") ||
        query.includes("search") ||
        query.includes("claim") ||
        query.includes("find");

    if (!state.currentStudentId && isAuthRequiredIntent) {
        addBotMessage(
            "Please log in with your Student ID to report, search, or claim items."
        );
        openAuthModal();
        return;
    }

    // INTENT 1: Hours / Location Inquiry
    if (query.includes("hours") || query.includes("location") || query.includes("office") || query.includes("sbo") || query.includes("where")) {
        addBotMessage(
            `The **${CONFIG.DEPT_NAME} Lost & Found** office is located at:\n\n` +
            `📍 **${CONFIG.SBO_OFFICE}**\n` +
            `⏰ **Operating Hours:** ${CONFIG.OFFICE_HOURS}\n\n` +
            `*Physical Student ID card verification is mandatory for item pickup.*`
        );
        return;
    }

    // INTENT 2: Report Lost Item Request
    if (query.includes("report lost") || query.includes("i lost") || query.includes("lost my")) {
        addBotMessage(
            `I can help you file a **Lost Item Report**. Please provide the following details (or use the **Report Lost Item** tab):\n\n` +
            `1. **Item Category** (e.g. Electronics, ID, Book, Charger)\n` +
            `2. **Brand / Color**\n` +
            `3. **Unique Markings** (Confidential distinguishing details)\n` +
            `4. **Last Known Department Location** (e.g., CCIT Lab 1)\n` +
            `5. **Date Lost**\n\n` +
            `Would you like to open the interactive guided reporting form?`,
            null
        );
        switchTab("report-lost");
        return;
    }

    // INTENT 3: Report Found Item Request
    if (query.includes("report found") || query.includes("i found") || query.includes("found a")) {
        addBotMessage(
            `Thank you for reporting a found item to the **${CONFIG.DEPT_NAME}** catalog!\n\n` +
            `We record:\n` +
            `• **Item Category** & **Visual Description**\n` +
            `• **Location Found** in CCIT\n` +
            `• **Current Drop-off Location** (Default: ${CONFIG.SBO_OFFICE})\n\n` +
            `I am opening the **Report Found Item** form for you now.`,
            null
        );
        switchTab("report-found");
        return;
    }

    // INTENT 4: Search & Claim Query
    if (query.includes("search") || query.includes("charger") || query.includes("laptop") || query.includes("bag") || query.includes("phone") || query.includes("id") || query.includes("card") || query.includes("calculator") || query.includes("keys") || query.includes("find")) {
        // Search existing catalog
        const matches = state.items.filter(item => {
            const matchText = `${item.title} ${item.category} ${item.brandColor} ${item.location}`.toLowerCase();
            return query.split(" ").some(q => q.length > 2 && matchText.includes(q));
        });

        if (matches.length > 0) {
            addBotMessage(
                `I found **${matches.length} matching found item(s)** in the CCIT Department catalog based on your inquiry.\n\n` +
                `🔒 *Privacy Protocol Active:* Sensitive distinguishing features are hidden from public view to prevent fraudulent claims.`,
                { type: "MATCH_LIST", items: matches }
            );
        } else {
            addBotMessage(
                `No exact matches were found currently in the catalog for your inquiry.\n\n` +
                `You can log an official **Lost Item Report** so our system can automatically notify you if a matching item is turned into the **${CONFIG.SBO_OFFICE}**.`
            );
        }
        return;
    }

    // INTENT 5: Check Claims Status
    if (query.includes("claim status") || query.includes("my claims") || query.includes("reference code")) {
        const userClaims = state.claims.filter(c => c.studentId === state.currentStudentId);
        if (userClaims.length > 0) {
            addBotMessage(
                `You currently have **${userClaims.length} active claim reference code(s)** registered under Student ID **${state.currentStudentId}**:\n\n` +
                userClaims.map(c => `🎫 **Code:** \`${c.code}\` - ${c.itemTitle}\n📍 Location: ${CONFIG.SBO_OFFICE} (${CONFIG.OFFICE_HOURS})`).join("\n\n") +
                `\n\n*Please present your physical Student ID card in person at the desk for item release.*`
            );
        } else {
            addBotMessage(
                `You have no active claim codes under Student ID **${state.currentStudentId}**. You can browse the catalog and select 'Claim Item' to generate a reference code.`
            );
        }
        return;
    }

    // DEFAULT FALLBACK RESPONSE
    addBotMessage(
        `I am **CampusFind AI**, ready to process your Lost & Found inquiry.\n\n` +
        `You can ask me to:\n` +
        `• Search registered found items in CCIT\n` +
        `• File a new Lost or Found item report\n` +
        `• Check your Claim Reference Codes\n` +
        `• Get SBO Office location & operating hours`
    );
}

// CLAIM GENERATION ENGINE
function generateClaimFromChat(itemId) {
    if (!state.currentStudentId) {
        openAuthModal();
        return;
    }
    processClaimForItem(itemId);
}

function processClaimForItem(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    // Check if already claimed
    const existingClaim = state.claims.find(c => c.itemId === itemId && c.studentId === state.currentStudentId);
    if (existingClaim) {
        showToast(`Claim code already exists: ${existingClaim.code}`, "info");
        openClaimModal(existingClaim, item);
        return;
    }

    // Generate Claim Reference Code: CCIT-CLAIM-YYYY-XXXX
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const claimCode = `CCIT-CLAIM-2026-${randomHex}`;

    const claimRecord = {
        code: claimCode,
        itemId: item.id,
        itemTitle: item.title,
        studentId: state.currentStudentId,
        timestamp: new Date().toLocaleDateString(),
        status: "PENDING_DESK_VERIFICATION"
    };

    state.claims.push(claimRecord);
    saveState();

    // Update item status
    item.status = "PENDING_CLAIM";
    saveState();

    renderAll();

    // Display in AI Chat
    addBotMessage(
        `✅ **Claim Reference Code Generated Successfully!**\n\n` +
        `Your secure claim code for **${item.title}** has been registered.`,
        {
            type: "CLAIM_CODE",
            code: claimCode,
            itemTitle: item.title
        }
    );

    openClaimModal(claimRecord, item);
    showToast(`Claim Code Generated: ${claimCode}`, "success");
}

function openClaimModal(claimRecord, item) {
    const body = document.getElementById("claimModalBody");
    body.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Generated Claim Code</div>
      <div class="claim-code-display" style="font-size: 1.4rem; padding: 14px; margin: 12px 0;">${claimRecord.code}</div>
      <p style="font-size: 0.9rem; color: var(--text-main); font-weight: 600;">Item: ${item.title}</p>
    </div>

    <div style="background: rgba(14, 19, 32, 0.8); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 0.85rem;">
      <div style="font-weight: 700; color: var(--primary); margin-bottom: 8px;">📋 Mandatory Desk Verification Instructions</div>
      <p style="margin-bottom: 6px;">1. Visit <strong>${CONFIG.SBO_OFFICE}</strong> during operating hours (<strong>${CONFIG.OFFICE_HOURS}</strong>).</p>
      <p style="margin-bottom: 6px;">2. Present your <strong>physical Student ID card</strong> (<code>${state.currentStudentId}</code>).</p>
      <p style="margin-bottom: 6px;">3. State this Reference Code: <code>${claimRecord.code}</code>.</p>
      <p>4. Verify distinguishing features with desk personnel in person.</p>
    </div>

    <div class="modal-actions">
      <button class="btn-primary" onclick="closeClaimModal(); switchTab('my-claims');">View in My Claims</button>
    </div>
  `;

    document.getElementById("claimModal").classList.add("active");
    initLucide();
}

function closeClaimModal() {
    document.getElementById("claimModal").classList.remove("active");
}

// BROWSE CATALOG RENDERING
function renderCatalog() {
    const grid = document.getElementById("catalogGrid");
    const statsContainer = document.getElementById("catalogQuickStats");
    if (!grid) return;

    const searchQuery = (document.getElementById("catalogSearchInput")?.value || "").toLowerCase();
    const statusFilter = document.getElementById("filterStatus")?.value || "ALL";
    const categoryFilter = document.getElementById("filterCategory")?.value || "ALL";
    const locationFilter = document.getElementById("filterLocation")?.value || "ALL";

    // Filter items
    const filtered = state.items.filter(item => {
        if (statusFilter !== "ALL" && item.type !== statusFilter && item.status !== statusFilter) return false;
        if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
        if (locationFilter !== "ALL" && item.location !== locationFilter) return false;

        if (searchQuery) {
            const fullTxt = `${item.title} ${item.brandColor} ${item.location} ${item.category}`.toLowerCase();
            if (!fullTxt.includes(searchQuery)) return false;
        }
        return true;
    });

    // Render Stats
    const foundCount = state.items.filter(i => i.type === "FOUND" && i.status !== "CLAIMED").length;
    const lostCount = state.items.filter(i => i.type === "LOST").length;
    const totalCount = state.items.length;

    document.getElementById("catalogCount").textContent = totalCount;

    if (statsContainer) {
        statsContainer.innerHTML = `
      <div class="stat-chip"><i data-lucide="package-check" style="color:var(--success);"></i> Found: <strong>${foundCount}</strong></div>
      <div class="stat-chip"><i data-lucide="file-question" style="color:var(--warning);"></i> Lost Reports: <strong>${lostCount}</strong></div>
    `;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color);">
        <i data-lucide="package-x" style="width: 48px; height: 48px; color: var(--text-dim); margin-bottom: 12px;"></i>
        <h3>No matching items found</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Try adjusting your filters or search query.</p>
      </div>
    `;
        initLucide();
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const isFound = item.type === "FOUND";
        const statusClass = item.status.toLowerCase();
        const canClaim = isFound && item.status !== "CLAIMED";

        return `
      <div class="item-card">
        <div class="item-card-top">
          <span class="item-category-tag">${item.category}</span>
          <span class="item-status-badge ${statusClass}">${item.status}</span>
        </div>

        <h3 class="item-title">${item.title}</h3>

        <div class="item-details-list">
          <div class="item-detail-row">
            <i data-lucide="tag"></i>
            <span><strong>Brand/Color:</strong> ${item.brandColor}</span>
          </div>
          <div class="item-detail-row">
            <i data-lucide="map-pin"></i>
            <span><strong>Location:</strong> ${item.location}</span>
          </div>
          <div class="item-detail-row">
            <i data-lucide="calendar"></i>
            <span><strong>Date Recorded:</strong> ${item.date}</span>
          </div>
          <div class="item-detail-row">
            <i data-lucide="building"></i>
            <span><strong>Drop Location:</strong> ${item.dropLocation}</span>
          </div>
        </div>

        <!-- Privacy Protected Markings Box -->
        <div class="privacy-mask-box">
          <i data-lucide="shield-lock"></i>
          <div>
            <strong>Unique Markings:</strong><br>
            <em>🔒 [Confidential - In-Person Verification Required at SBO Office]</em>
          </div>
        </div>

        <div class="item-card-bottom">
          <span class="item-code">${item.id}</span>
          ${canClaim ? `
            <button class="btn-claim-item" onclick="processClaimForItem('${item.id}')">
              <i data-lucide="ticket"></i> Claim Item
            </button>
          ` : `
            <span style="font-size: 0.78rem; color: var(--text-dim); font-weight: 600;">
              ${item.status === 'CLAIMED' ? 'Resolved / Picked Up' : 'Reported Lost'}
            </span>
          `}
        </div>
      </div>
    `;
    }).join("");

    initLucide();
}

function clearSearchFilters() {
    document.getElementById("catalogSearchInput").value = "";
    document.getElementById("filterStatus").value = "ALL";
    document.getElementById("filterCategory").value = "ALL";
    document.getElementById("filterLocation").value = "ALL";
    renderCatalog();
}

// FORM SUBMISSIONS
function submitLostItemForm(e) {
    e.preventDefault();
    if (!state.currentStudentId) {
        openAuthModal();
        return;
    }

    const category = document.getElementById("lostCategory").value;
    const brandColor = document.getElementById("lostBrandColor").value;
    const location = document.getElementById("lostLocation").value;
    const date = document.getElementById("lostDate").value;
    const markings = document.getElementById("lostMarkings").value;

    const newItem = {
        id: `LOST-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "LOST",
        category: category,
        title: `${brandColor} (${category})`,
        brandColor: brandColor,
        location: location,
        date: date,
        dropLocation: "N/A",
        uniqueMarkings: markings,
        status: "LOST",
        reporterStudentId: state.currentStudentId
    };

    state.items.unshift(newItem);
    saveState();
    renderAll();

    showToast(`Lost item report submitted successfully!`, "success");
    e.target.reset();

    addBotMessage(
        `📋 **Lost Item Report Cataloged!**\n\n` +
        `Item: **${newItem.title}**\n` +
        `Location: **${newItem.location}**\n\n` +
        `CampusFind AI will monitor incoming found items for potential matches.`
    );

    switchTab("assistant");
}

function submitFoundItemForm(e) {
    e.preventDefault();
    if (!state.currentStudentId) {
        openAuthModal();
        return;
    }

    const category = document.getElementById("foundCategory").value;
    const visualDesc = document.getElementById("foundVisualDesc").value;
    const location = document.getElementById("foundLocation").value;
    const dropLocation = document.getElementById("foundDropLocation").value;
    const markings = document.getElementById("foundMarkings").value;
    const todayStr = new Date().toISOString().split("T")[0];

    const newItem = {
        id: `FOUND-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "FOUND",
        category: category,
        title: visualDesc,
        brandColor: visualDesc,
        location: location,
        date: todayStr,
        dropLocation: dropLocation,
        uniqueMarkings: markings,
        status: "FOUND",
        reporterStudentId: state.currentStudentId
    };

    state.items.unshift(newItem);
    saveState();
    renderAll();

    showToast(`Found item recorded into CCIT catalog!`, "success");
    e.target.reset();

    addBotMessage(
        `📥 **Found Item Cataloged!**\n\n` +
        `Item: **${newItem.title}**\n` +
        `Current Location: **${newItem.dropLocation}**\n\n` +
        `Available for student search and claiming.`
    );

    switchTab("browse");
}

// MY CLAIMS TAB RENDERING
function renderMyClaims() {
    const container = document.getElementById("myClaimsList");
    const countBadge = document.getElementById("myClaimsCount");
    if (!container) return;

    if (!state.currentStudentId) {
        container.innerHTML = `
      <div style="text-align: center; padding: 48px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color);">
        <i data-lucide="lock" style="width: 48px; height: 48px; color: var(--warning); margin-bottom: 12px;"></i>
        <h3>Student Authentication Required</h3>
        <p style="color: var(--text-muted); margin-bottom: 16px;">Please log in with your Student ID to view your active claims.</p>
        <button class="btn-primary" style="margin: 0 auto;" onclick="openAuthModal()">Login with Student ID</button>
      </div>
    `;
        if (countBadge) countBadge.classList.add("hidden");
        initLucide();
        return;
    }

    const userClaims = state.claims.filter(c => c.studentId === state.currentStudentId);

    if (countBadge) {
        countBadge.textContent = userClaims.length;
        if (userClaims.length > 0) countBadge.classList.remove("hidden");
        else countBadge.classList.add("hidden");
    }

    if (userClaims.length === 0) {
        container.innerHTML = `
      <div style="text-align: center; padding: 48px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color);">
        <i data-lucide="ticket-slash" style="width: 48px; height: 48px; color: var(--text-dim); margin-bottom: 12px;"></i>
        <h3>No Active Claims Found</h3>
        <p style="color: var(--text-muted); margin-top: 4px;">Search the catalog for found items to generate a claim reference code.</p>
      </div>
    `;
        initLucide();
        return;
    }

    container.innerHTML = userClaims.map(c => `
    <div class="claim-card">
      <div class="claim-main-info">
        <span class="claim-code-badge">${c.code}</span>
        <h3 style="margin-top: 6px; font-size: 1.1rem; color: var(--text-main);">${c.itemTitle}</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted);">
          Generated on ${c.timestamp} for Student ID: <code>${c.studentId}</code>
        </p>
      </div>

      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="text-align: right; font-size: 0.82rem;">
          <strong style="color: var(--primary);"><i data-lucide="building"></i> ${CONFIG.SBO_OFFICE}</strong><br>
          <span style="color: var(--text-muted);">Hours: ${CONFIG.OFFICE_HOURS}</span>
        </div>
        <button class="btn-secondary" onclick="viewClaimDetails('${c.code}')">
          <i data-lucide="qr-code"></i> Verification Card
        </button>
      </div>
    </div>
  `).join("");

    initLucide();
}

function viewClaimDetails(code) {
    const claim = state.claims.find(c => c.code === code);
    const item = state.items.find(i => i.id === claim?.itemId);
    if (claim && item) {
        openClaimModal(claim, item);
    }
}

// SBO DESK ADMIN VIEW RENDERING
function renderAdminView() {
    const tableBody = document.getElementById("adminTableBody");
    const statsGrid = document.getElementById("adminStatsGrid");
    if (!tableBody) return;

    const totalItems = state.items.length;
    const foundItems = state.items.filter(i => i.type === "FOUND").length;
    const pendingClaims = state.claims.length;
    const claimedCount = state.items.filter(i => i.status === "CLAIMED").length;

    if (statsGrid) {
        statsGrid.innerHTML = `
      <div class="admin-stat-card">
        <span style="font-size: 0.78rem; color: var(--text-muted);">Total Catalog Items</span>
        <span class="admin-stat-number">${totalItems}</span>
      </div>
      <div class="admin-stat-card">
        <span style="font-size: 0.78rem; color: var(--text-muted);">Found Items in Desk</span>
        <span class="admin-stat-number" style="color: var(--success);">${foundItems}</span>
      </div>
      <div class="admin-stat-card">
        <span style="font-size: 0.78rem; color: var(--text-muted);">Active Claims Pending</span>
        <span class="admin-stat-number" style="color: var(--warning);">${pendingClaims}</span>
      </div>
      <div class="admin-stat-card">
        <span style="font-size: 0.78rem; color: var(--text-muted);">Resolved / Picked Up</span>
        <span class="admin-stat-number" style="color: var(--accent-purple);">${claimedCount}</span>
      </div>
    `;
    }

    tableBody.innerHTML = state.items.map(item => `
    <tr>
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${item.id}</td>
      <td><span class="item-status-badge ${item.type.toLowerCase()}">${item.type}</span></td>
      <td>${item.category}</td>
      <td><strong>${item.title}</strong></td>
      <td>${item.location}</td>
      <td>${item.date}</td>
      <td style="font-size: 0.78rem; color: #c4b5fd; background: rgba(112, 0, 255, 0.08); padding: 8px; border-radius: 6px;">
        <i data-lucide="eye"></i> ${item.uniqueMarkings || 'N/A'}
      </td>
      <td><span class="item-status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
      <td>
        ${item.status !== "CLAIMED" ? `
          <button class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="adminMarkClaimed('${item.id}')">
            Release Item
          </button>
        ` : `
          <span style="color: var(--text-dim); font-size: 0.78rem;">Released</span>
        `}
      </td>
    </tr>
  `).join("");

    initLucide();
}

function adminMarkClaimed(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (item) {
        item.status = "CLAIMED";
        saveState();
        renderAll();
        showToast(`Item ${itemId} marked as CLAIMED and released to student.`, "success");
    }
}
