const API = "http://localhost:3000";

const admin = JSON.parse(localStorage.getItem("admin"));
if (!admin) window.location.href = "login.html";

document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('open');
});
document.getElementById("logoutBtn").addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "index.html";
});
window.addEventListener('load', () => {
  loadData('/users', 'usersTableBody', buildUserRow);
  loadData('/campaigns', 'campaignsTableBody', buildCampaignRow);
});

function loadData(endpoint, tbodyId, buildRow) {
  fetch(API + endpoint)
    .then(res => res.json())
    .then(items => {
      const tbody = document.getElementById(tbodyId);
      if (!tbody) return;
      tbody.innerHTML = '';
      items.forEach(item => tbody.appendChild(buildRow(item)));
    })
    .catch(err => console.log(`problem to retrive data${endpoint}:`, err));
}

// === Users ===
function buildUserRow(user) {
  const tr = document.createElement('tr');
  const statusText = user.isActive ? 'Active' : 'Banned';
  const btnText = user.isActive ? 'Ban' : 'Unban';

  tr.innerHTML = `
    <td>#USR-${user.id}</td>
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td><span class="status-badge">${statusText}</span></td>
    <button class="user-btn ${user.isActive ? 'btn-ban' : 'btn-unban'}">
    ${btnText}
  </button>
  `;

  tr.querySelector('button').addEventListener('click', () => toggleStatus(user, tr));
  return tr;
}

function toggleStatus(user, row) {
  const newStatus = !user.isActive;
  fetch(`${API}/users/${user.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive: newStatus })
  })
    .then(res => res.json())
    .then(updated => {
      user.isActive = updated.isActive;
      const badge = row.querySelector('.status-badge');
      const btn = row.querySelector('button');
      badge.textContent = updated.isActive ? 'Active' : 'Banned';
      btn.textContent = updated.isActive ? 'Ban' : 'Unban';
    });
}

// === Campaigns ===
function buildCampaignRow(c) {
  const tr = document.createElement('tr');
  const progress = c.isApproved === true ? 75 : 30;

  tr.innerHTML = `
    <td>#CMP-${c.id}</td>
    <td>
      <div class="campaign-thumb">${c.image ? `<img src="${c.image}" />` : ''}</div>
      ${c.title}
    </td>
    <td>${c.creatorId || '-'}</td>
    <td>
      $${c.goal} <div class="progress-bar-fill" style="width:${progress}%"></div>
    </td>
    <td>
      ${c.isApproved === true ? 'Approved' : c.isApproved === 'rejected' ? 'Rejected' : `
        <button class="btn-approve">Approve</button>
        <button class="btn-reject">Reject</button>
        <button class="btn-delete">Delete</button>
      `}
    </td>
  `;

  tr.querySelector('.btn-approve')?.addEventListener('click', () => patchCampaign(c, tr, true));
  tr.querySelector('.btn-reject')?.addEventListener('click', () => patchCampaign(c, tr, 'rejected'));
  tr.querySelector('.btn-delete')?.addEventListener('click', () => deleteCampaign(c, tr));

  return tr;
}

function patchCampaign(c, row, status) {
  fetch(`${API}/campaigns/${c.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isApproved: status })
  })
    .then(() => {
      c.isApproved = status;
      row.querySelector('td:last-child').textContent = status === true ? 'Approved' : 'Rejected';
    });
}

function deleteCampaign(c, row) {
  fetch(`${API}/campaigns/${c.id}`, { method: 'DELETE' })
    .then(() => row.remove());
}
const pledgeBody = document.getElementById("pledgeBody");
//pledges
function getPledges() {
    Promise.all([
        fetch(API + "/pledges").then(res => res.json()),
        fetch(API + "/campaigns").then(res => res.json())
    ]).then(([pledges, campaigns]) => {
        if (!pledges.length) {
            pledgeBody.innerHTML = "<tr><td colspan='4'>No pledges yet</td></tr>";
            return;
        }
        const totals = {};
        pledges.forEach(p => {
            if (!totals[p.campaignId]) totals[p.campaignId] = 0;
            totals[p.campaignId] += parseFloat(p.amount);
        });

        pledgeBody.innerHTML = "";
        pledges.forEach(p => {
            const camp = campaigns.find(c => c.id === p.campaignId);
            const status = camp && totals[p.campaignId] >= camp.goal ? "Completed" : "In Progress";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${p.campaignId}</td>
                <td>${new Date(p.date || Date.now()).toLocaleDateString()}</td>
                <td>${status}</td>
                <td>$${p.amount}</td>
            `;
            pledgeBody.appendChild(row);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => getPledges());;    