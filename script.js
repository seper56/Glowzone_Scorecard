const holes = Array.from({ length: 18 }, (_, i) => i + 1);
const pars = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2];

let selectedLocation = "";
let players = [
  { id: 1, name: "NAME", scores: Array(18).fill("") },
  { id: 2, name: "NAME", scores: Array(18).fill("") },
  { id: 3, name: "NAME", scores: Array(18).fill("") },
  { id: 4, name: "NAME", scores: Array(18).fill("") }
];

const maxPlayers = 5;

const landingPage = document.getElementById("landingPage");
const locationPage = document.getElementById("locationPage");
const scorePanel = document.getElementById("scorePanel");
const rulesPanel = document.getElementById("rulesPanel");
const winnerPage = document.getElementById("winnerPage");

const locationText = document.getElementById("locationText");
const scoreHead = document.getElementById("scoreHead");
const scoreBody = document.getElementById("scoreBody");
const scoreFoot = document.getElementById("scoreFoot");
const summaryList = document.getElementById("summaryList");
const leaderText = document.getElementById("leaderText");

const winnerName = document.getElementById("winnerName");
const winnerScore = document.getElementById("winnerScore");
const winnerLocation = document.getElementById("winnerLocation");
const winnerPlacements = document.getElementById("winnerPlacements");

const startGameBtn = document.getElementById("startGameBtn");
const backToLandingBtn = document.getElementById("backToLandingBtn");
const homeBtn = document.getElementById("homeBtn");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const removePlayerBtn = document.getElementById("removePlayerBtn");
const rulesViewBtn = document.getElementById("rulesViewBtn");
const backToScorecardBtn = document.getElementById("backToScorecardBtn");
const shareBtn = document.getElementById("shareBtn");
const finishGameBtn = document.getElementById("finishGameBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const newGameBtn = document.getElementById("newGameBtn");
const winnerShareBtn = document.getElementById("winnerShareBtn");

function hideAllPages() {
  landingPage.classList.add("hidden");
  locationPage.classList.add("hidden");
  scorePanel.classList.add("hidden");
  rulesPanel.classList.add("hidden");
  winnerPage.classList.add("hidden");
}

function showLanding() {
  hideAllPages();
  landingPage.classList.remove("hidden");
  window.scrollTo(0, 0);
}

function showLocation() {
  hideAllPages();
  locationPage.classList.remove("hidden");
  window.scrollTo(0, 0);
}

function showScorecard() {
  hideAllPages();
  scorePanel.classList.remove("hidden");
  locationText.textContent = selectedLocation ? `Location: ${selectedLocation}` : "Location: Not Selected";
  window.scrollTo(0, 0);
}

function showRules() {
  hideAllPages();
  rulesPanel.classList.remove("hidden");
  window.scrollTo(0, 0);
}

function sumScores(scores, start, end) {
  let total = 0;

  for (let i = start; i <= end; i++) {
    const value = parseInt(scores[i], 10);
    total += Number.isNaN(value) ? 0 : value;
  }

  return total;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStats() {
  return players.map((player) => {
    const front = sumScores(player.scores, 0, 8);
    const back = sumScores(player.scores, 9, 17);
    const total = front + back;
    const hasAny = player.scores.some((score) => score !== "");

    return {
      id: player.id,
      name: player.name.trim() || "NAME",
      front,
      back,
      total,
      hasAny
    };
  });
}

function getLeader() {
  const ranked = getStats()
    .filter((player) => player.hasAny)
    .sort((a, b) => a.total - b.total);

  return ranked[0] || null;
}

function scoreClass(score, par) {
  if (score === "") return "";
  const number = parseInt(score, 10);
  if (Number.isNaN(number)) return "";
  if (number < par) return "under-par";
  if (number > par) return "over-par";
  return "at-par";
}

function renderHeader() {
  scoreHead.innerHTML = `
    <tr>
      <th class="hole-col">HOLE</th>
      <th class="par-col">PAR</th>
      ${players.map((player, index) => `
        <th class="player-col">
          <input
            class="player-name-input"
            type="text"
            maxlength="12"
            value="${escapeHtml(player.name)}"
            data-player-id="${player.id}"
            aria-label="Player ${index + 1} name"
          />
        </th>
      `).join("")}
    </tr>
  `;

  document.querySelectorAll(".player-name-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const player = players.find((p) => p.id === Number(event.target.dataset.playerId));
      if (!player) return;

      player.name = event.target.value.toUpperCase();
      event.target.value = player.name;

      renderSummary();
      renderLeader();
    });
  });
}

function makeSummaryRow(label, parTotal, start, end) {
  return `
    <tr class="summary-row">
      <td>${label}</td>
      <td>${parTotal}</td>
      ${players.map((player) => `<td>${sumScores(player.scores, start, end)}</td>`).join("")}
    </tr>
  `;
}

function renderBody() {
  let html = "";

  holes.forEach((hole, holeIndex) => {
    html += `
      <tr>
        <td><span class="hole-flag">${hole}</span></td>
        <td>${pars[holeIndex]}</td>
        ${players.map((player) => `
          <td>
            <input
              class="score-input ${scoreClass(player.scores[holeIndex], pars[holeIndex])}"
              type="number"
              min="0"
              inputmode="numeric"
              value="${player.scores[holeIndex]}"
              data-player-id="${player.id}"
              data-hole-index="${holeIndex}"
              aria-label="${escapeHtml(player.name)} hole ${hole}"
            />
          </td>
        `).join("")}
      </tr>
    `;

    if (holeIndex === 8) {
      html += makeSummaryRow("FRONT", 27, 0, 8);
    }
  });

  scoreBody.innerHTML = html;
  attachScoreEvents();
}

