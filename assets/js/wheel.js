// assets/js/wheel.js

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const questionInput = document.getElementById('questionInput');
const shuffleBtn = document.getElementById('shuffleBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const suggestionButtons = document.querySelectorAll('.my-app-btn-suggestion');
const toggleLayoutCheckbox = document.getElementById('toggleLayoutCheckbox');
const optionsSection = document.getElementById('optionsSection');
const wheelSection = document.getElementById('wheelSection');

const DEFAULT_QUESTIONS = ['Question 1', 'Question 2', 'Question 3'];
let questions = [...DEFAULT_QUESTIONS];
let currentAngle = 0;
let spinTimeout = null;
let currentQuestion = null;
let isSpinning = false; // Track spinning state

// Load sound effects
const spinSound = new Audio('./assets/sounds/spin.mp3');
const resultSound = new Audio('./assets/sounds/result.mp3');

// ===== LOCALSTORAGE FUNCTIONS =====
// Load questions from localStorage
function loadQuestionsFromStorage() {
  try {
    const savedQuestions = localStorage.getItem('wheelQuestions');
    if (savedQuestions) {
      const parsed = JSON.parse(savedQuestions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        questions = parsed;
        questionInput.value = questions.join('\n');
        return true;
      }
    }
  } catch (error) {
    console.error('Error loading questions from localStorage:', error);
  }
  return false;
}

// Save questions to localStorage
function saveQuestionsToStorage() {
  try {
    localStorage.setItem('wheelQuestions', JSON.stringify(questions));
  } catch (error) {
    console.error('Error saving questions to localStorage:', error);
  }
}

// Function: Draw the wheel
function drawWheel() {
  const radius = canvas.width / 2;
  const stepAngle = (2 * Math.PI) / questions.length;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw wheel background
  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#d1e7dd');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply gray filter if spinning
  if (isSpinning) {
    ctx.globalAlpha = 0.7;
  }

  // Draw each segment
  questions.forEach((question, i) => {
    const startAngle = currentAngle + i * stepAngle;
    const endAngle = startAngle + stepAngle;

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.fillStyle = i % 3 === 0 ? '#3e46cd' : i % 3 === 1 ? '#e90101' : '#fef200';
    ctx.fill();
    ctx.stroke();

    // Add text to each segment
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + stepAngle / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; // Black text
    ctx.font = 'bold 14px Arial';
    const maxWidth = radius / 1.5;
    wrapText(ctx, question, radius / 2, 0, maxWidth, 18);
    ctx.restore();
  });

  // Reset alpha
  ctx.globalAlpha = 1.0;

  // Add center circle
  ctx.beginPath();
  ctx.arc(radius, radius, radius / 8, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.stroke();

  // Add text "Spin" in the center
  ctx.save();
  ctx.translate(radius, radius);
  ctx.textAlign = 'center';
  ctx.fillStyle = isSpinning ? '#999' : '#000';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(isSpinning ? 'WAIT...' : 'SPIN', 0, 5);
  ctx.restore();

  // Add pointer
  ctx.beginPath();
  ctx.moveTo(radius, 1);
  ctx.lineTo(radius - 10, 25);
  ctx.lineTo(radius + 10, 25);
  ctx.closePath();
  ctx.fillStyle = '#FF0000';
  ctx.fill();

  // Update cursor style
  canvas.style.cursor = isSpinning ? 'not-allowed' : 'pointer';
}

// Function: Wrap text for long questions
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

// Function: Spin the wheel
function spinWheel() {
  // Prevent spinning if already spinning
  if (isSpinning) {
    return;
  }

  // Check if there are questions
  if (questions.length === 0) {
    alert('Vui lòng nhập câu hỏi trước khi quay!');
    return;
  }

  // Set spinning state
  isSpinning = true;
  drawWheel(); // Redraw to show disabled state

  const spinDuration = getSpinDuration();
  const spinAngle = Math.random() * 360 + 720; // Random angle + multiple rotations
  const startTime = Date.now();
  const endTime = startTime + spinDuration;

  const soundEnabled = document.getElementById('toggleSoundCheckbox').checked;
  if (soundEnabled) {
    spinSound.loop = true; // Lặp âm thanh
    spinSound.play(); // Bắt đầu âm thanh quay
  }

  function easeOutQuad(t) {
    return t * (2 - t); // Hàm easing để làm chậm tốc độ
  }

  function animate() {
    const now = Date.now();
    const elapsed = now - startTime;

    if (elapsed >= spinDuration) {
      clearTimeout(spinTimeout);
      if (soundEnabled) {
        spinSound.pause(); // Dừng âm thanh khi quay xong
        spinSound.currentTime = 0; // Reset âm thanh
      }
      isSpinning = false; // Reset spinning state
      displayResult(); // Hiển thị kết quả
      return;
    }

    // Tính toán tốc độ giảm dần
    const progress = elapsed / spinDuration;
    const easedProgress = easeOutQuad(progress);
    currentAngle += (spinAngle * (1 - easedProgress)) / spinDuration;
    currentAngle %= 2 * Math.PI;

    drawWheel();
    spinTimeout = requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// Function: Get spin duration from selected radio
function getSpinDuration() {
  const radios = document.getElementsByName('spinDuration');
  for (const radio of radios) {
    if (radio.checked) {
      const [min, max] = radio.value.split('-').map(Number);
      return Math.random() * (max - min) + min;
    }
  }
  return 3000; // Default
}

// Function: Display result
function displayResult() {
  const soundEnabled = document.getElementById('toggleSoundCheckbox').checked;
  if (soundEnabled) {
    resultSound.play(); // Play result sound nếu âm thanh được bật
  }

  const selectedIdx = Math.floor((currentAngle / (2 * Math.PI)) * questions.length) % questions.length;
  currentQuestion = questions[selectedIdx];
  const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
  document.getElementById('resultText').innerText = `${currentQuestion}`;
  resultModal.show();
}

// Event listener for "Remove Question" button
document.getElementById('removeQuestionBtn').addEventListener('click', () => {
  if (currentQuestion) {
    // Remove current question from the list
    questions = questions.filter((q) => q !== currentQuestion);

    // Reset to default questions if list is empty
    if (questions.length === 0) {
      questions = [...DEFAULT_QUESTIONS];
    }

    // Update the textarea input
    questionInput.value = questions.join('\n');

    // Save to localStorage
    saveQuestionsToStorage();

    // Re-initialize the wheel
    initializeWheel();

    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('resultModal'));
    modal.hide();

    // Clear the current question
    currentQuestion = null;
  }
});

// Function: Auto-update questions on input
function autoUpdateQuestions() {
  questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      updateQuestions();
    }
  });
  questionInput.addEventListener('blur', updateQuestions);

  // Auto-save every 2 seconds when typing
  let saveTimeout;
  questionInput.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      updateQuestions();
    }, 2000); // Save after 2 seconds of no typing
  });
}

