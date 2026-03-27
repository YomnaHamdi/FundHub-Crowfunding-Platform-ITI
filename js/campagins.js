var API_URL = "http://localhost:3000/campaigns?isApproved=true";
var allCampaigns = [];
var filteredCampaigns = [];

var cardsGrid = document.getElementById("cardsGrid");
var loadingMsg = document.getElementById("loadingMsg");
var emptyMsg = document.getElementById("emptyMsg");
var errorMsg = document.getElementById("errorMsg");
var searchInput = document.getElementById("searchInput");
var categoryFilter = document.getElementById("categoryFilter");

function loadCampaigns() {
  loadingMsg.style.display = "block";
  cardsGrid.innerHTML = "";
  emptyMsg.style.display = "none";
  errorMsg.style.display = "none";

  fetch(API_URL)
    .then(res => res.json())
    .then(campaigns => {
      allCampaigns = campaigns;

      return fetch('http://localhost:3000/pledges')
        .then(res => res.json())
        .then(pledges => {
          allCampaigns.forEach(c => {
            c.raised = pledges
              .filter(p => p.campaignId === c.id)
              .reduce((sum, p) => sum + p.amount, 0);
          });

          filteredCampaigns = [...allCampaigns];
          renderAllCampaigns();
          loadingMsg.style.display = "none";
        });
    })
    .catch(err => {
      loadingMsg.style.display = "none";
      errorMsg.style.display = "block";
    });
}

function renderAllCampaigns() {
  cardsGrid.innerHTML = "";

  if (filteredCampaigns.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  filteredCampaigns.forEach(function (campaign) {
    var card = createCard(campaign);
    cardsGrid.appendChild(card);
  });
}

function createCard(campaign) {
  var goal = campaign.goal || 1;
  var raised = campaign.raised || 0;
  var progress = Math.min(Math.round((raised / goal) * 100), 100);
  var imageUrl = campaign.image || "https://via.placeholder.com/400x200?text=No+Image";

  var card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML =
    '<div class="card-image">' +
      '<img src="' + imageUrl + '" alt="' + campaign.title + '" ' +
           'onerror="this.style.background=\'#e0e0e0\';this.removeAttribute(\'src\')" />' +
    '</div>' +
    '<div class="card-body">' +
      '<h3>' + (campaign.title || "Untitled") + '</h3>' +
      '<p>' + (campaign.description || "No description available.") + '</p>' +
      '<div class="progress-info">' +
        '<span>$' + raised.toLocaleString() + ' raised</span>' +
        '<span>' + progress + '%</span>' +
      '</div>' +
      '<div class="progress-bar">' +
        '<div class="progress-fill" style="width: ' + progress + '%;"></div>' +
      '</div>' +
      '<div class="card-footer">' +
        '<a href="#">View Story →</a>' +
      '</div>' +
    '</div>';

  return card;
}

function applyFilter() {
  var searchText = searchInput.value.toLowerCase().trim();
  var category = categoryFilter.value.toLowerCase();

  filteredCampaigns = allCampaigns.filter(function (campaign) {
    var titleMatch = (campaign.title || "").toLowerCase().includes(searchText);
    var descMatch = (campaign.description || "").toLowerCase().includes(searchText);
    var textMatch = titleMatch || descMatch;

    var categoryMatch = true;
    if (category) {
      categoryMatch = (campaign.category || "").toLowerCase() === category;
    }

    return textMatch && categoryMatch;
  });

  renderAllCampaigns();
}

searchInput.addEventListener("input", applyFilter);
categoryFilter.addEventListener("change", applyFilter);

var menuToggle = document.querySelector(".menu-toggle");
var navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
}

loadCampaigns();