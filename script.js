//script.js
// Initialize skills data
let skillsData = {};
let skillCategories = [];

// Load skills data from local storage
function loadSkillsData() {
    const storedData = localStorage.getItem('skillsData');
    if (storedData) {
        skillsData = JSON.parse(storedData);
    }
}

// Save skills data to local storage
function saveSkillsData() {
    localStorage.setItem('skillsData', JSON.stringify(skillsData));
}

// Fetch list of skill categories
async function fetchSkillCategories() {
    try {
        const response = await fetch('skills-db/skill-categories.json');
        skillCategories = await response.json();
        createTabs();
        await updateSkillsDisplay();
    } catch (error) {
        console.error('Error fetching skill categories:', error);
    }
}

// Load skills from JSON file
async function loadSkillsFromJson(category) {
    try {
        const response = await fetch(`skills-db/${category}.json`);
        const skills = await response.json();
        return skills;
    } catch (error) {
        console.error(`Error loading skills for ${category}:`, error);
        return [];
    }
}

// Update skills display
async function updateSkillsDisplay() {
    const skillContents = document.getElementById('skillContents');
    skillContents.innerHTML = '';

    for (const category of skillCategories) {
        const skills = await loadSkillsFromJson(category);
        const contentDiv = document.createElement('div');
        contentDiv.id = category;
        contentDiv.className = 'content';
        contentDiv.style.display = 'none'; // Hide all content by default
        //contentDiv.innerHTML = `<h2>${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>`;

        for (const skill of skills) {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill';
            skillDiv.innerHTML = `
                <span>${skill}</span>
                <div class="stars" data-skill="${skill}">
                    ${[5, 4, 3, 2, 1].map(rating => `
                        <span class="star ${skillsData[skill] >= rating ? 'filled' : ''}" data-rating="${rating}">★</span>
                    `).join('')}
                </div>
            `;
            contentDiv.appendChild(skillDiv);
        }

        skillContents.appendChild(contentDiv);
    }

    // Add event listeners for star ratings
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', handleStarClick);
    });

    // Show the first category by default
    const firstCategory = skillCategories[0];
    document.getElementById(firstCategory).style.display = 'block';
    document.querySelector(`.tab[data-category="${firstCategory}"]`).classList.add('active');
}

// Handle star click
function handleStarClick(event) {
    const star = event.target;
    const rating = parseInt(star.getAttribute('data-rating'));
    const skillStars = star.closest('.stars');
    const skill = skillStars.getAttribute('data-skill');

    if (skillsData[skill] === rating) {
        // If the clicked star is already the current rating, clear the rating
        delete skillsData[skill];
    } else {
        // Otherwise, set the new rating
        skillsData[skill] = rating;
    }

    saveSkillsData();
    updateStarDisplay(skillStars, skillsData[skill] || 0);
}

// Update star display for a single skill
function updateStarDisplay(skillStars, rating) {
    skillStars.querySelectorAll('.star').forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        star.classList.toggle('filled', starRating <= rating);
    });
}

// Create tabs
function createTabs() {
    const tabsContainer = document.getElementById('skillTabs');
    skillCategories.forEach((category, index) => {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.setAttribute('data-category', category);
        tab.textContent = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        tab.addEventListener('click', () => switchTab(category));
        tabsContainer.appendChild(tab);
    });
}

// Switch tab
function switchTab(category) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.content').forEach(content => content.style.display = 'none');

    document.querySelector(`.tab[data-category="${category}"]`).classList.add('active');
    document.getElementById(category).style.display = 'block';
}

// Export functionality
document.getElementById('exportBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(skillsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'skills_data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

// Import functionality
document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importInput').click();
});

document.getElementById('importInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                skillsData = importedData;
                saveSkillsData();
                updateSkillsDisplay();
                alert('Skills data imported successfully!');
            } catch (error) {
                alert('Error importing skills data. Please ensure the file is a valid JSON.');
            }
        };
        reader.readAsText(file);
    }
});

// Initialize the application
loadSkillsData();
fetchSkillCategories();