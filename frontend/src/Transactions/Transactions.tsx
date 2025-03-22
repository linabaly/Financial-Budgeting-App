import React, { useState, useEffect } from 'react';
import './Transactions.css';
import Header from '../Dashboard/components/Header';
import Footer from '../Dashboard/components/Footer';

// Sample transaction data
const initialTransactions = [
  { id: '#T1234', name: 'Groceries', date: '2025-03-15', amount: '$120.45', category: 'Food' },
  { id: '#T1235', name: 'Rent Payment', date: '2025-03-10', amount: '$1500.00', category: 'Housing' },
  { id: '#T1236', name: 'Electricity Bill', date: '2025-03-05', amount: '$85.20', category: 'Utilities' },
  { id: '#T1237', name: 'Internet Bill', date: '2025-03-03', amount: '$65.99', category: 'Utilities' },
  { id: '#T1238', name: 'Gym Membership', date: '2025-03-01', amount: '$50.00', category: 'Health' },
  { id: '#T1239', name: 'Dining Out', date: '2025-02-28', amount: '$78.50', category: 'Entertainment' },
  { id: '#T1240', name: 'Shopping', date: '2025-02-25', amount: '$135.75', category: 'Personal' },
  { id: '#T1241', name: 'Transportation', date: '2025-02-20', amount: '$45.00', category: 'Transport' },
  { id: '#T1242', name: 'Streaming Service', date: '2025-02-15', amount: '$14.99', category: 'Entertainment' },
  { id: '#T1243', name: 'Phone Bill', date: '2025-02-10', amount: '$85.00', category: 'Utilities' },
  { id: '#T1244', name: 'Insurance', date: '2025-02-05', amount: '$120.00', category: 'Insurance' },
  { id: '#T1245', name: 'Coffee', date: '2025-02-01', amount: '$25.30', category: 'Food' },
];

// Define category colors for styling
const categoryColors: {[key: string]: string} = {
  Food: '#27ae60',
  Housing: '#e74c3c',
  Utilities: '#3498db',
  Health: '#9b59b6',
  Entertainment: '#f39c12',
  Personal: '#1abc9c',
  Transport: '#2980b9',
  Insurance: '#c0392b'
};

const Transactions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: string} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    amount: '',
    category: 'Food'

    
  });
  
  // Filter transactions by search term and category
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Apply sorting
  const sortedTransactions = React.useMemo(() => {
    let sortableTransactions = [...filteredTransactions];
    if (sortConfig !== null) {
      sortableTransactions.sort((a, b) => {
        if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTransactions;
  }, [filteredTransactions, sortConfig]);
  
  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(transactions.map(t => t.category)))];
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Handle sorting
  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle adding a new transaction
  const handleAddTransaction = () => {
    const newId = `#T${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    
    const transactionToAdd = {
      id: newId,
      name: newTransaction.name,
      date: today,
      amount: `$${parseFloat(newTransaction.amount).toFixed(2)}`,
      category: newTransaction.category
    };
    
    setTransactions([transactionToAdd, ...transactions]);
    setNewTransaction({ name: '', amount: '', category: 'Food' });
    setIsNewTransactionOpen(false);
  };

  return (
    <div className="app">
      <Header />
      
      <main className="transactions-content">
        <div className="transactions-header">
          <h1>Transactions</h1>
          <button 
            className="fab-add-transaction"
            onClick={() => setIsNewTransactionOpen(!isNewTransactionOpen)}
          >
            <span className="add-icon">+</span>
            💰 Add Transaction
          </button>
        </div>
        
        {isNewTransactionOpen && (
          <div className="new-transaction-form card">
            <h3>New Transaction</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={newTransaction.name} 
                  onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})}
                  placeholder="e.g. Grocery Shopping"
                />
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input 
                  type="number" 
                  value={newTransaction.amount} 
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                >
                  {categories.filter(c => c !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
  <button 
    className="submit-btn" 
    onClick={handleAddTransaction}
    disabled={!newTransaction.name || !newTransaction.amount}
  >
    Add Transaction
  </button>
  <button 
    className="cancel-btn"
    onClick={() => setIsNewTransactionOpen(false)}
  >
    Cancel
  </button>
</div>
          </div>
        )}
        
        <div className="transactions-filters card">
          <div className="search-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          
          <div className="category-filters">
            {categories.map(category => (
              <button 
                key={category}
                className={`category-filter ${category === selectedCategory ? 'active' : ''}`}
                style={category !== 'All' ? {borderColor: categoryColors[category]} : {}}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1); // Reset to first page when filtering
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="transactions-table-container card">
          {sortedTransactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th 
                    className="sortable" 
                    onClick={() => requestSort('id')}
                  >
                    <div className="th-content">
                      <span>ID</span>
                      {sortConfig?.key === 'id' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => requestSort('name')}
                  >
                    <div className="th-content">
                      <span>Name</span>
                      {sortConfig?.key === 'name' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => requestSort('date')}
                  >
                    <div className="th-content">
                      <span>Date</span>
                      {sortConfig?.key === 'date' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => requestSort('category')}>
                    <div className="th-content">
                      <span>Category</span>
                      {sortConfig?.key === 'category' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="sortable amount-column" 
                    onClick={() => requestSort('amount')}
                  >
                    <div className="th-content">
                      <span>Amount</span>
                      {sortConfig?.key === 'amount' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction, index) => (
                  <tr key={transaction.id + index} className="transaction-row">
                    <td>
                      <div className="transaction-id">{transaction.id}</div>
                    </td>
                    <td>{transaction.name}</td>
                    <td>{transaction.date}</td>
                    <td>
                      <div 
                        className="category-badge"
                        style={{
                          backgroundColor: `${categoryColors[transaction.category]}30`,
                          color: categoryColors[transaction.category]
                        }}
                      >
                        {transaction.category}
                      </div>
                    </td>
                    <td className="amount-column">{transaction.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="15" x2="16" y2="15"></line>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
              <p>No transactions found with the current filters</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        
        {sortedTransactions.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedTransactions.length)} of {sortedTransactions.length} transactions
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-button" 
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div className="pagination-pages">
                <span className="current-page">{currentPage}</span>
                <span className="page-divider"> / </span>
                <span className="total-pages">{totalPages}</span>
              </div>
              <button 
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Transactions;