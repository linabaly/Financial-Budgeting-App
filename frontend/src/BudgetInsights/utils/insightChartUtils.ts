import * as d3 from 'd3';
import React from 'react';

/**
 * Represents an expense category for the pie chart visualization
 */
interface ExpenseCategory {
  id: string;          // Unique identifier for the category
  category: string;    // Display name of the category
  value: number;       // Monetary value of the expense
  color: string;       // Color used to represent this category
  percentage: number;  // Percentage of total expenses
}

/**
 * Sample expense data for the pie chart
 */
const expenseData: ExpenseCategory[] = [
  { id: 'rent', category: 'Rent', value: 1500, color: '#e74c3c', percentage: 48.8 },
  { id: 'groceries', category: 'Groceries', value: 600, color: '#2ecc71', percentage: 24.3 },
  { id: 'entertainment', category: 'Entertainment', value: 200, color: '#e57373', percentage: 12.3 },
  { id: 'utilities', category: 'Utilities', value: 300, color: '#2ed8c7', percentage: 14.6 }
];

/**
 * Represents monthly spending data for comparison chart
 */
interface MonthlyComparison {
  month: string;       // Month name (abbreviated)
  suggested: number;   // Suggested/budgeted amount
  actual: number;      // Actual amount spent
}

/**
 * Sample monthly comparison data for the bar chart
 */
const monthlyData: MonthlyComparison[] = [
  { month: 'Jan', suggested: 2.8, actual: 4.8 },
  { month: 'Feb', suggested: 4.3, actual: 3.6 },
  { month: 'Mar', suggested: 2.7, actual: 3.5 },
  { month: 'Apr', suggested: 2.8, actual: 4.1 },
  { month: 'May', suggested: 2.9, actual: 4.5 }
];

/**
 * Generates an enhanced pie chart showing expense distribution with improved visuals and animations
 * 
 * @param container - DOM element to render the chart in
 * @param expenses - Expense data to visualize
 */
export const generateEnhancedPieChart = (
  container: HTMLDivElement,
  expenses: ExpenseCategory[] = expenseData
): void => {
  // Clear any previous chart content
  d3.select(container).selectAll('*').remove();
 
  // Define chart dimensions based on container size
  const width = container.clientWidth;
  const height = container.clientHeight;
  const radius = Math.min(width, height) / 2.0;

  // Calculate total expenses for center text display
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.value, 0);
 
  // Create SVG element with responsive viewBox
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`); // Center the pie chart
    
  // Create visual effects definitions (filters)
  const defs = svg.append('defs');
  
  // Add glow effect filter for hover state
  const glowFilter = defs.append('filter')
    .attr('id', 'glow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');
    
  glowFilter.append('feGaussianBlur')
    .attr('stdDeviation', '3')
    .attr('result', 'blur');
    
  glowFilter.append('feComposite')
    .attr('in', 'SourceGraphic')
    .attr('in2', 'blur')
    .attr('operator', 'over');
  
  // Add shadow filter for 3D depth effect
  const dropShadow = defs.append('filter')
    .attr('id', 'drop-shadow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');
    
  dropShadow.append('feDropShadow')
    .attr('dx', '0')
    .attr('dy', '0')
    .attr('stdDeviation', '10')
    .attr('flood-color', 'rgba(0,0,0,0.5)');
 
  // Configure the pie layout with spacing between segments
  const pie = d3
    .pie<ExpenseCategory>()
    .value(d => d.value)
    .sort(null)  // Preserve original data order
    .padAngle(0.03); // Add space between segments for better visual separation
 
  // Create arc generators for different states and purposes
  // Main arc for normal state - INCREASED THICKNESS
  const mainArc = d3.arc<d3.PieArcDatum<ExpenseCategory>>()
    .innerRadius(radius * 0.55) // Donut hole size
    .outerRadius(radius * 0.90); // Outer edge of pie
  
  // Hover arc for interactive expansion
  const hoverArc = d3.arc<d3.PieArcDatum<ExpenseCategory>>()
    .innerRadius(radius * 0.55)
    .outerRadius(radius * 0.95); // Slightly larger on hover for emphasis
  
  // Arc for positioning labels
  const labelArc = d3
    .arc<d3.PieArcDatum<ExpenseCategory>>()
    .innerRadius(radius * 0.95)
    .outerRadius(radius * 0.95);
 
  // Filter out zero-value expenses to avoid empty segments
  const filteredExpenses = expenses.filter(expense => expense.value > 0);
  
  // Create a shadow layer for 3D depth effect
  const shadowGroup = svg.append('g')
    .attr('filter', 'url(#drop-shadow)');
    
  // Add shadow arcs with animation
  shadowGroup.selectAll('.shadow-arc')
    .data(pie(filteredExpenses))
    .enter()
    .append('path')
    .attr('class', 'shadow-arc')
    .attr('d', d => mainArc(d as d3.PieArcDatum<ExpenseCategory>))
    .attr('fill', 'rgba(0,0,0,0.3)')
    .style('opacity', 0)
    .transition()
    .duration(300)
    .delay((_, i) => i * 50) // Staggered appearance
    .style('opacity', 0.5);
 
  // Create arc groups for pie segments
  const arcs = svg
    .selectAll('.arc')
    .data(pie(filteredExpenses))
    .enter()
    .append('g')
    .attr('class', 'arc');
 
  // Add the colored pie segments with entrance animation
  arcs
    .append('path')
    .attr('d', d => mainArc(d as d3.PieArcDatum<ExpenseCategory>))
    .attr('fill', d => d.data.color)
    .attr('stroke', 'rgba(0, 0, 0, 0.3)') // Subtle outline for better segment separation
    .attr('stroke-width', 1)
    .style('opacity', 0)
    .style('cursor', 'pointer') // Indicate interactivity
    .transition()
    .duration(800)
    .delay((_, i) => i * 100) // Staggered appearance
    .style('opacity', 1);
    
  // Add interactive behaviors (hover effects)
  arcs.selectAll('path')
    .on('mouseover', function(event, d) {
      // Cast the datum to the correct type
      const datum = d as d3.PieArcDatum<ExpenseCategory>;
      
      // Enhance the hovered slice
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', d => hoverArc(d as d3.PieArcDatum<ExpenseCategory>))
        .attr('filter', 'url(#glow)');
        
      // Update center text to show selected category
      centerText.text(datum.data.category)
        .transition()
        .duration(200)
        .style('font-size', '1.4rem'); // Increased size
        
      // Update center value to show category amount
      centerValue.text(`${datum.data.value.toLocaleString()}`)
        .transition()
        .duration(200);
        
      // Show percentage in center
      centerPercent.text(`${datum.data.percentage.toFixed(1)}%`)
        .transition()
        .duration(200)
        .style('opacity', 1);

      // Adjust text sizing for clarity
      centerText.style('font-size', '1.1rem');
      centerValue.style('font-size', '1.3rem');
        
      // Highlight the corresponding legend item
      if (container.parentNode) {
        d3.select(container.parentNode as HTMLElement)
          .selectAll('.legend-item')
          .filter((datum: unknown) => (datum as ExpenseCategory).id === (d as d3.PieArcDatum<ExpenseCategory>).data.id)
          .transition()
          .duration(200)
          .style('transform', 'translateX(10px) scale(1.05)')
          .style('background-color', 'rgba(255, 255, 255, 0.1)');
      }
    })
    .on('mouseout', function() {
      // Return the slice to normal size
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', d => mainArc(d as d3.PieArcDatum<ExpenseCategory>))
        .attr('filter', null);
        
      // Reset center text to show total
      centerText.text('Total Amount')
        .transition()
        .duration(200)
        .style('font-size', '1.2rem');
        
      // Reset center value to show total amount
      centerValue.text(`${totalAmount.toLocaleString()}`);
      
      // Reset percent label
      centerPercent.text('Spent')
        .transition()
        .duration(200)
        .style('opacity', 0.7);
        
      // Reset legend highlight
      if (container.parentNode) {
        d3.select(container.parentNode as HTMLElement)
          .selectAll('.legend-item')
          .transition()
          .duration(200)
          .style('transform', 'none')
          .style('background-color', 'rgba(255, 255, 255, 0.03)');
      }
    });
 
  // Add percentage labels on the pie slices
  arcs
    .append('text')
    .attr('transform', d => {
      const pos = labelArc.centroid(d);
      // Position labels based on arc angle
      const midAngle = Math.atan2(pos[1], pos[0]);
      // Position labels closer to the segments for better legibility
      return `translate(${Math.cos(midAngle) * radius * 0.70}, ${
        Math.sin(midAngle) * radius * 0.70
      })`;    
    })
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .text(d => `${d.data.percentage.toFixed(1)}%`) // Show percentage on all segments
    .style('fill', '#ffffff') // White text for contrast
    .style('font-size', '14px') // Increased from 12px to 16px
    .style('font-weight', 'bold')
    // Add text shadow for better readability against colored backgrounds
    .style('text-shadow', '0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 1)')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .delay((_, i) => 400 + i * 100) // Staggered appearance after slices
    .style('opacity', 1);
  
  // Add center text elements for displaying total and details
  // Title text ("Total Amount")
  const centerText = svg.append('text')
    .attr('class', 'pie-center-text')
    .attr('x', 0)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .text('Total Amount')
    .style('font-size', '1.2rem') // Increased size
    .style('fill', '#fff')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .style('opacity', 1);
  
  // Value text (dollar amount)
  const centerValue = svg.append('text')
    .attr('class', 'pie-center-text')
    .attr('x', 0)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .text(`${totalAmount.toLocaleString()}`)
    .style('font-size', '1.4rem') // Increased size
    .style('fill', '#ff7b72') // Highlighted color for emphasis
    .style('opacity', 0)
    .transition()
    .duration(800)
    .delay(200)
    .style('opacity', 1);
  
  // Subtitle text ("Spent")
  const centerPercent = svg.append('text')
    .attr('class', 'pie-center-subtext')
    .attr('x', 0)
    .attr('y', 45)
    .attr('text-anchor', 'middle')
    .text('Spent')
    .style('font-size', '1.2rem') // Increased size
    .style('fill', 'rgba(255, 255, 255, 0.7)')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .delay(300)
    .style('opacity', 0.7);
};

/**
 * Generates a bar chart comparing suggested vs actual spending by month
 * 
 * @param containerRef - React ref to the DOM element to render the chart in
 * @param data - Optional monthly comparison data (uses default if not provided)
 */
export const generateMonthlyComparisonChart = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  data: MonthlyComparison[] = monthlyData
): void => {
  // Early return if container reference is invalid
  if (!containerRef.current) return;
  
  // Clear any existing chart
  d3.select(containerRef.current).selectAll('*').remove();
  
  // Set up chart dimensions and margins
  const margin = { top: 20, right: 60, bottom: 30, left: 40 };
  const width = containerRef.current.clientWidth - margin.left - margin.right;
  const height = containerRef.current.clientHeight - margin.top - margin.bottom;
  
  // Create the SVG container with proper positioning
  const svg = d3.select(containerRef.current)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Create scales for positioning
  // X scale for months (categorical)
  const x0 = d3.scaleBand()
    .domain(data.map(d => d.month))
    .rangeRound([0, width])
    .paddingInner(0.1);
  
  // X1 scale for grouped bars (suggested vs. actual)
  const x1 = d3.scaleBand()
    .domain(['suggested', 'actual'])
    .rangeRound([0, x0.bandwidth()])
    .padding(0.05);
  
  // Y scale for monetary values
  const y = d3.scaleLinear()
    .domain([0, 5]) // Fixed domain for consistent scale
    .range([height, 0]);
  
  // Add X axis with styled labels
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll('text')
    .attr('font-size', '18px')  // Increased from 10px to 24px
    .attr('fill', '#aaa')
    .attr('dy', '1em');  // Adjust vertical positioning
  
  // Add Y axis with styled labels
  svg.append('g')
    .call(
      d3.axisLeft(y)
        .tickFormat(d => `${d.toFixed(1)}`)  // Format with dollar sign
        .ticks(5)  // Reduce number of ticks for clarity
    )
    .selectAll('text')
    .attr('font-size', '16px')  // Increased from 10px to 24px
    .attr('fill', '#aaa')
    .attr('dx', '-0.5em');  // Adjust horizontal positioning
  
  // Remove axis lines for a cleaner look
  svg.selectAll('.domain, .tick line')
    .remove();
  
  // Create groups for each month's data
  const monthGroup = svg.selectAll('.month')
    .data(data)
    .enter().append('g')
    .attr('transform', d => `translate(${x0(d.month) || 0},0)`);
  
  // Add suggested spending bars (green)
  monthGroup.append('rect')
    .attr('x', () => x1('suggested') || 0)
    .attr('y', d => y(d.suggested))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - y(d.suggested))
    .attr('fill', '#2ecc71') // Green for suggested amounts
    .attr('rx', 6) // Increased rounded corners
    .attr('ry', 6);
  
  // Add actual spending bars (red)
  monthGroup.append('rect')
    .attr('x', () => x1('actual') || 0)
    .attr('y', d => y(d.actual))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - y(d.actual))
    .attr('fill', '#e74c3c') // Red for actual spending
    .attr('rx', 6) // Increased rounded corners
    .attr('ry', 6);
  
  // Add value labels above each bar
  monthGroup.selectAll('.value-label')
    .data(d => [
      { type: 'suggested', value: d.suggested },
      { type: 'actual', value: d.actual }
    ])
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('x', d => (x1(d.type) || 0) + x1.bandwidth() / 2)
    .attr('y', d => y(d.value) - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')  // Increased from 8px to 18px
    .attr('fill', '#fff')
    .text(d => `${d.value.toFixed(1)}`);
  
  // Add legend to explain bar colors
  const legend = svg.append('g')
    .attr('transform', `translate(${width - 240}, -10)`);
  
  // Suggested spending legend item
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 20)
    .attr('height', 20)
    .attr('fill', '#2ecc71');
  
  legend.append('text')
    .attr('x', 25)
    .attr('y', 15)
    .attr('font-size', '16px')
    .attr('fill', '#aaa')
    .text('Suggested');
  
  // Actual spending legend item
  legend.append('rect')
    .attr('x', 150)
    .attr('y', 0)
    .attr('width', 20)
    .attr('height', 20)
    .attr('fill', '#e74c3c');
  
  legend.append('text')
    .attr('x', 175)
    .attr('y', 15)
    .attr('font-size', '16px')
    .attr('fill', '#aaa')
    .text('Actual Spend');
};