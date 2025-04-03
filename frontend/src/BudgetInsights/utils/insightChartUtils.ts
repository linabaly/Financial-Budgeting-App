import * as d3 from 'd3';

// Data for pie chart
interface ExpenseCategory {
  id: string;
  category: string;
  value: number;
  color: string;
  percentage: number;
}

const expenseData: ExpenseCategory[] = [
  { id: 'rent', category: 'Rent', value: 1500, color: '#e74c3c', percentage: 48.8 },
  { id: 'groceries', category: 'Groceries', value: 600, color: '#2ecc71', percentage: 24.3 },
  { id: 'entertainment', category: 'Entertainment', value: 200, color: '#e57373', percentage: 12.3 },
  { id: 'utilities', category: 'Utilities', value: 300, color: '#2ed8c7', percentage: 14.6 }
];


// Data for monthly comparison chart
interface MonthlyComparison {
  month: string;
  suggested: number;
  actual: number;
}

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
  expenses: ExpenseCategory[]
 ): void => {
  // Clear previous chart
  d3.select(container).selectAll('*').remove();
 
  // Define chart dimensions
  const width = container.clientWidth;
  const height = container.clientHeight;
  const radius = Math.min(width, height) / 2.0; // changed from /2.2 to make it bigger

  // Calculate total amount for center text
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.value, 0);
 
  // Create SVG element with proper viewBox for responsiveness
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
  // Add a subtle glow filter
  const defs = svg.append('defs');
  
  // Filter for outer glow effect
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
  
  // Add shadow for 3D effect
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
 
  // Create pie layout
  const pie = d3
    .pie<ExpenseCategory>()
    .value(d => d.value)
    .sort(null)
    .padAngle(0.03); // Add space between segments
 
  // Create multiple arc generators for layered look
  const mainArc = d3.arc<d3.PieArcDatum<ExpenseCategory>>()
    .innerRadius(radius * 0.55) // increased to shrink hole a bit and give more padding
    .outerRadius(radius * 0.85) // slightly larger
  
  const hoverArc = d3.arc<d3.PieArcDatum<ExpenseCategory>>()
    .innerRadius(radius * 0.55)
    .outerRadius(radius * 0.90); // slightly larger on hover
  
    
  const labelArc = d3
    .arc<d3.PieArcDatum<ExpenseCategory>>()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);
 
  // Filter out expenses with zero value
  const filteredExpenses = expenses.filter(expense => expense.value > 0);
  
  // Add a shadow group
  const shadowGroup = svg.append('g')
    .attr('filter', 'url(#drop-shadow)');
    
  // Generate pie chart slices with shadow
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
    .delay((_, i) => i * 50)
    .style('opacity', 0.5);
 
  // Generate interactive pie chart slices
  const arcs = svg
    .selectAll('.arc')
    .data(pie(filteredExpenses))
    .enter()
    .append('g')
    .attr('class', 'arc');
 
  // Add slices with animation and interactive effects
  arcs
    .append('path')
    .attr('d', d => mainArc(d as d3.PieArcDatum<ExpenseCategory>))
    .attr('fill', d => d.data.color)
    .attr('stroke', 'rgba(0, 0, 0, 0.3)')
    .attr('stroke-width', 1)
    .style('opacity', 0)
    .style('cursor', 'pointer')
    .transition()
    .duration(800)
    .delay((_, i) => i * 100)
    .style('opacity', 1);
    
  // Add slice hover effects
  arcs.selectAll('path')
    .on('mouseover', function(event, d) {
      const datum = d as d3.PieArcDatum<ExpenseCategory>;
      // Enlarge the hovered slice
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', d => hoverArc(d as d3.PieArcDatum<ExpenseCategory>))
        .attr('filter', 'url(#glow)');
        
      centerText.text(datum.data.category)
        .transition()
        .duration(200)
        .style('font-size', '1.4rem');
      centerValue.text(`${datum.data.value.toLocaleString()}`)
        .transition()
        .duration(200);
      centerPercent.text(`${datum.data.percentage.toFixed(1)}%`)
        .transition()
        .duration(200)
        .style('opacity', 1);

        centerText.style('font-size', '1.1rem');
        centerValue.style('font-size', '1.3rem');
        
        
      // Highlight matching legend item
      d3.select(container.parentNode as HTMLElement)
        .selectAll('.legend-item')
        .filter((datum: unknown) => (datum as ExpenseCategory).id === (d as d3.PieArcDatum<ExpenseCategory>).data.id)
        .transition()
        .duration(200)
        .style('transform', 'translateX(10px) scale(1.05)')
        .style('background-color', 'rgba(255, 255, 255, 0.1)');
    })
    .on('mouseout', function() {
      // Return to normal size
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', d => mainArc(d as d3.PieArcDatum<ExpenseCategory>))
        .attr('filter', null);
        
      // Reset center text
      centerText.text('Total Amount')
        .transition()
        .duration(200)
        .style('font-size', '1.2rem');
        
      centerValue.text(`${totalAmount.toLocaleString()}`);
      
      centerPercent.text('Spent')
        .transition()
        .duration(200)
        .style('opacity', 0.7);
        
      if (container.parentNode) {
        d3.select(container.parentNode as HTMLElement)
          .selectAll('.legend-item')
          .transition()
          .duration(200)
          .style('transform', 'none')
          .style('background-color', 'rgba(255, 255, 255, 0.03)');
      }
    });
 
  // Add percentage labels on the slices
  arcs
  .append('text')
  .attr('transform', d => {
    const pos = labelArc.centroid(d);
    // Adjust label position based on angle
    const midAngle = Math.atan2(pos[1], pos[0]);
    // Change the multiplier below to move labels closer to center (smaller value)
    // Changed from 0.85 to 0.65 to move labels closer to center
    return `translate(${Math.cos(midAngle) * radius * 0.70}, ${
      Math.sin(midAngle) * radius * 0.70
    })`;    
  })
  .attr('dy', '.35em')
  .attr('text-anchor', 'middle')
  .text(d => `${d.data.percentage.toFixed(1)}%`) // Show percentage for all segments regardless of size
  // Changed label color - you can adjust this to your preference
  .style('fill', '#ffffff') // Bright white for better visibility
  .style('font-size', '12px')
  .style('font-weight', 'bold')
  // Enhanced text shadow for better readability on colored backgrounds
  .style('text-shadow', '0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 1)')
  .style('opacity', 0)
  .transition()
  .duration(800)
  .delay((_, i) => 400 + i * 100)
  .style('opacity', 1);
  
 
  // Add center text for total amount
  const centerText = svg.append('text')
    .attr('class', 'pie-center-text')
    .attr('x', 0)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .text('Total Amount')
    .style('font-size', '1.2rem')
    .style('fill', '#fff')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .style('opacity', 1);
  
  // Add center value
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
  
  // Add "spent" text
  const centerPercent = svg.append('text')
    .attr('class', 'pie-center-subtext')
    .attr('x', 0)
    .attr('y', 45)
    .attr('text-anchor', 'middle')
    .text('Spent')
    .style('font-size', '0.9rem')
    .style('fill', 'rgba(255, 255, 255, 0.7)')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .delay(300)
    .style('opacity', 0.7);
 };

