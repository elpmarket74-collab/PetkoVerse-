// ----------------------
// USER PROFILE & PET DATA (default)
// ----------------------
let userProfileDefault = {
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
  love: 0,
  level: 1,
  collectibles: 0
};

let userProfile = null;
const STORAGE_KEY = 'petko_userProfile';

// ----------------------
// Helpers: load/save profile
// ----------------------
function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Basic merge with defaults so missing fields don't break UI
      userProfile = Object.assign({}, userProfileDefault, parsed);
      // ensure arrays exist
      userProfile.pets = parsed.pets || userProfileDefault.pets.slice();
    } else {
      userProfile = JSON.parse(JSON.stringify(userProfileDefault));
    }
  } catch (e) {
    console.error('Failed to load profile, using defaults', e);
    userProfile = JSON.parse(JSON.stringify(userProfileDefault));
  }
}

function saveProfile() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

// ----------------------
// UI UPDATE FUNCTIONS
// ----------------------
function updateUI() {
  const loveEl = document.getElementById('loveCount');
  const levelEl = document.getElementById('levelCount');
  const collectiblesEl = document.getElementById('collectiblesCount');
  const petImg = document.getElementById('petImage');

  if (loveEl) loveEl.innerText = (userProfile.love || 0) + ' 💖';
  if (levelEl) levelEl.innerText = userProfile.level || 1;
  if (collectiblesEl) collectiblesEl.innerText = (userProfile.collectibles || 0) + ' items';

  // show current pet image if there's an active pet
  const active = userProfile.pets.find(p => p.isActive) || userProfile.currentPet;
  if (petImg) petImg.src = (active && active.image) ? active.image : 'assets/images/starter_pet.gif';
}

// ----------------------
// Feed & Play handlers
// ----------------------
function attachActionButtons() {
  const btnFeed = document.getElementById('btnFeed');
  const btnPlay = document.getElementById('btnPlay');
  const btnHome = document.getElementById('btnHome');
  const btnFriends = document.getElementById('btnFriends');
  const btnCollection = document.getElementById('btnCollection');

  if (btnFeed) btnFeed.addEventListener('click', () => {
    userProfile.love = (userProfile.love || 0) + 1;
    if (userProfile.love % 5 === 0) userProfile.level +=1;
    if (userProfile.love % 7 === 0) userProfile.collectibles +=1;
    saveProfile();
    updateUI();
  });

  if (btnPlay) btnPlay.addEventListener('click', () => {
    userProfile.love = (userProfile.love || 0) + 2;
    if (userProfile.love % 5 === 0) userProfile.level +=1;
    if (userProfile.love % 7 === 0) userProfile.collectibles +=1;
    saveProfile();
    updateUI();
  });

  if (btnHome) btnHome.addEventListener('click', () => {
    alert("Welcome Home! Your active pet is "+ (userProfile.currentPet?.name || "none"));
  });
  if (btnFriends) btnFriends.addEventListener('click', () => {
    alert("Friends feature coming soon!");
  });
  if (btnCollection) btnCollection.addEventListener('click', () => {
    alert("You own "+ (userProfile.collectibles || 0) +" collectible items!");
  });
}

// ----------------------
// Awakening Space Functions
// ----------------------
function checkPendingAwaken() {
  const pendingPet = userProfile.pets.find(p => p.status === "pending_awaken");
  if (pendingPet) {
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

  if (petImg) petImg.src = pet.image;
  if (text) text.innerHTML = `
    Hello ${userProfile.username},<br>
    This is your new companion, ${pet.name}.<br>
    They are ready to awaken. Take your time, no rush.<br>
    When you feel ready, proceed to awaken them.
  `;

  if (awakeningDiv) awakeningDiv.style.display = 'flex';

  // Lock bottom nav
  document.querySelectorAll('.bottom-nav button').forEach(btn => btn.disabled = true);
}

function closeAwakeningSpace() {
  document.getElementById('awakeningSpace').style.display = 'none';
  document.querySelectorAll('.bottom-nav button').forEach(btn => btn.disabled = false);
}

function attachAwakenButton() {
  const confirmBtn = document.getElementById('confirmAwakenBtn');
  if (!confirmBtn) return;
  confirmBtn.addEventListener('click', () => {
    const pet = userProfile.currentPet;
    if (pet) {
      pet.status = "awakened";
      pet.isActive = true;
      // deactivate others
      userProfile.pets.forEach(p => { if (p.id !== pet.id) p.isActive = false; });
      pet.traits = { gentle:true, loyal:true, calm:true };
      saveProfile();
      closeAwakeningSpace();
      alert(`Your pet ${pet.name} has awakened!`);
      updateUI();
    }
  });
}

// ----------------------
// Upload handler: create new pet, open awakening
// ----------------------
function attachUploadHandler() {
  const fileInput = document.getElementById('petFileInput');
  const nameInput = document.getElementById('petNameInput');
  const uploadBtn = document.getElementById('uploadPetBtn');

  if (!fileInput || !uploadBtn) return;

  uploadBtn.addEventListener('click', () => {
    if (fileInput.files.length === 0) {
      alert("Please select an image!");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      const imageData = e.target.result; // base64 image
      const petName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : "New Pet";

      const nextId = (userProfile.pets.reduce((max, p) => Math.max(max, p.id || 0), 0) || 0) + 1;
      const newPet = {
        id: nextId,
        name: petName,
        status: "pending_awaken",
        isActive: false,
        image: imageData,   // base64 string
        traits: {}
      };

      userProfile.pets.push(newPet);
      userProfile.currentPet = newPet;
      saveProfile();

      // Open Awakening Space
      openAwakeningSpace(newPet);
    };

    reader.readAsDataURL(file);
  });
}

// ----------------------
// Initialize App
// ----------------------
function init() {
  loadProfile();
  attachActionButtons();
  attachUploadHandler();
  attachAwakenButton();
  checkPendingAwaken();
  updateUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
