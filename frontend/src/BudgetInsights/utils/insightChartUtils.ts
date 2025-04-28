import * as d3 from 'd3';
import React from 'react';

/**
 * Expense category structure used for visualizations and analysis
 */
export interface ExpenseCategory {
  id: string;                      // Unique identifier for category styling and referencing
  category: string;                // Display name 
  value: number;                   // Monetary amount
  color: string;                   // HEX color code for visualizations
  percentage: number;              // Pre-calculated percentage of total expenses
  type?: 'needs' | 'wants' | 'savings'; // Optional category type for 50-30-20 budgeting rule
}

/**
 * Generates an enhanced pie chart showing expense distribution with improved visuals and animations
 * 
 * @param container - DOM element to render the chart in
 * @param expenses - Expense data to visualize
 */
export const generateEnhancedPieChart = (
  container: HTMLDivElement,
  expenses: ExpenseCategory[]
): void => {
  // Existing pie chart code (unchanged)
  // Clear any previous chart content
  d3.select(container).selectAll('*').remove();
 
  // Define chart dimensions based on container size and number of categories
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  const radius = Math.min(width, height) / 1.8;

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
          .filter((legendData: unknown) => {
            if (legendData && typeof legendData === 'object' && 'id' in legendData) {
              return (legendData as ExpenseCategory).id === datum.data.id;
            }
            return false;
          })
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
 
  // Add percentage labels on the pie slices (only for slices >= 5%)
  arcs
    .filter(d => d.data.percentage >= 5) // Only show percentages for segments >= 5%
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
    .style('font-size', '16px')
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
    .style('font-size', '1.4rem')
    .style('fill', '#ff7b72')
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
    .style('font-size', '1.2rem')
    .style('fill', 'rgba(255, 255, 255, 0.7)')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .delay(300)
    .style('opacity', 0.7);
};

/**
 * Financial best practice recommended allocation percentages for various expense categories
 * These values determine the suggested spending amounts based on monthly income
 */
export const recommendedAllocationPercentages: { [key: string]: number } = {
  'rent': 30,       // 30% of income for housing
  'food': 15,       // 15% of income for food
  'utilities': 10,  // 10% of income for utilities
  'transportation': 10, // 10% of income for transportation
  'healthcare': 5,  // 5% of income for healthcare
  'entertainment': 5, // 5% of income for entertainment
  'personal': 5,    // 5% of income for personal expenses
  'other': 5,       // 5% of income for other expenses
  // Total: 85% of income, leaving 15% for savings/investments
};

/**
 * Generates a bar chart showing actual expense categories vs recommended amounts based on income
 * 
 * @param containerRef - React ref to the DOM element to render the chart in
 * @param data - Expense category data to display
 * @param monthlyIncome - User's monthly income used to calculate recommended spending
 */
