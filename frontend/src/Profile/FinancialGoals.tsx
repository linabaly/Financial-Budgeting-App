/**
 * FinancialGoals.tsx
 * 
 * Component for managing financial goals such as savings targets,
 * emergency funds, and other personal finance objectives.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// API URL
const API_URL = 'http://localhost:5005';

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
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  deadline: string;
  createdAt?: string;
  accountId?: string;
}

/**
 * FinancialGoals component for managing user financial objectives
 */
const FinancialGoals: React.FC<FinancialGoalProps> = ({ onSave }) => {
  // State for goals data
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New goal form state
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    currentSaved: 0,
    deadline: new Date().toISOString().split('T')[0] // Today's date as default
  });

  // UI state
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Fetches all goals for the current user
   */
  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch(`${API_URL}/goal`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      
      // Handle empty response (204 No Content)
      if (response.status === 204) {
        setGoals([]);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch goals');
      }
      
      const data = await response.json();
      setGoals(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching goals');
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adds a new financial goal
   */
  const addNewGoal = async () => {
    // Validate form
    if (!newGoal.name || newGoal.targetAmount <= 0 || !newGoal.deadline) {
      setError('Please fill in all goal details');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch(`${API_URL}/goal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          name: newGoal.name,
          targetAmount: newGoal.targetAmount,
          currentSaved: newGoal.currentSaved || 0,
          deadline: new Date(newGoal.deadline).toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create goal');
      }
      
      // Reset form and close it
      setNewGoal({
        name: '',
        targetAmount: 0,
        currentSaved: 0,
        deadline: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
      
      // Refresh the goals list
      await fetchGoals();
      
      // Show success notification
      onSave();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the goal');
      console.error('Error creating goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates the progress of an existing goal
   * @param id - The goal ID to update
   * @param currentSaved - The new current amount
   */
  const updateGoalProgress = async (id: string, currentSaved: number) => {
    // Find the goal being updated to get its full data
    const goalToUpdate = goals.find(goal => goal.id === id);
    if (!goalToUpdate) {
      setError('Goal not found');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch(`${API_URL}/goal/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          currentSaved: currentSaved
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update goal');
      }
      
      // Update the local state for instant feedback
      setGoals(goals.map(goal => 
        goal.id === id 
          ? { ...goal, currentSaved } 
          : goal
      ));
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the goal');
      console.error('Error updating goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a financial goal
   * @param id - The goal ID to delete
   */
  const deleteGoal = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch(`${API_URL}/goal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete goal');
      }
      
      // Update local state by removing the deleted goal
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the goal');
      console.error('Error deleting goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculates the percentage progress of a goal
   * @param goal - The goal to calculate progress for
   * @returns The percentage completed (0-100)
   */
  const calculateProgress = (goal: FinancialGoal) => {
    return Math.min((goal.currentSaved / goal.targetAmount) * 100, 100);
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
    return diffDays > 0 ? diffDays : 0; // Don't show negative days
  };

  /**
   * Format date for display
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Fetch goals when component mounts
  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <motion.div 
      className="financial-goals"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Financial Goals</h2>
      
      {/* Error display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
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
          disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              
              {/* Current amount field (optional) */}
              <div className="form-group">
                <label htmlFor="currentSaved">Current Amount (Optional)</label>
                <input 
                  type="number"
                  id="currentSaved"
                  value={newGoal.currentSaved || ''}
                  onChange={(e) => setNewGoal({...newGoal, currentSaved: Number(e.target.value)})}
                  placeholder="Enter current saved amount"
                  disabled={isLoading}
                />
              </div>
              
              {/* Target date field */}
              <div className="form-group">
                <label htmlFor="targetDate">Target Date</label>
                <input 
                  type="date"
                  id="targetDate"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  disabled={isLoading}
                />
              </div>
              
              {/* Create goal button */}
              <motion.button 
                className="create-goal-button"
                onClick={addNewGoal}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!newGoal.name || newGoal.targetAmount <= 0 || !newGoal.deadline || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Goal'}
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
        
        {/* Loading indicator */}
        {isLoading && !isAdding && (
          <div className="loading-indicator">Loading goals...</div>
        )}
        
        {/* Message when no goals exist */}
        {!isLoading && goals.length === 0 ? (
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
                      disabled={isLoading}
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
                      <span className="current-amount">${goal.currentSaved.toLocaleString()}</span>
                      <span className="separator"> / </span>
                      <span className="target-amount">${goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="goal-date">
                      <span>Target: {formatDate(goal.deadline)}</span>
                      <span className="days-left">
                        {getRemainingDays(goal.deadline)} days left
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
                        value={goal.currentSaved}
                        onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FinancialGoals;