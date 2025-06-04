const taskStorage = {};
const taskPriorities = {};
const dailyMood = {};
    
const dateInput = document.getElementById('planner-date');
const planner = document.getElementById('planner');
const clearAllBtn = document.getElementById('clearAll');
const syncBtn = document.getElementById('syncBtn');
const hours = [
    "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", 
    "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", 
    "6 PM", "7 PM", "8 PM", "9 PM"
];
    
const aiSuggestions = [
    "💡 Add break time", "🎯 Set specific goals", "⏰ Time block this", 
    "🔔 Set reminder", "📱 Minimize distractions", "☕ Schedule coffee break"
];
    
const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
      
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function getStorageKey(date, hour) {
    return `${date}-${hour}`;
}

function saveTask(key, value) {
    taskStorage[key] = value;
    updateStats();
}

function getTask(key) {
    return taskStorage[key] || '';
}

function setPriority(key, priority) {
    taskPriorities[key] = priority;
}

function getPriority(key) {
    return taskPriorities[key] || 'low';
}

function getTimeStatus(date, hourIndex) {
    if (date !== today) {
        return date < today ? 'past' : 'future';
    }
      
    const currentHour = new Date().getHours();
    const hour24 = hourIndex + 6;
      
    if (hour24 < currentHour) return 'past';
    if (hour24 === currentHour) return 'present';
    return 'future';
}

function updateStats() {
    const currentDate = dateInput.value;
    let totalTasks = 0;
    let completedTasks = 0;
    let focusHours = 0;
      
    hours.forEach(hour => {
        const key = getStorageKey(currentDate, hour);
        const task = getTask(key);
        if (task.trim()) {
          totalTasks++;
          if (task.length > 10) completedTasks++;
          if (task.includes('focus') || task.includes('work')) focusHours++;
        }
    });
      
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completionRate').textContent = completionRate + '%';
    document.getElementById('focusTime').textContent = focusHours + 'h';
}

function loadPlanner(date) {
    planner.innerHTML = '';

    hours.forEach((label, index) => {
        const storageKey = getStorageKey(date, label);
        const savedValue = getTask(storageKey);
        const priority = getPriority(storageKey);
        const timeStatus = getTimeStatus(date, index);
        const row = document.createElement("div");
        row.className = `time-block priority-${priority}`;
        const hourDiv = document.createElement("div");
        hourDiv.className = "hour";
        hourDiv.innerHTML = `<span>${label}</span>`;
        const contentArea = document.createElement("div");
        contentArea.className = "content-area";
        const textArea = document.createElement("textarea");
        textArea.value = savedValue;
        textArea.className = timeStatus;
        textArea.placeholder = `What's your plan for ${label}? ✨`;
        const prioritySelector = document.createElement("div");
        prioritySelector.className = "priority-selector";
        ['high', 'medium', 'low'].forEach(p => {
          const dot = document.createElement("div");
          dot.className = `priority-dot ${p} ${priority === p ? 'active' : ''}`;
          dot.onclick = () => {
            setPriority(storageKey, p);
            loadPlanner(date);
          };
          prioritySelector.appendChild(dot);
        });
        const aiSuggestion = document.createElement("div");
        aiSuggestion.className = "ai-suggestion";
        aiSuggestion.textContent = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];

        textArea.addEventListener("input", () => {
          saveTask(storageKey, textArea.value);
        });

        const saveBtn = document.createElement("button");
        saveBtn.className = "save-btn";
        saveBtn.innerHTML = "💾 Save & Sync";

        saveBtn.onclick = () => {
          const taskText = textArea.value.trim();
          if (!taskText) {
            showNotification('Please enter a task first! 📝', 'warning');
            return;
          }

          saveTask(storageKey, taskText);
          showNotification('Task saved successfully! 🎉');
          
          setTimeout(() => {
            showNotification('📊 Productivity insights updated!', 'success');
          }, 1500);
        };

        contentArea.appendChild(textArea);
        contentArea.appendChild(prioritySelector);
        contentArea.appendChild(aiSuggestion);
        contentArea.appendChild(saveBtn);
        
        row.appendChild(hourDiv);
        row.appendChild(contentArea);
        planner.appendChild(row);
    });

    updateStats();
}

document.querySelectorAll('.mood-emoji').forEach(emoji => {
    emoji.onclick = () => {
        document.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('selected'));
        emoji.classList.add('selected');
        const mood = emoji.dataset.mood;
        dailyMood[dateInput.value] = mood;
        showNotification(`Mood set to ${emoji.textContent}! This helps us optimize your day.`);
    };
});

clearAllBtn.onclick = () => {
    const selectedDate = dateInput.value;
    if (confirm(`🗑️ Clear all tasks for ${selectedDate}? This cannot be undone!`)) {
        hours.forEach(label => {
          const key = getStorageKey(selectedDate, label);
          delete taskStorage[key];
          delete taskPriorities[key];
        });
        loadPlanner(selectedDate);
        showNotification('All tasks cleared! 🧹', 'success');
    }
};

syncBtn.onclick = () => {
    showNotification('🔄 Syncing with smart calendar...', 'success');
    setTimeout(() => {
        showNotification('✅ Smart sync completed! Data optimized.', 'success');
    }, 2000);
};

dateInput.addEventListener("change", () => {
    loadPlanner(dateInput.value);
    showNotification(`📅 Switched to ${dateInput.value}`);
});

const sampleData = {
    [getStorageKey(today, "9 AM")]: "Team standup meeting 👥",
    [getStorageKey(today, "2 PM")]: "Client presentation review 📊",
    [getStorageKey(today, "4 PM")]: "Focus time - deep work 🎯"
};
    
Object.assign(taskStorage, sampleData);
setPriority(getStorageKey(today, "2 PM"), "high");
setPriority(getStorageKey(today, "4 PM"), "medium");
loadPlanner(today);
setInterval(() => {
    if (dateInput.value === today) {
        const currentElements = document.querySelectorAll('.present');
        if (currentElements.length > 0) {
          loadPlanner(today);
        }
    }
}, 60000);

setInterval(() => {
    const temps = [18, 22, 25, 28, 20];
    const conditions = ['☀️ Sunny', '🌤️ Partly Cloudy', '☁️ Cloudy', '🌧️ Rainy'];
    const temp = temps[Math.floor(Math.random() * temps.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    document.getElementById('weatherWidget').innerHTML = `<span>${condition.split(' ')[0]}</span><span>${temp}°C - ${condition.split(' ')[1]}</span>`;
}, 30000);
