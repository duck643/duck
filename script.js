/* Стили для системы диалогов */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.dialog-content {
  background: #1a2d3f;
  border: 2px solid #7DCEA0;
  border-radius: 12px;
  padding: 20px;
  max-width: 90%;
  max-height: 80%;
  overflow-y: auto;
  color: #E0F7FA;
}

.dialog-message {
  margin: 15px 0;
  line-height: 1.5;
  font-size: 16px;
}

.dialog-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dialog-choice {
  background: #2c3e50;
  border: 1px solid #7DCEA0;
  color: #E0F7FA;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.dialog-choice:hover {
  background: #34495e;
  transform: translateX(5px);
}

.dialog-choice:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Стили для NPC */
.npc {
  animation: npc-float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
}

@keyframes npc-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

/* Статистика квеста */
.quest-stats {
  background: #2c3e50;
  padding: 10px;
  border-radius