// Update function signature to fix the TypeScript error
export const generateMonthlyComparisonChart = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  if (!containerRef.current) return;
  
  d3.select(containerRef.current).selectAll('*').remove();
  
  // Rest of the function unchanged
  const margin = { top: 20, right: 60, bottom: 30, left: 40 };
  const width = containerRef.current.clientWidth - margin.left - margin.right;
  const height = containerRef.current.clientHeight - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.select(containerRef.current)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Create scales
  const x0 = d3.scaleBand()
    .domain(monthlyData.map(d => d.month))
    .rangeRound([0, width])
    .paddingInner(0.1);
  
  const x1 = d3.scaleBand()
    .domain(['suggested', 'actual'])
    .rangeRound([0, x0.bandwidth()])
    .padding(0.05);
  
  const y = d3.scaleLinear()
    .domain([0, 5])
    .range([height, 0]);
  
  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll('text')
    .attr('font-size', '10px')
    .attr('fill', '#aaa');
  
  // Create groups for each month
  const monthGroup = svg.selectAll('.month')
    .data(monthlyData)
    .enter().append('g')
    .attr('transform', d => `translate(${x0(d.month) || 0},0)`);
  
  // Add suggested bars
  monthGroup.append('rect')
    .attr('x', () => x1('suggested') || 0)
    .attr('y', d => y(d.suggested))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - y(d.suggested))
    .attr('fill', '#2ecc71')
    .attr('rx', 3)
    .attr('ry', 3);
  
  // Add actual bars
  monthGroup.append('rect')
    .attr('x', () => x1('actual') || 0)
    .attr('y', d => y(d.actual))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - y(d.actual))
    .attr('fill', '#e74c3c')
    .attr('rx', 3)
    .attr('ry', 3);
  
  // Add value labels
  monthGroup.selectAll('.value-label')
    .data(d => [
      { type: 'suggested', value: d.suggested },
      { type: 'actual', value: d.actual }
    ])
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('x', d => (x1(d.type) || 0) + x1.bandwidth() / 2)
    .attr('y', d => y(d.value) - 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', '8px')
    .attr('fill', '#fff')
    .text(d => d.value.toFixed(1));
  
  // Add legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - 140}, -10)`);
  
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 12)
    .attr('height', 12)
    .attr('fill', '#2ecc71');
  
  legend.append('text')
    .attr('x', 18)
    .attr('y', 10)
    .attr('font-size', '10px')
    .attr('fill', '#aaa')
    .text('Suggested');
  
  legend.append('rect')
    .attr('x', 85)
    .attr('y', 0)
    .attr('width', 12)
    .attr('height', 12)
    .attr('fill', '#e74c3c');
  
  legend.append('text')
    .attr('x', 103)
    .attr('y', 10)
    .attr('font-size', '10px')
    .attr('fill', '#aaa')
    .text('Amount Spent');
};