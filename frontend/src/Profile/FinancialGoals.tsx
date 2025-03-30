import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface FinancialGoalProps {
  onSave: () => void;
}

interface FinancialGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

const FinancialGoals: React.FC<FinancialGoalProps> = ({ onSave }) => {
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: 1,
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 5500,
      targetDate: '2025-12-31'
    },
    {
      id: 2,
      name: 'Vacation Fund',
      targetAmount: 5000,
      currentAmount: 2000,
      targetDate: '2024-08-15'
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    targetDate: ''
  });

  const [isAdding, setIsAdding] = useState(false);

  const addNewGoal = () => {
    if (!newGoal.name || newGoal.targetAmount <= 0 || !newGoal.targetDate) {
      alert('Please fill in all goal details');
      return;
    }

    const goal: FinancialGoal = {
      id: Date.now(),
      ...newGoal,
      currentAmount: 0
    };

    setGoals([...goals, goal]);
    setNewGoal({ name: '', targetAmount: 0, targetDate: '' });
    setIsAdding(false);
    
    // Show success notification
    onSave();
  };

  const updateGoalProgress = (id: number, currentAmount: number) => {
    setGoals(goals.map(goal => 
      goal.id === id 
        ? { ...goal, currentAmount } 
        : goal
    ));
  };

  const deleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const calculateProgress = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#e74c3c';
    if (progress < 70) return '#f39c12';
    return '#2ecc71';
  };

  // Calculate remaining days
  const getRemainingDays = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <motion.div 
      className="financial-goals"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Financial Goals</h2>
      
      <motion.div 
        className="goals-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button 
          className="add-goal-button"
          onClick={() => setIsAdding(!isAdding)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAdding ? 'Cancel' : 'Add New Goal'}
        </motion.button>
      </motion.div>
      
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            className="add-goal-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Create New Goal</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Goal Name</label>
                <input 
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  placeholder="e.g., New Car, Home Down Payment"
                />
              </div>
              <div className="form-group">
                <label>Target Amount</label>
                <input 
                  type="number"
                  value={newGoal.targetAmount || ''}
                  onChange={(e) => setNewGoal({...newGoal, targetAmount: Number(e.target.value)})}
                  placeholder="Enter target amount"
                />
              </div>
              <div className="form-group">
                <label>Target Date</label>
                <input 
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                />
              </div>
              <motion.button 
                className="create-goal-button"
                onClick={addNewGoal}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!newGoal.name || newGoal.targetAmount <= 0 || !newGoal.targetDate}
              >
                Create Goal
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="existing-goals"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>Your Goals</h3>
        {goals.length === 0 ? (
          <motion.div 
            className="no-goals-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>You don't have any financial goals yet. Add a goal to get started on your financial journey!</p>
          </motion.div>
        ) : (
          <div className="goals-grid">
            <AnimatePresence>
              {goals.map(goal => (
                <motion.div 
                  key={goal.id} 
                  className="goal-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <div className="goal-header">
                    <h4>{goal.name}</h4>
                    <motion.button 
                      className="delete-goal"
                      onClick={() => deleteGoal(goal.id)}
                      whileHover={{ scale: 1.2, color: '#e74c3c' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FontAwesomeIcon icon="times" />
                    </motion.button>
                  </div>
                  
                  <div className="goal-progress-container">
                    <div className="goal-progress">
                      <motion.div 
                        className="progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProgress(goal)}%` }}
                        style={{ backgroundColor: getProgressColor(calculateProgress(goal)) }}
                        transition={{ duration: 1, delay: 0.2 }}
                      ></motion.div>
                    </div>
                    <div className="progress-text">
                      {calculateProgress(goal).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="goal-details">
                    <div className="goal-amounts">
                      <span className="current-amount">${goal.currentAmount.toLocaleString()}</span>
                      <span className="separator"> / </span>
                      <span className="target-amount">${goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="goal-date">
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                      <span className="days-left">
                        {getRemainingDays(goal.targetDate)} days left
                      </span>
                    </div>
                  </div>
                  
                  <div className="update-progress">
                    <label>Update Current Amount:</label>
                    <div className="update-input-group">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number"
                        value={goal.currentAmount}
                        onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      
      <motion.button 
        className="save-button"
        onClick={onSave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Save Goals
      </motion.button>
    </motion.div>
  );
};

export default FinancialGoals;