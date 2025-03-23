import React, { useState } from 'react';

interface FinancialGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

const FinancialGoals: React.FC = () => {
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

  return (
    <div className="financial-goals">
      <h2>Financial Goals</h2>
      
      <div className="add-goal-section">
        <h3>Add New Goal</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Goal Name</label>
            <input 
              type="text"
              value={newGoal.name}
              onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              placeholder="e.g., Emergency Fund"
            />
          </div>
          <div className="form-group">
            <label>Target Amount</label>
            <input 
              type="number"
              value={newGoal.targetAmount}
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
          <button 
            className="add-goal-button"
            onClick={addNewGoal}
          >
            Create Goal
          </button>
        </div>
      </div>

      <div className="existing-goals">
        <h3>Your Goals</h3>
        {goals.map(goal => (
          <div key={goal.id} className="goal-card">
            <div className="goal-header">
              <h4>{goal.name}</h4>
              <button 
                className="delete-goal"
                onClick={() => deleteGoal(goal.id)}
              >
                ✕
              </button>
            </div>
            <div className="goal-progress">
              <div 
                className="progress-bar"
                style={{width: `${calculateProgress(goal)}%`}}
              ></div>
            </div>
            <div className="goal-details">
              <div className="goal-amounts">
                <span>
                  ${goal.currentAmount.toLocaleString()} / 
                  ${goal.targetAmount.toLocaleString()}
                </span>
                <span>{calculateProgress(goal).toFixed(0)}%</span>
              </div>
              <div className="goal-date">
                Target Date: {new Date(goal.targetDate).toLocaleDateString()}
              </div>
            </div>
            <div className="update-progress">
              <input 
                type="number"
                placeholder="Update Current Amount"
                onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialGoals;