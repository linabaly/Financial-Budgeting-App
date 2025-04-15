import React, { useEffect, useState } from 'react';
import './Transactions.css';
import Header from '../Dashboard/components/Header';
import Footer from '../Dashboard/components/Footer';
import { API_BASE_URL } from "../config";

/**
 * Transaction interface to define the shape of transaction data
 */
interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  category: string;
  type: string;
}

/**
 * Interface for the form data 
 */
interface TransactionFormData {
  name: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

/**
 * Interface for sort configuration
 */
interface SortConfig {
  key: string;
  direction: string;
}

/**
 * Map of category names to their corresponding colors for styling
 */
const categoryColors: {[key: string]: string} = {
  Food: '#27ae60',
  Rent: '#e74c3c',
  Utilities: '#3498db',
  Healthcare: '#9b59b6',
  Entertainment: '#f39c12',
  Personal: '#1abc9c',
  Transport: '#2980b9',
  Insurance: '#c0392b'
};

/**
 * Initial transaction data for demonstration
 */
// const initialTransactions: Transaction[] = [
//   { id: '#T1234', name: 'Groceries', date: '2025-03-15', amount: '$120.45', category: 'Food' },
//   { id: '#T1235', name: 'Rent Payment', date: '2025-03-10', amount: '$1,500.00', category: 'Housing' },
//   { id: '#T1236', name: 'Electricity Bill', date: '2025-03-05', amount: '$85.20', category: 'Utilities' },
//   { id: '#T1237', name: 'Internet Bill', date: '2025-03-03', amount: '$65.99', category: 'Utilities' },
//   { id: '#T1238', name: 'Gym Membership', date: '2025-03-01', amount: '$50.00', category: 'Health' },
//   { id: '#T1239', name: 'Dining Out', date: '2025-02-28', amount: '$78.50', category: 'Entertainment' },
//   { id: '#T1240', name: 'Shopping', date: '2025-02-25', amount: '$135.75', category: 'Personal' },
//   { id: '#T1241', name: 'Transportation', date: '2025-02-20', amount: '$45.00', category: 'Transport' },
//   { id: '#T1242', name: 'Streaming Service', date: '2025-02-15', amount: '$14.99', category: 'Entertainment' },
//   { id: '#T1243', name: 'Phone Bill', date: '2025-02-10', amount: '$85.00', category: 'Utilities' },
//   { id: '#T1244', name: 'Insurance', date: '2025-02-05', amount: '$120.00', category: 'Insurance' },
//   { id: '#T1245', name: 'Coffee', date: '2025-02-01', amount: '$25.30', category: 'Food' },
// ];


/**
 * Transactions Component - Manages displaying, filtering, and sorting financial transactions
 */
const Transactions: React.FC = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<TransactionFormData>({
    name: '',
    amount: 0,
    category: 'Food',
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Formats a number as currency with 2 decimal places
   * @param amount - The number to format
   * @returns A formatted string (e.g., "1,234.56")
   */
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  /**
   * Fetch user transactions data
   */
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No token found.");
        }
        /**
       * !!!! DEBUGGING !!!!
       */

        console.log("Making API request to:", `${API_BASE_URL}/transaction`);
        console.log("With headers:", {
          "Content-Type": "application/json",
          "Authenticated": "token exists: " + !!token
        });
      
      
  
        const response = await fetch(`${API_BASE_URL}/transaction`, {  
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authenticated": token,
          },
        });


  
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch transactions");
        }
  
        const data = await response.json();
      
        // Format transactions for display
        const formattedTransactions = data.map((transaction: any) => ({
          id: transaction.id,
          name: transaction.name,
          date: new Date(transaction.date).toLocaleDateString('en-US'),
          amount: parseFloat(transaction.amount),
          category: transaction.category,
          type: transaction.type
        }));
    
        setTransactions(formattedTransactions);
      } catch (error: any) {
        console.error("Error fetching transactions:", error.message);
        setError(error.message);
      }
    };

      fetchTransactions();
  }, []);

  /**
   * Fetch a specific transaction by ID
   */
  const fetchTransactionById = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No token found.");
      }
      
      const response = await fetch(`${API_BASE_URL}/transaction/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authenticated": token,
        },
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch transaction");
      }
      
      const transaction = await response.json();
      return transaction;
    } catch (error: any) {
      console.error("Error fetching transaction:", error.message);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Create a new transaction
   */
  const createTransaction = async (transactionData: any) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No token found.");
      }

      /**
       * !!!! DEBUGGING !!!!
       */
      console.log("Making API request to:", `${API_BASE_URL}/transaction`);
      console.log("With headers:", {
        "Content-Type": "application/json",
        "Authenticated": "token exists: " + !!token
      });
      console.log("With body:", JSON.stringify(transactionData));
    

      
      const response = await fetch(`${API_BASE_URL}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authenticated": token,
        },
        body: JSON.stringify(transactionData)
      });

      /**
       * !!!! DEBUGGING !!!!
       */
      console.log("Fetch response:", response);
      
      if (!response.ok) {
        const err = await response.json();
        console.error("Error response:", err);
        throw new Error(err.message || "Failed to create transaction");
      }
      
      const createdTransaction = await response.json();
      console.log("Created transaction:", createdTransaction);


      return createdTransaction;
    } catch (error: any) {
      console.error("Error creating transaction:", error.message);
      setError(error.message);
      throw error;
    }
  };


  
  /**
   * Filter transactions based on search term and selected category
   */
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  /**
   * Sort transactions based on current sort configuration
   */
  const sortedTransactions = React.useMemo(() => {
    let sortableTransactions = [...filteredTransactions];
    
    if (sortConfig !== null) {
      sortableTransactions.sort((a, b) => {
        // Special handling for amount column to sort numerically
        if (sortConfig.key === 'amount') {
          // Extract numeric values from amounts (remove $ and commas)
          // const amountA = parseFloat(a.amount.replace(/[$,+/-]/g, ''));
          // const amountB = parseFloat(b.amount.replace(/[$,+/-]/g, ''));
          
          return sortConfig.direction === 'ascending' 
            ? a.amount - b.amount 
            : b.amount - a.amount;
        }
        
        // For other columns, sort alphabetically
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
  
  /**
   * Extract unique categories for the category filter
   */
  const categories = ['All', ...Array.from(new Set(transactions.map(t => t.category)))];
  
  /**
   * Calculate pagination values
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  /**
   * Navigate to previous page
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Navigate to next page
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  /**
   * Handle column sorting
   * @param key - The column to sort by
   */
  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  
  /**
   * Add a new transaction to the list
   */
  const handleAddTransaction = async () => {
    try {
      // Validate form
      if (!isFormValid) return;

      /**
       * !!!! DEBUGGING !!!!
       */

      console.log("Sending transaction with data:", {
        descriptor: newTransaction.name,
        amount: newTransaction.amount,
        category: newTransaction.category,
        type: newTransaction.type,
        postedAt: new Date(newTransaction.date).toISOString()
      });

      // create payload for API
      const transactionPayload = {
        descriptor: newTransaction.name,
        amount: newTransaction.amount,
        category: newTransaction.category,
        type: newTransaction.type,
        postedAt: new Date(newTransaction.date).toISOString()
      };

      // Call API to create transaction
      const createdTransaction = await createTransaction(transactionPayload);
      /**
       * !!!! DEBUGGING !!!!
       */
      console.log("Transaction created successfully:", createdTransaction);


      // Format created transaction for display
      const formattedTransaction = {
        id: createdTransaction.id,
        name: createdTransaction.descriptor,
        date: new Date(createdTransaction.postedAt).toLocaleDateString('en-US'),
        amount: parseFloat(String(createdTransaction.amount)),
        category: createdTransaction.category,
        type: createdTransaction.type
      };

      // Update transactions state (UI)
      setTransactions(prevTransactions => [formattedTransaction, ...prevTransactions]);
      setNewTransaction({
        name: '',
        amount: 0,
        category: 'Food',
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0]
      })
      setIsNewTransactionOpen(false);

    } catch (error: any) {
      console.error("Error adding transaction:", error.message);
      setError(error.message);
    }
    
  };

  /**
   * Validate form inputs
   */
  const isFormValid = newTransaction.name.trim() !== '' && 
                      !isNaN(newTransaction.amount) && 
                      newTransaction.amount > 0 &&
                      newTransaction.type !== '' &&
                      newTransaction.date !== '';

  return (
    <div className="app">
      <Header />
      
      {/* Main content area */}
      <main className="transactions-content">
        {/* Page header */}
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

         
        
        {/* New transaction form */}
        {isNewTransactionOpen && (
          <div className="new-transaction-form card">
            <h3>New Transaction</h3>
            <div className="form-grid">
              {/* Description field */}
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={newTransaction.name} 
                  onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})}
                  placeholder="e.g. Grocery Shopping"
                  required
                />
              </div>
              
              {/* Amount field */}
              <div className="form-group">
                <label>Amount ($)</label>
                <input 
                  type="number" 
                  value={newTransaction.amount} 
                  onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              {/* Category dropdown */}
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                >
                  <option value="FOOD">Food</option>
                  <option value="RENT">Rent</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="HEALTHCARE">Healthcare</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="OTHER">Other</option>
                  
                </select>
              </div>

              {/* Type dropdown */}
              <div className="form-group">
                <label>Type</label>
                <select 
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              {/* Date picker */}
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={newTransaction.date} 
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  required
                />
              </div>
            </div>
            
            {/* Form buttons */}
            <div className="form-actions">
              <button 
                className="submit-btn" 
                onClick={handleAddTransaction}
                disabled={!isFormValid}
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
        
        {/* Search and filter section */}
        <div className="transactions-filters card">
          {/* Search input */}
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
          
          {/* Category filters */}
          <div className="category-filters">
            {['All', 'Food', 'Rent', 'Utilities', 'Healthcare', 'Entertainment', 'Personal', 'Transport', 'Insurance', 'Other'].map(category => (
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
        
        {/* Transactions table */}
        <div className="transactions-table-container card">
          {sortedTransactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => requestSort('id')}>
                    <div className="th-content">
                      <span>ID</span>
                      {sortConfig?.key === 'id' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => requestSort('name')}>
                    <div className="th-content">
                      <span>Name</span>
                      {sortConfig?.key === 'name' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => requestSort('date')}>
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
                  <th className="sortable amount-column" onClick={() => requestSort('amount')}>
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
                    <td>
                      <div className={`type-badge ${transaction.type === 'INCOME' ? 'income' : 'expense'}`}>
                        {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                      </div>
                    </td>
                    <td className={`amount-column ${transaction.type === 'INCOME' ? 'income-amount' : 'expense-amount'}`}>
                      {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* No results message */
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
        
        {/* Pagination */}
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