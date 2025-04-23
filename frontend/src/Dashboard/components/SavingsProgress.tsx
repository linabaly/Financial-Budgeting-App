import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE_URL } from "../../config";
import '../Dashboard.css';

// Define Goal interface
interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  deadline?: string;
  createdAt?: string;
}

interface SavingsProgressProps {
  onUpdateClick?: () => void;
  onCreateGoalClick?: () => void;
  onDeadlineReached?: (goalId: string) => void;
  currentSavings?: number;
  goals?: Goal[];
  setGoals?: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export const getColorForPercentage = (percentage: number) => {
  if (percentage < 30) return { 
    main: "#dc143c", // crimson red
    light: "rgba(220, 20, 60, 0.3)", 
    text: "#dc143c" 
  };
  if (percentage < 70) return { 
    main: "#ffdf64", // pastel yellow
    light: "rgba(255, 223, 100, 0.3)", 
    text: "#ffdf64" 
  };
  return { 
    main: "#2ecc71", // emerald green
    light: "rgba(46, 204, 113, 0.3)", 
    text: "#2ecc71" 
  };
};

const SavingsProgress: React.FC<SavingsProgressProps> = ({ 
  onUpdateClick,
  onCreateGoalClick,
  onDeadlineReached,
  currentSavings: propCurrentSavings,
  goals: propGoals,
  setGoals: propSetGoals
}) => {
  // State management
  const [goals, setGoals] = useState<Goal[]>(propGoals || []);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for D3 visualizations
  const progressRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  // Fetch goals from the backend
  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
        const emptyGoals: Goal[] = [];
        setGoals(emptyGoals);
        if (propSetGoals) propSetGoals(emptyGoals);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch goals');
      }
      
      const data = await response.json();
      setGoals(data);
      if (propSetGoals) propSetGoals(data);
      
      // Check for deadlines that have been reached
      checkDeadlines(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching goals');
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if any goals have deadlines that have been reached
  const checkDeadlines = (goalsData: Goal[]) => {
    const today = new Date();
    
    for (const goal of goalsData) {
      if (goal.deadline) {
        const deadlineDate = new Date(goal.deadline);
        if (deadlineDate <= today) {
          if (onDeadlineReached) {
            onDeadlineReached(goal.id);
          }
          break;
        }
      }
    }
  };

  // Update goal progress
  const updateGoalProgress = async (id: string, currentSaved: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      
      // Update local state for immediate feedback
      const updatedGoals = goals.map(goal => 
        goal.id === id 
          ? { ...goal, currentSaved } 
          : goal
      );
      setGoals(updatedGoals);
      if (propSetGoals) propSetGoals(updatedGoals);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the goal');
      console.error('Error updating goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a goal
  const deleteGoal = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/goal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete goal');
      }
      
      // Remove goal from local state
      const updatedGoals = goals.filter(goal => goal.id !== id);
      setGoals(updatedGoals);
      if (propSetGoals) propSetGoals(updatedGoals);
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the goal');
      console.error('Error deleting goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress percentage
  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.currentSaved / goal.targetAmount) * 100, 100);
  };

  // Get appropriate color based on progress
  

  // Update D3 progress visualization
  const updateProgressBar = (goal: Goal) => {
    if (!progressRef.current) return;
    
    d3.select(progressRef.current).selectAll("*").remove();
    
    const width = progressRef.current.clientWidth;
    const height = 12;
    
    const svg = d3.select(progressRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    
    const progressPercentage = Math.min((goal.currentSaved / goal.targetAmount), 1);
    const colors = getColorForPercentage(progressPercentage * 100);
    
    // Background bar
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "#444");
    
    // Progress bar with animation
    svg.append("rect")
      .attr("width", 0)
      .attr("height", height)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", colors.main)
      .transition()
      .duration(750)
      .attr("width", width * progressPercentage);
  };