function renderFoot() {
  scoreFoot.innerHTML =
    makeSummaryRow("BACK", 26, 9, 17) +
    makeSummaryRow("TOTAL", 53, 0, 17);
}

function updateSummaryRowsOnly() {
  const frontRow = scoreBody.querySelector(".summary-row");

  if (frontRow) {
    frontRow.outerHTML = makeSummaryRow("FRONT", 27, 0, 8);
  }

  renderFoot();
}

function attachScoreEvents() {
  document.querySelectorAll(".score-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const player = players.find((p) => p.id === Number(event.target.dataset.playerId));
      const holeIndex = Number(event.target.dataset.holeIndex);

      if (!player) return;

      player.scores[holeIndex] = event.target.value;

      event.target.classList.remove("under-par", "over-par", "at-par");
      const newClass = scoreClass(event.target.value, pars[holeIndex]);
      if (newClass) event.target.classList.add(newClass);

      updateSummaryRowsOnly();
      renderSummary();
      renderLeader();
    });
  });
}

function renderSummary() {
  const stats = getStats();
  const leader = getLeader();

  summaryList.innerHTML = stats.map((player) => {
    const isLeader = leader && player.hasAny && player.id === leader.id;

    return `
      <div class="summary-item${isLeader ? " leading" : ""}">
        <div>${escapeHtml(player.name)}</div>
        <div>Front: ${player.front} | Back: ${player.back} | Total: ${player.total}</div>
      </div>
    `;
  }).join("");
}

function renderLeader() {
  const leader = getLeader();

  if (!leader) {
    leaderText.textContent = "Enter scores to see who’s winning";
    return;
  }

  leaderText.textContent = `${leader.name} is leading with ${leader.total}`;
}

function renderEverything() {
  renderHeader();
  renderBody();
  renderFoot();
  renderSummary();
  renderLeader();
}

function addPlayer() {
  if (players.length >= maxPlayers) {
    alert("Max 5 players for this version.");
    return;
  }

  players.push({
    id: Date.now(),
    name: "NAME",
    scores: Array(18).fill("")
  });

  renderEverything();
}

function removeLastPlayer() {
  if (players.length <= 1) return;

  players.pop();
  renderEverything();
}

function showWinnerPage() {
  const ranked = getStats()
    .filter((player) => player.hasAny)
    .sort((a, b) => a.total - b.total);

  if (ranked.length === 0) {
    alert("Enter scores first.");
    return;
  }

  const winner = ranked[0];

  winnerName.textContent = winner.name;
  winnerScore.textContent = `Winning Score: ${winner.total}`;
  winnerLocation.textContent = selectedLocation ? `Played at GlowZone 360 ${selectedLocation}` : "GlowZone 360";

  winnerPlacements.innerHTML = ranked.map((player, index) => `
    <div class="place-row ${index === 0 ? "first" : ""}">
      <div>
        ${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎯"}
        ${escapeHtml(player.name)}
      </div>

      <div>${player.total}</div>
    </div>
  `).join("");

  hideAllPages();
  winnerPage.classList.remove("hidden");
  window.scrollTo(0, 0);
}

function resetScores() {
  players.forEach((player) => {
    player.scores = Array(18).fill("");
  });

  renderEverything();
}

function playAgain() {
  resetScores();
  showScorecard();
}

function newGame() {
  selectedLocation = "";
  players = [
    { id: 1, name: "NAME", scores: Array(18).fill("") },
    { id: 2, name: "NAME", scores: Array(18).fill("") },
    { id: 3, name: "NAME", scores: Array(18).fill("") },
    { id: 4, name: "NAME", scores: Array(18).fill("") }
  ];

  renderEverything();
  showLanding();
}

function shareWinnerResult() {
  const leader = getLeader();

  if (!leader) {
    alert("Enter scores first.");
    return;
  }

  const locationPart = selectedLocation ? ` at GlowZone 360 ${selectedLocation}` : " at GlowZone 360";
  const message = `🏆 ${leader.name} won${locationPart} with a score of ${leader.total}!`;

  if (navigator.share) {
    navigator.share({
      title: "GlowZone 360 Winner",
      text: message,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(`${message} ${window.location.href}`);
    alert("Winner message copied!");
  }
}

startGameBtn.addEventListener("click", showLocation);
backToLandingBtn.addEventListener("click", showLanding);
homeBtn.addEventListener("click", showLanding);
addPlayerBtn.addEventListener("click", addPlayer);
removePlayerBtn.addEventListener("click", removeLastPlayer);
rulesViewBtn.addEventListener("click", showRules);
backToScorecardBtn.addEventListener("click", showScorecard);
shareBtn.addEventListener("click", shareWinnerResult);
finishGameBtn.addEventListener("click", showWinnerPage);
playAgainBtn.addEventListener("click", playAgain);
newGameBtn.addEventListener("click", newGame);
winnerShareBtn.addEventListener("click", shareWinnerResult);

document.querySelectorAll(".location-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedLocation = button.dataset.location;
    renderEverything();
    showScorecard();
  });
});

renderEverything();
showLanding();