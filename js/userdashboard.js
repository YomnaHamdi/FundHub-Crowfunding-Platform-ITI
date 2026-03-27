const API_URL = "http://localhost:3000";
const currentUser = JSON.parse(localStorage.getItem("user"));
const currentUserId = currentUser ? currentUser.id : null;

document.addEventListener("DOMContentLoaded", function () {

    const createBtn = document.getElementById("createCampaignBtn");
    const form = document.getElementById("newCampaignForm");
    const saveBtn = document.getElementById("saveCampaignBtn");
    const grid = document.getElementById("campaignsGrid");
    const viewAllBtn = document.getElementById("viewAllBtn");
    const myCampaignsBtn = document.getElementById("myCampaignsBtn");
    const allCampaignsBtn = document.getElementById("allCampaignsBtn");
    const activeEl = document.getElementById("activeCampaigns");
    const totalEl = document.getElementById("totalPledged");
    const pledgeBody = document.getElementById("pledgeTableBody");
    const imageInput = document.getElementById("campaignImage");
    const preview = document.getElementById("imagePreview");

    let campaigns = [];
    let showAll = false;
    let currentMode = "all";

    createBtn.onclick = () => form.style.display = form.style.display === "block" ? "none" : "block";
    myCampaignsBtn.onclick = () => getCampaigns("mine");
    allCampaignsBtn.onclick = () => getCampaigns("all");

    imageInput.onchange = () => {
        const file = imageInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => { preview.src = e.target.result; preview.style.display = "block"; };
        reader.readAsDataURL(file);
    };

    saveBtn.onclick = () => {
        const title = document.getElementById("campaignTitle").value;
        const desc = document.getElementById("campaignDescription").value;
        const goal = document.getElementById("campaignGoal").value;
        const deadline = document.getElementById("campaignDeadline").value;
        const category = document.getElementById("campaignCategory").value;
        if (!title || !desc || !goal || !deadline || !category) { alert("Fill all fields"); return; }

        const newCampaign = { title, description: desc, goal, deadline, category, creatorId: currentUserId, image: "" };

        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => { newCampaign.image = e.target.result; sendCampaign(newCampaign); };
            reader.readAsDataURL(file);
        } else {
            sendCampaign(newCampaign);
        }
    };

    function sendCampaign(data) {
        fetch(API_URL + "/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(res => res.json())
          .then(() => { alert("Campaign Added!"); form.style.display = "none"; getCampaigns(currentMode); });
    }

    function getCampaigns(mode) {
        currentMode = mode;
        const url = mode === "mine" ? API_URL + "/campaigns?creatorId=" + currentUserId : API_URL + "/campaigns";
        fetch(url)
        .then(res => res.json())
        .then(data => { campaigns = data; showAll = false; showCampaigns(); updateStats(); });
    }

    function getPledges() {
        fetch(API_URL + "/pledges")
        .then(res => res.json())
        .then(data => {
            const userPledges = data.filter(p => p.userId == currentUserId);
            pledgeBody.innerHTML = "";
            if (!userPledges.length) {
                pledgeBody.innerHTML = "<tr><td colspan='3'>No pledges yet</td></tr>";
            } else {
                userPledges.forEach(p => {
                    const c = campaigns.find(camp => camp.id == p.campaignId);
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${c ? c.title : p.campaignId}</td>
                        <td>${new Date(p.date || Date.now()).toLocaleDateString()}</td>
                        <td>$${p.amount}</td>`;
                    pledgeBody.appendChild(row);
                });
            }
        });
    }

    function showCampaigns() {
        grid.innerHTML = "";
        const list = showAll ? campaigns : campaigns.slice(0, 6);
        if (!list.length) { grid.innerHTML = "<p>No campaigns</p>"; viewAllBtn.style.display = "none"; return; }

        list.forEach(c => {
            const card = document.createElement("div");
            card.classList.add("campaign-card");
            card.innerHTML = `
                ${c.image ? `<img src="${c.image}" style="width:100%;height:150px;object-fit:cover;">` : `<div style="height:150px;background:#eee;display:flex;align-items:center;justify-content:center;">No Image</div>`}
                <div class="card-content">
                    <h3>${c.title}</h3>
                    <p>${c.description}</p>
                    <p>Goal: $${c.goal}</p>
                    <p>Deadline: ${new Date(c.deadline).toLocaleDateString()}</p>
                    <input type="number" placeholder="Amount" min="1" class="pledge-input">
                    <div class="button-group">
                        <button class="support-btn" data-id="${c.id}">Support</button>
                        <button class="details-btn" data-id="${c.id}">View Details</button>
                        ${currentMode === "mine" ? `<button class="edit-btn" data-id="${c.id}">Edit</button><button class="delete-btn" data-id="${c.id}">Delete</button>` : ""}
                    </div>
                </div>`;
            grid.appendChild(card);
        });

        grid.querySelectorAll(".support-btn").forEach(btn => btn.addEventListener("click", e => {
            const card = e.target.closest(".card-content");
            supportCampaign(e.target.dataset.id, card.querySelector(".pledge-input").value);
        }));
        grid.querySelectorAll(".edit-btn").forEach(btn => btn.addEventListener("click", e => editCampaign(e.target.dataset.id)));
        grid.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", e => deleteCampaign(e.target.dataset.id)));
        grid.querySelectorAll(".details-btn").forEach(btn => btn.addEventListener("click", e => {
            window.location.href = `campaign-details.html?id=${e.target.dataset.id}`;
        }));

        viewAllBtn.style.display = campaigns.length > 6 ? "block" : "none";
        if (campaigns.length > 6) viewAllBtn.innerText = showAll ? "Show Less" : "View All";
    }

    viewAllBtn.onclick = () => { showAll = !showAll; showCampaigns(); };

    function updateStats() {
        activeEl.innerText = campaigns.length;
        fetch(API_URL + "/pledges")
        .then(res => res.json())
        .then(data => {
            let total = 0;
            data.forEach(p => campaigns.forEach(c => { if (p.campaignId == c.id) total += p.amount; }));
            totalEl.innerText = "$" + total;
        });
    }

    function supportCampaign(campaignId, amount) {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) { alert("Enter a valid amount"); return; }
        fetch(API_URL + "/pledges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId, campaignId, amount: amt, date: new Date().toISOString() })
        }).then(() => { alert("Thank you for supporting!"); getPledges(); updateStats(); });
    }

    function deleteCampaign(id) {
        if (!confirm("Are you sure?")) return;
        fetch(API_URL + "/campaigns/" + id, { method: "DELETE" })
        .then(() => { alert("Deleted!"); getCampaigns(currentMode); });
    }

    function editCampaign(id) {
        const camp = campaigns.find(c => c.id == id);
        if (!camp) return;
        const newTitle = prompt("Title:", camp.title);
        const newDesc = prompt("Description:", camp.description);
        const newGoal = prompt("Goal:", camp.goal);
        const newDeadline = prompt("Deadline (YYYY-MM-DD):", camp.deadline);
        if (!newTitle || !newDesc || !newGoal || !newDeadline) { alert("All fields required"); return; }
        fetch(API_URL + "/campaigns/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, description: newDesc, goal: newGoal, deadline: newDeadline })
        }).then(() => { alert("Updated!"); getCampaigns(currentMode); });
    }

    getCampaigns("all");
    getPledges();
});