function updateQuestions() {
  const inputQuestions = questionInput.value.split('\n').filter(Boolean); // Split by newlines and filter empty lines
  questions = inputQuestions.length > 0 ? inputQuestions : [...DEFAULT_QUESTIONS]; // Use input if available, otherwise defaults
  saveQuestionsToStorage(); // Save to localStorage
  initializeWheel();
}

// Toggle layout
// Handle cleanup of modal-backdrop when exiting fullscreen or closing modal
function removeBackdrops() {
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach((backdrop) => backdrop.remove());
}

// Toggle layout (fullscreen mode)
toggleLayoutCheckbox.addEventListener('change', () => {
  const fullScreenMode = toggleLayoutCheckbox.checked;

  if (fullScreenMode) {
    wheelSection.classList.add('my-app-wheel-only');
    optionsSection.style.display = 'none'; // Hide options
    document.body.classList.add('fullscreen-modal-active');
  } else {
    wheelSection.classList.remove('my-app-wheel-only');
    optionsSection.style.display = 'block'; // Show options
    document.body.classList.remove('fullscreen-modal-active');

    // Remove remaining modal backdrops
    removeBackdrops();
  }

  drawWheel(); // Redraw the wheel to fit the new layout
});

// Ensure backdrops are cleaned up when modal is hidden
document.addEventListener('hidden.bs.modal', () => {
  removeBackdrops();
});

// Ensure fullscreen modal has the proper backdrop
document.addEventListener('shown.bs.modal', () => {
  if (toggleLayoutCheckbox.checked) {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.classList.add('fullscreen-modal-backdrop');
    }
  }
});

// Initialize wheel
function initializeWheel() {
  // if (questions.length === 0) {
  //     questions = [...DEFAULT_QUESTIONS];
  // }
  drawWheel();
}

// Event listeners
shuffleBtn.addEventListener('click', () => {
  questions = questions.sort(() => Math.random() - 0.5);
  questionInput.value = questions.join('\n');
  saveQuestionsToStorage(); // Save to localStorage
  initializeWheel();
});

clearAllBtn.addEventListener('click', () => {
  if (confirm('Bạn có chắc muốn xóa tất cả câu hỏi?')) {
    questionInput.value = '';
    questions = [...DEFAULT_QUESTIONS];
    localStorage.removeItem('wheelQuestions'); // Clear localStorage
    initializeWheel();
  }
});

canvas.addEventListener('click', spinWheel);

suggestionButtons.forEach((button) =>
  button.addEventListener('click', async () => {
    try {
      const response = await fetch(`./assets/data/${button.dataset.file}`);
      const data = await response.text();
      questionInput.value = data;
      updateQuestions();
    } catch (error) {
      console.error('Error loading template:', error);
    }
  }),
);

document.addEventListener('DOMContentLoaded', () => {
  // Load questions from localStorage first
  const loaded = loadQuestionsFromStorage();
  if (!loaded) {
    // If no saved questions, use defaults
    questions = [...DEFAULT_QUESTIONS];
  }

  autoUpdateQuestions();
  initializeWheel();
});