  // Update progress labels
  const updateLabels = (goal: Goal) => {
    if (!labelsRef.current) return;
    
    d3.select(labelsRef.current).selectAll("*").remove();
    
    const labelsContainer = d3.select(labelsRef.current);
    const progressPercent = Math.round(calculateProgress(goal));
    const colors = getColorForPercentage(progressPercent);
    
    const labelDiv = labelsContainer.append("div")
      .attr("class", "progress-label")
      .style("display", "flex")
      .style("justify-content", "space-between")
      .style("margin-top", "0.5rem");
    
    // Add percentage on the left with dynamic color
    labelDiv.append("span")
      .attr("class", `progress-percent ${getLevelClass(progressPercent / 100)}`)
      .text(`${progressPercent}%`)
      .style("color", colors.text);
    
    // Add amount on the right
    labelDiv.append("span")
      .text(`$${goal.currentSaved.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`);
  };

  // Get progress level class
  function getLevelClass(percentage: number): string {
    if (percentage < 0.3) return 'low';
    if (percentage < 0.7) return 'medium';
    return 'high';
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate remaining days
  const getRemainingDays = (deadline?: string) => {
    if (!deadline) return null;
    
    const today = new Date();
    const targetDate = new Date(deadline);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Fetch goals on component mount if not provided by props
  useEffect(() => {
    if (!propGoals) {
      fetchGoals();
    } else {
      setGoals(propGoals);
      setIsLoading(false);
      checkDeadlines(propGoals);
    }
  }, [propGoals]);
  
  // Update D3 visualizations when goals change
  useEffect(() => {
    if (goals.length > 0) {
      updateProgressBar(goals[0]);
      updateLabels(goals[0]);
    }
  }, [goals]);

  return (
    <div className="savings-progress widget">
      <div className="widget-header">
        <div className="section-header">Savings Progress</div>
      </div>
      <div className="widget-body savings-content">
        {isLoading ? (
          <div className="loading">Loading savings goals...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : goals.length === 0 ? (
          // No goals - show prompt to create one
          <div className="no-goals">
            <p>You haven't set any savings goals yet.</p>
            <button 
              className="create-goal-button"
              onClick={onCreateGoalClick}
            >
              Create a Goal
            </button>
          </div>
        ) : (
          // Show the first goal (most recent/important)
          <div className="goal-display">
            <div className="goal-name">{goals[0].name}</div>
            
            <div className="savings-goal">
              Goal: ${goals[0].targetAmount.toLocaleString()}
            </div>
            
            <div 
              className="current-savings" 
              style={{ 
                color: getColorForPercentage(goals[0].currentSaved / goals[0].targetAmount * 100).text 
              }}
            >
              Current Savings: ${goals[0].currentSaved.toLocaleString()}
            </div>
            
            {goals[0].deadline && (
              <div className="goal-deadline">
                Target Date: {formatDate(goals[0].deadline)}
                {getRemainingDays(goals[0].deadline) !== null && getRemainingDays(goals[0].deadline)! > 0 && (
                  <span className="days-remaining">
                    ({getRemainingDays(goals[0].deadline)} days remaining)
                  </span>
                )}
              </div>
            )}
            
            <div className="progress-container">
              <div 
                className={`progress-bar ${
                  calculateProgress(goals[0]) < 30 ? 'glow-low' : 
                  calculateProgress(goals[0]) < 70 ? 'glow-medium' : 
                  'glow-high'
                }`} 
                ref={progressRef}
              ></div>
              <div ref={labelsRef}></div>
            </div>
            
            <div className="goal-actions">
              <button 
                className="update-goal-button"
                onClick={() => {
                  if (typeof onUpdateClick === 'function') {
                    onUpdateClick();
                  }
                }}
              >
                Update Savings
              </button>
              
              <div className="secondary-actions">
                <button 
                  className="create-another-button"
                  onClick={onCreateGoalClick}
                >
                  Create Another Goal
                </button>
                <button 
                  className="delete-goal-button"
                  onClick={() => deleteGoal(goals[0].id)}
                >
                  Delete Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsProgress;