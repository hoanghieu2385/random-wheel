// js/input.js
// DOM elements
const questionInput = document.getElementById('questionInput');
const shuffleBtn = document.getElementById('shuffleBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const suggestionButtons = document.querySelectorAll('.my-app-btn-suggestion');

// Load questions from localStorage
function loadQuestions() {
    const savedQuestions = localStorage.getItem('questions');
    questionInput.value = savedQuestions ? savedQuestions : '';
}

// Save questions to localStorage
function saveQuestions() {
    localStorage.setItem('questions', questionInput.value.trim());
}

// Shuffle questions
function shuffleQuestions() {
    const questions = questionInput.value.split('\n').filter(Boolean);
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    questionInput.value = questions.join('\n');
    saveQuestions();
}

// Clear all questions
function clearAllQuestions() {
    questionInput.value = '';
    saveQuestions();
}

// Load suggestions from file
async function loadSuggestions(file) {
    try {
        const response = await fetch(`./assets/data/${file}`);
        const text = await response.text();
        questionInput.value += '\n' + text.trim();
        saveQuestions();
    } catch (error) {
        alert('Không thể tải gợi ý từ file: ' + file);
    }
}

// Event listeners
shuffleBtn.addEventListener('click', shuffleQuestions);
clearAllBtn.addEventListener('click', clearAllQuestions);
suggestionButtons.forEach((button) => {
    button.addEventListener('click', () => loadSuggestions(button.dataset.file));
});

// Initialize
loadQuestions();
questionInput.addEventListener('input', saveQuestions);
