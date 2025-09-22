class BoardGameTimer {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.teamBankTime = 0;
        this.isUsingTeamBank = false;
        
        this.settings = {
            playerCount: 4,
            bankTimeMinutes: 30,
            turnTimeSeconds: 60,
            teamBankMinutes: 10,
            enableTurnTime: true
        };
        
        // Common boardgame colors with dynamic gradients
        this.boardgameColors = [
            { name: 'Red', hex: '#DC2626', gradient: 'linear-gradient(135deg, #FF4B4B, #DC2626, #B91C1C)', class: 'red' },
            { name: 'Blue', hex: '#2563EB', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB, #1D4ED8)', class: 'blue' },
            { name: 'Green', hex: '#16A34A', gradient: 'linear-gradient(135deg, #22C55E, #16A34A, #15803D)', class: 'green' },
            { name: 'Yellow', hex: '#EAB308', gradient: 'linear-gradient(135deg, #FDE047, #EAB308, #CA8A04)', class: 'yellow' },
            { name: 'Purple', hex: '#9333EA', gradient: 'linear-gradient(135deg, #A855F7, #9333EA, #7C3AED)', class: 'purple' },
            { name: 'Orange', hex: '#EA580C', gradient: 'linear-gradient(135deg, #FB923C, #EA580C, #DC2626)', class: 'orange' },
            { name: 'Pink', hex: '#EC4899', gradient: 'linear-gradient(135deg, #F472B6, #EC4899, #DB2777)', class: 'pink' },
            { name: 'Teal', hex: '#0D9488', gradient: 'linear-gradient(135deg, #14B8A6, #0D9488, #0F766E)', class: 'teal' },
            { name: 'Brown', hex: '#A16207', gradient: 'linear-gradient(135deg, #D97706, #A16207, #92400E)', class: 'brown' },
            { name: 'White', hex: '#F8FAFC', gradient: 'linear-gradient(135deg, #FFFFFF, #F8FAFC, #E2E8F0)', class: 'white' },
            { name: 'Black', hex: '#1F2937', gradient: 'linear-gradient(135deg, #374151, #1F2937, #111827)', class: 'black' },
            { name: 'Gray', hex: '#6B7280', gradient: 'linear-gradient(135deg, #9CA3AF, #6B7280, #4B5563)', class: 'gray' }
        ];
        
        this.interval = null;
        this.teamBankInterval = null;
        
        this.initializeEventListeners();
        this.initializePlayers();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').style.display = 'block';
        });
        
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('settingsModal').style.display = 'none';
        });
        
        document.getElementById('applySettings').addEventListener('click', () => {
            this.applySettings();
            document.getElementById('settingsModal').style.display = 'none';
        });
        
        // Turn order modal
        document.getElementById('turnOrderBtn').addEventListener('click', () => {
            this.openTurnOrderModal();
        });
        
        document.getElementById('closeTurnOrderModal').addEventListener('click', () => {
            document.getElementById('turnOrderModal').style.display = 'none';
        });
        
        document.getElementById('applyTurnOrder').addEventListener('click', () => {
            this.applyTurnOrder();
            document.getElementById('turnOrderModal').style.display = 'none';
        });
        
        // Player count management
        document.getElementById('addPlayer').addEventListener('click', () => {
            this.addPlayer();
        });
        
        document.getElementById('removePlayer').addEventListener('click', () => {
            this.removePlayer();
        });
        
        // Control buttons
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetTimer();
        });
        
        // Team bank button
        document.getElementById('teamBankBtn').addEventListener('click', () => {
            this.toggleTeamBank();
        });
        
        // Close modal when clicking outside
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('settingsModal')) {
                document.getElementById('settingsModal').style.display = 'none';
            }
        });
        
        document.getElementById('turnOrderModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('turnOrderModal')) {
                document.getElementById('turnOrderModal').style.display = 'none';
            }
        });
        
        // Close color palettes when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.color-selector-container')) {
                document.querySelectorAll('.color-palette').forEach(palette => {
                    palette.classList.remove('visible');
                });
            }
        });
    }
    
    initializePlayers() {
        this.players = [];
        for (let i = 0; i < this.settings.playerCount; i++) {
            const colorData = this.boardgameColors[i] || this.boardgameColors[0];
            this.players.push({
                id: i,
                name: colorData.name,
                color: colorData.class,
                customColor: colorData.hex,
                bankTime: this.settings.bankTimeMinutes * 60,
                turnTime: this.settings.enableTurnTime ? this.settings.turnTimeSeconds : null,
                isActive: i === 0,
                isEliminated: false
            });
        }
        
        this.teamBankTime = this.settings.teamBankMinutes * 60;
        this.currentPlayerIndex = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isUsingTeamBank = false;
        
        this.renderPlayers();
    }
    
    renderPlayers() {
        const container = document.getElementById('playersContainer');
        container.innerHTML = '';
        
        // Set grid class based on player count
        container.className = `players-container ${this.getGridClass()}`;
        
        this.players.forEach((player, index) => {
            const nextPlayerIndex = this.getNextPlayerIndex();
            const isNextPlayer = index === nextPlayerIndex && !player.isActive && !player.isEliminated;
            
            const playerElement = document.createElement('div');
            playerElement.className = `player ${player.isActive ? 'active' : ''} ${isNextPlayer ? 'next-player' : ''}`;
            
            // Use the gradient from the color data if available, otherwise create one
            const colorData = this.boardgameColors.find(c => c.hex === player.customColor);
            const background = colorData ? colorData.gradient : `linear-gradient(135deg, ${player.customColor}, ${this.darkenColor(player.customColor, 20)})`;
            
            playerElement.style.background = background;
            // Determine status message
            let statusMessage = 'Waiting';
            if (player.isActive) {
                if (!this.isRunning || this.isPaused) {
                    statusMessage = 'Your turn - tap to start';
                } else if (player.turnTime !== null && player.turnTime === 0) {
                    statusMessage = 'Turn time expired - using bank time';
                } else {
                    statusMessage = 'Tap to end turn';
                }
            } else if (isNextPlayer) {
                statusMessage = 'Next up!';
            }
            
            playerElement.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="timer-display">
                    <div class="bank-time">${this.formatTime(player.bankTime)}</div>
                    ${player.turnTime !== null ? `<div class="turn-time ${player.turnTime === 0 ? 'expired' : ''}">Turn: ${this.formatTime(player.turnTime)}</div>` : ''}
                    <div class="player-status">${statusMessage}</div>
                </div>
            `;
            
            // Add click event to player area to end turn
            playerElement.addEventListener('click', () => {
                if (player.isActive && !this.isPaused) {
                    if (!this.isRunning) {
                        this.startTimer();
                    } else {
                        this.endTurn();
                    }
                }
            });
            
            container.appendChild(playerElement);
        });
    }
    
    getGridClass() {
        switch (this.settings.playerCount) {
            case 2: return 'two-players';
            case 3: return 'three-players';
            case 4: return 'four-players';
            case 5: return 'five-players';
            case 6: return 'six-players';
            default: return 'four-players';
        }
    }
    
    getClockwiseOrder() {
        // Define clockwise turn order for each player count
        const clockwiseOrders = {
            2: [0, 1],
            3: [0, 1, 2],
            4: [0, 1, 2, 3],
            5: [0, 1, 2, 3, 4],
            6: [0, 1, 2, 3, 4, 5]
        };
        return clockwiseOrders[this.settings.playerCount] || [0, 1, 2, 3];
    }
    
    getNextPlayerIndex() {
        const clockwiseOrder = this.getClockwiseOrder();
        const currentOrderIndex = clockwiseOrder.indexOf(this.currentPlayerIndex);
        
        // Find next non-eliminated player in clockwise order
        let attempts = 0;
        let nextOrderIndex = currentOrderIndex;
        do {
            nextOrderIndex = (nextOrderIndex + 1) % clockwiseOrder.length;
            attempts++;
        } while (this.players[clockwiseOrder[nextOrderIndex]].isEliminated && attempts < clockwiseOrder.length);
        
        return clockwiseOrder[nextOrderIndex];
    }
    
    startTimer() {
        if (this.isRunning && !this.isPaused) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.interval = setInterval(() => {
            if (this.isUsingTeamBank) {
                this.updateTeamBank();
            } else {
                this.updateCurrentPlayer();
            }
            this.updateDisplay();
        }, 1000);
        
        this.updateDisplay();
    }
    
    updateCurrentPlayer() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        if (currentPlayer.isEliminated) return;
        
        // If per-turn time is enabled and available, count down turn time first
        if (currentPlayer.turnTime !== null && currentPlayer.turnTime > 0) {
            currentPlayer.turnTime--;
            
            // If turn time runs out, switch to counting bank time (don't end turn automatically)
            if (currentPlayer.turnTime === 0) {
                // Turn time expired, now bank time will count down on next tick
                // Don't call endTurn() - let player continue with bank time
                return;
            }
        } else if (currentPlayer.turnTime === null || currentPlayer.turnTime === 0) {
            // Count down bank time when per-turn time is disabled or has expired
            if (currentPlayer.bankTime > 0) {
                currentPlayer.bankTime--;
                
                // If bank time runs out, eliminate player
                if (currentPlayer.bankTime === 0) {
                    this.eliminatePlayer(this.currentPlayerIndex);
                }
            }
        }
    }
    
    updateTeamBank() {
        if (this.teamBankTime > 0) {
            this.teamBankTime--;
            
            if (this.teamBankTime === 0) {
                this.stopTeamBank();
            }
        }
    }
    
    endTurn() {
        if (!this.isRunning || this.isPaused || this.isUsingTeamBank) return;
        
        // Reset turn time for current player
        const currentPlayer = this.players[this.currentPlayerIndex];
        if (this.settings.enableTurnTime) {
            currentPlayer.turnTime = this.settings.turnTimeSeconds;
        }
        
        // Move to next active player
        this.nextPlayer();
        
        // Start the timer if it wasn't running
        if (!this.isRunning) {
            this.startTimer();
        }
        
        this.updateDisplay();
    }
    
    nextPlayer() {
        // Use clockwise order to determine next player
        this.currentPlayerIndex = this.getNextPlayerIndex();
        
        // Update active status
        this.players.forEach((player, index) => {
            player.isActive = index === this.currentPlayerIndex && !player.isEliminated;
        });
        
        // Check if only one player remains
        const activePlayers = this.players.filter(p => !p.isEliminated);
        if (activePlayers.length <= 1) {
            this.endGame();
        }
    }
    
    eliminatePlayer(playerIndex) {
        this.players[playerIndex].isEliminated = true;
        this.players[playerIndex].isActive = false;
        
        // If the eliminated player was active, move to next player
        if (playerIndex === this.currentPlayerIndex) {
            this.nextPlayer();
        }
        
        this.updateDisplay();
    }
    
    endGame() {
        this.pauseTimer();
        const winner = this.players.find(p => !p.isEliminated);
        if (winner) {
            alert(`Game Over! ${winner.name} wins!`);
        } else {
            alert('Game Over! No players remaining!');
        }
    }
    
    togglePause() {
        if (!this.isRunning) {
            this.startTimer();
            document.getElementById('pauseBtn').innerHTML = '⏸️ Pause';
        } else if (this.isPaused) {
            this.isPaused = false;
            this.startTimer();
            document.getElementById('pauseBtn').innerHTML = '⏸️ Pause';
        } else {
            this.pauseTimer();
            document.getElementById('pauseBtn').innerHTML = '▶️ Resume';
        }
    }
    
    pauseTimer() {
        this.isPaused = true;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.teamBankInterval) {
            clearInterval(this.teamBankInterval);
            this.teamBankInterval = null;
        }
        this.updateDisplay();
    }
    
    resetTimer() {
        if (confirm('Are you sure you want to reset the timer? All progress will be lost.')) {
            this.pauseTimer();
            this.isRunning = false;
            this.isPaused = false;
            this.isUsingTeamBank = false;
            this.initializePlayers();
            this.updateDisplay();
            document.getElementById('pauseBtn').innerHTML = '⏸️ Pause';
        }
    }
    
    toggleTeamBank() {
        if (this.isUsingTeamBank) {
            this.stopTeamBank();
        } else {
            this.startTeamBank();
        }
    }
    
    startTeamBank() {
        if (this.teamBankTime <= 0) {
            alert('Team bank time is empty!');
            return;
        }
        
        this.isUsingTeamBank = true;
        this.pauseTimer();
        this.startTimer();
        
        document.getElementById('teamBankBtn').textContent = 'Stop Team Bank';
        document.getElementById('teamBankBtn').style.background = '#FF3B30';
        
        this.updateDisplay();
    }
    
    stopTeamBank() {
        this.isUsingTeamBank = false;
        
        document.getElementById('teamBankBtn').textContent = 'Use Team Bank';
        document.getElementById('teamBankBtn').style.background = '#4CAF50';
        
        if (this.isRunning && !this.isPaused) {
            this.startTimer();
        }
        
        this.updateDisplay();
    }
    
    applySettings() {
        // Get settings from form
        const newSettings = {
            playerCount: parseInt(document.getElementById('playerCount').value),
            bankTimeMinutes: parseInt(document.getElementById('bankTimeMinutes').value),
            turnTimeSeconds: parseInt(document.getElementById('turnTimeSeconds').value),
            teamBankMinutes: parseInt(document.getElementById('teamBankMinutes').value),
            enableTurnTime: document.getElementById('enableTurnTime').checked
        };
        
        // Validate settings
        if (newSettings.bankTimeMinutes < 1 || newSettings.bankTimeMinutes > 180) {
            alert('Bank time must be between 1 and 180 minutes');
            return;
        }
        
        if (newSettings.turnTimeSeconds < 10 || newSettings.turnTimeSeconds > 600) {
            alert('Turn time must be between 10 and 600 seconds');
            return;
        }
        
        if (newSettings.teamBankMinutes < 0 || newSettings.teamBankMinutes > 60) {
            alert('Team bank time must be between 0 and 60 minutes');
            return;
        }
        
        // Apply settings and reinitialize
        this.settings = newSettings;
        this.pauseTimer();
        this.isRunning = false;
        this.isPaused = false;
        this.isUsingTeamBank = false;
        this.initializePlayers();
        this.updateDisplay();
        document.getElementById('pauseBtn').innerHTML = '⏸️ Pause';
    }
    
    updateDisplay() {
        // Update team bank display
        document.getElementById('teamBankTime').textContent = this.formatTime(this.teamBankTime);
        
        const teamBankBtn = document.getElementById('teamBankBtn');
        if (this.teamBankTime <= 0) {
            teamBankBtn.disabled = true;
            teamBankBtn.textContent = 'Team Bank Empty';
        } else {
            teamBankBtn.disabled = false;
            if (!this.isUsingTeamBank) {
                teamBankBtn.textContent = 'Use Team Bank';
            }
        }
        
        // Re-render players to update their display
        this.renderPlayers();
    }
    
    openTurnOrderModal() {
        this.updatePlayerCountDisplay();
        this.renderTurnOrderList();
        document.getElementById('turnOrderModal').style.display = 'block';
    }
    
    updatePlayerCountDisplay() {
        document.getElementById('currentPlayerCount').textContent = this.settings.playerCount;
        document.getElementById('removePlayer').disabled = this.settings.playerCount <= 2;
        document.getElementById('addPlayer').disabled = this.settings.playerCount >= 12;
    }
    
    renderTurnOrderList() {
        const container = document.getElementById('turnOrderList');
        container.innerHTML = '';
        
        // Create a copy of players array for the turn order list
        const orderedPlayers = [...this.players].filter(p => !p.isEliminated);
        
        // Sort to show current player first, then others in order
        const currentPlayerIndex = orderedPlayers.findIndex(p => p.isActive);
        if (currentPlayerIndex > 0) {
            const currentPlayer = orderedPlayers.splice(currentPlayerIndex, 1)[0];
            orderedPlayers.unshift(currentPlayer);
        }
        
        orderedPlayers.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = `turn-order-item ${player.isActive ? 'current-player' : ''}`;
            item.draggable = true;
            item.dataset.playerId = player.id;
            
            const playerColorData = this.boardgameColors.find(c => c.hex === player.customColor) || this.boardgameColors[0];
            
            item.innerHTML = `
                <div class="color-selector-container">
                    <div class="selected-color" style="background: ${playerColorData.gradient}" data-player-id="${player.id}"></div>
                    <div class="color-palette" data-player-id="${player.id}">
                        ${this.boardgameColors.map(color => 
                            `<div class="color-option ${player.customColor === color.hex ? 'selected' : ''}" 
                                 style="background: ${color.gradient}" 
                                 data-color="${color.hex}" 
                                 data-gradient="${color.gradient}"
                                 data-name="${color.name}"
                                 title="${color.name}"></div>`
                        ).join('')}
                    </div>
                </div>
                <div class="turn-order-info">
                    <input type="text" class="turn-order-name-input" value="${player.name}" data-player-id="${player.id}" maxlength="12">
                    <div class="turn-order-status">${player.isActive ? 'Current Turn' : index === 0 ? 'Next Turn' : `${index + 1}${this.getOrdinalSuffix(index + 1)}`}</div>
                </div>
                <div class="turn-order-drag-handle">⋮⋮</div>
            `;
            
            // Add drag and drop event listeners
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
            item.addEventListener('dragover', this.handleDragOver.bind(this));
            item.addEventListener('drop', this.handleDrop.bind(this));
            item.addEventListener('dragenter', this.handleDragEnter.bind(this));
            item.addEventListener('dragleave', this.handleDragLeave.bind(this));
            
            // Add color selection event listeners
            const selectedColor = item.querySelector('.selected-color');
            const colorPalette = item.querySelector('.color-palette');
            
            selectedColor.addEventListener('click', (e) => {
                e.stopPropagation();
                // Toggle palette visibility
                colorPalette.classList.toggle('visible');
                // Hide other palettes
                document.querySelectorAll('.color-palette').forEach(palette => {
                    if (palette !== colorPalette) {
                        palette.classList.remove('visible');
                    }
                });
            });
            
            item.querySelectorAll('.color-option').forEach(colorOption => {
                colorOption.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const color = e.target.dataset.color;
                    const gradient = e.target.dataset.gradient;
                    const name = e.target.dataset.name;
                    
                    // Update selected color display with gradient
                    selectedColor.style.background = gradient;
                    selectedColor.setAttribute('data-color', color);
                    
                    // Update selection in palette
                    item.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                    e.target.classList.add('selected');
                    
                    // Hide palette
                    colorPalette.classList.remove('visible');
                });
            });
            
            container.appendChild(item);
        });
    }
    
    getOrdinalSuffix(num) {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const v = num % 100;
        return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    }
    
    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.dataTransfer.setData('text/plain', e.target.dataset.playerId);
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        // Clean up any drag-over classes
        document.querySelectorAll('.turn-order-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.closest('.turn-order-item')) {
            e.target.closest('.turn-order-item').classList.add('drag-over');
        }
    }
    
    handleDragLeave(e) {
        if (e.target.closest('.turn-order-item')) {
            e.target.closest('.turn-order-item').classList.remove('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const dropTarget = e.target.closest('.turn-order-item');
        
        if (dropTarget && dropTarget.dataset.playerId !== draggedId) {
            const container = document.getElementById('turnOrderList');
            const draggedElement = container.querySelector(`[data-player-id="${draggedId}"]`);
            
            // Insert before the drop target
            container.insertBefore(draggedElement, dropTarget);
            
            // Update the status indicators
            this.updateTurnOrderStatus();
        }
        
        // Clean up
        document.querySelectorAll('.turn-order-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }
    
    updateTurnOrderStatus() {
        const items = document.querySelectorAll('.turn-order-item');
        items.forEach((item, index) => {
            const statusElement = item.querySelector('.turn-order-status');
            const isCurrentPlayer = item.classList.contains('current-player');
            
            if (isCurrentPlayer && index === 0) {
                statusElement.textContent = 'Current Turn';
            } else if (index === 0 && !isCurrentPlayer) {
                statusElement.textContent = 'Next Turn';
            } else if (index === 1 && isCurrentPlayer) {
                statusElement.textContent = 'Current Turn';
            } else {
                const position = isCurrentPlayer ? index + 1 : index + 1;
                statusElement.textContent = `${position}${this.getOrdinalSuffix(position)}`;
            }
        });
    }
    
    addPlayer() {
        if (this.settings.playerCount >= 12) return;
        
        this.settings.playerCount++;
        const newPlayerId = this.players.length;
        const colorData = this.boardgameColors[newPlayerId % this.boardgameColors.length];
        
        this.players.push({
            id: newPlayerId,
            name: colorData.name,
            color: colorData.class,
            customColor: colorData.hex,
            bankTime: this.settings.bankTimeMinutes * 60,
            turnTime: this.settings.enableTurnTime ? this.settings.turnTimeSeconds : null,
            isActive: false,
            isEliminated: false
        });
        
        this.updatePlayerCountDisplay();
        this.renderTurnOrderList();
    }
    
    removePlayer() {
        if (this.settings.playerCount <= 2) return;
        
        // Remove the last player
        const removedPlayer = this.players.pop();
        this.settings.playerCount--;
        
        // If the removed player was active, move to the next player
        if (removedPlayer && removedPlayer.isActive) {
            this.currentPlayerIndex = 0;
            this.players.forEach(p => p.isActive = false);
            this.players[0].isActive = true;
        }
        
        this.updatePlayerCountDisplay();
        this.renderTurnOrderList();
    }
    
    applyTurnOrder() {
        const items = document.querySelectorAll('.turn-order-item');
        const newOrder = [];
        
        // Update player names and colors from the inputs
        items.forEach(item => {
            const playerId = parseInt(item.dataset.playerId);
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                const nameInput = item.querySelector('.turn-order-name-input');
                const selectedColor = item.querySelector('.selected-color');
                
                player.name = nameInput.value.trim() || player.name;
                player.customColor = selectedColor.getAttribute('data-color') || player.customColor;
                
                newOrder.push(player);
            }
        });
        
        // Add eliminated players back to the end
        const eliminatedPlayers = this.players.filter(p => p.isEliminated);
        newOrder.push(...eliminatedPlayers);
        
        // Update the players array with new order, reassigning IDs to match new positions
        this.players = newOrder.map((player, index) => ({
            ...player,
            id: index
        }));
        
        // Find the current active player's new index
        const activePlayerIndex = this.players.findIndex(p => p.isActive);
        if (activePlayerIndex !== -1) {
            this.currentPlayerIndex = activePlayerIndex;
        }
        
        // Re-render the game board
        this.renderPlayers();
        this.updateDisplay();
    }
    
    darkenColor(hex, percent) {
        // Convert hex to RGB
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }
    
    rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return rgb;
        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    
    formatTime(seconds) {
        if (seconds < 0) seconds = 0;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameTimer = new BoardGameTimer();
});

// Prevent page refresh/close without confirmation when game is running
window.addEventListener('beforeunload', (e) => {
    if (window.gameTimer && window.gameTimer.isRunning && !window.gameTimer.isPaused) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Handle visibility change (when tab becomes hidden/visible)
document.addEventListener('visibilitychange', () => {
    if (window.gameTimer && window.gameTimer.isRunning && !document.hidden) {
        // Refresh display when tab becomes visible again
        window.gameTimer.updateDisplay();
    }
});

// Handle orientation change on mobile devices
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (window.gameTimer) {
            window.gameTimer.updateDisplay();
        }
    }, 100);
});