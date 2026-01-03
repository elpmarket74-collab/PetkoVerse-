// ----------------------
// USER PROFILE & PET DATA
// ----------------------
let userProfile = {
  username: "Guest",
  pets: [
    {
      id: 1,
      name: "Fluffy",
      status: "awakened",
      isActive: false,
      image: "assets/images/fluffy.png",
      traits: {}
    },
    {
      id: 2,
      name: "Shadow",
      status: "pending_awaken",
      isActive: false,
      image: "assets/images/shadow_pending.png",
      traits: {}
    }
  ],
  currentPet: null,
  love: parseInt(localStorage.getItem('love')) || 0,
  level: parseInt(localStorage.getItem('level')) || 1,
  collectibles: parseInt(localStorage.getItem('collectibles')) || 0
};

// ----------------------
// UI UPDATE FUNCTIONS
// ----------------------
function updateUI() {
  document.getElementById('loveCount').innerText = userProfile.love + ' 💖';
  document.getElementById('levelCount').innerText = userProfile.level;
  document.getElementById('collectiblesCount').innerText = userProfile.collectibles + ' items';
}

// ----------------------
// FEED & PLAY BUTTONS
// ----------------------
document.getElementById('btnFeed').addEventListener('click', () => {
  userProfile.love += 1;
  if(userProfile.love % 5 === 0) userProfile.level +=1;
  if(userProfile.love % 7 === 0) userProfile.collectibles +=1;
  saveStats();
  updateUI();
});

document.getElementById('btnPlay').addEventListener('click', () => {
  userProfile.love += 2;
  if(userProfile.love % 5 === 0) userProfile.level +=1;
  if(userProfile.love % 7 === 0) userProfile.collectibles +=1;
  saveStats();
  updateUI();
});

document.getElementById('btnHome').addEventListener('click', () => {
  alert("Welcome Home! Your active pet is "+ (userProfile.currentPet?.name || "none"));
});
document.getElementById('btnFriends').addEventListener('click', () => {
  alert("Friends feature coming soon!");
});
document.getElementById('btnCollection').addEventListener('click', () => {
  alert("You own "+ userProfile.collectibles +" collectible items!");
});

// ----------------------
// SAVE STATS
// ----------------------
function saveStats() {
  localStorage.setItem('love', userProfile.love);
  localStorage.setItem('level', userProfile.level);
  localStorage.setItem('collectibles', userProfile.collectibles);
}

// ----------------------
// AWAKENING SPACE FUNCTIONS
// ----------------------
function checkPendingAwaken() {
  const pendingPet = userProfile.pets.find(p => p.status === "pending_awaken");
  if(pendingPet) {
    userProfile.currentPet = pendingPet;
    openAwakeningSpace(pendingPet);
  } else {
    // Show home space normally
    updateUI();
  }
}

function openAwakeningSpace(pet) {
  const awakeningDiv = document.getElementById('awakeningSpace');
  const petImg = document.getElementById('uploadedPetImage');
  const text = document.getElementById('awakeningText');

  petImg.src = pet.image;
  text.innerHTML = `
    Hello ${userProfile.username},<br>
    This is your new companion, ${pet.name}.<br>
    They are ready to awaken. Take your time, no rush.<br>
    When you feel ready, proceed to awaken them.
  `;

  awakeningDiv.style.display = 'flex';

  // Lock bottom nav
  document.querySelectorAll('.bottom-nav button').forEach(btn => btn.disabled = true);
}

document.getElementById('confirmAwakenBtn').addEventListener('click', () => {
  const pet = userProfile.currentPet;
  if(pet){
    pet.status = "awakened";
    pet.isActive = true;
    userProfile.pets.forEach(p => { if(p.id !== pet.id) p.isActive = false; });
    pet.traits = { gentle:true, loyal:true, calm:true };

    document.getElementById('awakeningSpace').style.display = 'none';
    document.querySelectorAll('.bottom-nav button').forEach(btn => btn.disabled = false);

    alert(`Your pet ${pet.name} has awakened!`);
    updateUI();
  }
});

// ----------------------
// INITIALIZE APP
// ----------------------
checkPendingAwaken();
updateUI();