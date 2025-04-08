/**
 * FinancialGoals.tsx
 * 
 * Component for managing financial goals such as savings targets,
 * emergency funds, and other personal finance objectives.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

/**
 * Props for the FinancialGoals component
 */
interface FinancialGoalProps {
  /** Callback function when goals are saved */
  onSave: () => void;
}

/**
 * Financial goal data structure
 */
interface FinancialGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

/**
 * FinancialGoals component for managing user financial objectives
 */
const FinancialGoals: React.FC<FinancialGoalProps> = ({ onSave }) => {
  // Initial sample goals
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

  // New goal form state
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    targetDate: ''
  });

  // Toggle for add goal form
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Adds a new financial goal
   */
  const addNewGoal = () => {
    // Validate form
    if (!newGoal.name || newGoal.targetAmount <= 0 || !newGoal.targetDate) {
      alert('Please fill in all goal details');
      return;
    }

    // Create new goal object with ID and currentAmount initialized to 0
    const goal: FinancialGoal = {
      id: Date.now(), // Use timestamp as ID
      ...newGoal,
      currentAmount: 0
    };

    // Add to goals array
    setGoals([...goals, goal]);
    
    // Reset form and close it
    setNewGoal({ name: '', targetAmount: 0, targetDate: '' });
    setIsAdding(false);
    
    // Show success notification
    onSave();
  };

  /**
   * Updates the progress of an existing goal
   * @param id - The goal ID to update
   * @param currentAmount - The new current amount
   */
  const updateGoalProgress = (id: number, currentAmount: number) => {
    setGoals(goals.map(goal => 
      goal.id === id 
        ? { ...goal, currentAmount } 
        : goal
    ));
  };

  /**
   * Deletes a financial goal
   * @param id - The goal ID to delete
   */
  const deleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  /**
   * Calculates the percentage progress of a goal
   * @param goal - The goal to calculate progress for
   * @returns The percentage completed (0-100)
   */
  const calculateProgress = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  /**
   * Gets appropriate color based on progress percentage
   * @param progress - Progress percentage
   * @returns Color code for the progress bar
   */
  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#e74c3c'; // Red - early progress
    if (progress < 70) return '#f39c12'; // Orange - mid progress
    return '#2ecc71'; // Green - almost complete
  };

  /**
   * Calculates remaining days until target date
   * @param targetDate - The goal's target date
   * @returns Number of days remaining
   */
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
      
      {/* Add goal button */}
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
      
      {/* Add goal form - only visible when isAdding is true */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            className="settings-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Create New Goal</h3>
            <div className="form-grid">
              {/* Goal name field */}
              <div className="form-group">
                <label htmlFor="goalName">Goal Name</label>
                <input 
                  type="text"
                  id="goalName"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  placeholder="e.g., New Car, Home Down Payment"
                />
              </div>
              
              {/* Target amount field */}
              <div className="form-group">
                <label htmlFor="targetAmount">Target Amount</label>
                <input 
                  type="number"
                  id="targetAmount"
                  value={newGoal.targetAmount || ''}
                  onChange={(e) => setNewGoal({...newGoal, targetAmount: Number(e.target.value)})}
                  placeholder="Enter target amount"
                />
              </div>
              
              {/* Target date field */}
              <div className="form-group">
                <label htmlFor="targetDate">Target Date</label>
                <input 
                  type="date"
                  id="targetDate"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                />
              </div>
              
              {/* Create goal button */}
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

      {/* List of existing goals */}
      <motion.div 
        className="settings-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>Your Goals</h3>
        
        {/* Message when no goals exist */}
        {goals.length === 0 ? (
          <motion.div 
            className="no-goals-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>You don't have any financial goals yet. Add a goal to get started on your financial journey!</p>
          </motion.div>
        ) : (
          // Grid of goal cards
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
                  {/* Goal header with title and delete button */}
                  <div className="goal-header">
                    <h4>{goal.name}</h4>
                    <motion.button 
                      className="delete-goal"
                      onClick={() => deleteGoal(goal.id)}
                      whileHover={{ scale: 1.2, color: '#e74c3c' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </motion.button>
                  </div>
                  
                  {/* Progress bar visualization */}
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
                  
                  {/* Goal amount and date details */}
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
                  
                  {/* Current amount update input */}
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
      
      {/* Save button */}
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