export const generateMonthlyComparisonChart = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  data: ExpenseCategory[],
  monthlyIncome: number = 0
): void => {
  // Early return if container reference is invalid or data is empty
  if (!containerRef.current || data.length === 0) return;
  
  // Clear any existing chart
  d3.select(containerRef.current).selectAll('*').remove();
  
  // Filter out any income categories for expense chart
  const expenseData = data.filter(item => item.id !== 'income');
  
  // Skip if no expense data available
  if (expenseData.length === 0) {
    d3.select(containerRef.current)
      .append('div')
      .attr('class', 'no-data-message')
      .style('text-align', 'center')
      .style('padding', '40px 0')
      .text('No expense data available for this month');
    return;
  }
  
  // Set up chart dimensions and margins
  const margin = { top: 50, right: 20, bottom: 80, left: 60 };
  const width = containerRef.current.clientWidth - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  
  // Create the SVG container with proper positioning
  const svg = d3.select(containerRef.current)
    .append('svg')
    .attr('width', containerRef.current.clientWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Calculate the total of all expenses for reference
  const totalExpenses = expenseData.reduce((sum, d) => sum + d.value, 0);
  
  // Create data with both actual and suggested values based on monthly income
  const combinedData = expenseData.map(d => {
    // Get the recommended percentage for this category (default to 5% if not specified)
    const recommendedPercentage = recommendedAllocationPercentages[d.id] || 5;
    
    // Calculate suggested amount based on monthly income
    const suggestedAmount = monthlyIncome * (recommendedPercentage / 100);
    
    // Calculate actual percentage of income
    const actualPercentageOfIncome = monthlyIncome > 0 ? (d.value / monthlyIncome) * 100 : 0;
    
    return {
      category: d.category,
      categoryId: d.id,
      values: [
        { 
          name: 'Actual', 
          value: d.value, 
          color: d.color,
          percentOfIncome: actualPercentageOfIncome 
        },
        { 
          name: 'Suggested', 
          value: suggestedAmount, 
          color: '#8884d8',
          percentOfIncome: recommendedPercentage
        }
      ]
    };
  });
  
  // Create scales for positioning
  // X scale for categories
  const x0 = d3.scaleBand()
    .domain(combinedData.map(d => d.category))
    .range([0, width])
    .padding(0.2);
  
  // X1 scale for grouped bars (actual vs suggested)
  const x1 = d3.scaleBand()
    .domain(['Actual', 'Suggested'])
    .range([0, x0.bandwidth()])
    .padding(0.05);
  
  // Find the maximum value for the y-axis scale
  const maxValue = d3.max(combinedData, d => d3.max(d.values, v => v.value)) || 0;
  
  // Y scale for monetary values (add 10% padding at top)
  const y = d3.scaleLinear()
    .domain([0, maxValue * 1.1])
    .range([height, 0]);
  
  // Add x-axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll('text')
    .style('text-anchor', 'end')
    .style('fill', '#aaa')
    .style('font-size', '16px') 
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)');
  
  // Add y-axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}`))
    .selectAll('text')
    .style('fill', '#aaa')
    .style('font-size', '16px'); 

  // Add y-axis label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -height / 2)
    .attr('text-anchor', 'middle')
    .style('fill', '#aaa')
    .style('font-size', '16px')
    .text('Amount ($)');
  
  // Create the gradient defs for bar styling
  const defs = svg.append('defs');
  
  // Add gradient for the suggested bars
  const suggestedGradient = defs.append('linearGradient')
    .attr('id', 'suggested-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');
  
  // Suggested gradient (lavender)
suggestedGradient.append('stop')
.attr('offset', '0%')
.attr('stop-color', '#9370DB'); // medium purple
  
  // Add category groups
  const categoryGroup = svg.selectAll('.category-group')
    .data(combinedData)
    .enter().append('g')
    .attr('class', 'category-group')
    .attr('transform', d => `translate(${x0(d.category)},0)`);
  
  // Add bars for each value (actual and suggested)
  categoryGroup.selectAll('.bar')
    .data(d => d.values)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x1(d.name)!)
    .attr('width', x1.bandwidth())
    .attr('y', height) // Start from bottom for animation
    .attr('height', 0) // Start with height 0 for animation
    .attr('fill', d => d.name === 'Actual' ? '#2ecc71' : '#dc143c')
    .attr('rx', 6) // Rounded corners
    .attr('ry', 6)
    .attr('stroke', 'rgba(255, 255, 255, 0.1)')
    .attr('stroke-width', 1)
    .transition()
    .duration(800)
    .delay((_, i, nodes) => {
      // Get the parent index to stagger by category
      const parentIndex = Array.from(nodes).indexOf(nodes[i]);
      return (parentIndex % 2) * 100 + Math.floor(parentIndex / 2) * 300;
    })
    .attr('y', d => y(d.value))
    .attr('height', d => height - y(d.value));
  
  // Format value for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Add value labels on top of bars
  categoryGroup.selectAll('.bar-label')
    .data(d => d.values)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', d => x1(d.name)! + x1.bandwidth() / 2)
    .attr('y', d => y(d.value) - 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('fill', '#fff')
    .style('font-weight', 'bold')
    .style('opacity', 0) // Start invisible for animation
    .text(d => formatCurrency(d.value))
    .transition()
    .duration(800)
    .delay((_, i, nodes) => {
      // Get the parent index to stagger by category
      const parentIndex = Array.from(nodes).indexOf(nodes[i]);
      return 400 + (parentIndex % 2) * 100 + Math.floor(parentIndex / 2) * 300;
    })
    .style('opacity', 1);
  
  // Add legend
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width / 2 - 120}, -40)`)

  
  // Add hover interactions with enhanced tooltip showing income percentages
  categoryGroup.selectAll('.bar')
    .on('mouseover', function(event, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('opacity', 0.8)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
      
      // Highlight corresponding label
      const barIndex = d.name === 'Actual' ? 0 : 1;
      const categoryIndex = combinedData.findIndex(item => item.values.includes(d));
      
      categoryGroup.selectAll('.bar-label')
        .filter((labelData: any, i) => {
          const labelCategory = Math.floor(i / 2);
          const labelType = i % 2;
          return labelCategory === categoryIndex && labelType === barIndex;
        })
        .transition()
        .duration(200)
        .style('font-size', '13px')
        .attr('y', (labelData: any) => y(labelData.value) - 10);
      
      // Get category info for tooltip
      const categoryData = combinedData[categoryIndex];
      const recommendedPercentage = recommendedAllocationPercentages[categoryData.categoryId] || 5;
      
      // Show enhanced tooltip with percentage info and income-based comparisons
      const tooltip = d3.select(containerRef.current)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', '#fff')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('top', `${event.pageY - 80}px`)
        .style('left', `${event.pageX - 100}px`)
        .style('opacity', 0)
        .style('z-index', '1000')
        .style('box-shadow', '0px 3px 8px rgba(0, 0, 0, 0.3)');
      
      // Determine comparison text
      let comparisonText = '';
      if (d.name === 'Actual') {
        const diff = d.percentOfIncome - recommendedPercentage;
        if (Math.abs(diff) < 1) {
          comparisonText = 'Right on target! 👍';
        } else if (diff > 0) {
          comparisonText = `${diff.toFixed(1)}% over recommended 🔺`;
        } else {
          comparisonText = `${Math.abs(diff).toFixed(1)}% under recommended 🔽`;
        }
      }
      
      tooltip.html(`
        <div style="font-weight: bold; margin-bottom: 5px; font-size: 13px;">
          ${categoryData.category} (${d.name})
        </div>
        <div>Amount: ${formatCurrency(d.value)}</div>
        <div style="margin-bottom: ${d.name === 'Actual' ? '0' : '5px'};">
          ${d.name === 'Actual' 
            ? `Actual: ${d.percentOfIncome.toFixed(1)}% of income` 
            : `Target: ${recommendedPercentage}% of income`}
        </div>
        ${d.name === 'Actual' && monthlyIncome > 0 
          ? `<div style="margin-top: 5px; font-style: italic;">${comparisonText}</div>` 
          : ''}
      `);
      
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
    })
    .on('mouseout', function(event, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('opacity', 1)
        .attr('stroke', 'rgba(255, 255, 255, 0.1)')
        .attr('stroke-width', 1);
    
      // Reset only the label for the bar being hovered out
      d3.select(this as Element)
        .selectAll('.bar-label')
        .filter((labelData: any) => labelData.name === d.name)
        .transition()
        .duration(200)
        .style('font-size', '16px') // Set back to default size
        .attr('y', (labelData: any) => y(labelData.value) - 5);

    
      // Remove tooltip
      d3.select(containerRef.current).selectAll('.tooltip').remove();
    });
    
};