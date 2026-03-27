const API_URL = "http://localhost:3000";

const params = new URLSearchParams(window.location.search);
const campaignId = params.get("id");

const titleEl = document.getElementById("title");
const imageEl = document.getElementById("image");
const descriptionEl = document.getElementById("description");
const goalEl = document.getElementById("goal");
const deadlineEl = document.getElementById("deadline");
const categoryEl = document.getElementById("category");
const pledgeBody = document.getElementById("pledgeTableBody");

function getCampaign() {
    fetch(`${API_URL}/campaigns/${campaignId}`)
    .then(res => res.json())
    .then(c => {
        titleEl.innerText = c.title;
        descriptionEl.innerText = c.description;
        goalEl.innerText = c.goal;
        deadlineEl.innerText = new Date(c.deadline).toLocaleDateString();
        categoryEl.innerText = c.category;
        if(c.image) imageEl.src = c.image;
        else imageEl.style.display = "none";
    });
}

function getPledges() {
    fetch(`${API_URL}/pledges?campaignId=${campaignId}`)
    .then(res => res.json())
    .then(data => {
        pledgeBody.innerHTML = "";
        if(!data.length){
            pledgeBody.innerHTML = "<tr><td colspan='3'>No pledges yet</td></tr>";
            return;
        }
        data.forEach(p => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${p.userId}</td><td>$${p.amount}</td><td>${new Date(p.date || Date.now()).toLocaleDateString()}</td>`;
            pledgeBody.appendChild(row);
        });
    });
}
getCampaign();
getPledges();