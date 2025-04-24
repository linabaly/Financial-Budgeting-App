import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Header from './components/Header';
import TotalBalance from './components/TotalBalance';
import SpendingProgress from './components/SpendingProgress';
import MonthlyChart from './components/MonthlyChart';
import IncomeExpenseChart from './components/IncomeExpenseChart';
import SmartInsights from './components/SmartInsights';
import SavingsProgress from './components/SavingsProgress';
import RecurringPayments from './components/RecurringPayments';
import ExpenseAlerts from './components/ExpenseAlerts';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import { API_BASE_URL } from '../config';

// Define Goal interface
interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  deadline?: string;
  createdAt?: string;
}

/**
 * Dashboard Component
 * 
 * Main dashboard page displaying financial summary, charts, insights,
 * and providing modal forms for different financial activities.
 */
const Dashboard: React.FC = () => {
  // ===== STATE MANAGEMENT =====

  // Modal visibility states
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showDeadlineReachedModal, setShowDeadlineReachedModal] = useState<string | null>(null);

  // User and account related states
  const [currentDate] = useState(new Date());
  const [currentSavings, setCurrentSavings] = useState(4500);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Goals related states
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 1000,
    currentSaved: 0,
    deadline: '',
    currentSavedInputEmpty: false,
    targetAmountInputEmpty: false
  });

  // Update savings modal state
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [updatedAmount, setUpdatedAmount] = useState<number>(0);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatedAmountInputEmpty, setUpdatedAmountInputEmpty] = useState<boolean>(false);

  // ===== DATA FETCHING =====

  /**
   * Fetch user's account data from API on component mount
   * Retrieves personal and financial information to populate the dashboard
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get authentication token from local storage
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please log in again.");

        // Fetch user data from API
        const response = await fetch("http://localhost:5005/account/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        // Handle error responses
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch dashboard data");
        }

        // Process and store successful response
        const data = await response.json();
        setDashboardData(data);
      } catch (error: any) {
        setDashboardError(error.message);
      }
    };

    fetchDashboardData();
  }, []);

  /**
   * Fetch savings goals from API
   */
  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/goal`, {
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
      console.error('Error fetching goals:', err);
    }
  };

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // ===== MODAL HANDLERS =====

  /**
   * Close savings modal
   * Used when clicking outside the modal
   */
  const closeSavingsModal = () => {
    setShowSavingsModal(false);
    setSelectedGoal(null);
    setUpdatedAmount(0);
    setUpdateError(null);
  };

  /**
   * Close create goal modal
   */
  const closeCreateGoalModal = () => {
    setShowCreateGoalModal(false);
  };

  /**
   * Close deadline reached modal
   */
  const closeDeadlineReachedModal = () => {
    setShowDeadlineReachedModal(null);
  };

  /**
   * Handle update goal savings button clicked
   * Opens the update modal with the selected goal's data
   */
  const handleUpdateGoalClick = () => {
    if (goals.length > 0) {
      setSelectedGoal(goals[0]);
      setUpdatedAmount(goals[0].currentSaved);
      setShowSavingsModal(true);
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
      setUpdateError('Goal not found');
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/goal/${id}`, {
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

      // Close the modal after successful update
      closeSavingsModal();
    } catch (err: any) {
      setUpdateError(err.message || 'An error occurred while updating the goal');
      console.error('Error updating goal:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle the form submission for updating goal progress
   */
  const handleUpdateSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGoal) {
      setUpdateError('No goal selected for updating');
      return;
    }

    // Validate input
    if (updatedAmount < 0) {
      setUpdateError('Amount cannot be negative');
      return;
    }

    // Call the update function
    updateGoalProgress(selectedGoal.id, updatedAmount);
  };

  /**
   * Handle the creation of a new goal
   */
  const handleCreateGoal = async () => {
    // Validate form
    if (!newGoal.name || newGoal.targetAmount <= 0) {
      // You could set an error state here to display to the user
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const goalData: any = {
        name: newGoal.name,
        targetAmount: newGoal.targetAmount,
        currentSaved: newGoal.currentSaved || 0
      };

      // Only add deadline if provided
      if (newGoal.deadline) {
        goalData.deadline = new Date(newGoal.deadline).toISOString();
      }

      const response = await fetch(`${API_BASE_URL}/goal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(goalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create goal');
      }

      // Get the newly created goal from the response
      const createdGoal = await response.json();

      // Update local state with the new goal
      setGoals(prevGoals => [createdGoal, ...prevGoals]);

      // Reset form
      setNewGoal({
        name: '',
        targetAmount: 1000,
        currentSaved: 0,
        deadline: '',
        currentSavedInputEmpty: false,
        targetAmountInputEmpty: false
      });
      setShowCreateGoalModal(false);
    } catch (err: any) {
      console.error('Error creating goal:', err);
    }
  };

  /**
   * Handle acknowledging a goal deadline and opening create goal modal
   */
  const handleDeadlineAcknowledge = () => {
    setShowDeadlineReachedModal(null);
    setShowCreateGoalModal(true);
  };

  return (
    <div className="app">
      {/* Main navigation and header */}
      <Header />

      <main className="main-content">
        {/* Theme toggle container positioned below header */}
        <div className="theme-toggle-container">
          <ThemeToggle />
        </div>

        {/* User greeting section with date */}
        <div className="greeting-section">
          <div>
            <h1>Hello, <span className="name">{dashboardData ? dashboardData.name || "User" : "Loading..."}</span>!</h1>
            <div className="greeting-date">
              {currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Primary dashboard financial summary */}
        <div className="dashboard-section">
          <div className="left-column">
            <TotalBalance />
            <SpendingProgress />
          </div>
          <div className="right-column">
            <MonthlyChart />
          </div>
        </div>

        {/* Analytics and insights section */}
        <div className="analytics-container">
          <div className="analytics-section">
            <div className="income-expense-chart-container">
              <IncomeExpenseChart />
            </div>
            <div className="insights-container">
              <SmartInsights />
              <SavingsProgress
                currentSavings={currentSavings}
                onUpdateClick={handleUpdateGoalClick}
                onCreateGoalClick={() => setShowCreateGoalModal(true)}
                goals={goals}
                setGoals={setGoals}
                onDeadlineReached={(goalId) => setShowDeadlineReachedModal(goalId)}
              />
              <RecurringPayments />
              <ExpenseAlerts />
            </div>
          </div>
        </div>

        {/* === MODAL COMPONENTS === */}

        {/* Update Savings Modal */}
        {showSavingsModal && selectedGoal && (
          <div className="modal-overlay" onClick={closeSavingsModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Savings Progress</h2>
              </div>
              <div className="modal-content">
                <form className="modal-form" onSubmit={handleUpdateSavingsSubmit}>
                  <div className="goal-info">
                    <h3>{selectedGoal.name}</h3>
                    <p>Target Amount: ${selectedGoal.targetAmount.toLocaleString()}</p>
                    {selectedGoal.deadline && (
                      <p>Deadline: {new Date(selectedGoal.deadline).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="current-saved">Current Saved Amount</label>
                    <input
                      type="number"
                      id="current-saved"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={updatedAmountInputEmpty ? "" : updatedAmount.toString()}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          setUpdatedAmount(0);
                          setUpdatedAmountInputEmpty(true);
                        } else {
                          const numValue = parseFloat(inputValue);
                          if (!isNaN(numValue)) {
                            setUpdatedAmount(numValue);
                            setUpdatedAmountInputEmpty(false);
                          }
                        }
                      }}
                      onBlur={() => {
                        setUpdatedAmountInputEmpty(false);
                      }}
                      onFocus={(e) => {
                        if (updatedAmount === 0 && !updatedAmountInputEmpty) {
                          e.target.select();
                        }
                      }}
                      required
                    />
                  </div>

                  {updateError && (
                    <div className="error-message">{updateError}</div>
                  )}

                  <div className="progress-info">
                    <div className="progress-percentage">
                      {Math.round((updatedAmount / selectedGoal.targetAmount) * 100)}% of goal
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeSavingsModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Updating...' : 'Update Progress'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateGoalModal && (
          <div className="modal-overlay" onClick={closeCreateGoalModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Savings Goal</h2>
              </div>
              <div className="modal-content">
                <form className="modal-form">
                  <div className="form-group">
                    <label htmlFor="goal-name">Goal Name</label>
                    <input
                      type="text"
                      id="goal-name"
                      placeholder="e.g., New Car, Vacation, Emergency Fund"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="target-amount">Target Amount</label>
                    <input
                      type="number"
                      id="target-amount"
                      placeholder="0.00"
                      step="0.01"
                      min="1"
                      value={newGoal.targetAmountInputEmpty ? "" : newGoal.targetAmount.toString()}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          setNewGoal({
                            ...newGoal,
                            targetAmount: 0,
                            targetAmountInputEmpty: true
                          });
                        } else {
                          const numValue = parseFloat(inputValue);
                          if (!isNaN(numValue)) {
                            setNewGoal({
                              ...newGoal,
                              targetAmount: numValue,
                              targetAmountInputEmpty: false
                            });
                          }
                        }
                      }}
                      onBlur={() => {
                        setNewGoal({
                          ...newGoal,
                          targetAmountInputEmpty: false
                        });
                      }}
                      onFocus={(e) => {
                        if (newGoal.targetAmount === 0 && !newGoal.targetAmountInputEmpty) {
                          e.target.select();
                        }
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="current-saved">Current Amount (Optional)</label>
                    <input
                      type="number"
                      id="current-saved"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={newGoal.currentSavedInputEmpty ? "" : newGoal.currentSaved.toString()}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          setNewGoal({
                            ...newGoal,
                            currentSaved: 0,
                            currentSavedInputEmpty: true
                          });
                        } else {
                          const numValue = parseFloat(inputValue);
                          if (!isNaN(numValue)) {
                            setNewGoal({
                              ...newGoal,
                              currentSaved: numValue,
                              currentSavedInputEmpty: false
                            });
                          }
                        }
                      }}
                      onBlur={() => {
                        setNewGoal({
                          ...newGoal,
                          currentSavedInputEmpty: false
                        });
                      }}
                      onFocus={(e) => {
                        if (newGoal.currentSaved === 0 && !newGoal.currentSavedInputEmpty) {
                          e.target.select();
                        }
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="deadline">Reach the Goal By (Optional)</label>
                    <input
                      type="date"
                      id="deadline"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeCreateGoalModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="submit-btn"
                      onClick={handleCreateGoal}
                      disabled={!newGoal.name || newGoal.targetAmount <= 0}
                    >
                      Create Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Deadline Reached Modal */}
        {showDeadlineReachedModal && goals.length > 0 && (
          <div className="modal-overlay" onClick={closeDeadlineReachedModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Goal Deadline Reached</h2>
              </div>
              <div className="modal-content">
                <div className="deadline-message">
                  {(() => {
                    const deadlineGoal = goals.find(g => g.id === showDeadlineReachedModal);
                    if (!deadlineGoal) return null;

                    const progressPercentage = Math.round((deadlineGoal.currentSaved / deadlineGoal.targetAmount) * 100);

                    return (
                      <>
                        <p>
                          The deadline for your goal "{deadlineGoal.name}"
                          has been reached!
                        </p>
                        <p>
                          Current progress:
                          <strong> ${deadlineGoal.currentSaved.toLocaleString()}</strong>
                          out of
                          <strong> ${deadlineGoal.targetAmount.toLocaleString()}</strong>
                          {' '}
                          ({progressPercentage}%).
                        </p>
                        <p>Would you like to create a new goal?</p>
                      </>
                    );
                  })()}
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeDeadlineReachedModal}
                  >
                    Continue with Current Goal
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleDeadlineAcknowledge}
                  >
                    Create New Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;