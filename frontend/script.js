class VoiceGroceryApp {
    constructor() {
        this.items = [];
        this.recognition = null;
        this.isRecording = false;
        // Update API URL to match current backend location
        this.apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://127.0.0.1:5000'  // Local development
            : 'https://your-backend-url.vercel.app';  // Production - update this URL when deployed
        
        this.initializeElements();
        this.initializeVoiceRecognition();
        this.bindEvents();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startRecording');
        this.stopBtn = document.getElementById('stopRecording');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.voiceText = document.getElementById('voiceText');
        this.bulkInput = document.getElementById('bulkInput');
        this.addBulkBtn = document.getElementById('addBulkItems');
        this.itemInput = document.getElementById('itemInput');
        this.addItemBtn = document.getElementById('addItem');
        this.itemsList = document.getElementById('itemsList');
        this.itemCount = document.getElementById('itemCount');
        this.clearAllBtn = document.getElementById('clearAll');
        this.exportBtn = document.getElementById('exportList');
        this.organizeBtn = document.getElementById('organizeItems');
        this.recipeInput = document.getElementById('recipeInput');
        this.getRecipeBtn = document.getElementById('getRecipeItems');
        this.organizedList = document.getElementById('organizedList');
        this.recipeResults = document.getElementById('recipeResults');
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isRecording = true;
                this.voiceStatus.textContent = '🎤 Listening... Say your grocery items!';
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
            };

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                this.voiceText.value = transcript;
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.voiceStatus.textContent = 'Processing speech...';
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
                this.processVoiceInput();
            };

            this.recognition.onerror = (event) => {
                this.voiceStatus.textContent = `Error: ${event.error}`;
                this.isRecording = false;
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
            };
        } else {
            this.voiceStatus.textContent = 'Voice recognition not supported in this browser';
            this.startBtn.disabled = true;
        }
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.addBulkBtn.addEventListener('click', () => this.addBulkItems());
        this.addItemBtn.addEventListener('click', () => this.addManualItem());
        this.itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addManualItem();
        });
        this.bulkInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.addBulkItems();
        });
        this.clearAllBtn.addEventListener('click', () => this.clearAllItems());
        this.exportBtn.addEventListener('click', () => this.exportList());
        this.organizeBtn.addEventListener('click', () => this.organizeItems());
        this.getRecipeBtn.addEventListener('click', () => this.getRecipeIngredients());
        this.recipeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.getRecipeIngredients();
        });
    }

    startRecording() {
        if (this.recognition) {
            this.voiceText.value = '';
            this.recognition.start();
        }
    }

    stopRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    processVoiceInput() {
        const text = this.voiceText.value.trim();
        if (text) {
            // Split by common delimiters and clean up
            const spokenItems = text.split(/[,;.!?\n]/)
                .map(item => item.trim())
                .filter(item => item.length > 0)
                .filter(item => !this.isCommonWord(item));

            spokenItems.forEach(item => {
                if (!this.items.includes(item)) {
                    this.items.push(item);
                }
            });

            this.updateItemsList();
            this.voiceStatus.textContent = `Added ${spokenItems.length} items from speech`;
        } else {
            this.voiceStatus.textContent = 'No items detected in speech';
        }
    }

    isCommonWord(word) {
        const commonWords = ['and', 'or', 'the', 'a', 'an', 'i', 'need', 'want', 'buy', 'get', 'also', 'plus'];
        return commonWords.includes(word.toLowerCase());
    }

    addBulkItems() {
        const text = this.bulkInput.value.trim();
        if (!text) return;

        // Split by common delimiters and clean up
        const items = text.split(/[,;\n]/)
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .filter(item => !this.isCommonWord(item));

        let addedCount = 0;
        items.forEach(item => {
            if (!this.items.includes(item)) {
                this.items.push(item);
                addedCount++;
            }
        });

        this.updateItemsList();
        this.bulkInput.value = '';
        
        if (addedCount > 0) {
            this.showMessage(`✅ Added ${addedCount} items to your shopping list!`);
        } else {
            this.showMessage('ℹ️ No new items to add');
        }
    }

    addManualItem() {
        const item = this.itemInput.value.trim();
        if (!item) return;

        if (this.items.includes(item)) {
            this.showMessage('⚠️ Item already in your list');
            return;
        }

        this.items.push(item);
        this.updateItemsList();
        this.itemInput.value = '';
        this.showMessage(`✅ Added "${item}" to your list`);
    }

    removeItem(index) {
        const item = this.items[index];
        this.items.splice(index, 1);
        this.updateItemsList();
        this.showMessage(`🗑️ Removed "${item}" from your list`);
    }

    editItem(index) {
        const itemNameElement = document.querySelector(`[data-index="${index}"] .item-name`);
        const currentName = this.items[index];
        
        itemNameElement.classList.add('editing');
        itemNameElement.contentEditable = true;
        itemNameElement.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(itemNameElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const saveEdit = () => {
            const newName = itemNameElement.textContent.trim();
            itemNameElement.classList.remove('editing');
            itemNameElement.contentEditable = false;
            
            if (newName && newName !== currentName) {
                if (this.items.includes(newName)) {
                    this.showMessage('⚠️ Item name already exists');
                    itemNameElement.textContent = currentName;
                } else {
                    this.items[index] = newName;
                    this.showMessage(`✏️ Updated item to "${newName}"`);
                }
            } else {
                itemNameElement.textContent = currentName;
            }
        };

        itemNameElement.addEventListener('blur', saveEdit, { once: true });
        itemNameElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                itemNameElement.blur();
            }
        });
    }

    clearAllItems() {
        if (this.items.length === 0) return;
        
        if (confirm(`Are you sure you want to clear all ${this.items.length} items?`)) {
            this.items = [];
            this.updateItemsList();
            this.organizedList.innerHTML = '';
            this.showMessage('🗑️ Cleared all items from your list');
        }
    }

    exportList() {
        if (this.items.length === 0) {
            this.showMessage('⚠️ No items to export');
            return;
        }

        const listText = this.items.join('\n');
        const blob = new Blob([listText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('📋 Exported your grocery list!');
    }

    showMessage(message) {
        // Create or update status message
        let statusDiv = document.getElementById('statusMessage');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'statusMessage';
            statusDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #48bb78;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(statusDiv);
        }

        statusDiv.textContent = message;
        statusDiv.style.background = message.includes('⚠️') ? '#e53e3e' : '#48bb78';
        statusDiv.style.transform = 'translateX(0)';

        // Hide after 3 seconds
        setTimeout(() => {
            statusDiv.style.transform = 'translateX(100%)';
        }, 3000);
    }

    updateItemsList() {
        this.itemsList.innerHTML = '';
        this.itemCount.textContent = this.items.length;
        
        if (this.items.length === 0) {
            this.itemsList.innerHTML = `
                <div class="no-items">
                    No items in your shopping list yet<br>
                    <small>Add items using voice, bulk input, or one by one</small>
                </div>
            `;
            this.organizeBtn.disabled = true;
            this.clearAllBtn.disabled = true;
            this.exportBtn.disabled = true;
        } else {
            this.items.forEach((item, index) => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.setAttribute('data-index', index);
                
                itemCard.innerHTML = `
                    <div class="item-content">
                        <div class="item-name" title="Click to edit">${item}</div>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" title="Edit item" onclick="app.editItem(${index})">✏️</button>
                        <button class="remove-btn" title="Remove item" onclick="app.removeItem(${index})">🗑️</button>
                    </div>
                `;
                
                this.itemsList.appendChild(itemCard);
            });
            
            this.organizeBtn.disabled = false;
            this.clearAllBtn.disabled = false;
            this.exportBtn.disabled = false;
        }
    }

    async organizeItems() {
        if (this.items.length === 0) return;

        this.organizedList.innerHTML = '<div class="loading">🤖 AI is organizing your groceries...</div>';

        try {
            const response = await fetch(`${this.apiBaseUrl}/grocery-list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: this.items })
            });

            const data = await response.json();
            this.displayOrganizedList(data);
        } catch (error) {
            this.organizedList.innerHTML = `<div class="error">❌ Error organizing items: ${error.message}</div>`;
        }
    }

    displayOrganizedList(data) {
        this.organizedList.innerHTML = '<h3>🛒 Organized by Store Sections</h3>';

        if (data.error) {
            this.organizedList.innerHTML += `<div class="error">❌ ${data.error}</div>`;
            return;
        }

        // Remove categories that are empty or have no items
        const categories = Object.keys(data).filter(key => 
            key !== 'error' && Array.isArray(data[key]) && data[key].length > 0
        );

        if (categories.length === 0) {
            this.organizedList.innerHTML += '<div class="no-results">No categories found</div>';
            return;
        }

        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = `${this.getCategoryIcon(category)} ${category.toUpperCase()}`;
            
            const itemsDiv = document.createElement('div');
            itemsDiv.className = 'category-items';
            
            data[category].forEach(item => {
                const itemSpan = document.createElement('span');
                itemSpan.className = 'category-item';
                itemSpan.textContent = item;
                itemsDiv.appendChild(itemSpan);
            });
            
            categoryDiv.appendChild(categoryTitle);
            categoryDiv.appendChild(itemsDiv);
            this.organizedList.appendChild(categoryDiv);
        });
    }

    getCategoryIcon(category) {
        const icons = {
            dairy: '🥛',
            meat: '🥩',
            vegetables: '🥕',
            fruits: '🍎',
            spices: '🌶️',
            bakery: '🍞',
            grains: '🌾',
            frozen: '🧊',
            beverages: '🥤',
            snacks: '🍿',
            cleaning: '🧽',
            personal_care: '🧴'
        };
        return icons[category.toLowerCase()] || '📦';
    }

    async getRecipeIngredients() {
        const recipe = this.recipeInput.value.trim();
        if (!recipe) return;

        this.recipeResults.innerHTML = '<div class="loading">🤖 AI is analyzing your recipe...</div>';

        try {
            const response = await fetch(`${this.apiBaseUrl}/recipe-groceries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipe: recipe })
            });

            const data = await response.json();
            this.displayRecipeResults(data, recipe);
        } catch (error) {
            this.recipeResults.innerHTML = `<div class="error">❌ Error analyzing recipe: ${error.message}</div>`;
        }
    }

    displayRecipeResults(data, recipe) {
        this.recipeResults.innerHTML = `<h3>🍳 Ingredients for "${recipe}"</h3>`;

        if (data.error) {
            this.recipeResults.innerHTML += `<div class="error">❌ ${data.error}</div>`;
            return;
        }

        if (!data.ingredients || data.ingredients.length === 0) {
            this.recipeResults.innerHTML += '<div class="no-results">No ingredients found</div>';
            return;
        }

        data.ingredients.forEach(ingredient => {
            const ingredientDiv = document.createElement('div');
            ingredientDiv.className = 'recipe-ingredient';
            
            ingredientDiv.innerHTML = `
                <div>
                    <span class="ingredient-name">${ingredient.item}</span>
                    <span class="ingredient-quantity">${ingredient.quantity}</span>
                </div>
                <span class="ingredient-category">${ingredient.category}</span>
            `;
            
            this.recipeResults.appendChild(ingredientDiv);
        });

        // Add button to add all ingredients to grocery list
        const addAllBtn = document.createElement('button');
        addAllBtn.className = 'organize-btn';
        addAllBtn.textContent = '➕ Add All to Grocery List';
        addAllBtn.onclick = () => {
            data.ingredients.forEach(ingredient => {
                if (!this.items.includes(ingredient.item)) {
                    this.items.push(ingredient.item);
                }
            });
            this.updateItemsList();
        };
        this.recipeResults.appendChild(addAllBtn);
    }
}

// Initialize the app when the page loads
const app = new VoiceGroceryApp();
