import * as d3 from 'd3';

// Data for pie chart
interface ExpenseCategory {
  category: string;
  value: number;
  color: string;
  percentage: number;
}

const expenseData: ExpenseCategory[] = [
  { category: 'Rent', value: 1500, color: '#e74c3c', percentage: 48.8 },
  { category: 'Groceries', value: 600, color: '#2ecc71', percentage: 24.3 },
  { category: 'Entertainment', value: 200, color: '#e57373', percentage: 12.3 },
  { category: 'Utilities', value: 300, color: '#2ed8c7', percentage: 14.6 }
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

// Update function signature to fix the TypeScript error
export const generateExpensePieChart = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  if (!containerRef.current) return;
  
  d3.select(containerRef.current).selectAll('*').remove();
  
  // Rest of the function unchanged
  const width = containerRef.current.clientWidth;
  const height = containerRef.current.clientHeight;
  const radius = Math.min(width, height) / 2;
  
  // Create SVG
  const svg = d3.select(containerRef.current)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);
  
  // Create pie layout
  const pie = d3.pie<ExpenseCategory>()
    .value(d => d.value)
    .sort(null);
  
  // Create arc generator
  const arc = d3.arc<d3.PieArcDatum<ExpenseCategory>>()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 0.9);
  
  // Create arcs
  const arcs = svg.selectAll('.arc')
    .data(pie(expenseData))
    .enter()
    .append('g')
    .attr('class', 'arc');
  
  // Add path
  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .attr('stroke', '#222')
    .attr('stroke-width', 1);
  
  // Add center text
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.5em')
    .attr('font-size', '0.8em')
    .attr('fill', '#aaa')
    .text('Total Amount Spent');
  
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1em')
    .attr('font-size', '1.2em')
    .attr('fill', '#ff6b6b')
    .attr('font-weight', 'bold')
    .text('$3,500');
  
  // Add percentage labels
  arcs.append('text')
    .attr('transform', d => {
      const [x, y] = arc.centroid(d);
      const rotation = (d.endAngle + d.startAngle) / 2 * (180 / Math.PI);
      const shouldFlip = rotation > 90 && rotation < 270;
      return `translate(${x * 0.8}, ${y * 0.8}) rotate(${shouldFlip ? rotation + 180 : rotation}) ${shouldFlip ? 'scale(-1)' : ''}`;
    })
    .attr('text-anchor', 'middle')
    .attr('font-size', '0.7em')
    .attr('fill', '#fff')
    .text(d => `${d.data.percentage}%`);
};

// Update function signature to fix the TypeScript error
export const generateMonthlyComparisonChart = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  if (!containerRef.current) return;
  
  d3.select(containerRef.current).selectAll('*').remove();
  
  // Rest of the function unchanged
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
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
    .attr('transform', `translate(${width - 120}, -10)`);
  
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